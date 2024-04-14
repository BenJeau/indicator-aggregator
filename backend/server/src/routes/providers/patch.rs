use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use database::PgPool;
use database::{logic::providers, schemas::providers::PatchProvider};

use crate::Result;

/// Partially update a specific source provider by database ID
#[utoipa::path(
    patch,
    path = "/providers/{id}",
    tag = "providers",
    responses(
        (status = 204, description = "Provider updated successfully"),
        (status = 404, description = "Provider not found"),
    ),
    params(
        ("id" = String, Path, description = "Provider database ID"),
    ),
    request_body(
        description = "Fields to update",
        content_type = "application/json",
        content = PatchProvider
    )
)]
pub async fn patch_provider(
    State(pool): State<PgPool>,
    Path(provider_id): Path<String>,
    Json(provider): Json<PatchProvider>,
) -> Result<impl IntoResponse> {
    let num_affected = providers::patch_provider(&pool, &provider_id, provider).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
