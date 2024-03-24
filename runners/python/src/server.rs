use common::{
    handle_init, handle_update,
    runner_server::{Runner, RunnerServer},
    BackgroundTaskRequest, Empty, FetchDataReply, FetchDataRequest, InitRequest, SourceCodeMapping,
    UpdateRequest, Validator,
};
use shared::tower::CommonTowerLayerBuilder;
use tonic::{transport::Server, Request, Response, Status};

use crate::executor;

#[derive(Default)]
pub struct PythonRunner {
    source_code: SourceCodeMapping,
}

#[tonic::async_trait]
impl Runner for PythonRunner {
    async fn fetch_data(
        &self,
        request: Request<FetchDataRequest>,
    ) -> Result<Response<FetchDataReply>, Status> {
        let request_data = request.into_inner().validate()?;
        let source_code = self.source_code.get(request_data.source.as_str())?;

        let data = executor::fetch_data(&source_code, request_data.indicator.unwrap())
            .map_err(|e| Status::internal(format!("Error fetching data: {}", e)))?;

        Ok(Response::new(data.into()))
    }

    async fn background_task(
        &self,
        request: Request<BackgroundTaskRequest>,
    ) -> Result<Response<Empty>, Status> {
        let request_data = request.into_inner().validate()?;
        let source_code = self.source_code.get(request_data.source.as_str())?;

        executor::background_task(&source_code)
            .map_err(|e| Status::internal(format!("Error fetching data: {}", e)))?;

        Ok(Response::new(Empty {}))
    }

    async fn update(&self, request: Request<UpdateRequest>) -> Result<Response<Empty>, Status> {
        handle_update(&self.source_code, request)
    }

    async fn init(&self, request: Request<InitRequest>) -> Result<Response<Empty>, Status> {
        handle_init(&self.source_code, request)
    }
}

impl PythonRunner {
    pub async fn run() -> Result<(), Box<dyn std::error::Error>> {
        let config = common::config::Config::new("PYTHON_RUNNER", include_str!("../config.toml"))?;

        let greeter = PythonRunner::default();

        pyo3::prepare_freethreaded_python();

        let layers = CommonTowerLayerBuilder::new().build();

        Server::builder()
            .add_service(RunnerServer::new(greeter))
            .serve(config.server.address()?)
            .await?;

        Ok(())
    }
}
