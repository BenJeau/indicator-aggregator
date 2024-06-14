#!/bin/bash

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment
echo "window._env_ = {" >>./env-config.js

# Iterate over environment keys
env_keys=(VITE_REST_SERVER_BASE_URL VITE_OPENTEL_URL VITE_ADMIN_EMAIL VITE_SENTRY_DSN)
for key in "${env_keys[@]}"; do
  value="$(printenv $key)"
  # Append configuration property to JS file
  echo "  $key: \"$value\"," >>./env-config.js
done

echo "}" >>./env-config.js
