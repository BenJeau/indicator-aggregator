use axum::extract::FromRef;
use cache::CacheImpl;
use sqlx::PgPool;
use tracing::instrument;

use crate::{config::Config, crypto::Crypto, postgres};

#[derive(Clone)]
pub struct ServerState {
    pub pool: PgPool,
    pub config: Config,
    pub crypto: Crypto,
    pub cache: CacheImpl,
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

        let pool = postgres::connect_to_db(&config.database.url())
            .await
            .expect("Failed to connect to database");

        let crypto = Crypto::new(&config.encryption.server_key);

        let cache = if let Some(url) = &config.cache.redis_url {
            CacheImpl::redis(url).expect("Failed to connect to redis")
        } else {
            CacheImpl::in_memory()
        };

        Self {
            pool,
            config,
            crypto,
            cache,
        }
    }
}
