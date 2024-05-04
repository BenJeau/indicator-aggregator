use async_trait::async_trait;
use axum_core::response::{IntoResponse, Response};
use axum_extra::headers::UserAgent;
use base64::{engine::general_purpose, Engine as _};
use chrono::NaiveDateTime;
use database::{
    logic::{auth, users},
    schemas::{
        auth::{CreateLoginRequest, LoginRequest},
        users::{CreateUser, UserLog},
    },
    PgPool,
};
use http::{header::LOCATION, StatusCode};
use hyper::{HeaderMap, Uri};
use jsonwebtoken::{jwk::Jwk, Algorithm, DecodingKey, Validation};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::{net::SocketAddr, time::Duration};
use tokio::{sync::watch, time::sleep};
use tracing::{error, info};
use utoipa::{IntoParams, ToSchema};

use crate::{
    config::{Auth, OpenId, State},
    generate_random_string,
    jwt::{Claims, JwtManager},
    Error, Result,
};

#[derive(Clone)]
pub struct OpenIdKeys {
    pub fetched_at: NaiveDateTime,
    pub jwks: Vec<Jwk>,
}

#[derive(Deserialize)]
struct CertsResponse {
    keys: Vec<Jwk>,
}

#[derive(Deserialize)]
struct OpenIdRawResponse {
    token_endpoint: String,
    jwks_uri: String,
    authorization_endpoint: String,
    issuer: String,
}

#[derive(Clone)]
pub struct OpenIdResponse {
    pub keys: watch::Receiver<OpenIdKeys>,
    pub token_endpoint: String,
    pub authorization_endpoint: String,
    pub issuer: String,
}

#[derive(Deserialize, IntoParams, ToSchema)]
pub struct RedirectLoginQuery {
    next: Option<String>,
}

fn temporary_redirect(uri: &str) -> Response {
    (StatusCode::FOUND, [(LOCATION, uri)]).into_response()
}

impl OpenIdResponse {
    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument(skip_all)]
    pub async fn handle_redirect_login(
        &self,
        query: &RedirectLoginQuery,
        addr: &SocketAddr,
        user_agent: &UserAgent,
        pool: &PgPool,
        auth: &Auth,
        provider: &str,
        headers: HeaderMap,
    ) -> Result<impl IntoResponse> {
        let parsed_referer = headers
            .get("referer")
            .ok_or(Error::BadRequest("Missing referer".to_string()))?
            .to_str()
            .map_err(|_| Error::BadRequest("Invalid referer".to_string()))?
            .parse::<hyper::Uri>()
            .map_err(|_| Error::BadRequest("Invalid referer address".to_string()))?;

        if !auth.frontend_redirect_hosts.contains(
            &parsed_referer
                .host()
                .ok_or(Error::BadRequest(
                    "Invalid referer address host".to_string(),
                ))?
                .to_string(),
        ) {
            return Err(Error::BadRequest("Invalid referer host".to_string()));
        }

        let redirect_uri = format!(
            "{}://{}",
            parsed_referer.scheme_str().ok_or(Error::BadRequest(
                "Invalid referer address scheme".to_string()
            ))?,
            parsed_referer.authority().ok_or(Error::BadRequest(
                "Invalid referer address authority".to_string()
            ))?
        );

        let nonce = generate_random_string(64);
        let state_nonce = generate_random_string(64);

        let login_request = CreateLoginRequest {
            nonce: nonce.clone(),
            state_nonce: state_nonce.clone(),
            provider: provider.to_string(),
            ip_address: addr.ip().to_string(),
            user_agent: user_agent.to_string(),
            browser_state: query.next.as_ref().map(|s| s.to_string()),
            redirect_uri,
        };

        let login_request_id = auth::create_login_request(pool, login_request).await?;

        let state = general_purpose::URL_SAFE.encode(format!("{state_nonce}:{login_request_id}"));
        let auth_url = self.generate_auth_url(auth.open_id(provider), &state, &nonce);

        Ok(temporary_redirect(&auth_url))
    }

    #[tracing::instrument(skip_all)]
    fn generate_auth_url(
        &self,
        OpenId {
            client_id,
            redirect_uri,
            ..
        }: &OpenId,
        state: &str,
        nonce: &str,
    ) -> String {
        format!(
            "{}?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=openid%20email%20profile&prompt=select_account&nonce={nonce}&state={state}",
            self.authorization_endpoint,
        )
    }

    #[tracing::instrument(skip_all)]
    pub async fn validate_and_decode_jwt<T: DeserializeOwned>(
        &self,
        token: &str,
        client_id: &str,
    ) -> Option<T> {
        let mut decoded_token = None;

        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_audience(&[client_id]);
        validation.set_issuer(&[&self.issuer]);
        validation.validate_exp = true;
        validation.validate_nbf = true;

        for jwk in &self.keys.borrow().jwks {
            if let Ok(key) = DecodingKey::from_jwk(jwk) {
                if let Ok(claims) = jsonwebtoken::decode::<T>(token, &key, &validation) {
                    decoded_token = Some(claims);
                    break;
                }
            }
        }

        decoded_token.map(|token| token.claims)
    }
}

