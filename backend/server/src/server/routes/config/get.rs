use axum::{extract::State, response::IntoResponse, Json};
use database::{logic::server_config::get_config_with_defaults_and_db_results, PgPool};

use crate::Result;

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
    let config = get_config_with_defaults_and_db_results(&pool).await?;

    Ok(Json(config))
}
