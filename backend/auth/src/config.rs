use serde::Deserialize;

use crate::{google::GoogleOpenId, microsoft::MicrosoftOpenId, openid::OpenIdProvider};

#[derive(Deserialize, Clone)]
pub struct Jwt {
    pub secret: String,
    pub issuer: String,
    pub audience: String,
    pub expiration: u64,
}

#[derive(Deserialize, Clone)]
pub struct OpenId {
    pub enabled: bool,
    pub redirect_uri: String,
    pub openid_url: String,
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Deserialize, Clone)]
pub struct Auth {
    pub frontend_redirect_path: String,
    pub frontend_redirect_hosts: Vec<String>,
    pub jwt: Jwt,
    pub google: OpenId,
    pub microsoft: OpenId,
}

impl Auth {
    pub fn open_id(&self, provider: &str) -> &OpenId {
        match provider {
            "google" => &self.google,
            "microsoft" => &self.microsoft,
            _ => panic!("Unknown provider: {}", provider),
        }
    }
}

#[derive(Clone)]
pub struct State {
    pub auth: Auth,
    pub google_keys: Option<GoogleOpenId>,
    pub microsoft_keys: Option<MicrosoftOpenId>,
    pub jwt_manager: crate::jwt::JwtManager,
}

impl State {
    pub fn provider_data(&self, provider: &str) -> Option<Box<dyn OpenIdProvider>> {
        match provider {
            "google" => self
                .google_keys
                .as_ref()
                .map(|a| Box::new(a.clone()) as Box<dyn OpenIdProvider>),
            "microsoft" => self
                .microsoft_keys
                .as_ref()
                .map(|a| Box::new(a.clone()) as Box<dyn OpenIdProvider>),
            _ => panic!("Unknown provider: {}", provider),
        }
    }
}
