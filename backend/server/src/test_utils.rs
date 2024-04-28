use axum::extract::connect_info::MockConnectInfo;
pub use axum::{
    body::Body,
    http::{self, Method, Request, StatusCode},
};
pub use http_body_util::BodyExt;
use reqwest::header::{AUTHORIZATION, USER_AGENT};
pub use serde_json::{json, Value};
pub use sqlx::PgPool;
use std::net::SocketAddr;
pub use tower::ServiceExt;

use crate::routes;
use crate::state::test::create_state;

fn router(pool: PgPool) -> axum::Router {
    routes::router(create_state(pool))
        .layer(MockConnectInfo(SocketAddr::from(([0, 0, 0, 0], 1337))))
}

async fn create_request(method: Method, uri: &str) -> http::Result<Request<Body>> {
    Request::builder()
        .method(method)
        .uri(uri)
        .header(AUTHORIZATION, "Bearer test")
        .header(USER_AGENT, "test")
        .body(Body::empty())
}

pub async fn json_response<V>(response: http::Response<Body>) -> V
where
    V: serde::de::DeserializeOwned,
{
    let body = response.into_body().collect().await.unwrap().to_bytes();
    serde_json::from_slice(&body).unwrap()
}

pub async fn str_response(response: http::Response<Body>) -> String {
    let body = response.into_body().collect().await.unwrap().to_bytes();
    String::from_utf8(body.to_vec()).unwrap()
}

pub async fn request(method: Method, uri: &str, pool: PgPool) -> http::Response<Body> {
    let router = router(pool);
    let request = create_request(method, uri).await.unwrap();
    router.oneshot(request).await.unwrap()
}

pub async fn json_request(
    method: Method,
    uri: &str,
    pool: PgPool,
    body: Value,
) -> http::Response<Body> {
    let router = router(pool);
    let request = Request::builder()
        .method(method)
        .uri(uri)
        .header("Content-Type", "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    router.oneshot(request).await.unwrap()
}
