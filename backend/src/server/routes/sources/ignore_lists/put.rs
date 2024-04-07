use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use postgres::logic::sources;
use postgres::PgPool;
use uuid::Uuid;

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
        ("id" = Uuid, Path, description = "Source database ID"),
    ),
    request_body(
        description = "The ignore lists to replace",
        content_type = "application/json",
        content = Vec<Uuid>
    )
)]
pub async fn put_source_ignore_lists(
    State(pool): State<PgPool>,
    Path(source_id): Path<Uuid>,
    Json(ignore_list_ids): Json<Vec<Uuid>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    sources::delete_all_source_ignore_lists(&mut *transaction, &source_id).await?;
    sources::add_source_ignore_lists(&mut *transaction, &source_id, &ignore_list_ids).await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
