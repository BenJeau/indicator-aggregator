use async_trait::async_trait;
use serde_json::json;
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    net::TcpStream,
};
use tracing::instrument;

use crate::{Error, FetchState, Indicator, Result, Source};

pub struct AsnCymru;

#[async_trait]
impl Source for AsnCymru {
    fn source_name(&self) -> &'static str {
        "ASN Cymru"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        _state: &FetchState,
    ) -> Result<serde_json::Value> {
        get_whois_data(&indicator.data)
            .await?
            .ok_or(Error::NotFound)
    }
}

pub async fn get_whois_data(value: &str) -> tokio::io::Result<Option<serde_json::Value>> {
    let stream = TcpStream::connect("whois.cymru.com:43").await?;

    stream.writable().await?;
    stream.try_write(format!("verbose\n{value}\n").as_bytes())?;
    stream.readable().await?;

    let mut reader = BufReader::new(stream);
    reader.read_line(&mut String::new()).await?;

    let mut data = String::new();
    if reader.read_line(&mut data).await? == 0 {
        return Ok(None);
    }

    let parts = data.split('|').map(|s| s.trim()).collect::<Vec<_>>();

    if parts.len() != 7 {
        return Ok(None);
    }

    Ok(Some(json! ({
        "ip": parts[1].to_string(),
        "asn": parts[0].to_string(),
        "bgp_prefix": parts[2].to_string(),
        "asn_country": parts[3].to_string(),
        "asn_registry": parts[4].to_string(),
        "asn_name": parts[6].to_string(),
        "allocated": parts[5].to_string(),
    })))
}
