use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use postgres::logic::secrets;
use postgres::PgPool;
use uuid::Uuid;

use crate::{Result, ServerState};

/// Get all secrets from the service, without their values
#[utoipa::path(
    get,
    path = "/secrets",
    tag = "secrets",
    responses(
        (status = 200, description = "Secrets retrieved successfully", body = Vec<SecretWithNumSources>),
    )
)]
pub async fn get_secrets(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let secrets = secrets::get_secrets(&pool).await?;

    Ok(Json(secrets))
}

/// Get a secret value by its database ID
#[utoipa::path(
    get,
    path = "/secrets/{id}/value",
    tag = "secrets",
    responses(
        (status = 200, description = "Secret value retrieved successfully", body = String),
        (status = 404, description = "Secret not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Secret database ID"),
    )
)]
pub async fn get_secret_value(
    State(state): State<ServerState>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let value = secrets::get_secret_value(
        &state.pool,
        &id,
        &state.crypto,
        &state.config.encryption.db_key,
    )
    .await?;

    Ok(value)
}
