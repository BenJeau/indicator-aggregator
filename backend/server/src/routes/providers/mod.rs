use axum::{routing::get, Router};

use crate::ServerState;

pub mod delete;
pub mod get;
pub mod patch;
pub mod post;

pub mod ignore_lists;
pub mod slugs;
pub mod sources;

pub fn router() -> Router<ServerState> {
    let provider_router = Router::new()
        .nest("/sources", sources::router())
        .nest("/ignoreLists", ignore_lists::router())
        .route(
            "/",
            get(get::get_provider)
                .delete(delete::delete_provider)
                .patch(patch::patch_provider),
        );

    Router::new()
        .nest("/:id", provider_router)
        .route("/", get(get::get_providers).post(post::create_provider))
        .route("/slugs/:slug", get(slugs::get::get_provider_id_from_slug))
}
