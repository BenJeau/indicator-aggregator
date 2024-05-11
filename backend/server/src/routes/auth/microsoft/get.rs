use auth::openid::{logic, RedirectCallbackQuery, RedirectLoginQuery};
use axum::{
    extract::{ConnectInfo, OriginalUri, Query, State},
    http::HeaderMap,
    response::IntoResponse,
};
use axum_extra::{headers::UserAgent, TypedHeader};
use std::net::SocketAddr;
use tracing::info;

use crate::{Result, ServerState};

/// Redirect to Microsoft OAuth2 login
#[utoipa::path(
    get,
    path = "/auth/microsoft",
    tag = "auth",
    responses(
        (status = 302, description = "Redirect to Microsoft login page"),
    ),
    params(RedirectLoginQuery)
)]
pub async fn microsoft_redirect_login(
    State(state): State<ServerState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    headers: HeaderMap,
    Query(query): Query<RedirectLoginQuery>,
) -> Result<impl IntoResponse> {
    state
        .auth_state
        .microsoft_keys
        .0
        .handle_redirect_login(
            &query,
            &addr,
            &user_agent,
            &state.pool,
            &state.config.auth,
            "microsoft",
            headers,
        )
        .await
        .map_err(Into::into)
}

/// Microsoft OAuth2 callback
#[utoipa::path(
    get,
    path = "/auth/microsoft/redirect",
    tag = "auth",
    responses(
        (status = 302, description = "Redirect to Indicator Aggregator frontend")
    ),
    params(RedirectCallbackQuery)
)]
pub async fn microsoft_auth_redirect_callback(
    State(state): State<ServerState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    Query(query): Query<RedirectCallbackQuery>,
    OriginalUri(uri): OriginalUri,
) -> Result<impl IntoResponse> {
    info!("Microsoft OAuth2 callback");

    logic(
        &state.pool,
        &state.auth_state,
        &query,
        "microsoft",
        &addr,
        &user_agent,
        &uri,
    )
    .await
    .map_err(Into::into)
}
