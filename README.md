# Indicator Aggregator

A centralized platform aggregating various data sources with multiple nice add-on features. The backend is written in Rust and the frontend is in TypeScript using React.

![Screenshot of the sources page of the frontend](./frontend/screenshot.png)

## Why centralized?

Centralizing external requests and responses allows for:
  * a normalized request handling (rate limiting, caching, proxying, …)
  * a common response format (error, success, timeouts,…)
  * a centralized caching mechanism
  * a global ignore list
  * built-in limit and quota management
  * secret management
  * background tasks
  * metrics/logs
  * authentication

By having all of these already built, creating a source is as simple as configuring it and writing the code needed to correlate the data. I've seen in my field many different ways this was handled, many of which were overly complicated due to:
* having duplicated code
* having multiple disconnected microservices (while it may seem like a good idea, it's not)
* having no centralization on any of the above

## Getting started

You'll need to have Rust and Node.js installed locally, alongside PNPM. To run the frontend, you need to run:

```sh
cd frontend && pnpm i && pnpm dev
```

To run the backend, you'll need to have a PostgreSQL instance and run the following:

```sh
cd backend && cargo run
```

Or if you have Docker installed locally, simply run the whole stack (PostgreSQL, Redis, Jaeger UI, Rust REST API, React Web UI) with the following:

```sh
docker compose up
```