use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;
use std::net::{AddrParseError, SocketAddr};
use tracing::info;

#[derive(Deserialize, Clone)]
pub struct Server {
    pub host: String,
    pub port: u16,
}

impl Server {
    pub fn address(&self) -> Result<SocketAddr, AddrParseError> {
        format!("{}:{}", self.host, self.port).parse()
    }
}

#[derive(Deserialize, Clone)]
pub struct Config {
    pub server: Server,
}

impl Config {
    pub fn new(prefix: &str, config: &str) -> figment::error::Result<Self> {
        info!("Fetching config");

        Figment::new()
            .merge(Toml::string(config))
            .merge(Env::prefixed(&format!("{prefix}__")).split("__"))
            .extract()
    }
}
