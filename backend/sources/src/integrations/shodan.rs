use async_trait::async_trait;
use database::schemas::indicators::{Indicator, IndicatorKind};
use tracing::instrument;

use crate::{handle_response, FetchState, Result, Source};

pub struct Shodan;

#[async_trait]
impl Source for Shodan {
    fn source_name(&self) -> &'static str {
        "Shodan"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let query = match indicator.kind {
            IndicatorKind::Ipv4 | IndicatorKind::Ipv6 => format!("ip:{}", indicator.data),
            IndicatorKind::Domain => format!("hostname:{}", indicator.data),
            _ => unreachable!(),
        };

        let response = reqwest::Client::new()
            .get(format!(
                "https://api.shodan.io/{}?key={}&query={}",
                indicator.data, state.secrets["SHODAN_API_KEY"], query
            ))
            .send()
            .await?;

        handle_response(response).await
    }
}
