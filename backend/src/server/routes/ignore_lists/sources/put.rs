use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{postgres::logic::ignore_lists, Result};

/// Updates the list of sources affected by an ignore list
#[utoipa::path(
    put,
    path = "/ignoreLists/{id}/sources",
    tag = "ignoreLists",
    responses(
        (status = 201, description = "Ignore list sources updated successfully"),
    ),
    params(
        ("id" = Uuid, Path, description = "Ignore list database ID"),
    ),
    request_body(
        content_type = "application/json", content = Vec<Uuid>, description = "List of source database IDs"
    )
)]
pub async fn put_ignore_list_sources(
    State(pool): State<PgPool>,
    Path(ignore_list_id): Path<Uuid>,
    Json(source_ids): Json<Vec<Uuid>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    ignore_lists::delete_all_ignore_list_sources(&mut *transaction, &ignore_list_id).await?;
    ignore_lists::add_ignore_list_sources(&mut *transaction, &ignore_list_id, &source_ids).await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
