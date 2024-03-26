use axum::{routing::get, Router};

use crate::ServerState;

pub mod delete;
pub mod get;
pub mod patch;
pub mod post;

pub mod ignore_lists;
pub mod requests;
pub mod secrets;

pub fn router() -> Router<ServerState> {
    Router::new()
        .nest(
            "/:id",
            Router::new()
                .route(
                    "/",
                    get(get::get_source)
                        .delete(delete::delete_source)
                        .patch(patch::patch_source),
                )
                .nest("/ignoreLists", ignore_lists::router())
                .nest("/secrets", secrets::router())
                .nest("/requests", requests::router()),
        )
        .route("/", get(get::get_sources).post(post::create_source))
}
