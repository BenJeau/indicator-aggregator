use async_trait::async_trait;
use tracing::instrument;

use crate::{
    sources::{FetchState, Indicator, Source},
    Result,
};

pub struct CertificateTransparency;

#[async_trait]
impl Source for CertificateTransparency {
    fn source_name(&self) -> &'static str {
        "Certificate Transparency"
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
