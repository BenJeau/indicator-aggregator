use axum::{
    extract::{DefaultBodyLimit, Request},
    middleware::{self, Next},
    response::Response,
    Router,
};
use http::{header, HeaderName, HeaderValue, Method};
use opentelemetry::global;
use std::{str::FromStr, time::Duration};
use tower_http::{
    compression::{
        predicate::{NotForContentType, SizeAbove},
        CompressionLayer, CompressionLevel, Predicate,
    },
    cors::{AllowOrigin, Any, CorsLayer},
    timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing::Span;
use tracing_opentelemetry::OpenTelemetrySpanExt;

pub struct AxumLayerBuilder {
    allowed_methods: Vec<Method>,
    allowed_origins: AllowOrigin,
    allowed_headers: Vec<HeaderName>,
    compression_level: CompressionLevel,
    compression_size: u16,
    timeout: u64,
    max_size: usize,
    tracing: bool,
    enable_sentry_layer: bool,
}

impl Default for AxumLayerBuilder {
    fn default() -> Self {
        Self {
            allowed_methods: vec![
                Method::GET,
                Method::POST,
                Method::PATCH,
                Method::DELETE,
                Method::PUT,
            ],
            allowed_origins: Any.into(),
            allowed_headers: vec![header::AUTHORIZATION, header::CONTENT_TYPE],
            compression_level: CompressionLevel::Fastest,
            compression_size: 1024,
            timeout: 30,
            max_size: 1024 * 1024 * 250,
            tracing: true,
            enable_sentry_layer: true,
        }
    }
}

impl AxumLayerBuilder {
    pub fn allowed_methods(mut self, methods: Vec<Method>) -> Self {
        self.allowed_methods = methods;
        self
    }

    pub fn allowed_origins<T: Into<AllowOrigin>>(mut self, origin: T) -> Self {
        self.allowed_origins = origin.into();
        self
    }

    pub fn allowed_headers(mut self, headers: Vec<HeaderName>) -> Self {
        self.allowed_headers = headers;
        self
    }

    pub fn compression_level(mut self, level: CompressionLevel) -> Self {
        self.compression_level = level;
        self
    }

    pub fn compression_size(mut self, size: u16) -> Self {
        self.compression_size = size;
        self
    }

    pub fn timeout(mut self, timeout: u64) -> Self {
        self.timeout = timeout;
        self
    }

    pub fn max_size(mut self, size: usize) -> Self {
        self.max_size = size;
        self
    }

    pub fn disable_tracing(mut self) -> Self {
        self.tracing = false;
        self
    }

    pub fn enable_tracing(mut self) -> Self {
        self.tracing = true;
        self
    }

    pub fn disable_sentry_layer(mut self) -> Self {
        self.enable_sentry_layer = false;
        self
    }

    pub fn enable_sentry_layer(mut self) -> Self {
        self.enable_sentry_layer = true;
        self
    }

    pub fn build(self, router: Router) -> Router {
        let cors_layer = CorsLayer::new()
            .allow_methods(self.allowed_methods)
            .allow_origin(self.allowed_origins)
            .allow_headers(self.allowed_headers);

        let compression_layer = CompressionLayer::new()
            .quality(self.compression_level)
            .compress_when(
                SizeAbove::new(self.compression_size)
                    .and(NotForContentType::new("text/event-stream")),
            );

        let timeout_layer = TimeoutLayer::new(Duration::from_secs(self.timeout));

        let tracing_layer = if self.tracing {
            Some(
                TraceLayer::new_for_http().make_span_with(|request: &Request<_>| {
                    tracing::info_span!(
                        "request",
                        user_id = tracing::field::Empty,
                        method = %request.method(),
                        uri = %request.uri(),
                        version = ?request.version(),
                    )
                }),
            )
        } else {
            None
        };

        let size_limit_layer = DefaultBodyLimit::max(self.max_size);

        let mut router = router
            .layer(size_limit_layer)
            .layer(timeout_layer)
            .layer(compression_layer)
            .layer(cors_layer)
            .route_layer(middleware::from_fn(middleware));

        if let Some(tracing_layer) = tracing_layer {
            router = router.layer(tracing_layer);
        }

        if self.enable_sentry_layer {
            router = router
                .layer(sentry_tower::NewSentryLayer::<Request>::new_from_top())
                .layer(sentry_tower::SentryHttpLayer::with_transaction());
        }

        router
    }
}

async fn middleware(req: Request, next: Next) -> Response {
    let mut res = next.run(req).await;

    let span = Span::current();
    let mut fields = global::get_text_map_propagator(|propagator| {
        let mut fields = std::collections::HashMap::new();
        propagator.inject_context(&span.context(), &mut fields);
        fields
    });

    let headers = res.headers_mut();
    for (key, value) in fields.drain() {
        if value.is_empty() {
            continue;
        }
        headers.insert(
            HeaderName::from_str(&key).unwrap(),
            HeaderValue::from_str(&value).unwrap(),
        );
    }

    res
}
