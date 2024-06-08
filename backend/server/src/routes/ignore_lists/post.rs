use axum::{extract::State, response::IntoResponse, Extension, Json};
use database::{
    logic::ignore_lists,
    schemas::{ignore_lists::CreateIgnoreList, users::User},
    PgPool,
};

use crate::Result;

/// Create a new ignore list
#[utoipa::path(
    post,
    path = "/ignoreLists",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list created successfully", body = IdSlug),
    ),
    params(CreateIgnoreList),
)]
pub async fn create_list(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Json(list): Json<CreateIgnoreList>,
) -> Result<impl IntoResponse> {
    let created_list = ignore_lists::create_list(&pool, list, &user.id).await?;

    Ok(Json(created_list))
}
