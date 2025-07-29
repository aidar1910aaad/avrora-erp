FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./
COPY frontend/src ./src
COPY frontend/index.html ./

RUN npm run build

FROM caddy:2-alpine AS production

COPY --from=build /app/dist /usr/share/caddy

COPY /frontend/Caddyfile /etc/caddy/Caddyfile

RUN addgroup -g 1001 -S caddy && \
    adduser -S caddy -u 1001

RUN chown -R caddy:caddy /usr/share/caddy && \
    chown -R caddy:caddy /etc/caddy

USER caddy