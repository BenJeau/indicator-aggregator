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

#[tokio::main]
async fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let opentelemetry_endpoint =
        std::env::var("OTEL_ENDPOINT").unwrap_or_else(|_| "http://localhost:4317".to_string());

    shared::telemetry::Telemetry::new(
        "indicator-aggregator-server".to_string(),
        opentelemetry_endpoint,
        ENV_FILTER.to_string(),
    )
    .setup()
    .unwrap();

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
