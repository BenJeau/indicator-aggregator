use axum::{
    routing::{delete, get},
    Router,
};

use crate::ServerState;

pub mod delete;
pub mod get;
pub mod patch;
pub mod post;

pub fn router() -> Router<ServerState> {
    Router::new()
        .route("/", get(get::get_secrets).post(post::create_secret))
        .nest(
            "/:id",
            Router::new()
                .route(
                    "/",
                    delete(delete::delete_secret).patch(patch::patch_secret),
                )
                .route("/value", get(get::get_secret_value)),
        )
}
