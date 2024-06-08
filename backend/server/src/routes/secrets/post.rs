use axum::{extract::State, response::IntoResponse, Extension, Json};
use database::{
    logic::secrets,
    schemas::{secrets::CreateSecret, users::User},
};

use crate::{Result, ServerState};

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
    Extension(user): Extension<User>,
    Json(secret): Json<CreateSecret>,
) -> Result<impl IntoResponse> {
    let secret_id = secrets::create_secret(
        &state.pool,
        secret,
        &state.crypto,
        &state.config.encryption.db_key,
        &user.id,
    )
    .await?;

    Ok(secret_id.to_string())
}
