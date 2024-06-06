use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::requests, PgPool};

use crate::Result;

/// Get requests related to a specific source
#[utoipa::path(
    get,
    path = "/sources/{id}/requests",
    tag = "sources",
    responses(
        (status = 200, description = "List of source requests", body = [Request]),
    ),
    params(
        ("id" = String, Path, description = "Source database ID"),
    )
)]
pub async fn get_source_requests(
    State(pool): State<PgPool>,
    Path(source_id): Path<String>,
) -> Result<impl IntoResponse> {
    let requests = requests::get_source_requests(&pool, &source_id).await?;

    Ok(Json(requests))
}
