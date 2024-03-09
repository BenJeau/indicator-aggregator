# Frontend

A React frontend in TypeScript using [Vite.js](https://vitejs.dev/) to build the application using pnpm for dependency management.

## Getting started

You'll need to have Rust and Node.js installed locally, alongside pnpm. To run the frontend, you need to run:

```sh
pnpm i && pnpm dev
```

## Main packages

As with any frontend in JavaScript, this project depends on multiple dependencies but tries to be minimal and not add _any_ package.

### User interface

To style components, [Tailwind CSS](https://tailwindcss.com/) is used and [shadcn/ui](https://ui.shadcn.com/) is used as based components. For icons, [lucide](https://lucide.dev/) is used for generic icons and [Simple Icons](https://simpleicons.org/) is used for brand icons.

As for illustrations within the application (to represent empty states, loading states, welcome pages, ...) [manypixels](https://www.manypixels.co/gallery) SVG illustrations with the `Two Color` variants.

### REST API

For communication with the backend, the browser's built-in `fetch` and `EventSource` is used alongside [@tanstack/query](https://tanstack.com/query/) for easier async state management.

### Routing

To navigate within the application, [@tanstack/router](https://tanstack.com/router/) is used due to it:
- being typesafe
- being file based
- having nice integrations with `@tanstack/query`
