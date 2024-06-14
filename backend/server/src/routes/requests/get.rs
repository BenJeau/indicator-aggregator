use auth::require_roles;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Extension, Json,
};
use database::{logic::requests, schemas::users::User, PgPool};

use crate::{Error, Result};

/// Get all requests
#[utoipa::path(
    get,
    path = "/requests",
    tag = "requests",
    responses(
        (status = 200, description = "List of requests", body = [Request]),
    )
)]
pub async fn get_requests(
    Extension(user): Extension<User>,
    State(pool): State<PgPool>,
) -> Result<impl IntoResponse> {
    require_roles(&user.roles, &["request_view"])?;

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
        ("id" = String, Path, description = "Request ID"),
    )
)]
pub async fn get_request(
    Extension(user): Extension<User>,
    State(pool): State<PgPool>,
    Path(request_id): Path<String>,
) -> Result<impl IntoResponse> {
    require_roles(&user.roles, &["request_view"])?;

    let request = requests::get_request(&pool, &request_id)
        .await?
        .ok_or(Error::NotFound)?;

    Ok(Json(request))
}

/// Get request data
#[utoipa::path(
    get,
    path = "/requests/{id}/history",
    tag = "requests",
    responses(
        (status = 200, description = "Request data", body = [SourceRequest]),
    ),
    params(
        ("id" = String, Path, description = "Request ID"),
    )
)]
pub async fn get_request_data(
    Extension(user): Extension<User>,
    State(pool): State<PgPool>,
    Path(request_id): Path<String>,
) -> Result<impl IntoResponse> {
    require_roles(&user.roles, &["request_view"])?;

    let request_data = requests::get_request_source_requests(&pool, &request_id).await?;

    Ok(Json(request_data))
}
