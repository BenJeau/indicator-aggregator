use async_trait::async_trait;
use database::schemas::indicators::Indicator;

pub mod error;
mod helpers;
pub mod integrations;
pub mod schemas;
pub mod state;

pub use error::{Error, Result};
pub use helpers::handle_response;
pub use state::FetchState;

#[async_trait]
pub trait Source: Send + Sync {
    fn source_name(&self) -> &'static str {
        ""
    }

    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value>;

    async fn background_task(&self, _state: &FetchState) -> Result<()> {
        todo!()
    }
}
