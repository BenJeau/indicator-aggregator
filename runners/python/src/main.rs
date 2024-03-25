mod executor;
mod server;

const ENV_FILTER: &str = "python_runner=debug,common=debug,shared=debug";
const SERVICE_NAME: &str = "python-runner";

fn main() {
    let _guard = shared::telemetry::Telemetry::setup_sentry();

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            start().await.unwrap();
        });
}

async fn start() -> Result<(), Box<dyn std::error::Error>> {
    shared::telemetry::Telemetry::new(SERVICE_NAME, ENV_FILTER).setup_tracing()?;

    server::PythonRunner::run().await
}
