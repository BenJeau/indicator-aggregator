use axum::{routing::get, Router};

use crate::ServerState;

pub mod delete;
pub mod get;
pub mod patch;
pub mod post;

pub mod ignore_lists;
pub mod sources;

pub fn router() -> Router<ServerState> {
    Router::new()
        .nest(
            "/:id",
            Router::new()
                .nest("/sources", sources::router())
                .nest("/ignoreLists", ignore_lists::router())
                .route(
                    "/",
                    get(get::get_provider)
                        .delete(delete::delete_provider)
                        .patch(patch::patch_provider),
                ),
        )
        .route("/", get(get::get_providers).post(post::create_provider))
}
