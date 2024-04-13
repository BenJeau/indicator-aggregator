use std::net::{AddrParseError, SocketAddr};

use figment::{
    providers::{Env, Format, Toml},
    Figment,
};
use serde::Deserialize;
use tracing::info;

#[derive(Deserialize, Clone)]
pub struct Database {
    pub username: String,
    pub password: String,
    pub host: String,
    pub port: u16,
    pub name: String,
}

impl Database {
    pub fn url(&self) -> String {
        format!(
            "postgresql://{}:{}@{}:{}/{}",
            self.username, self.password, self.host, self.port, self.name
        )
    }
}

#[derive(Deserialize, Clone)]
pub struct ServerInstance {
    pub enabled: bool,
    pub host: String,
    pub port: u16,
}

impl ServerInstance {
    pub fn address(&self) -> Result<SocketAddr, AddrParseError> {
        format!("{}:{}", self.host, self.port).parse()
    }
}

#[derive(Deserialize, Clone)]
pub struct Server {
    pub http: ServerInstance,
}

#[derive(Deserialize, Clone)]
pub struct Encryption {
    pub db_key: String,
    pub server_key: String,
}

#[derive(Deserialize, Clone)]
pub struct Cache {
    pub redis_url: Option<String>,
}

#[derive(Deserialize, Clone)]
pub struct Config {
    pub database: Database,
    pub server: Server,
    pub encryption: Encryption,
    pub cache: Cache,
}

impl Config {
    pub fn new() -> figment::error::Result<Self> {
        info!("Fetching config");

        Figment::new()
            .merge(Toml::string(include_str!("../config.toml")))
            .merge(Env::prefixed("INDICATOR_AGGREGATOR__").split("__"))
            .extract()
    }
}

#[cfg(test)]
pub mod test {
    use super::*;

    pub fn create_config() -> Config {
        Config {
            database: Database {
                username: "test".to_string(),
                password: "test".to_string(),
                host: "localhost".to_string(),
                port: 5432,
                name: "test".to_string(),
            },
            server: Server {
                http: ServerInstance {
                    enabled: true,
                    host: "localhost".to_string(),
                    port: 8080,
                },
            },
            encryption: Encryption {
                db_key: "tqQxsKu7z2CWMGuWJ@HAXF_oRHtsyFHR7HHEmNhmyNw4gCzqiez.T4hbN2jLH.LrVJbtAecRyb3J9Ke6!qjK4RzY_NqgFBEN*C6h".to_string(),
                server_key: "AsuKXKermWGsAPo3e9XnEHMzt*7svap#".to_string(), 
            },
            cache: Cache { redis_url: None },
        }
    }
}
