use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::ignore_lists, PgPool};

use crate::Result;

/// Get the providers affected by an ignore list
#[utoipa::path(
    get,
    path = "/ignoreLists/{id}/providers",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list providers retrieved successfully", body = [Provider]),
    ),
    params(
        ("id" = String, Path, description = "Ignore list database ID"),
    )
)]
pub async fn get_list_providers(
    State(pool): State<PgPool>,
    Path(list_id): Path<String>,
) -> Result<impl IntoResponse> {
    let providers = ignore_lists::get_list_providers(&pool, &list_id).await?;

    Ok(Json(providers))
}
