use tracing::error;

use super::Source;

mod abuse_ip_db;
mod asn_cymru;
mod certificate_transparency;
mod dns;
mod internet_db;
mod malware_bazaar;
mod megatron;
mod phish_tank;
mod shodan;
mod threat_fox;
mod url_haus;
mod urlscan_search;
mod urlscan_submit;
mod virus_total;

pub fn source(name: &str) -> Option<Box<dyn Source>> {
    if name == abuse_ip_db::AbuseIpDb.source_name() {
        Some(Box::new(abuse_ip_db::AbuseIpDb))
    } else if name == asn_cymru::AsnCymru.source_name() {
        Some(Box::new(asn_cymru::AsnCymru))
    } else if name == certificate_transparency::CertificateTransparency.source_name() {
        Some(Box::new(certificate_transparency::CertificateTransparency))
    } else if name == dns::RawDns.source_name() {
        Some(Box::new(dns::RawDns))
    } else if name == internet_db::InternetDb.source_name() {
        Some(Box::new(internet_db::InternetDb))
    } else if name == malware_bazaar::MalwareBazaar.source_name() {
        Some(Box::new(malware_bazaar::MalwareBazaar))
    } else if name == megatron::Megatron.source_name() {
        Some(Box::new(megatron::Megatron))
    } else if name == phish_tank::PhishTank.source_name() {
        Some(Box::new(phish_tank::PhishTank))
    } else if name == shodan::Shodan.source_name() {
        Some(Box::new(shodan::Shodan))
    } else if name == threat_fox::ThreatFox.source_name() {
        Some(Box::new(threat_fox::ThreatFox))
    } else if name == url_haus::UrlHaus.source_name() {
        Some(Box::new(url_haus::UrlHaus))
    } else if name == urlscan_search::UrlscanSearch.source_name() {
        Some(Box::new(urlscan_search::UrlscanSearch))
    } else if name == urlscan_submit::UrlscanSubmit.source_name() {
        Some(Box::new(urlscan_submit::UrlscanSubmit))
    } else if name == virus_total::VirusTotal.source_name() {
        Some(Box::new(virus_total::VirusTotal))
    } else {
        error!(name, "unknown source");
        None
    }
}
