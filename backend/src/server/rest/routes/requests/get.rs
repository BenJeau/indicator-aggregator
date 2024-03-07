use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{postgres::logic::requests, Result};

/// Get all requests
#[utoipa::path(
    get,
    path = "/requests",
    tag = "requests",
    responses(
        (status = 200, description = "List of requests", body = Vec<Request>),
    )
)]
pub async fn get_requests(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let requests = requests::get_requests(&pool).await?;

    Ok(Json(requests))
}

/// Get a single request
#[utoipa::path(
    get,
    path = "/requests/{id}",
    tag = "requests",
    responses(
        (status = 200, description = "Request data", body = Request),
        (status = 404, description = "Request not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Request ID"),
    )
)]
pub async fn get_request(
    State(pool): State<PgPool>,
    Path(request_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let request = requests::get_request(&pool, &request_id).await?;

    if let Some(request) = request {
        Ok(Json(request).into_response())
    } else {
        Ok(StatusCode::NOT_FOUND.into_response())
    }
}

/// Get request data
#[utoipa::path(
    get,
    path = "/requests/{id}/history",
    tag = "requests",
    responses(
        (status = 200, description = "Request data", body = Vec<SourceRequest>),
    ),
    params(
        ("id" = Uuid, Path, description = "Request ID"),
    )
)]
pub async fn get_request_data(
    State(pool): State<PgPool>,
    Path(request_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let request_data = requests::get_request_source_requests(&pool, &request_id).await?;

    Ok(Json(request_data))
}
