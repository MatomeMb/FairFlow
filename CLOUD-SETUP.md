# Cloud Setup Configuration

## Overview
This document outlines the cloud infrastructure setup for the Things That Matter application, including API server (shadow-index) and frontend (auth-portal) configurations.

## Architecture

### API Server (shadow-index)
- **Port**: 3000
- **Health Check**: `GET /health`
- **Runtime**: Node.js
- **Framework**: Express/Next.js
- **Location**: `/workspace/packages/shadow-index`

### Frontend (auth-portal)
- **Port**: 5178
- **Type**: React/Web Application
- **Runtime**: Node.js
- **Location**: `/workspace/packages/auth-portal`

## Development Setup

### Terminal 1 - API Server
```bash
cd /workspace/packages/shadow-index
npm run dev
```

### Terminal 2 - Frontend
```bash
cd /workspace/packages/auth-portal
npm run dev
```

## Health Checks

### API Health
```bash
curl http://localhost:3000/health
```

### Frontend Availability
```bash
curl http://localhost:5178
```

## Environment Configuration
See `.env` file for required environment variables.

## Deployment Readiness
- [ ] API server starts without errors
- [ ] Frontend builds successfully
- [ ] Health checks pass
- [ ] CORS configured correctly
- [ ] API endpoints responsive
