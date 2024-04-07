use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize, FromRow, Serialize)]
pub struct Entry {
    pub id: i64,
    #[serde(deserialize_with = "crate::utils::url_haus_deserialize")]
    pub dateadded: NaiveDateTime,
    pub url: String,
    pub url_status: String,
    #[serde(deserialize_with = "crate::utils::url_haus_optional_deserialize")]
    pub last_online: Option<NaiveDateTime>,
    pub threat: String,
    pub tags: String,
    pub urlhaus_link: String,
    pub reporter: String,
}
