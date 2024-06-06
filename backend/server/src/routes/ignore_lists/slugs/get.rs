use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use database::{logic::ignore_lists, PgPool};

use crate::{Error, Result};

/// Get an ignore list ID from a slug
#[utoipa::path(
    get,
    path = "/ignoreLists/slugs/{slug}",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list ID retrieved successfully", body = String),
        (status = 404, description = "Ignore list not found"),
    ),
    params(
        ("slug" = String, Path, description = "Ignore list slug"),
    )
)]
pub async fn get_ignore_list_id_from_slug(
    State(pool): State<PgPool>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse> {
    let ignore_list_id = ignore_lists::get_ignore_list_id_from_slug(&pool, &slug)
        .await?
        .ok_or(Error::NotFound)?;

    Ok(ignore_list_id)
}
