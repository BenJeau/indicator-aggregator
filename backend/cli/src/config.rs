use std::env::var;

pub struct Config {
    pub base_url: String,
    pub api_token: String,
}

impl Config {
    pub fn from_env() -> Self {
        let base_url = var("BASE_URL").expect("Needs BASE_URL to be set");
        let api_token = var("API_TOKEN").expect("Needs API_TOKEN to be set");

        Self {
            base_url,
            api_token,
        }
    }
}
