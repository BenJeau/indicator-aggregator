use axum::{
    extract::{ConnectInfo, Request, State},
    middleware::Next,
    response::Response,
};
use axum_extra::{
    headers::{authorization::Bearer, Authorization, UserAgent},
    TypedHeader,
};
use database::PgPool;
use std::net::SocketAddr;

use crate::{Result, ServerState};

#[tracing::instrument(skip_all)]
pub async fn auth_middleware(
    State(state): State<ServerState>,
    State(pool): State<PgPool>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    TypedHeader(user_agent): TypedHeader<UserAgent>,
    mut request: Request,
    next: Next,
) -> Result<Response> {
    auth::middleware::auth_middleware(pool, state.auth_state, addr, auth, user_agent, &mut request)
        .await?;

    Ok(next.run(request).await)
}