impl OpenIdKeys {
    #[tracing::instrument(skip_all)]
    async fn get_keys(certs_url: &str) -> reqwest::Result<(Self, u64)> {
        info!(certs_url, "Fetching OpenID auth keys");
        let response = reqwest::get(certs_url).await?;

        let cache_header = response.headers().get("cache-control").unwrap();

        let max_age = cache_header
            .to_str()
            .unwrap_or_default()
            .split(',')
            .map(|s| s.trim())
            .find(|s| s.starts_with("max-age"))
            .unwrap()
            .split_once('=')
            .unwrap()
            .1
            .parse()
            .unwrap_or(0);

        let jwks = response.json::<CertsResponse>().await?;
        let fetched_at = chrono::Utc::now().naive_utc();

        info!(
            certs_url,
            max_age,
            "Fetched {} OpenID auth keys",
            jwks.keys.len()
        );

        Ok((
            Self {
                fetched_at,
                jwks: jwks.keys,
            },
            max_age,
        ))
    }

    #[tracing::instrument(skip_all)]
    async fn get_jwks_uri_from_openid_config(
        openid_url: &str,
    ) -> reqwest::Result<OpenIdRawResponse> {
        info!(openid_url, "Fetching OpenID config to get JWK URIs");

        reqwest::get(openid_url).await?.json().await
    }

    #[tracing::instrument(skip_all)]
    pub async fn new(openid_url: &str) -> reqwest::Result<OpenIdResponse> {
        info!("Initial fetching OpenID auth keys");

        let OpenIdRawResponse {
            token_endpoint,
            jwks_uri,
            authorization_endpoint,
            issuer,
        } = Self::get_jwks_uri_from_openid_config(openid_url).await?;
        let (keys, mut max_age) = Self::get_keys(&jwks_uri).await?;

        let (tx, rx) = watch::channel(keys);

        tokio::task::spawn(async move {
            loop {
                info!(max_age, "Waiting until cache expires");
                sleep(Duration::from_secs(max_age)).await;

                let Ok((keys, new_max_age)) = Self::get_keys(&jwks_uri)
                    .await
                    .map_err(|err| error!(%err, "Failed to fetch Google keys"))
                else {
                    continue;
                };

                if tx.send(keys).is_err() {
                    error!("Failed to send Google keys");
                }

                max_age = new_max_age;
            }
        });

        Ok(OpenIdResponse {
            keys: rx,
            token_endpoint,
            authorization_endpoint,
            issuer,
        })
    }
}

#[async_trait]
pub trait OpenIdProvider: Send {
    async fn validate_and_decode_jwt(
        &self,
        token: &str,
        client_id: &str,
    ) -> Option<CreateUserClaims>;

    fn open_id_response(&self) -> &OpenIdResponse;
}

#[derive(Deserialize, Serialize, Debug)]
pub struct OpenIdAuthResponse {
    access_token: String,
    expires_in: u64,
    pub id_token: String,
    scope: String,
    token_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    refresh_token: Option<String>,
}

impl OpenId {
    #[tracing::instrument(skip_all)]
    pub async fn exchange_auth_code(
        &self,
        code: &str,
        token_url: &str,
    ) -> Result<OpenIdAuthResponse> {
        info!("Exchanging auth code for access token");

        let client = reqwest::Client::new();
        let data = client
            .post(token_url)
            .form(&[
                ("code", code),
                ("client_id", self.client_id.as_str()),
                ("client_secret", self.client_secret.as_str()),
                ("grant_type", "authorization_code"),
                ("redirect_uri", self.redirect_uri.as_str()),
            ])
            .send()
            .await?;

        let data = data.json::<serde_json::Value>().await?;
        serde_json::from_value(data.clone()).map_err(|err| {
            error!(%err, %data, token_url, "Failed to deserialize OAuth2 response");
            err.into()
        })
    }
}

pub struct CreateUserClaims {
    pub sub: String,
    pub email: String,
    pub email_verified: Option<bool>,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub picture: Option<String>,
    pub locale: Option<String>,
    pub provider: String,
}

impl CreateUserClaims {
    #[tracing::instrument(skip_all)]
    pub fn generate_jwt(self, jwt_manager: &JwtManager, roles: Vec<String>) -> Result<String> {
        let claims = Claims {
            sub: self.sub,
            email: self.email,
            email_verified: self.email_verified,
            name: self.name,
            given_name: self.given_name,
            family_name: self.family_name,
            locale: self.locale,
            roles,
            provider: self.provider,
        };

        jwt_manager.generate_jwt(claims)
    }
}

#[tracing::instrument(skip_all)]
fn extract_state_content(state: &str) -> anyhow::Result<Option<(String, String)>> {
    let decoded_state_nonce = String::from_utf8(general_purpose::URL_SAFE.decode(state)?)?;

    let Some((nonce, id)) = decoded_state_nonce.split_once(':') else {
        return Ok(None);
    };

    Ok(Some((nonce.to_string(), id.to_string())))
}

