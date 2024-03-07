use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{postgres::logic::ignore_lists, Result};

/// Get all ignore lists
#[utoipa::path(
    get,
    path = "/ignoreLists",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore lists retrieved successfully", body = Vec<IgnoreList>),
    ),
)]
pub async fn get_lists(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let lists = ignore_lists::get_lists(&pool).await?;

    Ok(Json(lists))
}

/// Get an ignore list by its database ID
#[utoipa::path(
    get,
    path = "/ignoreLists/{id}",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list retrieved successfully", body = IgnoreList),
        (status = 404, description = "Ignore list not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Ignore list database ID"),
    )
)]
pub async fn get_list(
    State(pool): State<PgPool>,
    Path(list_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let list = ignore_lists::get_list(&pool, &list_id).await?;

    if let Some(list) = list {
        Ok(Json(list).into_response())
    } else {
        Ok(StatusCode::NOT_FOUND.into_response())
    }
}

/// Get the ignore lists affecting all sources
#[utoipa::path(
    get,
    path = "/ignoreLists/global",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Global ignore list retrieved successfully", body = Vec<IgnoreList>),
    ),
)]
pub async fn get_global_lists(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let lists = ignore_lists::get_global_lists(&pool).await?;

    Ok(Json(lists))
}
