use opentelemetry::{global, trace::TraceContextExt, Value};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{propagation::TraceContextPropagator, Resource};
use tracing_opentelemetry::OpenTelemetrySpanExt;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub struct Telemetry {
    service_name: String,
    endpoint: String,
    env_filter: String,
    sentry_dsn: Option<String>,
}

impl Telemetry {
    pub fn new(service_name: String, env_filter: String) -> Self {
        let endpoint =
            std::env::var("OTEL_ENDPOINT").unwrap_or_else(|_| "http://localhost:4317".to_string());
        let sentry_dsn = std::env::var("SENTRY_DSN").ok();

        Self {
            service_name,
            endpoint,
            env_filter,
            sentry_dsn,
        }
    }

    pub fn setup(self) -> anyhow::Result<()> {
        global::set_text_map_propagator(TraceContextPropagator::new());

        let _guard = sentry::init(self.sentry_dsn);

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
            EnvFilter::try_from_default_env().unwrap_or(self.env_filter.clone().into());
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
