use axum::{extract::State, response::IntoResponse, Json};

use crate::{
    config::Config,
    schemas::{AuthService, AuthServiceKind},
    Result,
};

/// Get all enabled auth services
#[utoipa::path(
    get,
    path = "/auth",
    tag = "auth",
    responses(
        (status = 200, description = "List of enabled auth services successfully", body = [AuthService]),
    ),
)]
pub async fn get_enabled_auth(State(config): State<Config>) -> Result<impl IntoResponse> {
    Ok(Json([
        AuthService {
            enabled: config.auth.google.enabled,
            kind: AuthServiceKind::OpenId {
                name: "google".to_string(),
            },
        },
        AuthService {
            enabled: config.auth.microsoft.enabled,
            kind: AuthServiceKind::OpenId {
                name: "microsoft".to_string(),
            },
        },
        AuthService {
            enabled: true,
            kind: AuthServiceKind::Password,
        },
    ]))
}
