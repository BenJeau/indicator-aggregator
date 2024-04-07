use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use postgres::logic::ignore_lists;
use postgres::PgPool;
use uuid::Uuid;

use crate::Result;

/// Get the providers affected by an ignore list
#[utoipa::path(
    get,
    path = "/ignoreLists/{id}/providers",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list providers retrieved successfully", body = Vec<Provider>),
    ),
    params(
        ("id" = Uuid, Path, description = "Ignore list database ID"),
    )
)]
pub async fn get_list_providers(
    State(pool): State<PgPool>,
    Path(list_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let providers = ignore_lists::get_list_providers(&pool, &list_id).await?;

    Ok(Json(providers))
}
