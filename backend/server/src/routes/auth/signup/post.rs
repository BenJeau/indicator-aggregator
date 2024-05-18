use auth::openid::parse_and_validate_referer;
use axum::{
    extract::{ConnectInfo, OriginalUri, State},
    http::HeaderMap,
    response::IntoResponse,
    Json,
};
use axum_extra::{headers::UserAgent, TypedHeader};
use database::{
    logic::users,
    schemas::users::{CreateUser, UserLog},
};
use reqwest::StatusCode;
use shared::crypto::hash_password;
use std::net::SocketAddr;

use crate::{config::AUTH_PROVIDER, schemas::SignupUserRequest, Result, ServerState};

/// Signup to create a new user
#[utoipa::path(
    post,
    path = "/auth/signup",
    tag = "auth",
    responses(
        (status = 201, description = "User created successfully"),
    ),
    request_body(
        description = "User information needed to create new user",
        content_type = "application/json",
        content = SignupUserRequest
    )
)]
pub async fn signup(
    State(state): State<ServerState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    OriginalUri(uri): OriginalUri,
    headers: HeaderMap,
    Json(data): Json<SignupUserRequest>,
) -> Result<impl IntoResponse> {
    let create_user = CreateUser {
        auth_id: None,
        provider: AUTH_PROVIDER.to_string(),
        email: data.email,
        verified: false,
        name: data.name,
        picture: None,
        given_name: None,
        family_name: None,
        enabled: false,
        locale: None,
        roles: Default::default(),
        hashed_password: Some(hash_password(&data.password)?),
    };
    let user = users::create_or_update_user(&state.pool, &create_user).await?;

    let user_log = UserLog {
        user_id: user.id,
        ip_address: addr.to_string(),
        user_agent: user_agent.to_string(),
        uri: uri.to_string(),
        method: "GET".to_string(),
    };
    users::create_user_log(&state.pool, &user_log).await?;

    parse_and_validate_referer(&headers, &state.config.auth)?;

    Ok(StatusCode::CREATED)
}
