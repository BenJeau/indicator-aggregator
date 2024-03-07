use async_trait::async_trait;
use tracing::instrument;

use crate::{
    sources::{handle_response, FetchState, Indicator, Source},
    Result,
};

pub struct AbuseIpDb;

#[async_trait]
impl Source for AbuseIpDb {
    fn source_name(&self) -> &'static str {
        "AbuseIPDB"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let response = reqwest::Client::new()
            .get(format!(
                "https://api.abuseipdb.com/api/v2/check?ipAddress={}",
                indicator.data
            ))
            .header("Key", &state.secrets["ABUSE_IPDB_KEY"])
            .send()
            .await?;

        handle_response(response).await
    }
}
