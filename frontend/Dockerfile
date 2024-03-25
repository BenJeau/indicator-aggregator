FROM node:20.11.1-alpine3.19 as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS builder
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:1.25.4-alpine3.18
COPY --from=builder /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80

# Copy shell script to container and make is executable
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/nginx/env.sh .
RUN chmod +x env.sh
RUN apk add bash

# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]