use axum::{
    extract::State,
    response::{
        sse::{Event, KeepAlive, Sse},
        IntoResponse,
    },
    Json,
};
use axum_extra::extract::Query;
use database::schemas::indicators::Indicator;
use futures_util::future::join;
use sources::{integrations, schemas::SourceError};
use tokio_stream::wrappers::UnboundedReceiverStream;
use tracing::{info_span, Instrument};

use crate::{
    integrations::{get_indicator, handle_indicator_request},
    schemas::{DataSource, RequestExecuteParam, SseDoneData, SseStartData},
    Result, ServerState,
};

/// Request to get the data for a specific indicator from enabled sources supporting the indicator kind
#[utoipa::path(
    get,
    path = "/requests/execute",
    tag = "requests",
    params(RequestExecuteParam),
    responses(
        (status = 200, description = "Data retrieved successfully", body = [Data]),
    )
)]
pub async fn request(
    State(state): State<ServerState>,
    Query(request): Query<RequestExecuteParam>,
) -> Result<impl IntoResponse> {
    let should_ignore_errors = request.ignore_errors;

    let mut data = handle_indicator_request(&request, &state).await?;

    if should_ignore_errors {
        data.retain(|data| data.errors.is_empty());
    }

    Ok(Json(data))
}

/// Get a stream of Server-Sent Events (SSE) for a specific indicator from enabled sources supporting the indicator kind
///
/// The SSE stream will contain the following event in order:
/// - `fetching_start` (a single time): The event is sent when the server starts fetching data from the sources. The event will contain a list of all sources and wether they have source code.
///
/// One of the following events will be sent for each source if they have source code set. To know which event relates to which souce, the `id` field in the event will be the same as the `id` field in the source.
/// - `fetching_done`: The event is sent when the server has finished fetching data from the sources and the time it was done.
/// - `fetching_error` (ignored `ignoreErrors` is set to `false`): The event is sent when the server encounters an error while fetching data from the sources.
///
/// The server will also send a `keep-alive` event every 30 seconds to keep the connection alive.
#[utoipa::path(
    get,
    path = "/requests/execute/sse",
    tag = "requests",
    params(RequestExecuteParam),
    responses(
        (status = 200, description = "SSE stream for the indicator", content_type = "text/event-stream", body = serde_json::Value,
            examples(
                ("fetching_start" = (
                    summary = "fetching_start",
                    description = "The event is sent when the server starts fetching data from the sources. The event will contain a list of all sources and wether they have source code.",
                    value = json!(vec![SseStartData{has_source_code: true, source: DataSource{name: "DNS".to_string(), slug: "dns".to_string(), id: "a479w5ks7qfg".to_string(), url: "github.com".to_string(), favicon: None}},SseStartData{has_source_code: false, source: DataSource{name: "Google Web Risk".to_string(), slug: "google-web-risk".to_string(), id: "jyh3ktarowap".to_string(), url: "google.com".to_string(), favicon: None}}])
                )),
                ("fetching_done" = (
                    summary = "fetching_done",
                    description = "The event is sent when the server has finished fetching data from the sources and the time it was done.",
                    value = json!({"cache": {"action": "FROM_CACHE", "cached_at": "2024-05-20T01:30:45.548", "expires_at": "2024-05-21T01:30:45.000", "cache_key": "ie9zxieg227c:DOMAIN:google.com"}, "timing": {"started_at": "2024-05-20T01:30:43.224", "ended_at": "2024-05-20T01:30:45.548"}, "data": Some(serde_json::json!({"url": ["google.com/bad_url", "google.com/phishing_url"]}))})
                )),
                ("fetching_error" = (
                    summary = "fetching_error",
                    description = "The event is sent when the server encounters an error while fetching data from the sources.",
                    value = json!(vec![SourceError::UnsupportedIndicator, SourceError::MissingSourceCode])
                )),
             )
        ),
    )
)]
pub async fn sse_handler(
    State(state): State<ServerState>,
    Query(request): Query<RequestExecuteParam>,
) -> Result<impl IntoResponse> {
    let should_ignore_errors = request.ignore_errors;
    let source_ids = request.source_ids.clone();
    let indicator: Indicator = request.into();
    let (tx, rx) = tokio::sync::mpsc::unbounded_channel();

    let (sources, request_id) = join(
        database::logic::sources::get_sources_for_internal_request(
            &state.pool,
            &indicator,
            &source_ids,
        ),
        database::logic::requests::create_request(&state.pool, &indicator),
    )
    .await;

    let sources = sources?;
    let request_id = request_id?;

    let source_integrations = sources
        .into_iter()
        .map(|source| {
            (
                integrations::source(&source.source_name, &source.source_kind),
                source,
            )
        })
        .collect::<Vec<_>>();

    let start_data = source_integrations
        .iter()
        .map(|(i, s)| {
            SseStartData::from_inner(
                DataSource {
                    name: s.source_name.clone(),
                    slug: s.source_slug.clone(),
                    id: s.source_id.clone(),
                    url: s.source_url.clone(),
                    favicon: s.source_favicon.clone(),
                },
                i.is_some(),
            )
        })
        .collect::<Vec<_>>();

    tx.clone()
        .send(Result::Ok(
            Event::default()
                .id(&request_id)
                .event("fetching_start")
                .json_data(start_data)
                .unwrap(),
        ))
        .unwrap();

    source_integrations
        .into_iter()
        .flat_map(|(integration, source)| integration.map(|i| (i, source)))
        .for_each(|(integration, source)| {
            let indicator = indicator.clone();
            let state = state.clone();
            let tx = tx.clone();

            let info_span = info_span!(
                "integration_fetch",
                source_id = source.source_id.to_string(),
                source_name = source.source_name,
            );

            let request_id = request_id.clone();

            tokio::task::spawn(
                async move {
                    let mut encountered_error = false;
                    let data = get_indicator(
                        &indicator,
                        &source,
                        &state,
                        request_id,
                        integration.as_ref(),
                    )
                    .await
                    .map(|data| {
                        if data.errors.is_empty() {
                            Event::default()
                                .event("fetching_data")
                                .id(source.source_id.clone())
                                .json_data(SseDoneData::from(data))
                                .unwrap()
                        } else {
                            encountered_error = true;
                            Event::default()
                                .event("fetching_error")
                                .id(source.source_id.clone())
                                .json_data(&data.errors)
                                .unwrap()
                        }
                    })
                    .unwrap_or_else(|e| {
                        encountered_error = true;
                        Event::default()
                            .event("fetching_error")
                            .id(source.source_id)
                            .json_data([SourceError::from(e)])
                            .unwrap()
                    });

                    if !should_ignore_errors || !encountered_error {
                        tx.send(Result::Ok(data)).unwrap();
                    }
                }
                .instrument(info_span),
            );
        });

    Ok(Sse::new(UnboundedReceiverStream::new(rx))
        .keep_alive(KeepAlive::default())
        .into_response())
}
