# ==============================================================================
# Multi-Stage Production Dockerfile for MarketinGlu Broadcast Engine
# Target: High-Performance, Sub-Second Latency OBS Overlay & Web Server
# Base OS: Alpine Linux (Minimal Attack Surface & Lightweight Footprint)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Compilation Environment
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build prerequisites for native dependencies (if any)
RUN apk add --no-cache libc6-compat python3 make g++

# Copy dependency manifests first for maximum Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy application configuration files
COPY tsconfig.json vite.config.ts index.html server.ts ./
COPY public ./public
COPY src ./src

# Build client SPA (Vite + TailwindCSS) and server bundle (esbuild)
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    PORT=8000 \
    HOST=0.0.0.0

# Install curl for healthcheck probes
RUN apk add --no-cache curl tzdata

# Set Indian Standard Time (IST) default timezone
ENV TZ=Asia/Kolkata

# Copy package manifest
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Copy pre-compiled bundles and public assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Create isolated, non-root system user and group for security hardening
RUN addgroup -S -g 1001 broadcastgroup && \
    adduser -S -u 1001 -G broadcastgroup broadcastuser && \
    chown -R broadcastuser:broadcastgroup /app

# Switch to unprivileged user
USER broadcastuser

# Expose HTTP & WebSocket Port
EXPOSE 8000

# Docker Healthcheck: Query local Express health endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start MarketinGlu Broadcast Server
CMD ["node", "dist/server.js"]
