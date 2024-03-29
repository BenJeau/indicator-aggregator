use axum::{extract::State, response::IntoResponse, Json};
use sqlx::PgPool;

use crate::{
    postgres::{logic::server_config, schemas::server_config::ServerConfig},
    Result,
};

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
    let mut config = ServerConfig::default();
    let db_config = server_config::get_all_server_configs(&pool).await?;

    config.combine_with_db_results(db_config);

    Ok(Json(config))
}
