use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::logic::ignore_lists;
use database::PgPool;

use crate::Result;

/// Get all of the ignore list entries for a specific list
#[utoipa::path(
    get,
    path = "/ignoreLists/{id}/entries",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list entries retrieved successfully", body = Vec<IgnoreListEntry>),
    ),
    params(
        ("id" = String, Path, description = "Ignore list database ID"),
    )
)]
pub async fn get_list_entries(
    State(pool): State<PgPool>,
    Path(list_id): Path<String>,
) -> Result<impl IntoResponse> {
    let list_entries = ignore_lists::get_list_entries(&pool, &list_id).await?;

    Ok(Json(list_entries))
}
