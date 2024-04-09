use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::logic::ignore_lists;
use database::PgPool;
use uuid::Uuid;

use crate::Result;

/// Get the sources affected by an ignore list
#[utoipa::path(
    get,
    path = "/ignoreLists/{id}/sources",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list sources retrieved successfully", body = Vec<Source>),
    ),
    params(
        ("id" = Uuid, Path, description = "Ignore list database ID"),
    )
)]
pub async fn get_list_sources(
    State(pool): State<PgPool>,
    Path(list_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let sources = ignore_lists::get_list_sources(&pool, &list_id).await?;

    Ok(Json(sources))
}
