use async_trait::async_trait;
use tracing::instrument;

use crate::{FetchState, Indicator, Result, Source};

pub struct HaveIBeenPwned;

#[async_trait]
impl Source for HaveIBeenPwned {
    fn source_name(&self) -> &'static str {
        "HaveIBeenPwned"
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
