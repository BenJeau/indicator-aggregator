DELETE FROM "server_config" WHERE "key" = ANY(ARRAY['JAVASCRIPT_INTEGRATION_TEMPLATE', 'PYTHON_INTEGRATION_TEMPLATE', 'PROXY_ENABLED', 'PROXY_TYPE', 'PROXY_VALUE', 'SSE_KEEP_ALIVE', 'SSE_NUMBER_CONCURRENT_INTEGRATION_FETCHING']);
