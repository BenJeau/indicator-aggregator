use axum::{routing::get, Router};

use crate::ServerState;

pub mod delete;
pub mod get;
pub mod patch;
pub mod post;

pub mod entries;
pub mod providers;
pub mod sources;

pub fn router() -> Router<ServerState> {
    Router::new()
        .nest(
            "/:id",
            Router::new()
                .route(
                    "/",
                    get(get::get_list)
                        .delete(delete::delete_list)
                        .patch(patch::patch_list),
                )
                .nest("/entries", entries::router())
                .nest("/providers", providers::router())
                .nest("/sources", sources::router()),
        )
        .route("/", get(get::get_lists).post(post::create_list))
        .route("/global", get(get::get_global_lists))
}
