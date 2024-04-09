use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use database::PgPool;
use database::{logic::ignore_lists, schemas::ignore_lists::CreateIngoreListEntry};
use uuid::Uuid;

use crate::Result;

/// Replace all ignore list entries for a specific list
#[utoipa::path(
    put,
    path = "/ignoreLists/{id}/entries",
    tag = "ignoreLists",
    responses(
        (status = 201, description = "Ignore list entries replaced successfully"),
    ),
    params(
        ("id" = Uuid, Path, description = "Ignore list database ID"),
    ),
    request_body(
        content_type = "application/json", content = Vec<CreateIngoreListEntry>, description = "List of ignore list entries"
    )
)]
pub async fn put_ignore_list_entries(
    State(pool): State<PgPool>,
    Path(list_id): Path<Uuid>,
    Json(data): Json<Vec<CreateIngoreListEntry>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    ignore_lists::delete_all_ignore_list_entries(&mut *transaction, &list_id).await?;
    ignore_lists::add_entries_to_list(&mut *transaction, &list_id, data).await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
