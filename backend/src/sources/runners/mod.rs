use common::{runner_client::RunnerClient, InitRequest};
use sqlx::PgPool;

use crate::{
    postgres::{
        logic::sources::get_source_code_by_kind,
        schemas::sources::{SourceCode, SourceKind},
    },
    Result,
};

pub async fn send_init_request(pool: &PgPool) -> Result<()> {
    let updates = get_source_code_by_kind(pool, SourceKind::Python).await?;

    let request = InitRequest {
        updates: updates
            .into_iter()
            .flat_map(SourceCode::into_update_request)
            .collect(),
    };

    let mut client =
        RunnerClient::connect("http://indicator_aggregator_python_runner:50051").await?;

    client.init(request).await?;

    Ok(())
}
