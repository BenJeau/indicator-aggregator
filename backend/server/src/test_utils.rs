use axum::extract::connect_info::MockConnectInfo;
pub use axum::{
    body::Body,
    http::{self, Method, Request, StatusCode},
};
use database::{
    logic::{api_tokens, users},
    schemas::users::CreateUser,
};
pub use http_body_util::BodyExt;
use reqwest::header::{AUTHORIZATION, CONTENT_TYPE, USER_AGENT};
pub use serde_json::{json, Value};
use shared::crypto::hash_password;
pub use sqlx::PgPool;
use std::net::SocketAddr;
pub use tower::ServiceExt;

use crate::{config::AUTH_PROVIDER, routes, state::test::create_state};

const TEST_API_TOKEN: &str = "test-token";
const TEST_USER_AGENT: &str = "test-user-agent";

fn router(pool: PgPool) -> axum::Router {
    routes::router(create_state(pool))
        .layer(MockConnectInfo(SocketAddr::from(([0, 0, 0, 0], 1337))))
}

async fn create_request(method: Method, uri: &str, pool: &PgPool) -> http::request::Builder {
    let token_id = get_or_create_user_and_token(pool).await;

    Request::builder()
        .method(method)
        .uri(uri)
        .header(AUTHORIZATION, format!("Token {token_id}_{TEST_API_TOKEN}"))
        .header(USER_AGENT, TEST_USER_AGENT)
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
    let request = create_request(method, uri, &pool)
        .await
        .body(Body::empty())
        .unwrap();

    router(pool).oneshot(request).await.unwrap()
}

pub async fn json_request(
    method: Method,
    uri: &str,
    pool: PgPool,
    body: Value,
) -> http::Response<Body> {
    let body = Body::from(serde_json::to_vec(&body).unwrap());
    let request = create_request(method, uri, &pool)
        .await
        .header(CONTENT_TYPE, "application/json")
        .body(body)
        .unwrap();

    router(pool).oneshot(request).await.unwrap()
}

async fn get_or_create_user_and_token(pool: &sqlx::Pool<sqlx::Postgres>) -> String {
    let create_user = CreateUser {
        auth_id: None,
        provider: AUTH_PROVIDER.to_string(),
        enabled: true,
        email: "test@test.test".to_string(),
        verified: false,
        name: "Test User".to_string(),
        given_name: None,
        family_name: None,
        locale: None,
        picture: None,
        roles: Default::default(),
        hashed_password: None,
    };

    let user = users::create_or_update_user(pool, &create_user)
        .await
        .unwrap();

    let hashed_token = hash_password(TEST_API_TOKEN).unwrap();

    api_tokens::update_or_create_api_token(pool, Default::default(), &user.id, &hashed_token)
        .await
        .unwrap()
}
