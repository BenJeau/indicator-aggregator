use async_trait::async_trait;
use serde::Deserialize;

use crate::openid::{CreateUserClaims, OpenIdProvider, OpenIdResponse};

/// https://developers.google.com/identity/openid-connect/openid-connect#java
#[derive(Deserialize, Clone)]
pub struct GoogleClaims {
    pub sub: String,
    pub email: String,
    pub email_verified: Option<bool>,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub picture: Option<String>,
    pub locale: Option<String>,
}

impl From<GoogleClaims> for CreateUserClaims {
    fn from(claims: GoogleClaims) -> Self {
        Self {
            sub: claims.sub,
            email: claims.email,
            email_verified: claims.email_verified,
            name: claims.name,
            given_name: claims.given_name,
            family_name: claims.family_name,
            picture: claims.picture,
            locale: claims.locale,
            provider: "google".to_string(),
        }
    }
}

#[derive(Clone)]
pub struct GoogleOpenId(pub OpenIdResponse);

impl From<OpenIdResponse> for GoogleOpenId {
    fn from(openid: OpenIdResponse) -> Self {
        Self(openid)
    }
}

#[async_trait]
impl OpenIdProvider for GoogleOpenId {
    async fn validate_and_decode_jwt(
        &self,
        token: &str,
        client_id: &str,
    ) -> Option<CreateUserClaims> {
        self.0
            .validate_and_decode_jwt::<GoogleClaims>(token, client_id)
            .await
            .map(Into::into)
    }

    fn open_id_response(&self) -> &OpenIdResponse {
        &self.0
    }
}
