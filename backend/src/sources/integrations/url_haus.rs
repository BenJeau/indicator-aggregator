use async_trait::async_trait;
use chrono::NaiveDateTime;
use futures_util::future::join_all;
use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, PgPool, QueryBuilder};
use std::io::Read;
use tracing::{info, instrument, warn};

use crate::{
    schemas::{Indicator, IndicatorKind},
    sources::{FetchState, Source},
    Error, Result,
};

pub struct UrlHaus;

#[async_trait]
impl Source for UrlHaus {
    fn source_name(&self) -> &'static str {
        "URLHaus"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let data = if indicator.kind == IndicatorKind::Url {
            sqlx::query_as!(
                Entry,
                "SELECT id, dateadded, url, url_status, last_online, threat, tags, urlhaus_link, reporter FROM url_haus WHERE url = $1",
                indicator.data
            ).fetch_all(&state.pool).await?
        } else {
            sqlx::query_as!(
                Entry,
                "SELECT id, dateadded, url, url_status, last_online, threat, tags, urlhaus_link, reporter FROM url_haus WHERE url ILIKE '%' || $1 || '%'",
                indicator.data
            ).fetch_all(&state.pool).await?
        };

        Ok(serde_json::json!(data))
    }

    #[instrument(skip_all, err)]
    async fn background_task(&self, state: &FetchState) -> Result<()> {
        let response = reqwest::get("https://urlhaus.abuse.ch/downloads/csv/").await?;

        let headers: String = response
            .headers()
            .into_iter()
            .map(|(k, v)| format!("{}: {}", k, v.to_str().unwrap()))
            .collect::<Vec<String>>()
            .join("\n");

        let bytes = response.bytes().await?;

        let mut buffer = String::new();

        {
            let mut zip_archive = zip::ZipArchive::new(std::io::Cursor::new(bytes))?;
            let mut archive_file = zip_archive.by_index(0)?;

            info!(filename = archive_file.name(), "unzipping file");

            archive_file.read_to_string(&mut buffer)?;
        }

        let (_, data) = buffer
            .split_once("#\r\n#\r\n# ")
            .ok_or(Error::ResponseError)?;

        let mut reader = csv::Reader::from_reader(data.as_bytes());

        join_all(
            reader
                .deserialize()
                .flat_map(|result| match result {
                    Ok(entry) => Some(entry),
                    Err(error) => {
                        warn!("error parsing entry: {}", error);
                        None
                    }
                })
                .collect::<Vec<Entry>>()
                .chunks(7_000)
                .map(|chunk| insert_entries(chunk, state.pool.clone())),
        )
        .await;

        sqlx::query!(
            "INSERT INTO url_haus_refreshes (response_headers) VALUES ($1)",
            headers
        )
        .execute(&state.pool)
        .await?;

        Ok(())
    }
}

#[instrument(skip_all)]
async fn insert_entries(entries: &[Entry], pool: PgPool) {
    let mut query_builder = QueryBuilder::new("INSERT INTO url_haus (id, dateadded, url, url_status, last_online, threat, tags, urlhaus_link, reporter) ");

    query_builder.push_values(entries, |mut b, entry| {
        b.push_bind(entry.id)
            .push_bind(entry.dateadded)
            .push_bind(&entry.url)
            .push_bind(&entry.url_status)
            .push_bind(entry.last_online)
            .push_bind(&entry.threat)
            .push_bind(&entry.tags)
            .push_bind(&entry.urlhaus_link)
            .push_bind(&entry.reporter);
    });

    query_builder.push(" ON CONFLICT DO NOTHING");

    let query = query_builder.build();

    query.execute(&pool).await.unwrap();
}

#[derive(Debug, Deserialize, FromRow, Serialize)]
pub struct Entry {
    id: i64,
    #[serde(deserialize_with = "crate::utils::url_haus_deserialize")]
    dateadded: NaiveDateTime,
    url: String,
    url_status: String,
    #[serde(deserialize_with = "crate::utils::url_haus_optional_deserialize")]
    last_online: Option<NaiveDateTime>,
    threat: String,
    tags: String,
    urlhaus_link: String,
    reporter: String,
}
