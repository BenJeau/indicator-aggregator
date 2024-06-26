use auth::middleware::Token;
use axum::{
    extract::{ConnectInfo, Request, State},
    middleware::Next,
    response::Response,
};
use axum_extra::{
    headers::{
        authorization::{Basic, Bearer},
        Authorization, UserAgent,
    },
    TypedHeader,
};
use std::net::SocketAddr;

use crate::{Result, ServerState};

#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip_all)]
pub async fn auth_middleware(
    State(state): State<ServerState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    bearer_auth: Option<TypedHeader<Authorization<Bearer>>>,
    token_auth: Option<TypedHeader<Authorization<Token>>>,
    basic_auth: Option<TypedHeader<Authorization<Basic>>>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    mut request: Request,
    next: Next,
) -> Result<Response> {
    auth::middleware::auth_middleware(
        state.pool,
        state.auth_state,
        addr,
        bearer_auth.map(|auth| auth.0),
        token_auth.map(|auth| auth.0),
        basic_auth.map(|auth| auth.0),
        user_agent,
        &mut request,
    )
    .await?;

    Ok(next.run(request).await)
}
