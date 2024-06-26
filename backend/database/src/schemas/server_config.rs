use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;

use crate::schemas::sources::SourceKind;

/// Enum containing the different kinds of server configuration entries
#[derive(Deserialize, Serialize, Debug, Clone, Eq, PartialEq, Hash, ToSchema, Default)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[typeshare]
pub enum ServerConfigKind {
    #[default]
    String,
    Number,
    Boolean,
    Code,
}

/// Enum containing the different categories of server configuration entries
#[derive(Deserialize, Serialize, Debug, Clone, Eq, PartialEq, Hash, ToSchema, Default)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[typeshare]
pub enum ServerConfigCategory {
    #[default]
    Code,
    Proxy,
    Sse,
    Runners,
}

/// Configuration entry for the server
#[derive(Deserialize, Serialize, Debug, ToSchema, Default, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
#[typeshare]
#[aliases(ServerConfigEntryString = ServerConfigEntry<String>, ServerConfigEntryBool = ServerConfigEntry<bool>, ServerConfigEntryU32 = ServerConfigEntry<u32>)]
pub struct ServerConfigEntry<T: Default> {
    /// Unique identifier of the server config entry
    pub id: Option<String>,
    /// Timestamp of the creation of the server config entry
    pub created_at: Option<NaiveDateTime>,
    /// Timestamp of the last update of the server config entry
    pub updated_at: Option<NaiveDateTime>,
    /// User defined value of the server config entry, if any, otherwise defaults to the default value
    pub value: Option<T>,
    /// Default value of the server config entry
    pub default_value: T,
    /// Friendly name of the server config entry
    pub friendly_name: String,
    /// Brief description of the server config entry
    pub description: String,
    /// Kind of the server config entry
    pub kind: ServerConfigKind,
    /// Category grouping server config entries
    pub category: ServerConfigCategory,
    /// User that last modified the server config entry
    pub last_modified_user_id: Option<String>,
}

impl<T: Default> ServerConfigEntry<T> {
    pub fn get_value(&self) -> &T {
        self.value.as_ref().unwrap_or(&self.default_value)
    }
}

/// Parameters for updating a server config entry
#[derive(Deserialize, Debug, ToSchema)]
#[typeshare]
pub struct UpdateServerConfig {
    /// Name of the server config entry
    pub key: String,
    /// User defined value of the server config entry, if any, otherwise defaults to the default value
    pub value: Option<String>,
}

#[derive(Serialize, Debug, ToSchema, FromRow)]
pub struct DbServerConfig {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub key: String,
    pub value: String,
    pub last_modified_user_id: String,
}

/// General server configuration
#[derive(Deserialize, Serialize, Debug, ToSchema, Eq, PartialEq)]
#[typeshare]

