use async_trait::async_trait;
use futures_util::future::join_all;
use hickory_resolver::{
    config::{NameServerConfig, Protocol, ResolverConfig, ResolverOpts},
    error::ResolveErrorKind,
    lookup::Lookup,
    proto::rr::{RData, RecordType},
    TokioAsyncResolver,
};
use once_cell::sync::Lazy;
use postgres::schemas::indicators::IndicatorKind;
use regex::Regex;
use serde_json::json;
use std::{net::IpAddr, str::FromStr, time::Duration};
use tracing::{error, instrument};

use crate::{Error, FetchState, Indicator, Result, Source};

pub struct RawDns;

#[async_trait]
impl Source for RawDns {
    fn source_name(&self) -> &'static str {
        "DNS"
    }

    #[instrument(skip_all, err)]
    async fn fetch_data(
        &self,
        indicator: &Indicator,
        _state: &FetchState,
    ) -> Result<serde_json::Value> {
        let resolver =
            TokioAsyncResolver::tokio(RESOLVER_CONFIG.to_owned(), RESOLVER_OPTS.to_owned());

        match indicator.kind {
            IndicatorKind::Ipv4 | IndicatorKind::Ipv6 => {
                reverse_dns_lookup(&indicator.data, resolver).await
            }
            IndicatorKind::Domain => dns_lookup(&indicator.data, resolver).await,
            IndicatorKind::Url => {
                let domain = match DOMAIN_REGEX.captures(&indicator.data) {
                    Some(captures) => Ok(captures.get(1).ok_or(Error::NotFound)?.as_str()),
                    None => Err(Error::NotFound),
                }?;

                match IpAddr::from_str(domain) {
                    Ok(_) => reverse_dns_lookup(domain, resolver).await,
                    Err(_) => dns_lookup(domain, resolver).await,
                }
            }
            _ => unreachable!(),
        }
    }
}

async fn dns_lookup(value: &str, resolver: TokioAsyncResolver) -> Result<serde_json::Value> {
    let lookups = join_all(
        DNS_RECORD_TYPES
            .into_iter()
            .map(|record_type| resolver.lookup(value, record_type)),
    )
    .await
    .iter()
    .flatten()
    .map(stringify_lookup)
    .collect::<Vec<_>>();

    if lookups.is_empty() {
        return Err(Error::NotFound);
    }

    Ok(json!(lookups))
}

async fn reverse_dns_lookup(
    value: &str,
    resolver: TokioAsyncResolver,
) -> Result<serde_json::Value> {
    let lookup = resolver
        .reverse_lookup(value.parse().unwrap())
        .await
        .map_err(|err| {
            error!("Reverse lookup error: {err}");

            if matches!(err.kind(), &ResolveErrorKind::NoRecordsFound { .. }) {
                Error::NotFound
            } else if matches!(err.kind(), &ResolveErrorKind::Timeout { .. }) {
                Error::Timeout
            } else {
                Error::InternalError
            }
        })?;

    Ok(stringify_lookup(lookup.as_lookup()))
}

fn stringify_lookup(lookup: &Lookup) -> serde_json::Value {
    let query = lookup.query();
    let records = lookup
        .records()
        .iter()
        .map(|record| {
            let data = record.data();
            let mut record = serde_json::to_value(record).unwrap();
            if let Some(RData::TXT(data)) = data {
                let value = data
                    .txt_data()
                    .iter()
                    .map(|i| std::str::from_utf8(i))
                    .try_fold(String::new(), |a, i| {
                        i.map(|i| {
                            let mut a = a;
                            a.push_str(i);
                            a
                        })
                    });

                if let Ok(data) = value {
                    record["rdata"]["TXT"]["txt_data"] = data.into();
                }
            }
            record
        })
        .collect::<Vec<_>>();

    json!({
        "query": {
            "name": query.name(),
            "type": query.query_type(),
            "class": query.query_class()
        },
        "records": records,
        "valid_until": chrono::Utc::now() + chrono::Duration::from_std(lookup.valid_until().elapsed()).unwrap()
    })
}

const DNS_RECORD_TYPES: [RecordType; 35] = [
    RecordType::A,
    RecordType::AAAA,
    RecordType::ANAME,
    RecordType::AXFR,
    RecordType::CAA,
    RecordType::CDS,
    RecordType::CDNSKEY,
    RecordType::CNAME,
    RecordType::CSYNC,
    RecordType::DNSKEY,
    RecordType::DS,
    RecordType::HINFO,
    RecordType::HTTPS,
    RecordType::IXFR,
    RecordType::KEY,
    RecordType::MX,
    RecordType::NAPTR,
    RecordType::NS,
    RecordType::NSEC,
    RecordType::NSEC3,
    RecordType::NSEC3PARAM,
    RecordType::NULL,
    RecordType::OPENPGPKEY,
    RecordType::OPT,
    RecordType::PTR,
    RecordType::RRSIG,
    RecordType::SIG,
    RecordType::SOA,
    RecordType::SRV,
    RecordType::SSHFP,
    RecordType::SVCB,
    RecordType::TLSA,
    RecordType::TSIG,
    RecordType::TXT,
    RecordType::ZERO,
];

static DOMAIN_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^.*://(.*)!?(?::\d+)?/?$").unwrap());

static RESOLVER_CONFIG: Lazy<ResolverConfig> = Lazy::new(|| {
    let nameservers = [
        "1.1.1.1",
        "8.8.8.8",
        "9.9.9.9",
        "1.0.0.1",
        "8.8.4.4",
        "149.112.112.112",
    ];

    let mut resolver_config = ResolverConfig::new();
    for nameserver in nameservers {
        let addr = format!("{nameserver}:53").parse().unwrap();
        resolver_config.add_name_server(NameServerConfig::new(addr, Protocol::Udp));
        resolver_config.add_name_server(NameServerConfig::new(addr, Protocol::Tcp));
    }

    resolver_config
});

static RESOLVER_OPTS: Lazy<ResolverOpts> = Lazy::new(|| {
    let mut resolver_opts = ResolverOpts::default();

    resolver_opts.timeout = Duration::from_secs(1);
    resolver_opts.check_names = false;
    resolver_opts.num_concurrent_reqs = 1000;
    resolver_opts.use_hosts_file = false;
    resolver_opts.cache_size = 0;
    resolver_opts.rotate = true;
    resolver_opts.attempts = 2;

    resolver_opts
});
