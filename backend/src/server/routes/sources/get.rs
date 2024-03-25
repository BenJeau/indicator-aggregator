use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{postgres::logic::sources, Result};

/// Get all sources
#[utoipa::path(
    get,
    path = "/sources",
    tag = "sources",
    responses(
        (status = 200, description = "Sources retrieved successfully", body = Vec<Source>),
    ),
)]
pub async fn get_sources(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let sources = sources::get_sources(&pool).await?;

    Ok(Json(sources))
}

/// Get a specific source by ID
#[utoipa::path(
    get,
    path = "/sources/{id}",
    tag = "sources",
    responses(
        (status = 200, description = "Source retrieved successfully", body = Source),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Source database ID"),
    )
)]
pub async fn get_source(
    State(pool): State<PgPool>,
    Path(source_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let source = sources::get_source(&pool, &source_id).await?;

    Ok(Json(source))
}
