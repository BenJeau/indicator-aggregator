use axum::{
    extract::State,
    response::{sse::KeepAlive, IntoResponse, Sse},
};
use database::schemas::sources::SourceKind;
use database::PgPool;

use crate::{runners::stream_health_check, Result};

/// Get a stream of Server-Sent Events (SSE) for the status of all runners
///
/// The SSE stream will contain events with the event ID as the runner source kind type (e.g. `PYTHON` or `JAVA_SCRIPT`) and the data as the runner status as a string.
///
/// The server will also send a `keep-alive` event every 30 seconds to keep the connection alive.
#[utoipa::path(
    get,
    path = "/runners/status/sse",
    tag = "runners",
    responses(
        (status = 200, description = "SSE stream for the indicator", content_type = "text/event-stream"),
    )
)]
pub async fn get_runners_status_sse(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let python_runner_status_stream = stream_health_check(&pool, SourceKind::Python).await?;

    Ok(Sse::new(python_runner_status_stream)
        .keep_alive(KeepAlive::default())
        .into_response())
}
