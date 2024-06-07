use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::collections::HashSet;
use typeshare::typeshare;
use utoipa::ToSchema;

/// User able to query and make modifications to Indicator Aggregator
#[derive(FromRow, Serialize, Deserialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct User {
    /// Database ID of the user
    pub id: String,
    /// Time when the user was created
    pub created_at: NaiveDateTime,
    /// Time when the user was updated
    pub updated_at: NaiveDateTime,
    /// OpenID authentication ID of the user, if user authenticated via an OpenID provider
    pub auth_id: Option<String>,
    /// Authentication provider of the user, either an OpenID provider or "Indicator Aggregator"
    pub provider: String,
    /// Whether the user is enabled or not, if they are able to login/access the platform
    pub enabled: bool,
    /// Email of the user
    pub email: String,
    /// Whether the user has verified their email or not
    pub verified: bool,
    /// Full name of the user
    pub name: String,
    /// First part of the user's name
    pub given_name: Option<String>,
    /// Last part of the user's name
    pub family_name: Option<String>,
    /// Locale/language of the user
    pub locale: Option<String>,
    /// Picture of the user
    pub picture: Option<Vec<u8>>,
    /// Roles of the user, defining their access and what they can do on the platform
    pub roles: Vec<String>,
    /// User that last modified the user
    pub last_modified_user_id: Option<String>,
}

#[derive(FromRow, Clone, Debug)]
pub struct UserWithPassword {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub auth_id: Option<String>,
    pub provider: String,
    pub enabled: bool,
    pub email: String,
    pub verified: bool,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub locale: Option<String>,
    pub picture: Option<Vec<u8>>,
    pub roles: Vec<String>,
    pub password: Option<String>,
    pub last_modified_user_id: Option<String>,
}

impl From<UserWithPassword> for User {
    fn from(value: UserWithPassword) -> Self {
        Self {
            id: value.id,
            created_at: value.created_at,
            updated_at: value.updated_at,
            auth_id: value.auth_id,
            provider: value.provider,
            enabled: value.enabled,
            email: value.email,
            verified: value.verified,
            name: value.name,
            given_name: value.given_name,
            family_name: value.family_name,
            locale: value.locale,
            picture: value.picture,
            roles: value.roles,
            last_modified_user_id: value.last_modified_user_id,
        }
    }
}

/// What to update in a user
#[derive(Deserialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct UpdateUser {
    /// Wheter to enable the user or not
    pub enabled: Option<bool>,
    /// Roles to assign to the user, if any
    pub roles: Option<HashSet<String>>,
}

/// Container for a user and the number of logs they have
#[derive(Deserialize, FromRow, Serialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct UserWithNumLogs {
    /// User information
    #[sqlx(flatten)]
    pub user: User,
    /// Number of user request logs
    pub num_logs: i32,
}

#[derive(Debug)]
pub struct CreateUser {
    pub auth_id: Option<String>,
    pub provider: String,
    pub enabled: bool,
    pub email: String,
    pub verified: bool,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub locale: Option<String>,
    pub picture: Option<Vec<u8>>,
    pub roles: HashSet<String>,
    pub hashed_password: Option<String>,
}

/// Internal user request log
#[derive(Debug, Clone)]
pub struct UserLog {
    pub user_id: String,
    pub ip_address: String,
    pub user_agent: String,
    pub uri: String,
    pub method: String,
}

/// User request log
#[derive(FromRow, Serialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct DbUserLog {
    /// Database ID of the log
    pub id: String,
    /// Time when the log was created
    pub created_at: NaiveDateTime,
    /// Time when the log was modifed
    pub updated_at: NaiveDateTime,
    /// Database ID of the user that made the request
    pub user_id: String,
    /// IP address of the user that made the request
    pub ip_address: String,
    /// Browser user agent of the user that made the request
    pub user_agent: String,
    /// URI path of the request
    pub uri: String,
    /// HTTP method of the request
    pub method: String,
    /// Opentelemetry trace ID of the request, can be used to correlate logs with a tool like Jaeger
    pub trace_id: String,
}
