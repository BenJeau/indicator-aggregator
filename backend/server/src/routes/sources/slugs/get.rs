use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use database::{logic::sources, PgPool};

use crate::Result;

/// Get a source ID from a slug
#[utoipa::path(
    get,
    path = "/sources/slugs/{slug}",
    tag = "sources",
    responses(
        (status = 200, description = "Source ID retrieved successfully", body = String),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("slug" = String, Path, description = "Source slug"),
    )
)]
pub async fn get_source_id_from_slug(
    State(pool): State<PgPool>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse> {
    let source_id = sources::get_source_id_from_slug(&pool, &slug).await?;

    if let Some(source_id) = source_id {
        Ok(source_id.into_response())
    } else {
        Ok(StatusCode::NOT_FOUND.into_response())
    }
}
