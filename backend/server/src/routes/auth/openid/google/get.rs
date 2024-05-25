use auth::openid::{logic, RedirectCallbackQuery, RedirectLoginQuery};
use axum::{
    extract::{ConnectInfo, OriginalUri, Query, State},
    http::HeaderMap,
    response::IntoResponse,
};
use axum_extra::{headers::UserAgent, TypedHeader};
use serde::Deserialize;
use std::net::SocketAddr;
use tracing::info;
use utoipa::{IntoParams, ToSchema};

use crate::{Error, Result, ServerState};

/// Redirect to Google OAuth2 login
#[utoipa::path(
    get,
    path = "/auth/openid/google",
    tag = "auth",
    responses(
        (status = 302, description = "Redirect to Google login page"),
    ),
    params(RedirectLoginQuery)
)]
pub async fn google_redirect_login(
    State(state): State<ServerState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    headers: HeaderMap,
    Query(query): Query<RedirectLoginQuery>,
) -> Result<impl IntoResponse> {
    let Some(keys) = state.auth_state.google_keys else {
        return Err(Error::NotFound);
    };

    keys.0
        .handle_redirect_login(
            &query,
            &addr,
            &user_agent,
            &state.pool,
            &state.config.auth,
            "google",
            headers,
        )
        .await
        .map_err(Into::into)
}

#[derive(Deserialize, IntoParams, ToSchema)]
pub struct GoogleCallbackContent {
    #[serde(flatten)]
    data: RedirectCallbackQuery,
    scope: String,
    authuser: Option<usize>,
    prompt: Option<String>,
}

/// Google OAuth2 callback
#[utoipa::path(
    get,
    path = "/auth/openid/google/redirect",
    tag = "auth",
    responses(
        (status = 302, description = "Redirect to Indicator Aggregator frontend")
    ),
    params(GoogleCallbackContent)
)]
pub async fn google_auth_redirect_callback(
    State(state): State<ServerState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    Query(content): Query<GoogleCallbackContent>,
    OriginalUri(uri): OriginalUri,
) -> Result<impl IntoResponse> {
    info!(
        scope = content.scope.as_str(),
        authuser = content.authuser,
        prompt = content.prompt.as_deref(),
        "Google OAuth2 callback"
    );

    logic(
        &state.pool,
        &state.auth_state,
        &content.data,
        "google",
        &addr,
        &user_agent,
        &uri,
    )
    .await
    .map_err(Into::into)
}
