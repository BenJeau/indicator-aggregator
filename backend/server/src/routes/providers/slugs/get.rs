use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use database::{logic::providers, PgPool};

use crate::Result;

/// Get a provider ID from a slug
#[utoipa::path(
    get,
    path = "/providers/slugs/{slug}",
    tag = "providers",
    responses(
        (status = 200, description = "Provider ID retrieved successfully", body = String),
        (status = 404, description = "Provider not found"),
    ),
    params(
        ("slug" = String, Path, description = "Provider slug"),
    )
)]
pub async fn get_provider_id_from_slug(
    State(pool): State<PgPool>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse> {
    let provider_id = providers::get_provider_id_from_slug(&pool, &slug).await?;

    if let Some(provider_id) = provider_id {
        Ok(provider_id.into_response())
    } else {
        Ok(StatusCode::NOT_FOUND.into_response())
    }
}
