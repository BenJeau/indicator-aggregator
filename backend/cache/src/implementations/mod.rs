mod memory;
mod redis;

use async_trait::async_trait;
use serde::de::DeserializeOwned;
use std::collections::HashMap;
use tracing::instrument;

use crate::{Cache, CacheEntry, CacheKey, InnerCache, Result};

#[derive(Clone)]
pub enum CacheImpl {
    InMemory(memory::InMemoryCache),
    Redis(redis::RedisCache),
}

impl CacheImpl {
    pub fn redis(url: &str) -> Result<Self> {
        Ok(Self::Redis(redis::RedisCache::new(url)?))
    }

    pub fn in_memory() -> Self {
        Self::InMemory(memory::InMemoryCache::new())
    }
}

impl From<memory::InMemoryCache> for CacheImpl {
    fn from(cache: memory::InMemoryCache) -> Self {
        Self::InMemory(cache)
    }
}

impl From<redis::RedisCache> for CacheImpl {
    fn from(cache: redis::RedisCache) -> Self {
        Self::Redis(cache)
    }
}

#[async_trait]
impl InnerCache for CacheImpl {
    #[instrument(skip_all)]
    async fn set_inner(&mut self, key: CacheKey, entry: Vec<u8>) -> Result<bool> {
        match self {
            Self::InMemory(cache) => cache.set_inner(key, entry).await,
            Self::Redis(cache) => cache.set_inner(key, entry).await,
        }
    }

    #[instrument(skip_all)]
    async fn get_inner(&self, key: CacheKey) -> Result<Option<Vec<u8>>> {
        match self {
            Self::InMemory(cache) => cache.get_inner(key).await,
            Self::Redis(cache) => cache.get_inner(key).await,
        }
    }
}

#[async_trait]
impl Cache for CacheImpl {
    #[instrument(skip_all)]
    async fn invalidate<S: Into<CacheKey> + Send>(&mut self, key: S) -> Result<bool> {
        match self {
            Self::InMemory(cache) => cache.invalidate(key).await,
            Self::Redis(cache) => cache.invalidate(key).await,
        }
    }

    #[instrument(skip_all)]
    async fn partial_invalidate<S: Into<CacheKey> + Send>(
        &mut self,
        partial_key: S,
    ) -> Result<u64> {
        match self {
            Self::InMemory(cache) => cache.partial_invalidate(partial_key).await,
            Self::Redis(cache) => cache.partial_invalidate(partial_key).await,
        }
    }

    #[instrument(skip_all)]
    async fn clear(&mut self) -> Result<u64> {
        match self {
            Self::InMemory(cache) => cache.clear().await,
            Self::Redis(cache) => cache.clear().await,
        }
    }

    #[instrument(skip_all)]
    async fn keys(&self) -> Result<Vec<CacheKey>> {
        match self {
            Self::InMemory(cache) => cache.keys().await,
            Self::Redis(cache) => cache.keys().await,
        }
    }

    #[instrument(skip_all)]
    async fn get_all<T: DeserializeOwned + Send>(
        &self,
    ) -> Result<HashMap<CacheKey, CacheEntry<T>>> {
        match self {
            Self::InMemory(cache) => cache.get_all().await,
            Self::Redis(cache) => cache.get_all().await,
        }
    }
}
