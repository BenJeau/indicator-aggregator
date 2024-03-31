use common::{
    handle_delete, handle_init, handle_update,
    runner_server::{Runner, RunnerServer},
    BackgroundTaskRequest, DeleteRequest, Empty, FetchDataReply, FetchDataRequest, InitRequest,
    SourceCodeMapping, UpdateRequest, Validator,
};
use tonic::{transport::Server, Request, Response, Status};
use tracing::{info, instrument};

use crate::executor;

#[derive(Default, Debug)]
pub struct PythonRunner {
    source_code: SourceCodeMapping,
}

#[tonic::async_trait]
impl Runner for PythonRunner {
    #[instrument(err, ret, skip_all, fields(request = ?request.get_ref()))]
    async fn fetch_data(
        &self,
        request: Request<FetchDataRequest>,
    ) -> Result<Response<FetchDataReply>, Status> {
        tracing::info!("received request");

        let request_data = request.into_inner().validate()?;
        let source_code = self.source_code.get(request_data.source.as_str())?;

        let data = executor::fetch_data(&source_code, request_data.indicator.unwrap())
            .map_err(|e| Status::internal(format!("Error fetching data: {}", e)))?;

        Ok(Response::new(data.into()))
    }

    #[instrument(err, ret)]
    async fn background_task(
        &self,
        request: Request<BackgroundTaskRequest>,
    ) -> Result<Response<Empty>, Status> {
        tracing::info!("received request");

        let request_data = request.into_inner().validate()?;
        let source_code = self.source_code.get(request_data.source.as_str())?;

        executor::background_task(&source_code)
            .map_err(|e| Status::internal(format!("Error fetching data: {}", e)))?;

        Ok(Response::new(Empty {}))
    }

    #[instrument(err, ret)]
    async fn update(&self, request: Request<UpdateRequest>) -> Result<Response<Empty>, Status> {
        handle_update(&self.source_code, request)
    }

    #[instrument(err, ret)]
    async fn init(&self, request: Request<InitRequest>) -> Result<Response<Empty>, Status> {
        handle_init(&self.source_code, request)
    }

    #[instrument(err, ret)]
    async fn delete(&self, request: Request<DeleteRequest>) -> Result<Response<Empty>, Status> {
        handle_delete(&self.source_code, request)
    }
}

impl PythonRunner {
    pub async fn run() -> Result<(), Box<dyn std::error::Error>> {
        let (_, health_service) = tonic_health::server::health_reporter();

        let config = common::config::Config::new("PYTHON_RUNNER", include_str!("../config.toml"))?;

        pyo3::prepare_freethreaded_python();

        let addr = config.server.address()?;

        info!("listening on http://{addr}");

        Server::builder()
            .trace_fn(|_| tracing::info_span!("python_runner"))
            .add_service(health_service)
            .add_service(RunnerServer::new(PythonRunner::default()))
            .serve(addr)
            .await?;

        Ok(())
    }
}
