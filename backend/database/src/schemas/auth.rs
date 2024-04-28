use chrono::NaiveDateTime;
use sqlx::FromRow;

#[derive(Debug)]
pub struct CreateLoginRequest {
    pub nonce: String,
    pub state_nonce: String,
    pub provider: String,
    pub ip_address: String,
    pub user_agent: String,
    pub browser_state: Option<String>,
    pub redirect_uri: String,
}

#[derive(FromRow, Debug)]
pub struct LoginRequest {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub nonce: String,
    pub state_nonce: String,
    pub provider: String,
    pub ip_address: String,
    pub user_agent: String,
    pub browser_state: Option<String>,
    pub redirect_uri: String,
}
