use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    postgres::{logic::sources, schemas::sources::UpdateSource},
    Result,
};

/// Partially update a specific source by ID
#[utoipa::path(
    patch,
    path = "/sources/{id}",
    tag = "sources",
    responses(
        (status = 204, description = "Source updated successfully"),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Source database ID"),
    ),
    request_body(
        description = "Fields to update",
        content_type = "application/json",
        content = UpdateSource
    )
)]
pub async fn patch_source(
    State(pool): State<PgPool>,
    Path(source_id): Path<Uuid>,
    Json(source): Json<UpdateSource>,
) -> Result<impl IntoResponse> {
    let num_affected = sources::update_source(&pool, &source_id, source).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
