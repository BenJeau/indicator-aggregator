use axum_core::extract::Request;
use axum_extra::headers::{authorization::Bearer, Authorization, UserAgent};
use database::{logic::users, schemas::users::UserLog, PgPool};
use std::net::SocketAddr;
use tracing::Span;

use crate::{Error, Result};

#[tracing::instrument(skip_all)]
pub async fn auth_middleware(
    pool: PgPool,
    state: crate::config::State,
    addr: SocketAddr,
    auth: Authorization<Bearer>,
    user_agent: UserAgent,
    request: &mut Request,
) -> Result<()> {
    let claims = state.jwt_manager.get_claims(auth.token()).map_err(|err| {
        tracing::error!(?err, "Failed to get claims from token");
        Error::Unauthorized("Invalid token".to_string())
    })?;

    Span::current().record("user_id", &claims.data.sub);

    let user = users::get_user(&pool, &claims.data.sub).await?;

    let Some(user) = user else {
        return Err(Error::Unauthorized("User does not exist".to_string()));
    };

    if !user.enabled {
        return Err(Error::Unauthorized("User is disabled".to_string()));
    }

    request.extensions_mut().insert(user);

    let user_log = UserLog {
        user_id: claims.data.sub,
        ip_address: addr.to_string(),
        user_agent: user_agent.to_string(),
        uri: request.uri().to_string(),
        method: request.method().to_string(),
    };

    tokio::task::spawn(async move {
        let user_log = user_log.clone();
        users::create_user_log(&pool, &user_log)
            .await
            .unwrap_or_else(|err| {
                tracing::error!(%err, "Failed to create user log");
            });
    });

    Ok(())
}
