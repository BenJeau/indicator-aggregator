use axum::Router;

use crate::ServerState;

pub mod google;
pub mod microsoft;

pub fn router() -> Router<ServerState> {
    Router::new()
        .nest("/google", google::router())
        .nest("/microsoft", microsoft::router())
}
