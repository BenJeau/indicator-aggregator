use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use postgres::{logic::secrets, schemas::secrets::UpdateSecret};
use uuid::Uuid;

use crate::{Result, ServerState};

/// Partially update a secret by its ID
#[utoipa::path(
    patch,
    path = "/secrets/{id}",
    tag = "secrets",
    responses(
        (status = 204, description = "Secret updated successfully", body = ()),
        (status = 404, description = "Secret not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Secret database ID"),
        UpdateSecret
    )
)]
pub async fn patch_secret(
    State(state): State<ServerState>,
    Path(secret_id): Path<Uuid>,
    Json(secret): Json<UpdateSecret>,
) -> Result<impl IntoResponse> {
    let num_affected = secrets::patch_secret(
        &state.pool,
        &secret_id,
        secret,
        &state.crypto,
        &state.config.encryption.db_key,
    )
    .await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
