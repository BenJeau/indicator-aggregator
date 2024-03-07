pub mod rest;
pub mod state;

pub async fn start_all_servers(
    state: state::ServerState,
) -> Result<(), Box<dyn std::error::Error>> {
    rest::RestServer::new(state.clone()).start().await
}
