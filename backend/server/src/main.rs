#![allow(clippy::blocks_in_conditions)]

mod background_tasks;
mod config;
mod error;
mod integrations;
mod routes;
mod runners;
mod schemas;
mod state;

#[cfg(test)]
mod test_utils;

use database::schemas::sources::SourceKind;
pub use error::{Error, Result};
pub use state::ServerState;

const ENV_FILTER: &str = "server=debug,cache=debug,tower_http=debug,shared=debug,database=debug";
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

    database::run_migrations(&state.pool).await?;

    let (runners_init, background_tasks, servers) = futures_util::future::join3(
        runners::send_init_request(&state.pool, SourceKind::Python),
        background_tasks::run_background_tasks(&state),
        routes::server::RestServer::new(state.clone()).start(),
    )
    .await;

    runners_init?;
    background_tasks?;
    servers?;

    Ok(())
}
