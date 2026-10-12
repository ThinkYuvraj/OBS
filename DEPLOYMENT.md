# MarketinGlu OBS Broadcast Suite — Production Deployment Guide

[![Engine](https://img.shields.io/badge/Engine-MarketinGlu%20Sub--Second-06b6d4)](https://marketinglu.com)
[![Standard](https://img.shields.io/badge/Quality-ISO%209001:2015-emerald)](https://marketinglu.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](Dockerfile)
[![Node](https://img.shields.io/badge/Node.js-22%20LTS-green)](https://nodejs.org)

This guide outlines the production deployment workflow for the **MarketinGlu Sub-Second OBS Broadcast Overlay Suite**, covering Docker containerization, PM2 process management on Linux VPS / Hostinger, Nginx reverse proxy configuration with WebSocket upgrades, and OBS Studio browser source optimization.

---

## 1. Production Architecture Overview

The system operates across a **3-Tier Broadcast Architecture**:

1. **Presentation & Scorer Tier (Edge)**:
   - High-density web consoles for Cricket and 10 Multi-Sport disciplines (Football, Basketball, Pro Kabaddi, Tennis, Badminton, Table Tennis, Volleyball, Field Hockey, Baseball, Rugby).
   - Mandatory user policy agreement gate (`v2.4.0`) verifying commercial terms, acceptable streaming use, and SLA.
   - Sub-second UI updates rendered with GPU-accelerated Tailwind CSS and Space Grotesk typography.

2. **Application & Real-Time Engine Tier (Core)**:
   - Express server bundled with `esbuild` into a self-contained Node.js ESM executable (`dist/server.js`).
   - `ws` WebSocket broadcast hub dispatching instant scoreboard state, stingers, alerts, and timer ticks.
   - Comprehensive multi-sport rule engines with automated strike rotation, 24s shot clocks, and Kabaddi tackle matrices.

3. **Data Persistence & Cold Storage Tier**:
   - Primary: High-speed In-Memory hot store for zero-latency lookups.
   - Cold: Hostinger MySQL database integration for persistent records and phpMyAdmin DDL export.

---

## 2. Option A: Docker Deployment (Recommended)

### Prerequisites
- Docker Engine 24+ & Docker Compose v2+

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/ThinkYuvraj/OBS.git
cd OBS

# 2. Configure environment
cp .env.example .env
# Edit .env with your Razorpay or Hostinger credentials

# 3. Build & start container
docker compose up -d --build

# 4. View logs
docker compose logs -f broadcast-suite
```

The application is now live at:
- **Dashboard & Consoles**: `http://localhost:3000`
- **Healthcheck & Metrics**: `http://localhost:3000/health`
- **WebSocket Streaming**: `ws://localhost:3000/ws`

---

## 3. Option B: PM2 on Hostinger VPS or Linux Ubuntu/Debian

### Prerequisites
- Node.js 20+ or 22+ LTS
- PM2: `npm install -g pm2`

### Build & Run
```bash
# 1. Install dependencies
npm ci

# 2. Build frontend and bundle server executable
npm run build

# 3. Launch with PM2 process manager
pm2 start ecosystem.config.cjs --env production

# 4. Save PM2 startup script for auto-restart on server reboot
pm2 save
pm2 startup
```

---

## 4. Production Nginx Reverse Proxy & SSL Configuration

When deploying behind Nginx (with Let's Encrypt SSL), use the following configuration to handle **WebSocket upgrade headers** and allow **OBS Studio iframe embedding**:

```nginx
server {
    listen 80;
    server_name broadcast.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name broadcast.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/broadcast.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/broadcast.yourdomain.com/privkey.pem;

    # Allow OBS Studio and broadcast switchers to embed overlays without X-Frame-Options blocks
    add_header Content-Security-Policy "frame-ancestors * 'self';" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip Compression for fast overlay asset loads
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket Upgrade headers (Critical for sub-second live score stream)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeouts for persistent broadcast streams
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

---

## 5. OBS Studio Browser Source Best Practices

To achieve broadcast-quality output in OBS Studio, vMix, or Wirecast:

1. **Add Browser Source**:
   - **URL**: `https://broadcast.yourdomain.com/overlay/{activeOverlayToken}`
   - **Width**: `1920`
   - **Height**: `1080`
   - **FPS**: `60`
2. **Settings Checklist**:
   - [x] Check **Shutdown source when not visible** (saves GPU when transitioning scenes)
   - [x] Check **Refresh browser when scene becomes active**
   - [x] Set OBS Settings &rarr; Advanced &rarr; **Enable Browser Source Hardware Acceleration** (ensures smooth CSS micro-animations)
3. **Movable Scoreboard Positioning**:
   - Append `?pos=top-left`, `?pos=top-right`, `?pos=bottom-center`, or `?movable=1` to position or drag the scoreboard anywhere on the broadcast canvas.

---

## 6. Health & Monitoring Endpoints

- `GET /health` or `GET /api/health`: JSON diagnostics including uptime, RSS/heap memory, active WebSocket stream clients, and database connectivity.
- `GET /api/architecture/telemetry`: 3-Tier telemetry across presentation, rule engines, and output switchers.
