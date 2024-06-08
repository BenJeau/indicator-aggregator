use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{
    logic::secrets,
    schemas::{secrets::UpdateSecret, users::User},
};

use crate::{Result, ServerState};

/// Partially update a secret by its ID
#[utoipa::path(
    patch,
    path = "/secrets/{id}",
    tag = "secrets",
    responses(
        (status = 204, description = "Secret updated successfully"),
        (status = 404, description = "Secret not found"),
    ),
    params(
        ("id" = String, Path, description = "Secret database ID"),
        UpdateSecret
    )
)]
pub async fn patch_secret(
    State(state): State<ServerState>,
    Extension(user): Extension<User>,
    Path(secret_id): Path<String>,
    Json(secret): Json<UpdateSecret>,
) -> Result<impl IntoResponse> {
    let num_affected = secrets::patch_secret(
        &state.pool,
        &secret_id,
        secret,
        &state.crypto,
        &state.config.encryption.db_key,
        &user.id,
    )
    .await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
