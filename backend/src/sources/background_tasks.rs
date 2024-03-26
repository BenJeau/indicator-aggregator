use futures_util::future::join_all;
use std::time::Duration;
use tracing::{error, info, info_span, instrument, Instrument};

use crate::{
    postgres::{
        self,
        schemas::sources::{Source, SourceKind},
    },
    sources::{self, FetchState},
    Result, ServerState,
};

#[instrument(skip_all, name = "run_tasks", err)]
pub async fn run_background_tasks(state: &ServerState) -> Result<()> {
    let sources = postgres::logic::sources::get_sources(&state.pool).await?;

    join_all(
        sources
            .into_iter()
            .map(|source| prapare_background_task(state, source)),
    )
    .await
    .into_iter()
    .collect::<Result<_>>()?;

    Ok(())
}

#[instrument(skip_all, name = "prep_task", err)]
async fn prapare_background_task(state: &ServerState, source: Source) -> Result<()> {
    if !source.enabled || !source.task_enabled {
        return Ok(());
    }

    if let Some(interval_secs) = source.task_interval {
        let fetch_state = FetchState::from_server_state(state, &source.id).await?;

        let info_span = info_span!("background_task", id = %source.id, name = source.name,);

        tokio::task::spawn(
            async move {
                run_background_task(source.name, source.kind, fetch_state, interval_secs).await
            }
            .instrument(info_span),
        );
    }

    Ok(())
}

#[instrument(skip_all, name = "task")]
async fn run_background_task(
    source_name: String,
    source_kind: SourceKind,
    fetch_state: FetchState,
    interval_secs: i32,
) {
    info!(interval_secs, "starting task");

    let mut interval = tokio::time::interval(Duration::from_secs(interval_secs as u64));
    let integration = sources::integrations::source(&source_name, &source_kind).unwrap();

    loop {
        interval.tick().await;
        if let Err(err) = integration.background_task(&fetch_state).await {
            error!(error = ?err, "tick failed");
        }

        info!("tick finished, pausing task");
    }
}
