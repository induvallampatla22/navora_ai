# NAVORA Production Deployment Guide

This document covers deployment procedures for NAVORA on Linux servers (Ubuntu/Debian) using Docker and Docker Compose with Nginx reverse proxy.

---

## 🐳 Docker Deployment Setup

### 1. Environment Files Setup

Copy example environment configuration templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Ensure production values are set in `backend/.env`:
- `SECRET_KEY`: High-entropy random string (e.g. generated via `openssl rand -hex 32`).
- `GEMINI_API_KEY`: Production Google Gemini API key.
- `DATABASE_URL`: PostgreSQL connection string (e.g. `postgresql://navora_user:password@db:5432/navora_db`).
- `CORS_ORIGINS`: Production domain origins (e.g. `https://navora.ai`).

---

## 📦 Containerization Overview

NAVORA consists of three container services defined in `docker-compose.yml`:

1. **`backend`**: FastAPI application running on Gunicorn / Uvicorn worker nodes.
2. **`frontend`**: Next.js Node.js server optimized build.
3. **`nginx`**: Reverse proxy handling TLS/SSL termination, static caching, and path routing (`/api` -> backend, `/` -> frontend).

---

## 🛠️ Commands for Deployment

Build and spin up the production stack:

```bash
docker-compose up --build -d
```

Verify service status:

```bash
docker-compose ps
```

View application logs:

```bash
docker-compose logs -f --tail=100
```

Stop services safely:

```bash
docker-compose down
```
