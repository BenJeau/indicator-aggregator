use axum_core::extract::Request;
use axum_extra::headers::{
    authorization::{Bearer, Credentials},
    Authorization, UserAgent,
};
use database::{
    logic::{api_tokens, users},
    schemas::users::UserLog,
    PgPool,
};
use http::HeaderValue;
use std::net::SocketAddr;
use tracing::Span;

use crate::{Error, Result};

#[derive(Clone, PartialEq, Debug)]
pub struct Token(String);

impl Credentials for Token {
    const SCHEME: &'static str = "Token";

    fn decode(value: &HeaderValue) -> Option<Self> {
        let bytes = &value.as_bytes()["Token ".len()..];
        let decoded = String::from_utf8(bytes.to_vec()).ok()?;
        Some(Token(decoded))
    }

    fn encode(&self) -> HeaderValue {
        HeaderValue::from_str(&format!("Token {}", self.0)).unwrap()
    }
}

#[tracing::instrument(skip_all)]
pub async fn auth_middleware(
    pool: PgPool,
    state: crate::config::State,
    addr: SocketAddr,
    bearer_auth: Option<Authorization<Bearer>>,
    token_auth: Option<Authorization<Token>>,
    user_agent: UserAgent,
    crypto: shared::crypto::Crypto,
    db_secret: &str,
    request: &mut Request,
) -> Result<()> {
    let user_id = match (bearer_auth, token_auth) {
        (Some(auth), None) => {
            state
                .jwt_manager
                .get_claims(auth.token())
                .map_err(|err| {
                    tracing::error!(?err, "Failed to get claims from token");
                    Error::Unauthorized("Invalid token".to_string())
                })?
                .data
                .sub
        }
        (None, Some(auth)) => {
            let token = auth.0 .0.clone();
            let Some(user_id) =
                api_tokens::get_user_id_from_token(&pool, &token, db_secret, crypto).await?
            else {
                return Err(Error::Unauthorized("API token unused".to_string()));
            };

            user_id
        }
        _ => return Err(Error::Unauthorized("Missing token".to_string())),
    };

    let Some(user) = users::get_user(&pool, &user_id).await? else {
        return Err(Error::Unauthorized("User does not exist".to_string()));
    };

    Span::current().record("user_id", &user.id);

    if !user.enabled {
        return Err(Error::Unauthorized("User is disabled".to_string()));
    }

    let user_log = UserLog {
        user_id: user.id.clone(),
        ip_address: addr.to_string(),
        user_agent: user_agent.to_string(),
        uri: request.uri().to_string(),
        method: request.method().to_string(),
    };

    request.extensions_mut().insert(user);

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
