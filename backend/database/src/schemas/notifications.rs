use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;

/// Enum containing the different kinds of notifications and it's content
#[derive(Serialize, ToSchema, Debug)]
#[serde(tag = "kind", content = "content", rename_all = "SCREAMING_SNAKE_CASE")]
#[typeshare]
pub enum NotificationKind {
    MissingRequiredSourceSecret(MinimalSource),
    // TODO: MissingSourceCode,
    // TODO: ExpiredSecret,
}

/// A source with minimal information needed for displaying the notification
#[derive(Serialize, FromRow, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct MinimalSource {
    /// Database ID of the source
    pub id: String,
    /// Name of the source
    pub name: String,
    /// URL friendly name of the provider
    pub slug: String,
    /// Number of secrets needed for the source
    pub num_missing_secrets: i32,
}
