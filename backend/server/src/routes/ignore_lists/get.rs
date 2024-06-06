use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::ignore_lists, PgPool};

use crate::{Error, Result};

/// Get all ignore lists
#[utoipa::path(
    get,
    path = "/ignoreLists",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore lists retrieved successfully", body = [IgnoreList]),
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
        ("id" = String, Path, description = "Ignore list database ID"),
    )
)]
pub async fn get_list(
    State(pool): State<PgPool>,
    Path(list_id): Path<String>,
) -> Result<impl IntoResponse> {
    let list = ignore_lists::get_list(&pool, &list_id)
        .await?
        .ok_or(Error::NotFound)?;

    Ok(Json(list))
}

/// Get the ignore lists affecting all sources
#[utoipa::path(
    get,
    path = "/ignoreLists/global",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Global ignore list retrieved successfully", body = [IgnoreList]),
    ),
)]
pub async fn get_global_lists(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let lists = ignore_lists::get_global_lists(&pool).await?;

    Ok(Json(lists))
}
