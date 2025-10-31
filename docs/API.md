# API Documentation

## Base URL

**Development**: `http://localhost:3001`  
**Production**: `https://your-domain.com` (configure after deployment)

## Authentication

**Current**: No authentication (prototype only)  
**Production**: Will require API key in header: `X-API-Key: your_api_key`

---

## Health Check

### GET /api/health

Check if all services are operational.

**Response**:
```json
{
  "backend": "ok",
  "ai": "ok",
  "simulator": "ok",
  "hedera": "ok",
  "timestamp": "2025-10-31T14:23:17Z"
}