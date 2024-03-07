use async_trait::async_trait;
use serde_json::json;
use tracing::instrument;

use crate::{
    schemas::{Indicator, IndicatorKind},
    sources::{handle_response, FetchState, Source},
    Error, Result,
};

pub struct ThreatFox;

#[async_trait]
impl Source for ThreatFox {
    fn source_name(&self) -> &'static str {
        "ThreatFox"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        _state: &FetchState,
    ) -> Result<serde_json::Value> {
        let request = match indicator.kind {
            IndicatorKind::Md5 | IndicatorKind::Sha256 => {
                json!({
                    "query": "search_hash",
                    "hash": indicator.data,
                })
            }
            _ => {
                json!({
                    "query": "search_ioc",
                    "search_term": indicator.data,
                })
            }
        };

        let response = reqwest::Client::new()
            .post("https://threatfox-api.abuse.ch/api/v1/")
            .json(&request)
            .send()
            .await?;

        let data: serde_json::Value = handle_response(response).await?;

        if let Some(serde_json::Value::String(query_status)) = data.get("query_status") {
            if query_status == "no_result" {
                return Err(Error::NotFound);
            }

            if query_status != "ok" {
                return Err(Error::ResponseError);
            }
        }

        Ok(data)
    }
}
