use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{postgres::logic::sources, Result};

/// Get the sources linked to a specific provider
#[utoipa::path(
    get,
    path = "/providers/{id}/sources",
    tag = "providers",
    responses(
        (status = 200, description = "Provider sources retrieved successfully", body = Vec<Source>),
    ),
    params(
        ("id" = Uuid, Path, description = "Provider database ID"),
    )
)]
pub async fn get_provider_sources(
    State(pool): State<PgPool>,
    Path(provider_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let sources = sources::get_provider_sources(&pool, &provider_id).await?;

    Ok(Json(sources))
}
