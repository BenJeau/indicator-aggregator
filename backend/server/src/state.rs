use auth::{jwt::JwtManager, openid::OpenIdKeys};
use axum::extract::FromRef;
use cache::CacheImpl;
use database::PgPool;
use shared::crypto::Crypto;
use sources::FetchState;
use tokio::join;
use tracing::instrument;

use crate::{config::Config, Result};

#[derive(Clone)]
pub struct ServerState {
    pub pool: PgPool,
    pub config: Config,
    pub crypto: Crypto,
    pub cache: CacheImpl,
    pub auth_state: auth::config::State,
}

impl FromRef<ServerState> for PgPool {
    fn from_ref(state: &ServerState) -> Self {
        state.pool.clone()
    }
}

impl FromRef<ServerState> for Crypto {
    fn from_ref(state: &ServerState) -> Self {
        state.crypto.clone()
    }
}

impl ServerState {
    #[instrument(skip_all)]
    pub async fn new() -> Self {
        let config = Config::new().expect("Failed to load config");

        let pool = database::connect_to_db(&config.database.url())
            .await
            .expect("Failed to connect to database");

        let crypto = Crypto::new(&config.encryption.server_key);

        let cache = if let Some(url) = &config.cache.redis_url {
            CacheImpl::redis(url).expect("Failed to connect to redis")
        } else {
            CacheImpl::in_memory()
        };

        let jwt_manager = JwtManager::new(&config.auth.jwt);

        let (google_keys, microsoft_keys) = join!(
            OpenIdKeys::new(&config.auth.google.openid_url),
            OpenIdKeys::new(&config.auth.microsoft.openid_url),
        );

        let auth_state = auth::config::State {
            auth: config.auth.clone(),
            google_keys: google_keys.unwrap().into(),
            microsoft_keys: microsoft_keys.unwrap().into(),
            jwt_manager,
        };

        Self {
            pool,
            config,
            crypto,
            cache,
            auth_state,
        }
    }

    pub async fn into_fetch_state(&self, source_id: &str) -> Result<FetchState> {
        let secrets = database::logic::secrets::internal_get_source_secrets(
            &self.pool,
            source_id,
            &self.crypto,
            &self.config.encryption.db_key,
        )
        .await?;

        Ok(FetchState::new(
            self.pool.clone(),
            secrets,
            source_id.to_string(),
        ))
    }
}

#[cfg(test)]
pub mod test {
    use auth::openid::OpenIdResponse;

    use super::*;
    use crate::config::test::create_config;

    pub fn create_state(pool: PgPool) -> ServerState {
        let config = create_config();
        let crypto = Crypto::new(&config.encryption.server_key);
        let cache = CacheImpl::in_memory();

        let auth_state = auth::config::State {
            auth: config.auth.clone(),
            google_keys: OpenIdResponse {
                keys: tokio::sync::watch::channel(OpenIdKeys {
                    fetched_at: chrono::Utc::now().naive_utc(),
                    jwks: vec![],
                })
                .1,
                token_endpoint: "https://accounts.google.com".to_string(),
                authorization_endpoint: "https://accounts.google.com".to_string(),
                issuer: "https://accounts.google.com".to_string(),
            }
            .into(),
            microsoft_keys: OpenIdResponse {
                keys: tokio::sync::watch::channel(OpenIdKeys {
                    fetched_at: chrono::Utc::now().naive_utc(),
                    jwks: vec![],
                })
                .1,
                token_endpoint: "https://login.microsoftonline.com".to_string(),
                authorization_endpoint: "https://login.microsoftonline.com".to_string(),
                issuer: "https://login.microsoftonline.com".to_string(),
            }
            .into(),
            jwt_manager: JwtManager::new(&config.auth.jwt),
        };

        ServerState {
            pool,
            config,
            crypto,
            cache,
            auth_state,
        }
    }
}
