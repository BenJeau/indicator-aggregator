use axum::{extract::State, response::IntoResponse, Json};
use database::logic::stats;
use database::PgPool;

use crate::Result;

/// Total count of various items
#[utoipa::path(
    get,
    tag = "stats",
    path = "/stats/count",
    responses(
        (status = 200, description = "Count of various items", body = [Count])
    )
)]
pub async fn count(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let count = stats::count(&pool).await?;

    Ok(Json(count))
}

/// Count of requests for the last 24 hour divided by sources, per hour
#[utoipa::path(
    get,
    tag = "stats",
    path = "/stats/count/requests/sources",
    responses(
        (status = 200, body = [CountPerIdWrapper])
    )
)]
pub async fn count_requests_by_sources(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let count = stats::requests_per_source_last_day(&pool).await?;

    Ok(Json(count))
}

/// Count of requests for the last 24 hour divided by providers, per hour
#[utoipa::path(
    get,
    tag = "stats",
    path = "/stats/count/requests/providers",
    responses(
        (status = 200, body = [CountPerIdWrapper])
    )
)]
pub async fn count_requests_by_providers(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let count = stats::requests_per_provider_last_day(&pool).await?;

    Ok(Json(count))
}

/// Count of requests for the last 24 hour divided by indicator kinds, per hour
#[utoipa::path(
    get,
    tag = "stats",
    path = "/stats/count/requests/kinds",
    responses(
        (status = 200, body = [CountPerIdWrapper])
    )
)]
pub async fn count_requests_by_kind(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let count = stats::requests_per_kind_last_day(&pool).await?;

    Ok(Json(count))
}

/// Count of requests per hour for the last 24 hour divided by providers
#[utoipa::path(
    get,
    tag = "stats",
    path = "/stats/count/requests",
    responses(
        (status = 200, body = [CountPerHour])
    )
)]
pub async fn count_requests_by_hour(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let count = stats::requests_per_hour_last_day(&pool).await?;

    Ok(Json(count))
}
