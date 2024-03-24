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
    shared::telemetry::Telemetry::new(SERVICE_NAME, ENV_FILTER)
        .setup()
        .unwrap();

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            start().await.unwrap();
        });
}

async fn start() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let state = ServerState::new().await;

    let (migration, background_tasks, servers) = futures_util::future::join3(
        postgres::run_migrations(&state.pool),
        sources::background_tasks::run_background_tasks(&state),
        server::start_all_servers(state.clone()),
    )
    .await;

    migration?;
    background_tasks?;
    servers?;

    Ok(())
}