pub struct ServerConfig {
    pub javascript_source_template: ServerConfigEntryString,
    pub python_source_template: ServerConfigEntryString,
    pub proxy_enabled: ServerConfigEntryBool,
    pub proxy_type: ServerConfigEntryString,
    pub proxy_value: ServerConfigEntryString,
    pub sse_keep_alive: ServerConfigEntryU32,
    pub sse_number_concurrent_source_fetching: ServerConfigEntryU32,
    pub javascript_runner_grpc_address: ServerConfigEntryString,
    pub javascript_runner_enabled: ServerConfigEntryBool,
    pub python_runner_grpc_address: ServerConfigEntryString,
    pub python_runner_enabled: ServerConfigEntryBool,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            javascript_source_template: ServerConfigEntry {
                default_value: r#"async function fetchData(indicator_data, indicator_kind) {
  // perform your source data correlation here
}

async function backgroundTask() {
  // perform your background task here
}"#
                .to_string(),
                friendly_name: "Javascript Source Template".to_string(),
                description: "Template for the Javascript source code".to_string(),
                kind: ServerConfigKind::Code,
                category: ServerConfigCategory::Code,
                ..Default::default()
            },
            python_source_template: ServerConfigEntry {
                default_value: r#"def fetch_data(indicator_data, indicator_kind):
  # perform your source data correlation here
  pass

def background_task():
  # perform your background task here
  pass"#
                    .to_string(),
                friendly_name: "Python Source Template".to_string(),
                description: "Template for the Python source code".to_string(),
                kind: ServerConfigKind::Code,
                category: ServerConfigCategory::Code,
                ..Default::default()
            },
            proxy_enabled: ServerConfigEntry {
                default_value: false,
                friendly_name: "Proxy Enabled".to_string(),
                description: "Enable or disable the proxy".to_string(),
                kind: ServerConfigKind::Boolean,
                category: ServerConfigCategory::Proxy,
                ..Default::default()
            },
            proxy_type: ServerConfigEntry {
                default_value: "http".to_string(),
                friendly_name: "Proxy Type".to_string(),
                description: "Type of the proxy".to_string(),
                kind: ServerConfigKind::String,
                category: ServerConfigCategory::Proxy,
                ..Default::default()
            },
            proxy_value: ServerConfigEntry {
                default_value: "http://localhost:8080".to_string(),
                friendly_name: "Proxy Value".to_string(),
                description: "Value of the proxy".to_string(),
                kind: ServerConfigKind::String,
                category: ServerConfigCategory::Proxy,
                ..Default::default()
            },
            sse_keep_alive: ServerConfigEntry {
                default_value: 30000,
                friendly_name: "SSE Keep Alive".to_string(),
                description: "Keep alive interval in seconds for the SSE connection".to_string(),
                kind: ServerConfigKind::Number,
                category: ServerConfigCategory::Sse,
                ..Default::default()
            },
            sse_number_concurrent_source_fetching: ServerConfigEntry {
                default_value: 10,
                friendly_name: "SSE Number Concurrent Source Fetching".to_string(),
                description: "Number of concurrent source fetching".to_string(),
                kind: ServerConfigKind::Number,
                category: ServerConfigCategory::Sse,
                ..Default::default()
            },
            javascript_runner_grpc_address: ServerConfigEntry {
                default_value: "http://indicator_aggregator_javascript_runner:50051".to_string(),
                friendly_name: "Javascript Runner GRPC Address".to_string(),
                description: "GRPC address of the Javascript runner".to_string(),
                kind: ServerConfigKind::String,
                category: ServerConfigCategory::Runners,
                ..Default::default()
            },
            javascript_runner_enabled: ServerConfigEntry {
                default_value: false,
                friendly_name: "Javascript Runner Enabled".to_string(),
                description: "Enable or disable the Javascript runner".to_string(),
                kind: ServerConfigKind::Boolean,
                category: ServerConfigCategory::Runners,
                ..Default::default()
            },
            python_runner_grpc_address: ServerConfigEntry {
                default_value: "http://indicator_aggregator_python_runner:50051".to_string(),
                friendly_name: "Python Runner GRPC Address".to_string(),
                description: "GRPC address of the Python runner".to_string(),
                kind: ServerConfigKind::String,
                category: ServerConfigCategory::Runners,
                ..Default::default()
            },
            python_runner_enabled: ServerConfigEntry {
                default_value: true,
                friendly_name: "Python Runner Enabled".to_string(),
                description: "Enable or disable the Python runner".to_string(),
                kind: ServerConfigKind::Boolean,
                category: ServerConfigCategory::Runners,
                ..Default::default()
            },
        }
    }
}

pub const SERVER_CONFIG_ENTRIES: [&str; 11] = [
    "javascript_source_template",
    "python_source_template",
    "proxy_enabled",
    "proxy_type",
    "proxy_value",
    "sse_keep_alive",
    "sse_number_concurrent_source_fetching",
    "javascript_runner_grpc_address",
    "javascript_runner_enabled",
    "python_runner_grpc_address",
    "python_runner_enabled",
];

