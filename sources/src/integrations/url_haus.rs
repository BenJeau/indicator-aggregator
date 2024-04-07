use async_trait::async_trait;
use futures_util::future::join_all;
use postgres::{
    logic::url_haus::{insert_entries, insert_url_haus_refresh},
    schemas::{
        indicators::{Indicator, IndicatorKind},
        url_haus::Entry,
    },
};
use std::io::Read;
use tracing::{info, instrument, warn};

use crate::{Error, FetchState, Result, Source};

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
            postgres::logic::url_haus::get_url_haus_by_url(&indicator.data, &state.pool).await?
        } else {
            postgres::logic::url_haus::get_url_haus_by_domain(&indicator.data, &state.pool).await?
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
                .map(|chunk| insert_entries(chunk, &state.pool)),
        )
        .await;

        insert_url_haus_refresh(&headers, &state.pool).await?;

        Ok(())
    }
}
