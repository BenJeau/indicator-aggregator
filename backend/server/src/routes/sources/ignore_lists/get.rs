use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::sources, PgPool};

use crate::Result;

/// Get the ignore lists for a specific source
#[utoipa::path(
    get,
    path = "/sources/{id}/ignoreLists",
    tag = "sources",
    responses(
        (status = 200, description = "Source ignore lists retrieved successfully", body = [IgnoreList]),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = String, Path, description = "Source database ID"),
    )
)]
pub async fn get_source_ignore_lists(
    State(pool): State<PgPool>,
    Path(source_id): Path<String>,
) -> Result<impl IntoResponse> {
    let ignore_lists = sources::get_source_ignore_lists(&pool, &source_id).await?;

    Ok(Json(ignore_lists))
}
