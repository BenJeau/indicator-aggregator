use async_trait::async_trait;
use serde::de::DeserializeOwned;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;
use tracing::instrument;

use crate::{Cache, CacheEntry, CacheKey, InnerCache, Result};

#[derive(Default, Clone)]
pub struct InMemoryCacheInner(HashMap<CacheKey, Vec<u8>>);

#[derive(Default, Clone)]
pub struct InMemoryCache(Arc<RwLock<InMemoryCacheInner>>);

impl InMemoryCache {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl InnerCache for InMemoryCache {
    #[instrument(skip_all)]
    async fn set_inner(&mut self, key: CacheKey, entry: Vec<u8>) -> Result<bool> {
        let data = self.0.write().await.0.insert(key, entry);

        Ok(data.is_some())
    }

    #[instrument(skip_all)]
    async fn get_inner(&self, key: CacheKey) -> Result<Option<Vec<u8>>> {
        Ok(self.0.read().await.0.get(&key).cloned())
    }
}

#[async_trait]
impl Cache for InMemoryCache {
    #[instrument(skip_all)]
    async fn invalidate<S: Into<CacheKey> + Send>(&mut self, key: S) -> Result<bool> {
        Ok(self.0.write().await.0.remove(&key.into()).is_some())
    }

    #[instrument(skip_all)]
    async fn partial_invalidate<S: Into<CacheKey> + Send>(
        &mut self,
        partial_key: S,
    ) -> Result<u64> {
        let partial_key = partial_key.into();

        let mut keys = Vec::new();

        for key in self.0.read().await.0.keys() {
            if key.matches_partial_cache_key(&partial_key) {
                keys.push(key.clone());
                self.0.write().await.0.remove(key);
            }
        }

        Ok(keys.len() as u64)
    }

    #[instrument(skip_all)]
    async fn clear(&mut self) -> Result<u64> {
        let len = self.0.read().await.0.len();
        self.0.write().await.0.clear();

        Ok(len as u64)
    }

    #[instrument(skip_all)]
    async fn keys(&self) -> Result<Vec<CacheKey>> {
        Ok(self.0.read().await.0.keys().cloned().collect())
    }

    #[instrument(skip_all)]
    async fn get_all<T: DeserializeOwned + Send>(
        &self,
    ) -> Result<HashMap<CacheKey, CacheEntry<T>>> {
        let mut data = HashMap::new();

        for (key, value) in &self.0.read().await.0 {
            data.insert(key.clone(), serde_json::from_slice(value)?);
        }

        Ok(data)
    }
}

#[cfg(test)]
mod tests {
    use crate::CreateCacheEntry;

    use super::*;

    #[tokio::test]
    async fn test_given() {
        let mut cache = InMemoryCache::new();

        let key = "test";
        let value = serde_json::json!({"test": "test"});

        let entry = CreateCacheEntry {
            key,
            value: value.clone(),
            expiration: None,
        };

        cache.set(entry).await.unwrap();

        let result = cache
            .get::<serde_json::Value, _>(key)
            .await
            .unwrap()
            .unwrap();

        assert_eq!(value, result.value);

        let all = cache.get_all::<serde_json::Value>().await.unwrap();

        assert_eq!(1, all.len());

        let result = cache.invalidate(key).await.unwrap();

        assert!(result);

        let result = cache.get::<serde_json::Value, _>(key).await.unwrap();

        assert!(result.is_none());

        let all = cache.get_all::<serde_json::Value>().await.unwrap();

        assert!(all.is_empty());
    }

    #[tokio::test]
    async fn test_expiration() {
        let mut cache = InMemoryCache::new();

        let key = "test";
        let value = serde_json::json!({"test": "test"});

        let entry = CreateCacheEntry {
            key,
            value: value.clone(),
            expiration: Some(1),
        };

        cache.set(entry).await.unwrap();

        let result = cache
            .get::<serde_json::Value, _>(key)
            .await
            .unwrap()
            .unwrap();

        assert_eq!(value, result.value);

        tokio::time::sleep(tokio::time::Duration::from_millis(1001)).await;

        let result = cache.get::<serde_json::Value, _>(key).await.unwrap();

        assert!(result.is_none());
    }
}
