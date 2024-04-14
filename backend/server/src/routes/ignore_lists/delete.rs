use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use database::logic::ignore_lists;
use database::PgPool;

use crate::Result;

/// Deletes an ignore list by its ID
#[utoipa::path(
    delete,
    path = "/ignoreLists/{id}",
    tag = "ignoreLists",
    responses(
        (status = 204, description = "Ignore list deleted successfully"),
        (status = 404, description = "Ignore list not found"),
    ),
    params(
        ("id" = String, Path, description = "Ignore list database ID"),
    )
)]
pub async fn delete_list(
    State(pool): State<PgPool>,
    Path(list_id): Path<String>,
) -> Result<impl IntoResponse> {
    let num_affected = ignore_lists::delete_list(&pool, &list_id).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
