use async_trait::async_trait;
use serde::Deserialize;

use crate::openid::{CreateUserClaims, OpenIdProvider, OpenIdResponse};

/// https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc
#[derive(Deserialize, Clone)]
pub struct MicrosoftClaims {
    pub oid: String,
    pub email: String,
    pub email_verified: Option<bool>,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub picture: Option<String>,
    pub locale: Option<String>,
}

impl From<MicrosoftClaims> for CreateUserClaims {
    fn from(claims: MicrosoftClaims) -> Self {
        Self {
            sub: claims.oid,
            email: claims.email,
            email_verified: claims.email_verified,
            name: claims.name,
            given_name: claims.given_name,
            family_name: claims.family_name,
            picture: claims.picture,
            locale: claims.locale,
            provider: "microsoft".to_string(),
        }
    }
}

#[derive(Clone)]
pub struct MicrosoftOpenId(pub OpenIdResponse);

impl From<OpenIdResponse> for MicrosoftOpenId {
    fn from(openid: OpenIdResponse) -> Self {
        Self(openid)
    }
}

#[async_trait]
impl OpenIdProvider for MicrosoftOpenId {
    async fn validate_and_decode_jwt(
        &self,
        token: &str,
        client_id: &str,
    ) -> Option<CreateUserClaims> {
        self.0
            .validate_and_decode_jwt::<MicrosoftClaims>(token, client_id)
            .await
            .map(Into::into)
    }

    fn open_id_response(&self) -> &OpenIdResponse {
        &self.0
    }
}
