use async_trait::async_trait;
use database::{
    logic::phish_tank::{
        get_phish_tank_by_domain, get_phish_tank_by_url, insert_entries, insert_phish_tank_refresh,
    },
    schemas::{
        indicators::{Indicator, IndicatorKind},
        phish_tank::Entry,
    },
};
use flate2::read::GzDecoder;
use futures_util::future::join_all;
use std::io::Read;
use tracing::{info, instrument};

use crate::{FetchState, Result, Source};

pub struct PhishTank;

#[async_trait]
impl Source for PhishTank {
    fn source_name(&self) -> &'static str {
        "PhishTank"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value> {
        let data = if indicator.kind == IndicatorKind::Url {
            get_phish_tank_by_url(&indicator.data, &state.pool).await?
        } else {
            get_phish_tank_by_domain(&indicator.data, &state.pool).await?
        };

        Ok(serde_json::json!(data))
    }

    #[instrument(skip_all, err)]
    async fn background_task(&self, state: &FetchState) -> Result<()> {
        info!("fetching data");

        // TODO: do a HEAD request and check if the file has changed

        let client = reqwest::Client::new();
        let response = client
            .get("http://data.phishtank.com/data/online-valid.json.gz")
            .header(reqwest::header::USER_AGENT, "phishtank/username")
            .send()
            .await?;

        let headers: String = response
            .headers()
            .into_iter()
            .map(|(k, v)| format!("{}: {}", k, v.to_str().unwrap()))
            .collect::<Vec<String>>()
            .join("\n");

        let bytes = response.bytes().await?;

        let mut buffer = String::new();

        let mut decoder = GzDecoder::new(&*bytes);

        decoder.read_to_string(&mut buffer)?;

        let data: Vec<Entry> = serde_json::from_str(&buffer).unwrap();

        join_all(
            data.chunks(9_000)
                .map(|chunk| insert_entries(chunk, &state.pool)),
        )
        .await;

        insert_phish_tank_refresh(&headers, &state.pool).await?;

        Ok(())
    }
}
