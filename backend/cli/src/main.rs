use colored::Colorize;
use eventsource_stream::Event as MessageEvent;
use futures_util::stream::StreamExt;
use reqwest_eventsource::Event;
use schemas::StartData;
use std::collections::HashMap;
use tokio::join;

use crate::schemas::{Data, ErrorData, EventKind};

mod cli;
mod client;
mod config;
mod persistence;
mod schemas;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    cli::print_banner();

    let config = config::Config::from_env();
    let client = client::IndicatorAggregatorClient::new(config);

    let (sources, indicator_kinds) = join!(client.get_sources(), client.get_indicator_kinds());

    let source_id_to_slug = sources.iter().fold(HashMap::new(), |mut acc, s| {
        acc.insert(s.id.clone(), s.slug.clone());
        acc
    });
    let source_slug_to_id = sources.iter().fold(HashMap::new(), |mut acc, s| {
        acc.insert(s.slug.clone(), s.id.clone());
        acc
    });
    let source_slugs = source_slug_to_id.keys().cloned().collect::<Vec<_>>();

    let request_data = cli::RequestData::request_from_cli(&indicator_kinds, &source_slugs)?;

    let source_ids: Vec<_> = request_data
        .sources
        .into_iter()
        .flat_map(|slug| source_slug_to_id.get(slug.as_str()))
        .cloned()
        .collect();

    let mut stream = client
        .execute_request(&source_ids, &request_data.data, &request_data.kind)
        .await;

    let writer = if request_data.save_to_files {
        Some(persistence::SourceFileWriter::new())
    } else {
        None
    };

    while let Some(event) = stream.next().await {
        match event {
            Ok(Event::Message(message)) => {
                handle_message(message, &source_ids, &source_id_to_slug, &writer)
            }
            Err(_) => stream.close(),
            _ => (),
        }
    }

    Ok(())
}

fn handle_message(
    message: MessageEvent,
    source_ids: &[String],
    source_id_to_slug: &HashMap<String, String>,
    writer: &Option<persistence::SourceFileWriter>,
) {
    let event = EventKind::from_str(&message.event);
    let should_print_event = source_ids.contains(&message.id);
    let title = source_id_to_slug
        .get(&message.id)
        .map(|slug| format!(" {} - {slug} ", event.as_str()))
        .unwrap_or_default();

    if let Some(writer) = writer {
        if let Some(slug) = source_id_to_slug.get(&message.id) {
            writer.write_source(slug, &message.data);
        }
    }

    match event {
        EventKind::Data if should_print_event => {
            let data = &serde_json::from_str::<Data>(&message.data).unwrap();
            let elapsed = (data.timing.ended_at - data.timing.started_at).num_milliseconds();

            println!("{} took {elapsed}ms", title.on_bright_green().green());
            println!("{:#}", data.data);
            println!();
        }
        EventKind::Error if should_print_event => {
            let data = &serde_json::from_str::<Vec<ErrorData>>(&message.data).unwrap();

            println!("{}", title.on_bright_red().red());
            data.iter().for_each(|e| println!("- {}", e.kind));
            println!();
        }
        EventKind::Start => {
            println!("request ID {}", message.id.bold());
            println!();

            let data = &serde_json::from_str::<Vec<StartData>>(&message.data).unwrap();
            let (has_source_code, no_source_code): (Vec<_>, Vec<_>) = data
                .iter()
                .filter(|s| source_ids.contains(&s.source.id))
                .partition(|d| d.has_source_code);

            println!("{}", " has source code ".green().on_bright_green());
            print_sources(has_source_code);

            println!();

            println!("{}", " doesn't have source code ".red().on_bright_red());
            print_sources(no_source_code);

            if source_ids.is_empty() {
                std::process::exit(0);
            }

            println!();
        }
        _ => (),
    }
}

fn print_sources(sources: Vec<&StartData>) {
    sources
        .iter()
        .for_each(|s| println!("- {} ", s.source.slug));

    if sources.is_empty() {
        println!("{}", "no source".italic().dimmed());
    }
}
