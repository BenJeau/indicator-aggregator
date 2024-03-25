INSERT INTO "server_config"
  (key, friendly_name, description, default_value, kind, category)
VALUES
  ('JAVASCRIPT_SOURCE_TEMPLATE', 'JavaScript Source Template', 'The code template for JavaScript sources', 'async function fetchData(indicator, state) {\n    // perform your source data correlation here \n}\n\nasync function backgroundTask(state) {\n    // perform your background task here \n}', 'code', 'Code of sources'),
  ('PYTHON_SOURCE_TEMPLATE', 'Python Source Template', 'The code template for Python sources', 'def fetch_data(indicator, state):\n    # perform your source data correlation here \n\n\ndef background_task(state):\n    # perform your background task here \n', 'code', 'Code of sources'),
  ('PROXY_ENABLED', 'Proxy Enabled', 'Whether to use a proxy for requests', 'false', 'boolean', 'Proxy'),
  ('PROXY_TYPE', 'Proxy Type', 'The type of proxy to use', 'http', 'string', 'Proxy'),
  ('PROXY_VALUE', 'Proxy Value', 'The value of the proxy to use', 'http://localhost:8080', 'string', 'Proxy'),
  ('SSE_KEEP_ALIVE', 'SSE Keep Alive', 'The keep alive interval in seconds for the SSE connection', '60', 'number', 'Server-Sent Events'),
  ('SSE_NUMBER_CONCURRENT_SOURCE_FETCHING', 'SSE Source Request Concurrency', 'The number of concurrent sources to fetch from', '10', 'number', 'Server-Sent Events'),
  ('JAVASCRIPT_RUNNER_GRPC_ADDRESS', 'JavaScript Runner gRPC Address', 'The address of the JavaScript Runner gRPC server', 'localhost:50052', 'string', 'Runners'),
  ('JAVASCRIPT_RUNNER_ENABLED', 'JavaScript Runner Enabled', 'Whether to enable the JavaScript Runner', 'true', 'boolean', 'Runners'),
  ('PYTHON_RUNNER_GRPC_ADDRESS', 'Python Runner gRPC Address', 'The address of the Python Runner gRPC server', 'localhost:50051', 'string', 'Runners'),
  ('PYTHON_RUNNER_ENABLED', 'Python Runner Enabled', 'Whether to enable the Python Runner', 'true', 'boolean', 'Runners'),;