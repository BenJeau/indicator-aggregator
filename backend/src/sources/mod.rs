use async_trait::async_trait;
use cache::Cache;
use futures_util::future::{join, join_all};
use serde::de::DeserializeOwned;
use std::collections::HashMap;
use tracing::{error, instrument, warn};
use uuid::Uuid;

use crate::{
    postgres::schemas::{requests::CreateSourceRequest, sources::InternalRequest},
    schemas::{
        Data, DataCache, DataCacheAction, DataSource, DataTiming, Indicator, IndicatorKind,
        RequestExecuteParam, SourceError,
    },
    Error, Result, ServerState,
};

pub mod background_tasks;
pub mod integrations;

#[instrument(skip(state))]
pub async fn handle_indicator_request(
    request: &RequestExecuteParam,
    state: &ServerState,
) -> Result<Vec<Data>> {
    let indicator: Indicator = request.clone().into();
    indicator.validate()?;

    get_source_data(&indicator, state, &request.sources).await
}

async fn get_source_data(
    indicator: &Indicator,
    state: &ServerState,
    source_ids: &[Uuid],
) -> Result<Vec<Data>> {
    let (sources, request_id) = join(
        crate::postgres::logic::sources::get_sources_for_internal_request(
            &state.pool,
            &indicator,
            source_ids,
        ),
        crate::postgres::logic::requests::create_request(&state.pool, indicator),
    )
    .await;

    let sources = sources?;
    let request_id = request_id?;

    let source_integrations = sources
        .iter()
        .map(|source| (integrations::source(&source.source_name), source))
        .collect::<Vec<_>>();

    let data = join_all(
        source_integrations
            .into_iter()
            .map(|(integration, source)| async move {
                if let Some(integration) = integration {
                    integration
                        .get_indicator(indicator, &source, state, &request_id)
                        .await
                } else {
                    Err(Error::MissingSourceCode)
                }
            }),
    )
    .await
    .into_iter()
    .zip(sources.iter())
    .map(|(result, source)| match result {
        Ok(data) => data,
        Err(error) => {
            tracing::error!(
                source_name = source.source_name,
                "error fetching data: {:?}",
                error
            );
            Data {
                source: DataSource {
                    name: source.source_name.clone(),
                    id: source.source_id,
                    url: source.source_url.clone(),
                    favicon: source.source_favicon.clone(),
                },
                cache: Default::default(),
                // TODO: properly set these times
                timing: DataTiming {
                    started_at: chrono::Utc::now().naive_utc(),
                    ended_at: chrono::Utc::now().naive_utc(),
                },
                errors: vec![SourceError::from(error)],
                data: None,
            }
        }
    })
    .collect::<Vec<_>>();

    Ok(data)
}

#[instrument(err, ret)]
pub async fn handle_response<T>(response: reqwest::Response) -> Result<T>
where
    T: DeserializeOwned + std::fmt::Debug,
{
    if response.status().is_success() {
        Ok(response.json().await?)
    } else {
        let status = response.status();
        let body = response.text().await?;

        error!(status = ?status, body = ?body, "error fetching data");
        match status {
            reqwest::StatusCode::NOT_FOUND => Err(Error::NotFound),
            reqwest::StatusCode::UNAUTHORIZED | reqwest::StatusCode::FORBIDDEN => {
                Err(Error::Unauthorized)
            }
            reqwest::StatusCode::TOO_MANY_REQUESTS => Err(Error::RateLimited),
            _ => Err(Error::ResponseError),
        }
    }
}

pub struct FetchState {
    pool: sqlx::PgPool,
    secrets: HashMap<String, String>,
}

impl FetchState {
    fn new(pool: sqlx::PgPool, secrets: HashMap<String, String>) -> Self {
        Self { pool, secrets }
    }

    async fn from_server_state(state: &ServerState, source_id: &Uuid) -> Result<Self> {
        let secrets = crate::postgres::logic::secrets::internal_get_source_secrets(
            &state.pool,
            &source_id,
            &state.crypto,
            &state.config.encryption.db_key,
        )
        .await?;

        Ok(Self::new(state.pool.clone(), secrets))
    }
}

