FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

FROM nginx:alpine AS production

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
