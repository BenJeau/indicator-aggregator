mod executor;
mod server;

const ENV_FILTER: &str = "python_runner=debug,common=debug,shared=debug";
const SERVICE_NAME: &str = "python-runner";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    shared::telemetry::Telemetry::new(SERVICE_NAME, ENV_FILTER).setup()?;

    server::PythonRunner::run().await
}
