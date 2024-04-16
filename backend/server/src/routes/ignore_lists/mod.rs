use axum::{routing::get, Router};

use crate::ServerState;

pub mod delete;
pub mod get;
pub mod patch;
pub mod post;

pub mod entries;
pub mod providers;
pub mod slugs;
pub mod sources;

pub fn router() -> Router<ServerState> {
    let ignore_list_router = Router::new()
        .route(
            "/",
            get(get::get_list)
                .delete(delete::delete_list)
                .patch(patch::patch_list),
        )
        .nest("/entries", entries::router())
        .nest("/providers", providers::router())
        .nest("/sources", sources::router());

    Router::new()
        .nest("/:id", ignore_list_router)
        .route("/", get(get::get_lists).post(post::create_list))
        .route("/global", get(get::get_global_lists))
        .route(
            "/slugs/:slug",
            get(slugs::get::get_ignore_list_id_from_slug),
        )
}
