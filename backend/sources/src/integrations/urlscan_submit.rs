use async_trait::async_trait;
use reqwest::StatusCode;
use serde::Deserialize;
use serde_json::json;
use tracing::instrument;

use crate::{Error, FetchState, Indicator, Result, Source};

pub struct UrlscanSubmit;

#[derive(Deserialize)]
struct UrlscanSubmission {
    api: String,
}

#[async_trait]
impl Source for UrlscanSubmit {
    fn source_name(&self) -> &'static str {
        "URLScan.io - Submit"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let response = reqwest::Client::new()
            .post("https://urlscan.io/api/v1/scan/")
            .json(&json!({
                "url": indicator.data,
                "visibility": "private",
            }))
            .header("API-Key", &state.secrets["URLSCAN_IO_KEY"])
            .send()
            .await?;

        match response.status() {
            StatusCode::NOT_FOUND => return Err(Error::NotFound),
            StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN => return Err(Error::Unauthorized),
            _ => (),
        };

        let submission: UrlscanSubmission = response.json().await?;

        for _ in 0..3 {
            tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;

            let response = reqwest::Client::new()
                .get(&submission.api)
                .header("API-Key", &state.secrets["URLSCAN_IO_KEY"])
                .send()
                .await?;

            if response.status().is_success() {
                return Ok(response.json().await?);
            }
        }

        Err(Error::Timeout)
    }
}
