use axum::{extract::State, response::IntoResponse, Json};

use crate::{
    postgres::{logic::secrets, schemas::secrets::CreateSecret},
    Result, ServerState,
};

/// Create a new secret
#[utoipa::path(
    post,
    path = "/secrets",
    tag = "secrets",
    responses(
        (status = 200, description = "Secret created successfully", body = String),
    ),
    request_body(
        description = "Secret to create", content_type = "application/json", content = CreateSecret
    )
)]
pub async fn create_secret(
    State(state): State<ServerState>,
    Json(secret): Json<CreateSecret>,
) -> Result<impl IntoResponse> {
    let secret_id = secrets::create_secret(
        &state.pool,
        secret,
        &state.crypto,
        &state.config.encryption.db_key,
    )
    .await?;

    Ok(secret_id.to_string())
}
