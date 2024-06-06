use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::{IntoParams, ToSchema};

/// A secret with the number of sources that use it
#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Secret {
    /// The database ID of the secret
    pub id: String,
    /// The time the secret was created
    pub created_at: NaiveDateTime,
    /// The time the secret was last updated
    pub updated_at: NaiveDateTime,
    /// The name of the secret
    pub name: String,
    /// The description of the secret
    pub description: Option<String>,
    /// The time the secret expires
    pub expires_at: Option<NaiveDateTime>,
    /// Database ID of the user who created the secret
    pub created_user_id: String,
    /// Database ID of the user who last updated the secret
    pub updated_user_id: Option<String>,
    /// The number of sources that use this secret
    pub num_sources: i32,
}

/// Defining secrets needed for a source and the link between a source and a secret
#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct SourceSecret {
    /// Database ID of the source secret
    pub id: String,
    /// Timestamp of the creation of the source secret
    pub created_at: NaiveDateTime,
    /// Timestamp of the last update of the source secret
    pub updated_at: NaiveDateTime,
    /// Database ID of the secret
    pub secret_id: Option<String>,
    /// Name of the source secret
    pub name: String,
    /// Description of the source secret
    pub description: Option<String>,
    /// Wether the source secret needs a secret linked for the source to work
    pub required: bool,
    /// Database ID of the user who created the source secret
    pub created_user_id: String,
    /// Database ID of the user who last updated the source secret
    pub updated_user_id: Option<String>,
}

/// Parameters for creating a new secret
#[derive(Deserialize, FromRow, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CreateSecret {
    /// The value of the secret
    pub value: String,
    /// The name of the secret
    pub name: String,
    /// The description of the secret
    pub description: Option<String>,
    /// The time the secret expires
    pub expires_at: Option<NaiveDateTime>,
}

#[derive(FromRow)]
pub struct GetSecret {
    pub value: Vec<u8>,
    pub name: String,
}

/// Parameters for updating a secret
#[derive(Deserialize, IntoParams, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct UpdateSecret {
    /// The value of the secret
    pub value: Option<String>,
    /// The name of the secret
    pub name: Option<String>,
    /// The description of the secret
    pub description: Option<String>,
    /// The time the secret expires
    pub expires_at: Option<NaiveDateTime>,
}

/// Parameters for creating a new source secret
#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CreateSourceSecret {
    /// ID of the secret
    pub secret_id: Option<String>,
    /// Name of the source secret
    pub name: String,
    /// Description of the source secret
    pub description: Option<String>,
    /// Wether the source secret needs a secret linked for the source to work
    pub required: bool,
}
