use serde::Deserialize;
use utoipa::IntoParams;

#[derive(Deserialize, IntoParams)]
pub struct GetFaviconParams {
    /// URL of the favicon to fetch
    pub url: String,
}
