use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{postgres::logic::ignore_lists, Result};

/// Get all of the ignore list entries for a specific list
#[utoipa::path(
    get,
    path = "/ignoreLists/{id}/entries",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list entries retrieved successfully", body = Vec<IgnoreListEntry>),
    ),
    params(
        ("id" = Uuid, Path, description = "Ignore list database ID"),
    )
)]
pub async fn get_list_entries(
    State(pool): State<PgPool>,
    Path(list_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let list_entries = ignore_lists::get_list_entries(&pool, &list_id).await?;

    Ok(Json(list_entries))
}
