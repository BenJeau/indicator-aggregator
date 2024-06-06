use axum::{extract::State, response::IntoResponse, Extension, Json};
use database::{
    logic::providers, schemas::providers::CreateProvider, schemas::users::User, PgPool,
};

use crate::Result;

/// Create a new source provider
#[utoipa::path(
    post,
    path = "/providers",
    tag = "providers",
    responses(
        (status = 200, description = "Provider created successfully", body = IdSlug),
    ),
    request_body(
        description = "Provider to create",
        content_type = "application/json",
        content = CreateProvider
    )
)]
pub async fn create_provider(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Json(provider): Json<CreateProvider>,
) -> Result<impl IntoResponse> {
    let created_provider = providers::create_provider(&pool, provider, &user.id).await?;

    Ok(Json(created_provider))
}
