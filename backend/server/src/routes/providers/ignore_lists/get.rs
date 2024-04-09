use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::logic::providers;
use database::PgPool;
use uuid::Uuid;

use crate::Result;

/// Get the ignore lists for a specific source provider
#[utoipa::path(
    get,
    path = "/providers/{id}/ignoreLists",
    tag = "providers",
    responses(
        (status = 200, description = "Provider ignore lists retrieved successfully", body = Vec<IgnoreList>),
    ),
    params(
        ("id" = Uuid, Path, description = "Provider database ID"),
    )
)]
pub async fn get_provider_ignore_lists(
    State(pool): State<PgPool>,
    Path(provider_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let ignore_lists = providers::get_provider_ignore_lists(&pool, &provider_id).await?;

    Ok(Json(ignore_lists))
}
