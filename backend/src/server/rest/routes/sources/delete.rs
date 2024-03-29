use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{postgres::logic::sources, Result};

/// Delete a specific source by ID
#[utoipa::path(
    delete,
    path = "/sources/{id}",
    tag = "sources",
    responses(
        (status = 204, description = "Source deleted successfully"),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Source database ID"),
    )
)]
pub async fn delete_source(
    State(pool): State<PgPool>,
    Path(source_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let num_affected = sources::delete_source(&pool, &source_id).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
