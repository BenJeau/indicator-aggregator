use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{logic::sources, schemas::users::User, PgPool};

use crate::Result;

/// Replace the ignore lists for a specific source
#[utoipa::path(
    put,
    path = "/sources/{id}/ignoreLists",
    tag = "sources",
    responses(
        (status = 201, description = "Source ignore lists replaced successfully"),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = String, Path, description = "Source database ID"),
    ),
    request_body(
        description = "The ignore lists to replace",
        content_type = "application/json",
        content = Vec<String>
    )
)]
pub async fn put_source_ignore_lists(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(source_id): Path<String>,
    Json(ignore_list_ids): Json<Vec<String>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    // TODO: don't unset and set everything... then set the updated_user_id accordingly
    sources::delete_all_source_ignore_lists(&mut *transaction, &source_id).await?;
    sources::add_source_ignore_lists(&mut *transaction, &source_id, &ignore_list_ids, &user.id)
        .await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
