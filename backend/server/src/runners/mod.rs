use axum::response::sse::Event;
use common::{
    health::pb::{health_client::HealthClient, HealthCheckRequest},
    runner_client::RunnerClient,
    DeleteRequest, InitRequest, UpdateRequest,
};
use database::{logic::server_config::get_config_with_defaults_and_db_results, PgPool};
use database::{logic::sources::get_source_code_by_kind, schemas::sources::SourceKind};
use futures_util::{Stream, StreamExt, TryStreamExt};
use tonic::transport::Endpoint;

use crate::Result;

pub async fn send_init_request(pool: &PgPool, source_kind: SourceKind) -> Result<()> {
    let updates = get_source_code_by_kind(pool, &source_kind).await?;

    let request = InitRequest {
        updates: updates
            .into_iter()
            .flat_map(|s| {
                s.source_code.map(|source_code| common::UpdateRequest {
                    source: s.id.to_string(),
                    source_code,
                })
            })
            .collect(),
    };

    let config = get_config_with_defaults_and_db_results(pool).await?;
    let endpoint = Endpoint::from_shared(config.runner_endpoint(&source_kind).to_string())?;

    let mut client = RunnerClient::connect(endpoint).await?;

    client.init(request).await?;

    Ok(())
}

pub async fn send_delete_request(
    pool: &PgPool,
    source_kind: SourceKind,
    source_id: &str,
) -> Result<()> {
    let request = DeleteRequest {
        source: source_id.to_string(),
    };

    let config = get_config_with_defaults_and_db_results(pool).await?;
    let endpoint = Endpoint::from_shared(config.runner_endpoint(&source_kind).to_string())?;

    let mut client = RunnerClient::connect(endpoint).await?;

    client.delete(request).await?;

    Ok(())
}

pub async fn send_update_request(
    pool: &PgPool,
    source_kind: SourceKind,
    source_id: &str,
    source_code: &str,
) -> Result<()> {
    let request = UpdateRequest {
        source: source_id.to_string(),
        source_code: source_code.to_string(),
    };

    let config = get_config_with_defaults_and_db_results(pool).await?;
    let endpoint = Endpoint::from_shared(config.runner_endpoint(&source_kind).to_string())?;

    let mut client = RunnerClient::connect(endpoint).await?;

    client.update(request).await?;

    Ok(())
}

pub async fn stream_health_check(
    pool: &PgPool,
    source_kind: SourceKind,
) -> Result<impl Stream<Item = Result<Event>>> {
    let config = get_config_with_defaults_and_db_results(pool).await?;
    let endpoint = Endpoint::from_shared(config.runner_endpoint(&source_kind).to_string())?;
    let connection = endpoint.connect().await?;

    let mut client = HealthClient::new(connection);

    let request = HealthCheckRequest {
        service: "".to_string(),
    };

    let stream = client.watch(request).await?.into_inner();

    let sse_stream = stream.into_stream().map(move |data| {
        data.map(|d| {
            Event::default()
                .id(source_kind.to_string())
                .data(d.status().as_str_name())
        })
        .map_err(Into::into)
    });

    Ok(sse_stream)
}
