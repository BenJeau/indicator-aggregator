mod config;
mod crypto;
mod error;
mod hashing;
mod postgres;
mod schemas;
mod server;
mod sources;
mod utils;
mod validators;

pub use error::{Error, Result};
pub use server::state::ServerState;

const ENV_FILTER: &str = "backend=debug,cache=debug,tower_http=debug,shared=debug";
const SERVICE_NAME: &str = "indicator-aggregator-server";

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

async fn start() -> std::result::Result<(), Box<dyn std::error::Error>> {
    shared::telemetry::Telemetry::new(SERVICE_NAME, ENV_FILTER).setup_tracing()?;

    let state = ServerState::new().await;

    postgres::run_migrations(&state.pool).await?;

    let (runners_init, background_tasks, servers) = futures_util::future::join3(
        sources::runners::send_init_request(&state.pool),
        sources::background_tasks::run_background_tasks(&state),
        server::RestServer::new(state.clone()).start(),
    )
    .await;

    runners_init?;
    background_tasks?;
    servers?;

    Ok(())
}
