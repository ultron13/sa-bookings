FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "dist/server.js"]
