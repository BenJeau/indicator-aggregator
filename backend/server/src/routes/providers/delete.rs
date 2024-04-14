use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use database::logic::providers;
use database::PgPool;

use crate::Result;

/// Delete a specific provider by ID
#[utoipa::path(
    delete,
    path = "/providers/{id}",
    tag = "providers",
    responses(
        (status = 204, description = "Provider deleted successfully"),
        (status = 404, description = "Provider not found"),
    ),
    params(
        ("id" = String, Path, description = "Provider database ID"),
    )
)]
pub async fn delete_provider(
    State(pool): State<PgPool>,
    Path(provider_id): Path<String>,
) -> Result<impl IntoResponse> {
    let num_affected = providers::delete_provider(&pool, &provider_id).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
