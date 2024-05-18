use axum_core::extract::Request;
use axum_extra::headers::{
    authorization::{Basic, Bearer, Credentials},
    Authorization, UserAgent,
};
use database::{
    logic::{api_tokens, users},
    schemas::users::UserLog,
    PgPool,
};
use http::HeaderValue;
use shared::crypto::verify_password;
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

#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip_all)]
pub async fn auth_middleware(
    pool: PgPool,
    state: crate::config::State,
    addr: SocketAddr,
    bearer_auth: Option<Authorization<Bearer>>,
    token_auth: Option<Authorization<Token>>,
    basic_auth: Option<Authorization<Basic>>,
    user_agent: UserAgent,
    request: &mut Request,
) -> Result<()> {
    let user = match (bearer_auth, token_auth, basic_auth) {
        (Some(auth), None, None) => {
            let id = state
                .jwt_manager
                .get_claims(auth.token())
                .map_err(|err| {
                    tracing::error!(?err, "Failed to get claims from token");
                    Error::Unauthorized("Invalid token".to_string())
                })?
                .data
                .sub;

            users::get_user(&pool, &id).await?
        }
        (None, Some(auth), None) => {
            let raw_token = auth.0 .0.clone();
            let Some((id, value)) = raw_token.split_once('_') else {
                return Err(Error::Unauthorized("Invalid API token".to_string()));
            };

            let Some(token) = api_tokens::get_api_token_from_id(&pool, id).await? else {
                return Err(Error::Unauthorized("API token unused".to_string()));
            };

            if !verify_password(value, &token.token)? {
                return Err(Error::Unauthorized("Invalid API token".to_string()));
            }

            users::get_user(&pool, &token.user_id).await?
        }
        (None, None, Some(auth)) => {
            let email = auth.username();
            let password = auth.password();

            let Some(data) = users::get_user_from_email(&pool, email).await? else {
                return Err(Error::Unauthorized("API token unused".to_string()));
            };

            if !verify_password(password, &data.password.clone().unwrap())? {
                return Err(Error::Unauthorized("Invalid API token".to_string()));
            }

            Some(data.into())
        }
        _ => return Err(Error::Unauthorized("Missing token".to_string())),
    };

    let Some(user) = user else {
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
