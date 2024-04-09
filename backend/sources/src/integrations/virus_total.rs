use async_trait::async_trait;
use database::schemas::indicators::{Indicator, IndicatorKind};
use reqwest::header::HeaderMap;
use tracing::instrument;

use crate::{handle_response, FetchState, Result, Source};

pub struct VirusTotal;

#[async_trait]
impl Source for VirusTotal {
    fn source_name(&self) -> &'static str {
        "VirusTotal"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let path = match indicator.kind {
            IndicatorKind::Ipv4 | IndicatorKind::Ipv6 => "ip_addresses",
            IndicatorKind::Url => "urls",
            IndicatorKind::Domain => "domains",
            IndicatorKind::Md5
            | IndicatorKind::Sha256
            | IndicatorKind::Sha512
            | IndicatorKind::Sha1 => "files",
            _ => unreachable!(),
        };

        let mut header_map = HeaderMap::new();

        if let Some(key) = state.secrets.get("VIRUSTOTAL_KEY") {
            header_map.insert("x-apikey", key.parse()?);
        }

        let response = reqwest::Client::new()
            .get(format!(
                "https://www.virustotal.com/api/v3/{path}/{}",
                indicator.data
            ))
            .headers(header_map)
            .send()
            .await?;

        handle_response(response).await
    }
}
