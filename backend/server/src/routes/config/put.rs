use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use database::PgPool;
use database::{logic::server_config, schemas::server_config::UpdateServerConfig};

use crate::Result;

/// Update server configuration values
#[utoipa::path(
    put,
    tag = "config",
    path = "/config",
    responses((status = 204, description = "Server configuration updated")),
    request_body(
        description = "Server configuration",
        content_type = "application/json",
        content = Vec<UpdateServerConfig>
    )
)]
pub async fn update_config(
    State(pool): State<PgPool>,
    Json(data): Json<Vec<UpdateServerConfig>>,
) -> Result<impl IntoResponse> {
    server_config::create_or_update_server_configs(&pool, &data).await?;

    Ok(StatusCode::NO_CONTENT)
}
