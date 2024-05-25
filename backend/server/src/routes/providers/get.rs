use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use database::logic::providers;
use database::PgPool;

use crate::Result;

/// Get all source providers
#[utoipa::path(
    get,
    path = "/providers",
    tag = "providers",
    responses(
        (status = 200, description = "Providers retrieved successfully", body = [Provider]),
    ),
)]
pub async fn get_providers(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let providers = providers::get_providers(&pool).await?;

    Ok(Json(providers))
}

/// Get a specific source provider by ID
#[utoipa::path(
    get,
    path = "/providers/{id}",
    tag = "providers",
    responses(
        (status = 200, description = "Provider retrieved successfully", body = Provider),
        (status = 404, description = "Provider not found"),
    ),
    params(
        ("id" = String, Path, description = "Provider database ID"),
    )
)]
pub async fn get_provider(
    State(pool): State<PgPool>,
    Path(provider_id): Path<String>,
) -> Result<impl IntoResponse> {
    let provider = providers::get_provider(&pool, &provider_id).await?;

    if let Some(provider) = provider {
        Ok(Json(provider).into_response())
    } else {
        Ok(StatusCode::NOT_FOUND.into_response())
    }
}
