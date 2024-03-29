use async_trait::async_trait;
use common::{BackgroundTaskRequest, FetchDataRequest};
use tonic::transport::Endpoint;
use tracing::instrument;

use crate::{
    sources::{FetchState, Indicator, Source},
    Result,
};

pub struct Python;

#[async_trait]
impl Source for Python {
    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let request = FetchDataRequest {
            source: state.source_id.to_string(),
            indicator: Some(common::Indicator {
                data: indicator.data.clone(),
                kind: indicator.db_kind(),
            }),
        };

        let config = state.get_server_config().await?;
        let endpoint =
            Endpoint::from_shared(config.python_runner_grpc_address.get_value().to_string())?;

        let mut client = common::runner_client::RunnerClient::connect(endpoint).await?;

        let data = client.fetch_data(request).await?.into_inner().data;

        Ok(serde_json::Value::String(data))
    }

    #[instrument(skip_all, err)]
    async fn background_task(&self, state: &FetchState) -> Result<()> {
        let request = BackgroundTaskRequest {
            source: state.source_id.to_string(),
        };

        let config = state.get_server_config().await?;
        let endpoint =
            Endpoint::from_shared(config.python_runner_grpc_address.get_value().to_string())?;

        let mut client = common::runner_client::RunnerClient::connect(endpoint).await?;

        client.background_task(request).await?;

        Ok(())
    }
}
