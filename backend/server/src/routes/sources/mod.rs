use axum::{routing::get, Router};

use crate::ServerState;

pub mod delete;
pub mod get;
pub mod patch;
pub mod post;

pub mod ignore_lists;
pub mod requests;
pub mod secrets;
pub mod slugs;

pub fn router() -> Router<ServerState> {
    let source_router = Router::new()
        .route(
            "/",
            get(get::get_source)
                .delete(delete::delete_source)
                .patch(patch::patch_source),
        )
        .nest("/ignoreLists", ignore_lists::router())
        .nest("/secrets", secrets::router())
        .nest("/requests", requests::router());
    Router::new()
        .nest("/:id", source_router)
        .route("/", get(get::get_sources).post(post::create_source))
        .route("/slugs/:slug", get(slugs::get::get_source_id_from_slug))
}
