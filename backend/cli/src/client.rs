use reqwest::{
    header::{HeaderMap, HeaderValue, AUTHORIZATION},
    Client, RequestBuilder,
};
use reqwest_eventsource::EventSource;
use serde::de::DeserializeOwned;

use crate::{config::Config, schemas::Source};

struct HttpClient {
    config: Config,
    client: Client,
}

impl HttpClient {
    fn new(config: Config) -> Self {
        println!("creating client to server at {} ...", config.base_url);

        let client = Self::create_client(&config.api_token);

        Self { config, client }
    }

    fn create_client(api_token: &str) -> Client {
        let mut headers = HeaderMap::new();

        let mut auth_value = HeaderValue::from_maybe_shared(format!("Token {api_token}")).unwrap();
        auth_value.set_sensitive(true);
        headers.insert(AUTHORIZATION, auth_value);

        Client::builder()
            .user_agent("IndicatorAggregatorClient")
            .default_headers(headers)
            .build()
            .unwrap()
    }

    fn url(&self, endpoint: &str) -> String {
        format!("{}{}", self.config.base_url, endpoint)
    }

    fn get_request_builder(&self, endpoint: &str) -> RequestBuilder {
        self.client.get(self.url(endpoint))
    }

    async fn get<T: DeserializeOwned>(&self, endpoint: &str) -> reqwest::Result<T> {
        self.get_request_builder(endpoint)
            .send()
            .await?
            .error_for_status()?
            .json()
            .await
    }
}

pub struct IndicatorAggregatorClient {
    http_client: HttpClient,
}

impl IndicatorAggregatorClient {
    pub fn new(config: Config) -> Self {
        Self {
            http_client: HttpClient::new(config),
        }
    }

    pub async fn get_sources(&self) -> Vec<Source> {
        println!("getting sources ...");
        self.http_client.get("/sources").await.unwrap()
    }

    pub async fn get_indicator_kinds(&self) -> Vec<String> {
        println!("getting indicator kinds ...");
        self.http_client.get("/indicatorKinds").await.unwrap()
    }

    pub async fn execute_request(
        &self,
        sources: &[String],
        data: &str,
        indicator_kind: &str,
    ) -> EventSource {
        println!("executing request ...");
        let mut query = vec![("data", data), ("kind", indicator_kind)];

        sources
            .iter()
            .for_each(|source| query.push(("source_ids", source)));

        let request = self
            .http_client
            .get_request_builder("/requests/execute/sse")
            .query(&query);

        EventSource::new(request).unwrap()
    }
}