impl ServerConfig {
    pub fn combine_with_db_results(&mut self, db_results: Vec<DbServerConfig>) {
        for db_result in db_results {
            match db_result.key.to_lowercase().as_str() {
                "javascript_source_template" => {
                    self.javascript_source_template.id = Some(db_result.id);
                    self.javascript_source_template.created_at = Some(db_result.created_at);
                    self.javascript_source_template.updated_at = Some(db_result.updated_at);
                    self.javascript_source_template.value = Some(db_result.value);
                    self.javascript_source_template.last_modified_user_id =
                        Some(db_result.last_modified_user_id);
                }
                "python_source_template" => {
                    self.python_source_template.id = Some(db_result.id);
                    self.python_source_template.created_at = Some(db_result.created_at);
                    self.python_source_template.updated_at = Some(db_result.updated_at);
                    self.python_source_template.value = Some(db_result.value);
                    self.python_source_template.last_modified_user_id =
                        Some(db_result.last_modified_user_id);
                }
                "proxy_enabled" => {
                    self.proxy_enabled.id = Some(db_result.id);
                    self.proxy_enabled.created_at = Some(db_result.created_at);
                    self.proxy_enabled.updated_at = Some(db_result.updated_at);
                    self.proxy_enabled.value = Some(db_result.value.parse().unwrap());
                    self.proxy_enabled.last_modified_user_id =
                        Some(db_result.last_modified_user_id);
                }
                "proxy_type" => {
                    self.proxy_type.id = Some(db_result.id);
                    self.proxy_type.created_at = Some(db_result.created_at);
                    self.proxy_type.updated_at = Some(db_result.updated_at);
                    self.proxy_type.value = Some(db_result.value);
                    self.proxy_type.last_modified_user_id = Some(db_result.last_modified_user_id);
                }
                "proxy_value" => {
                    self.proxy_value.id = Some(db_result.id);
                    self.proxy_value.created_at = Some(db_result.created_at);
                    self.proxy_value.updated_at = Some(db_result.updated_at);
                    self.proxy_value.value = Some(db_result.value);
                    self.proxy_value.last_modified_user_id = Some(db_result.last_modified_user_id);
                }
                "sse_keep_alive" => {
                    self.sse_keep_alive.id = Some(db_result.id);
                    self.sse_keep_alive.created_at = Some(db_result.created_at);
                    self.sse_keep_alive.updated_at = Some(db_result.updated_at);
                    self.sse_keep_alive.value = Some(db_result.value.parse().unwrap());
                    self.sse_keep_alive.last_modified_user_id =
                        Some(db_result.last_modified_user_id);
                }
                "sse_number_concurrent_source_fetching" => {
                    self.sse_number_concurrent_source_fetching.id = Some(db_result.id);
                    self.sse_number_concurrent_source_fetching.created_at =
                        Some(db_result.created_at);
                    self.sse_number_concurrent_source_fetching.updated_at =
                        Some(db_result.updated_at);
                    self.sse_number_concurrent_source_fetching.value =
                        Some(db_result.value.parse().unwrap());
                    self.sse_number_concurrent_source_fetching
                        .last_modified_user_id = Some(db_result.last_modified_user_id);
                }
                "javascript_runner_grpc_address" => {
                    self.javascript_runner_grpc_address.id = Some(db_result.id);
                    self.javascript_runner_grpc_address.created_at = Some(db_result.created_at);
                    self.javascript_runner_grpc_address.updated_at = Some(db_result.updated_at);
                    self.javascript_runner_grpc_address.value = Some(db_result.value);
                    self.javascript_runner_grpc_address.last_modified_user_id =
                        Some(db_result.last_modified_user_id);
                }
                "javascript_runner_enabled" => {
                    self.javascript_runner_enabled.id = Some(db_result.id);
                    self.javascript_runner_enabled.created_at = Some(db_result.created_at);
                    self.javascript_runner_enabled.updated_at = Some(db_result.updated_at);
                    self.javascript_runner_enabled.value = Some(db_result.value.parse().unwrap());
                    self.javascript_runner_enabled.last_modified_user_id =
                        Some(db_result.last_modified_user_id);
                }
                "python_runner_grpc_address" => {
                    self.python_runner_grpc_address.id = Some(db_result.id);
                    self.python_runner_grpc_address.created_at = Some(db_result.created_at);
                    self.python_runner_grpc_address.updated_at = Some(db_result.updated_at);
                    self.python_runner_grpc_address.value = Some(db_result.value);
                    self.python_runner_grpc_address.last_modified_user_id =
                        Some(db_result.last_modified_user_id);
                }
                "python_runner_enabled" => {
                    self.python_runner_enabled.id = Some(db_result.id);
                    self.python_runner_enabled.created_at = Some(db_result.created_at);
                    self.python_runner_enabled.updated_at = Some(db_result.updated_at);
                    self.python_runner_enabled.value = Some(db_result.value.parse().unwrap());
                    self.python_runner_enabled.last_modified_user_id =
                        Some(db_result.last_modified_user_id);
                }
                _ => (),
            };
        }
    }

    pub fn runner_enabled(&self, source_kind: &SourceKind) -> bool {
        match source_kind {
            SourceKind::JavaScript => *self.javascript_runner_enabled.get_value(),
            SourceKind::Python => *self.python_runner_enabled.get_value(),
            _ => panic!("Invalid source kind"),
        }
    }

    pub fn runner_endpoint(&self, source_kind: &SourceKind) -> &str {
        match source_kind {
            SourceKind::JavaScript => self.javascript_runner_grpc_address.get_value(),
            SourceKind::Python => self.python_runner_grpc_address.get_value(),
            _ => panic!("Invalid source kind"),
        }
    }
}
