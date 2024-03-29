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
    path = "/ignoreLists/{id}/providers",
    tag = "ignoreLists",
    responses(
        (status = 201, description = "Ignore list providers updated successfully"),
    ),
    params(
        ("id" = Uuid, Path, description = "Ignore list database ID"),
    ),
    request_body(
        content_type = "application/json", content = Vec<Uuid>, description = "List of provider database IDs"
    )
)]
pub async fn put_ignore_list_providers(
    State(pool): State<PgPool>,
    Path(ignore_list_id): Path<Uuid>,
    Json(provider_ids): Json<Vec<Uuid>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    ignore_lists::delete_all_ignore_list_providers(&mut *transaction, &ignore_list_id).await?;
    ignore_lists::add_ignore_list_providers(&mut *transaction, &ignore_list_id, &provider_ids)
        .await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
