use async_trait::async_trait;
use tracing::instrument;

use crate::{handle_response, FetchState, Indicator, Result, Source};

pub struct InternetDb;

#[async_trait]
impl Source for InternetDb {
    fn source_name(&self) -> &'static str {
        "InternetDB"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let response = reqwest::Client::new()
            .get(format!(
                "https://internetdb.shodan.io/{}?key={}",
                indicator.data, state.secrets["SHODAN_API_KEY"]
            ))
            .send()
            .await?;

        handle_response(response).await
    }
}
