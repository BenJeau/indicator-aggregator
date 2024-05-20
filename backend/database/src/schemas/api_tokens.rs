use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::{IntoParams, ToSchema};

/// An token used for authentication with the API
#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ApiToken {
    /// The database ID of the token
    pub id: String,
    /// The time the token was created
    pub created_at: NaiveDateTime,
    /// The time the token was last updated
    pub updated_at: NaiveDateTime,
    /// A description of the token
    pub note: String,
    /// The time the token expires
    pub expires_at: Option<NaiveDateTime>,
}

/// Parameters for creating a new API token
#[derive(Deserialize, FromRow, ToSchema, Debug, Default)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CreateApiToken {
    /// A description of the token
    pub note: String,
    /// The time the token expires
    pub expires_at: Option<NaiveDateTime>,
}

/// Parameters for updating an API token
#[derive(Deserialize, IntoParams, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct UpdateApiToken {
    /// A description of the token
    pub note: Option<String>,
    /// The time the token expires
    pub expires_at: Option<NaiveDateTime>,
}

impl From<UpdateApiToken> for InternalUpdateApiToken {
    fn from(value: UpdateApiToken) -> Self {
        Self {
            token: None,
            note: value.note,
            expires_at: value.expires_at,
        }
    }
}

#[derive(Debug, Default)]
pub struct InternalUpdateApiToken {
    pub token: Option<String>,
    pub note: Option<String>,
    pub expires_at: Option<NaiveDateTime>,
}

#[derive(FromRow, Debug)]
pub struct GetApiToken {
    pub token: String,
    pub user_id: String,
}
