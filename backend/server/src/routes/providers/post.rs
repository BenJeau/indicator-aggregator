use axum::{extract::State, response::IntoResponse, Json};
use database::PgPool;
use database::{logic::providers, schemas::providers::CreateProvider};

use crate::Result;

/// Create a new source provider
#[utoipa::path(
    post,
    path = "/providers",
    tag = "providers",
    responses(
        (status = 200, description = "Provider created successfully", body = String),
    ),
    request_body(
        description = "Provider to create",
        content_type = "application/json",
        content = CreateProvider
    )
)]
pub async fn create_provider(
    State(pool): State<PgPool>,
    Json(provider): Json<CreateProvider>,
) -> Result<impl IntoResponse> {
    let provider_id = providers::create_provider(&pool, provider).await?;

    Ok(provider_id.to_string())
}