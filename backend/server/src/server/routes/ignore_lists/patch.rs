use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use database::PgPool;
use database::{logic::ignore_lists, schemas::ignore_lists::UpdateIgnoreList};
use uuid::Uuid;

use crate::Result;

/// Partially update an ignore list by its ID
#[utoipa::path(
    patch,
    path = "/ignoreLists/{id}",
    tag = "ignoreLists",
    responses(
        (status = 204, description = "Ignore list updated successfully", body = ()),
        (status = 404, description = "Ignore list not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Ignore list database ID"),
        UpdateIgnoreList
    )
)]
pub async fn patch_list(
    State(pool): State<PgPool>,
    Path(list_id): Path<Uuid>,
    Json(data): Json<UpdateIgnoreList>,
) -> Result<impl IntoResponse> {
    let num_affected = ignore_lists::update_list(&pool, &list_id, data).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
