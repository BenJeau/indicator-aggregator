use async_trait::async_trait;
use tracing::instrument;

use crate::{FetchState, Indicator, Result, Source};

pub struct InternetArchive;

#[async_trait]
impl Source for InternetArchive {
    fn source_name(&self) -> &'static str {
        "Internet Archive"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        _indicator: &Indicator,
        _state: &FetchState,
    ) -> Result<serde_json::Value> {
        Ok(serde_json::Value::Null)
    }
}
