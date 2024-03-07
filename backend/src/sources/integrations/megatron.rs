use async_trait::async_trait;
use tracing::{info, instrument};

use crate::{
    sources::{FetchState, Indicator, Source},
    Result,
};

pub struct Megatron;

#[async_trait]
impl Source for Megatron {
    fn source_name(&self) -> &'static str {
        "Megatron"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        _indicator: &Indicator,
        _state: &FetchState,
    ) -> Result<serde_json::Value> {
        Ok(serde_json::Value::Null)
    }

    async fn background_task(&self, _state: &FetchState) -> Result<()> {
        info!("fetching data");

        let client = reqwest::Client::new();
        let _response = client
            .post("https://megatron.abuse.ch/api/")
            .form(&[("query", "get_entries")])
            .send()
            .await?;

        Ok(())
    }
}
