use auth::openid::{parse_and_validate_referer, CreateUserClaims};
use axum::{
    extract::{ConnectInfo, OriginalUri, State},
    http::HeaderMap,
    response::IntoResponse,
    Json,
};
use axum_extra::{headers::UserAgent, TypedHeader};
use database::{logic::users, schemas::users::UserLog};
use shared::crypto::verify_password;
use std::net::SocketAddr;

use crate::{
    config::AUTH_PROVIDER,
    schemas::{LoginUserRequest, LoginUserResponse},
    Error, Result, ServerState,
};

/// Login to authenticate and generate a new JWT
#[utoipa::path(
    post,
    path = "/auth/login",
    tag = "auth",
    responses(
        (status = 200, description = "User logged in successfully", body = LoginUserResponse),
    ),
    request_body(
        description = "User information needed to authenticate a user",
        content_type = "application/json",
        content = LoginUserRequest
    )
)]
pub async fn login(
    State(state): State<ServerState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    OriginalUri(uri): OriginalUri,
    headers: HeaderMap,
    Json(data): Json<LoginUserRequest>,
) -> Result<impl IntoResponse> {
    let Some(user) = users::get_user_from_email(&state.pool, &data.email).await? else {
        return Err(Error::InvalidCredentials);
    };

    if !verify_password(&data.password, &user.password.unwrap())? {
        return Err(Error::InvalidCredentials);
    }

    if !user.enabled {
        return Err(Error::DisabledUser);
    }

    let user_log = UserLog {
        user_id: user.id.clone(),
        ip_address: addr.to_string(),
        user_agent: user_agent.to_string(),
        uri: uri.to_string(),
        method: "GET".to_string(),
    };
    users::create_user_log(&state.pool, &user_log).await?;

    parse_and_validate_referer(&headers, &state.config.auth)?;

    let claims = CreateUserClaims {
        sub: user.id.clone(),
        email: user.email,
        email_verified: Some(user.verified),
        name: user.name,
        given_name: user.given_name,
        family_name: user.family_name,
        picture: None,
        locale: user.locale,
        provider: AUTH_PROVIDER.to_string(),
    };

    let jwt_token = claims.generate_jwt(&state.auth_state.jwt_manager, user.roles, user.id)?;

    Ok(Json(LoginUserResponse { jwt_token }).into_response())
}
