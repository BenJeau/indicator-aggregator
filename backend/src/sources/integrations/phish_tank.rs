use async_trait::async_trait;
use chrono::NaiveDateTime;
use flate2::read::GzDecoder;
use futures_util::future::join_all;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, QueryBuilder};
use std::io::Read;
use tracing::{info, instrument};

use crate::{
    schemas::{Indicator, IndicatorKind},
    sources::{FetchState, Source},
    Result,
};

pub struct PhishTank;

#[async_trait]
impl Source for PhishTank {
    fn source_name(&self) -> &'static str {
        "PhishTank"
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
                "SELECT phish_id, phish_detail_url, url, submission_time, verification_time, target, details FROM phishtank WHERE url = $1",
                indicator.data
            ).fetch_all(&state.pool).await?
        } else {
            sqlx::query_as!(
                Entry,
                "SELECT phish_id, phish_detail_url, url, submission_time, verification_time, target, details FROM phishtank WHERE url ILIKE '%' || $1 || '%'",
                indicator.data
            ).fetch_all(&state.pool).await?
        };

        Ok(serde_json::json!(data))
    }

    #[instrument(skip_all, err)]
    async fn background_task(&self, state: &FetchState) -> Result<()> {
        info!("fetching data");

        // TODO: do a HEAD request and check if the file has changed

        let client = reqwest::Client::new();
        let response = client
            .get("http://data.phishtank.com/data/online-valid.json.gz")
            .header(reqwest::header::USER_AGENT, "phishtank/username")
            .send()
            .await?;

        let headers: String = response
            .headers()
            .into_iter()
            .map(|(k, v)| format!("{}: {}", k, v.to_str().unwrap()))
            .collect::<Vec<String>>()
            .join("\n");

        let bytes = response.bytes().await?;

        let mut buffer = String::new();

        let mut decoder = GzDecoder::new(&*bytes);

        decoder.read_to_string(&mut buffer)?;

        let data: Vec<Entry> = serde_json::from_str(&buffer).unwrap();

        join_all(
            data.chunks(9_000)
                .map(|chunk| insert_entries(chunk, state.pool.clone())),
        )
        .await;

        sqlx::query!(
            "INSERT INTO phishtank_refreshes (response_headers) VALUES ($1)",
            headers
        )
        .execute(&state.pool)
        .await?;

        Ok(())
    }
}

async fn insert_entries(entries: &[Entry], pool: PgPool) {
    let mut query_builder = QueryBuilder::new("INSERT INTO phishtank (phish_id, phish_detail_url, url, submission_time, verification_time, target, details) ");

    query_builder.push_values(entries, |mut b, entry| {
        b.push_bind(entry.phish_id)
            .push_bind(&entry.phish_detail_url)
            .push_bind(&entry.url)
            .push_bind(entry.submission_time)
            .push_bind(entry.verification_time)
            .push_bind(&entry.target)
            .push_bind(&entry.details);
    });

    query_builder.push(" ON CONFLICT DO NOTHING");

    let query = query_builder.build();

    query.execute(&pool).await.unwrap();
}

#[derive(Debug, FromRow, Serialize, Deserialize)]
struct Entry {
    phish_id: i32,
    phish_detail_url: String,
    url: String,
    #[serde(deserialize_with = "crate::utils::phish_tank_deserialize")]
    submission_time: NaiveDateTime,
    #[serde(deserialize_with = "crate::utils::phish_tank_deserialize")]
    verification_time: NaiveDateTime,
    target: String,
    details: serde_json::Value,
}
