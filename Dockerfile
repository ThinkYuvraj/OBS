# ==============================================================================
# Multi-Stage Production Dockerfile for MarketinGlu OBS Broadcast Suite
# ==============================================================================

# Stage 1: Build & Compilation Environment
FROM node:22-alpine AS builder

WORKDIR /app

# Install system utilities needed for building native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Cache layer: Copy package manifests
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy full application source code
COPY . .

# Run production build (compiles client assets to dist/ and bundles server.ts to dist/server.js)
RUN npm run build

# Prune development dependencies to keep final image lean
RUN npm prune --omit=dev

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Establish non-root user and group for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 broadcast

# Install curl for production Docker health checks
RUN apk add --no-cache curl

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy node_modules, compiled dist directory, and necessary configs
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Set file ownership to non-root broadcast user
RUN chown -R broadcast:nodejs /app

USER broadcast

# Expose HTTP & WebSocket port
EXPOSE 3000

# Docker Healthcheck targeting the high-availability /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start production server bundle with native Node.js
CMD ["node", "dist/server.js"]
