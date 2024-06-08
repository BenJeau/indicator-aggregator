use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{
    logic::ignore_lists,
    schemas::{ignore_lists::CreateIngoreListEntry, users::User},
    PgPool,
};

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
        ("id" = String, Path, description = "Ignore list database ID"),
    ),
    request_body(
        content_type = "application/json", content = Vec<CreateIngoreListEntry>, description = "List of ignore list entries"
    )
)]
pub async fn put_ignore_list_entries(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(list_id): Path<String>,
    Json(data): Json<Vec<CreateIngoreListEntry>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    // TODO: don't unset and set everything... then set the updated_user_id accordingly
    ignore_lists::delete_all_ignore_list_entries(&mut *transaction, &list_id).await?;
    ignore_lists::add_entries_to_list(&mut *transaction, &list_id, data, &user.id).await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