#[derive(Debug)]
pub enum LoginRequestError {
    InvalidState,
    InvalidNonce(String, String),
    InvalidIpAddress(String, String),
    InvalidUserAgent(String, String),
    InvalidProvider(String, String),
    NotFound(String),
    Expired(NaiveDateTime),
    Sqlx(database::Error),
}

#[tracing::instrument(skip_all)]
async fn validate_state_nonce_inner(
    state: &str,
    pool: &PgPool,
    addr: &SocketAddr,
    user_agent: &UserAgent,
    provider: &str,
) -> std::result::Result<LoginRequest, LoginRequestError> {
    let Ok(Some((nonce, id))) = extract_state_content(state) else {
        return Err(LoginRequestError::InvalidState);
    };

    let request = auth::get_login_request(pool, &id)
        .await
        .map_err(LoginRequestError::Sqlx)?
        .ok_or(LoginRequestError::NotFound(id))?;

    if request.state_nonce != nonce {
        return Err(LoginRequestError::InvalidNonce(request.state_nonce, nonce));
    }

    if request.ip_address != addr.ip().to_string() {
        return Err(LoginRequestError::InvalidIpAddress(
            request.ip_address,
            addr.ip().to_string(),
        ));
    }

    if request.user_agent != user_agent.to_string() {
        return Err(LoginRequestError::InvalidUserAgent(
            request.user_agent,
            user_agent.to_string(),
        ));
    }

    if request.provider != provider {
        return Err(LoginRequestError::InvalidProvider(
            request.provider,
            provider.to_string(),
        ));
    }

    if chrono::Utc::now().naive_utc() - request.created_at > chrono::Duration::minutes(2) {
        return Err(LoginRequestError::Expired(request.created_at));
    }

    Ok(request)
}

#[tracing::instrument(skip_all)]
pub async fn validate_state_nonce(
    state: &str,
    pool: &PgPool,
    addr: &SocketAddr,
    user_agent: &UserAgent,
    provider: &str,
) -> Result<LoginRequest> {
    match validate_state_nonce_inner(state, pool, addr, user_agent, provider).await {
        Ok(request) => Ok(request),
        Err(LoginRequestError::Sqlx(err)) => Err(err.into()),
        Err(err) => {
            error!(
                ?err,
                "Failed to validate state nonce and/or logging request"
            );
            Err(Error::Unauthorized("Invalid authentication".to_string()))
        }
    }
}

#[derive(Deserialize, IntoParams, ToSchema)]
pub struct RedirectCallbackQuery {
    state: String,
    code: String,
}

#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip_all)]
pub async fn logic(
    pool: &PgPool,
    state: &State,
    query: &RedirectCallbackQuery,
    provider: &str,
    addr: &SocketAddr,
    user_agent: &UserAgent,
    uri: &Uri,
) -> Result<impl IntoResponse> {
    let login_request =
        validate_state_nonce(&query.state, pool, addr, user_agent, provider).await?;

    let data = state
        .auth
        .open_id(provider)
        .exchange_auth_code(
            &query.code,
            &state
                .provider_data(provider)
                .open_id_response()
                .token_endpoint,
        )
        .await?;

    let Some(claims) = state
        .provider_data(provider)
        .validate_and_decode_jwt(&data.id_token, &state.auth.open_id(provider).client_id)
        .await
    else {
        return Err(Error::Unauthorized("Invalid authentication".to_string()));
    };

    let enabled = users::is_user_enabled(pool, &claims.sub)
        .await?
        .unwrap_or_default();

    let picture = if let Some(url) = &claims.picture {
        let response = reqwest::get(url).await?;
        let picture = response.bytes().await?;
        Some(picture.to_vec())
    } else {
        None
    };

    let create_user = CreateUser {
        auth_id: claims.sub.clone(),
        provider: provider.to_string(),
        email: claims.email.clone(),
        verified: claims.email_verified.unwrap_or_default(),
        name: claims.name.clone(),
        picture,
        given_name: claims.given_name.clone(),
        family_name: claims.family_name.clone(),
        enabled,
        locale: claims.locale.clone(),
        roles: Default::default(),
    };
    let user_log = UserLog {
        user_id: claims.sub.clone(),
        ip_address: addr.to_string(),
        user_agent: user_agent.to_string(),
        uri: uri.to_string(),
        method: "GET".to_string(),
    };

    let user = users::create_or_update_user(pool, &create_user).await?;
    let _ = users::create_user_log(pool, &user_log)
        .await
        .map_err(|err| error!(%err, "Failed to create user log"));

    auth::set_user_id_for_login_request(pool, &login_request.id, &claims.sub).await?;

    let base_redirect_url = format!(
        "{}{}",
        login_request.redirect_uri, state.auth.frontend_redirect_path
    );

    if !enabled {
        let redirect_uri = format!("{base_redirect_url}?disabled=true");
        return Ok(temporary_redirect(&redirect_uri));
    }

    let jwt = claims.generate_jwt(&state.jwt_manager, user.roles)?;

    let next_part = if let Some(next) = login_request.browser_state {
        format!("&next={}", next)
    } else {
        "".to_string()
    };

    let redirect_uri = format!("{base_redirect_url}?token={jwt}{next_part}",);
    Ok(temporary_redirect(&redirect_uri))
}
