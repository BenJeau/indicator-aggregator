use axum::{routing::get, Router};

use crate::ServerState;

pub mod delete;
pub mod get;
pub mod patch;

pub mod ignore_lists;
pub mod providers;
pub mod requests;
pub mod sources;

pub fn router() -> Router<ServerState> {
    let user_router = Router::new()
        .route("/logs", get(get::get_user_logs))
        .route(
            "/apiTokens",
            get(get::get_user_api_tokens).delete(delete::delete_user_api_tokens),
        )
        .route("/", get(get::get_user).patch(patch::update_user))
        .nest("/ignoreLists", ignore_lists::router())
        .nest("/providers", providers::router())
        .nest("/requests", requests::router())
        .nest("/sources", sources::router());

    Router::new()
        .route("/", get(get::get_users))
        .nest("/:id", user_router)
}
