use opentelemetry::{global, trace::TraceContextExt, Value};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{propagation::TraceContextPropagator, Resource};
use sentry::ClientInitGuard;
use tracing_opentelemetry::OpenTelemetrySpanExt;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub struct Telemetry {
    service_name: String,
    endpoint: String,
    env_filter: String,
}

impl Telemetry {
    pub fn new(service_name: impl Into<String>, env_filter: impl Into<String>) -> Self {
        global::set_text_map_propagator(TraceContextPropagator::new());

        let endpoint =
            std::env::var("OTEL_ENDPOINT").unwrap_or_else(|_| "http://localhost:4317".to_string());

        Self {
            service_name: service_name.into(),
            endpoint,
            env_filter: env_filter.into(),
        }
    }

    pub fn setup_sentry() -> ClientInitGuard {
        tracing::info!("Setting up Sentry");

        sentry::init(Option::<String>::None)
    }

    pub fn setup_tracing(self) -> anyhow::Result<()> {
        let exporter = opentelemetry_otlp::new_exporter()
            .tonic()
            .with_endpoint(&self.endpoint);

        let config = opentelemetry_sdk::trace::config().with_resource(Resource::new(vec![
            opentelemetry::KeyValue::new("service.name", Value::from(self.service_name.clone())),
        ]));

        let tracer = opentelemetry_otlp::new_pipeline()
            .tracing()
            .with_exporter(exporter)
            .with_trace_config(config)
            .install_batch(opentelemetry_sdk::runtime::Tokio)?;

        let opentelemetry_layer = tracing_opentelemetry::layer().with_tracer(tracer);
        let env_filter_layer =
            EnvFilter::try_from_default_env().unwrap_or_else(|_| self.env_filter.clone().into());
        let default_layer = tracing_subscriber::fmt::layer();
        let sentry_layer = sentry_tracing::layer();

        tracing_subscriber::registry()
            .with(env_filter_layer)
            .with(default_layer)
            .with(opentelemetry_layer)
            .with(sentry_layer)
            .try_init()?;

        tracing::info!(
            service_name = self.service_name,
            endpoint = self.endpoint,
            env_filter = self.env_filter,
            "Telemetry setup complete"
        );

        Ok(())
    }

    pub fn get_trace_id() -> String {
        let current_span = tracing::Span::current();
        let span_context = current_span.context();
        let trace_id = span_context.span().span_context().trace_id().to_string();
        trace_id
    }
}
