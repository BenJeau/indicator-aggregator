use opentelemetry::{global, trace::TraceContextExt, Value};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{propagation::TraceContextPropagator, Resource};
use tracing_opentelemetry::OpenTelemetrySpanExt;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub struct Telemetry {
    service_name: String,
    endpoint: String,
    env_filter: String,
}

impl Telemetry {
    pub fn new(service_name: String, endpoint: String, env_filter: String) -> Self {
        Self {
            service_name,
            endpoint,
            env_filter,
        }
    }

    pub fn setup(self) -> anyhow::Result<()> {
        global::set_text_map_propagator(TraceContextPropagator::new());

        let exporter = opentelemetry_otlp::new_exporter()
            .tonic()
            .with_endpoint(&self.endpoint);

        let config = opentelemetry_sdk::trace::config().with_resource(Resource::new(vec![
            opentelemetry::KeyValue::new("service.name", Value::from(self.service_name)),
        ]));

        let tracer = opentelemetry_otlp::new_pipeline()
            .tracing()
            .with_exporter(exporter)
            .with_trace_config(config)
            .install_batch(opentelemetry_sdk::runtime::Tokio)?;

        let opentelemetry_layer = tracing_opentelemetry::layer().with_tracer(tracer);
        let env_filter_layer = EnvFilter::try_from_default_env().unwrap_or(self.env_filter.into());
        let default_layer = tracing_subscriber::fmt::layer();

        tracing_subscriber::registry()
            .with(env_filter_layer)
            .with(default_layer)
            .with(opentelemetry_layer)
            .try_init()?;

        Ok(())
    }

    pub fn get_trace_id() -> String {
        let current_span = tracing::Span::current();
        let span_context = current_span.context();
        let trace_id = span_context.span().span_context().trace_id().to_string();
        trace_id
    }
}
