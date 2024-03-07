use tracing::info;

use crate::ServerState;

pub mod routes;

pub struct RestServer(ServerState);

impl RestServer {
    pub fn new(state: ServerState) -> Self {
        Self(state)
    }

    #[tracing::instrument(skip(self), fields(kind = "RestServer"), err)]
    pub async fn start(self) -> Result<(), Box<dyn std::error::Error>> {
        let addr = self.0.config.server.http.address()?;

        info!("listening on http://{addr}");

        axum::serve(
            tokio::net::TcpListener::bind(addr).await?,
            routes::router(self.0.clone()),
        )
        .await?;

        Ok(())
    }
}
