use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::collections::HashSet;
use typeshare::typeshare;
use utoipa::ToSchema;

#[derive(FromRow, Serialize, Deserialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct User {
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
        }
    }
}

#[derive(Deserialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct UpdateUser {
    pub enabled: Option<bool>,
    pub roles: Option<HashSet<String>>,
}

#[derive(Deserialize, FromRow, Serialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct UserWithNumLogs {
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

#[derive(Debug, Clone)]
pub struct UserLog {
    pub user_id: String,
    pub ip_address: String,
    pub user_agent: String,
    pub uri: String,
    pub method: String,
}

#[derive(FromRow, Serialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct DbUserLog {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub user_id: String,
    pub ip_address: String,
    pub user_agent: String,
    pub uri: String,
    pub method: String,
}
