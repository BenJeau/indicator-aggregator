use cache::Cache;
use database::{
    logic::server_config::get_config_with_defaults_and_db_results,
    schemas::{
        indicators::{Indicator, IndicatorKind},
        sources::{InternalRequest, SourceKind},
    },
    PgPool,
};
use futures_util::future::{join, join_all};
use sources::{integrations, schemas::SourceError, Source};
use tracing::{error, info_span, instrument, warn, Instrument};

use crate::{
    schemas::{Data, DataCache, DataCacheAction, DataSource, DataTiming, RequestExecuteParam},
    Error, Result, ServerState,
};

#[instrument(skip(state))]
pub async fn handle_indicator_request(
    request: &RequestExecuteParam,
    state: &ServerState,
) -> Result<Vec<Data>> {
    let indicator: Indicator = request.clone().into();

    if !indicator.validate() {
        return Err(Error::InvalidIndicatorKind(indicator.kind));
    }

    get_source_data(&indicator, state, &request.sources).await
}

async fn get_source_data(
    indicator: &Indicator,
    state: &ServerState,
    source_ids: &[String],
) -> Result<Vec<Data>> {
    let (sources, request_id) = join(
        database::logic::sources::get_sources_for_internal_request(
            &state.pool,
            indicator,
            source_ids,
        ),
        database::logic::requests::create_request(&state.pool, indicator),
    )
    .await;

    let sources = sources?;
    let request_id = request_id?;

    let source_integrations = sources
        .iter()
        .map(|source| {
            (
                integrations::source(&source.source_name, &source.source_kind),
                source,
            )
        })
        .collect::<Vec<_>>();

    let data = join_all(
        source_integrations
            .into_iter()
            .map(|(integration, source)| {
                let request_id = request_id.clone();

                async move {
                    if let Some(integration) = integration {
                        get_indicator(indicator, source, state, request_id, integration.as_ref())
                            .await
                    } else {
                        Err(Error::MissingSourceCode)
                    }
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
                    slug: source.source_slug.clone(),
                    id: source.source_id.clone(),
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

    let fetch_state = state.into_fetch_state(&source.source_id).await?;
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

async fn get_source_errors(
    source: &InternalRequest,
    indicator_kind: &IndicatorKind,
    pool: &PgPool,
) -> Result<Vec<SourceError>> {
    let kind = indicator_kind.to_string().to_uppercase();
    let mut errors = vec![];

    if !source.source_supported_indicators.contains(&kind) {
        errors.push(SourceError::UnsupportedIndicator);
    }

    if !source.source_enabled {
        errors.push(SourceError::SourceDisabled);
    }

    if !source.provider_enabled.unwrap_or(true) {
        errors.push(SourceError::ProviderDisabled(
            source.provider_id.as_ref().unwrap().clone(),
        ));
    }

    if source.source_kind != SourceKind::System {
        let server_config = get_config_with_defaults_and_db_results(pool).await?;

        if !server_config.runner_enabled(&source.source_kind) {
            errors.push(SourceError::RunnerDisabled(source.source_kind.clone()));
        }
    }

    if source.source_disabled_indicators.contains(&kind) {
        errors.push(SourceError::DisabledIndicator);
    }

    if !source.within_ignore_lists.is_empty() {
        errors.push(SourceError::WithinIgnoreList(
            source.within_ignore_lists.clone(),
        ));
    }

    if !source.missing_source_secrets.is_empty() {
        errors.push(SourceError::MissingSecret(
            source.missing_source_secrets.clone(),
        ));
    }

    Ok(errors)
}

#[instrument(skip_all, fields(source_name = source.source_name))]
pub async fn get_indicator<S: Source + ?Sized>(
    indicator: &Indicator,
    source: &InternalRequest,
    state: &ServerState,
    request_id: String,
    source_impl: &S,
) -> Result<Data> {
    let started_at = chrono::Utc::now().naive_utc();

    let errors = get_source_errors(source, &indicator.kind, &state.pool).await?;

    let (data, cache) = if errors.is_empty() {
        get_data(source, &mut state.clone(), indicator, source_impl).await?
    } else {
        (None, Default::default())
    };

    let data = Data {
        source: DataSource {
            name: source.source_name.clone(),
            slug: source.source_slug.clone(),
            id: source.source_id.clone(),
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

    let source_request = data
        .clone()
        .into_create_source_request(request_id.to_owned());
    let pool = state.pool.clone();

    let info_span = info_span!("save_source_request");
    tokio::task::spawn(
        async move {
            let _ = database::logic::requests::create_source_request(&pool, source_request)
                .await
                .map_err(|e| {
                    error!(error = ?e, "error creating source request");
                });
        }
        .instrument(info_span),
    );

    Ok(data)
}
