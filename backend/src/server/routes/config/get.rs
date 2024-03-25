use axum::{extract::State, response::IntoResponse, Json};
use sqlx::PgPool;

use crate::{postgres::logic::server_config, Result};

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
    let config = server_config::get_all_server_configs(&pool).await?;

    Ok(Json(config))
}
