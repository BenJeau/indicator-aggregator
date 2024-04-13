use crate::routes;
use crate::state::test::create_state;
pub use axum::{
    body::Body,
    http::{self, Method, Request, StatusCode},
};
pub use http_body_util::BodyExt;
pub use serde_json::{json, Value};
pub use sqlx::PgPool;
pub use tower::ServiceExt;

fn router(pool: PgPool) -> axum::Router {
    routes::router(create_state(pool))
}

async fn create_request(method: Method, uri: &str) -> http::Result<Request<Body>> {
    Request::builder()
        .method(method)
        .uri(uri)
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
