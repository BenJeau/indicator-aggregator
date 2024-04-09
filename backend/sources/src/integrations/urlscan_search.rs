use async_trait::async_trait;
use database::schemas::indicators::IndicatorKind;
use reqwest::header::HeaderMap;
use tracing::instrument;

use crate::{handle_response, FetchState, Indicator, Result, Source};

pub struct UrlscanSearch;

#[async_trait]
impl Source for UrlscanSearch {
    fn source_name(&self) -> &'static str {
        "URLScan.io - Search"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let mut headers = HeaderMap::new();

        if let Some(key) = state.secrets.get("URLSCAN_IO_KEY") {
            headers.insert("API-Key", key.parse().unwrap());
        }

        // Need to replace anything in: + - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ / with a backslah prefix
        let escaped_value = indicator
            .data
            .replace('\\', "\\\\")
            .replace('+', "\\+")
            .replace('-', "\\-")
            .replace('=', "\\=")
            .replace('&', "\\&")
            .replace('|', "\\|")
            .replace('>', "\\>")
            .replace('<', "\\<")
            .replace('!', "\\!")
            .replace('(', "\\(")
            .replace(')', "\\)")
            .replace('{', "\\{")
            .replace('}', "\\}")
            .replace('[', "\\[")
            .replace(']', "\\]")
            .replace('^', "\\^")
            .replace('\"', "\\\"")
            .replace('~', "\\~")
            .replace('*', "\\*")
            .replace('?', "\\?")
            .replace(':', "\\:")
            .replace('/', "\\/");

        let url = match indicator.kind {
            IndicatorKind::Url => format!(
            "https://urlscan.io/api/v1/search/?q=task.url:{escaped_value} OR page.url:{escaped_value}",
        ),
            IndicatorKind::Domain => format!(
            "https://urlscan.io/api/v1/search/?q=domain:{escaped_value}",
            ),
            _ => unreachable!()
        };

        reqwest::Client::new()
            .get(url)
            .headers(headers)
            .send()
            .await
            .map(handle_response)?
            .await
    }
}
