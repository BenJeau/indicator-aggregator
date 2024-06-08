use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use database::{logic::providers, PgPool};

use crate::{Error, Result};

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
    let provider_id = providers::get_provider_id_from_slug(&pool, &slug)
        .await?
        .ok_or(Error::NotFound)?;

    Ok(provider_id)
}
