use sqlx::PgPool;
use sqlx::{
    postgres::{PgConnectOptions, PgPoolOptions},
    ConnectOptions,
};
use std::str::FromStr;
use tracing::info;

pub mod logic;
pub mod schemas;

pub async fn connect_to_db(url: &str) -> Result<PgPool, sqlx::Error> {
    info!("Connecting to database");
    let options = PgConnectOptions::from_str(url)?;

    PgPoolOptions::new()
        .max_connections(75)
        .min_connections(5)
        .connect_with(options.disable_statement_logging())
        .await
}

pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::migrate::MigrateError> {
    info!("Running migrations");
    sqlx::migrate!("./migrations").run(pool).await
}