#[async_trait]
pub trait Source: Send + Sync {
    fn source_name(&self) -> &'static str;

    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value>;

    #[instrument(skip_all, fields(source_name = source.source_name))]
    async fn get_indicator(
        &self,
        indicator: &Indicator,
        source: &InternalRequest,
        state: &ServerState,
        request_id: &Uuid,
    ) -> Result<Data> {
        let started_at = chrono::Utc::now().naive_utc();

        let errors = get_source_errors(source, &indicator.kind);

        let (data, cache) = if errors.is_empty() {
            get_data(source, &mut state.clone(), indicator, self).await?
        } else {
            (None, Default::default())
        };

        let data = Data {
            source: DataSource {
                name: source.source_name.clone(),
                id: source.source_id,
                url: source.source_url.clone(),
                favicon: source.source_favicon.clone(),
            },
            cache,
            timing: DataTiming {
                started_at,
                ended_at: chrono::Utc::now().naive_utc(),
            },
            errors,
            data,
        };

        let source_request = CreateSourceRequest::from_data(data.clone(), request_id.to_owned());
        let pool = state.pool.clone();
        tokio::task::spawn(async move {
            let _ = crate::postgres::logic::requests::create_source_request(&pool, source_request)
                .await
                .map_err(|e| {
                    error!(error = ?e, "error creating source request");
                });
        });

        Ok(data)
    }

    async fn background_task(&self, _state: &FetchState) -> Result<()> {
        todo!()
    }
}

async fn get_data<S: Source + ?Sized>(
    source: &InternalRequest,
    state: &mut ServerState,
    indicator: &Indicator,
    source_impl: &S,
) -> Result<(Option<serde_json::Value>, DataCache)> {
    let cache_key = format!("{}:{}:{}", source.source_id, indicator.kind, indicator.data);

    if source.source_cache_enabled {
        if let Some(data) = state.cache.get(cache_key.clone()).await? {
            return Ok((
                Some(data.value),
                DataCache::new(
                    Some(DataCacheAction::FromCache),
                    Some(data.timestamp),
                    data.expiration
                        .map(|e| e as i64)
                        .map(|e| data.timestamp + chrono::Duration::seconds(e)),
                    Some(cache_key),
                ),
            ));
        }
    }

    let fetch_state = FetchState::from_server_state(state, &source.source_id).await?;
    let data = source_impl.fetch_data(indicator, &fetch_state).await?;

    let mut data_cache = DataCache::default();

    if source.source_cache_enabled {
        if let Some(interval) = source.source_cache_interval {
            let entry = cache::CreateCacheEntry {
                key: cache_key.clone(),
                value: data.clone(),
                expiration: Some(interval as usize),
            };

            let set_cache_data = state.cache.set(entry).await?;

            data_cache.action = Some(DataCacheAction::SavedToCache);
            data_cache.cached_at = Some(set_cache_data.timestamp);
            data_cache.expires_at =
                Some(set_cache_data.timestamp + chrono::Duration::seconds(interval as i64));
            data_cache.cache_key = Some(cache_key);
        } else {
            warn!(
                "source {} has cache enabled but no cache interval set",
                source.source_name
            );
        }
    }

    Ok((Some(data), data_cache))
}

fn get_source_errors(source: &InternalRequest, indicator_kind: &IndicatorKind) -> Vec<SourceError> {
    let kind = indicator_kind.to_string().to_uppercase();
    let mut errors = vec![];

    if !source.source_supported_indicators.contains(&kind) {
        errors.push(SourceError::UnsupportedIndicator);
    }

    if !source.source_enabled {
        errors.push(SourceError::SourceDisabled);
    }

    if !source.provider_enabled.unwrap_or(true) {
        errors.push(SourceError::ProviderDisabled(source.provider_id.unwrap()));
    }

    if source.source_disabled_indicators.contains(&kind) {
        errors.push(SourceError::DisabledIndicator);
    }

    if source.within_ignore_lists.len() > 0 {
        errors.push(SourceError::WithinIgnoreList(
            source.within_ignore_lists.clone(),
        ));
    }

    if source.missing_source_secrets.len() > 0 {
        errors.push(SourceError::MissingSecret(
            source.missing_source_secrets.clone(),
        ));
    }

    errors
}
