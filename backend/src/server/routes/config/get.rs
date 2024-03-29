use axum::{extract::State, response::IntoResponse, Json};
use sqlx::PgPool;

use crate::{postgres::schemas::server_config::ServerConfig, Result};

/// Get server configuration values
#[utoipa::path(
    get,
    tag = "config",
    path = "/config",
    responses(
        (status = 200, description = "Server configuration", body = [ServerConfig])
    )
)]
pub async fn get_config(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let config = ServerConfig::get_config_with_defaults_and_db_results(&pool).await?;

    Ok(Json(config))
}
