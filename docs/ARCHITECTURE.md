# SolarSentinel Architecture

## System Overview

SolarSentinel is a proof-of-concept DePIN (Decentralized Physical Infrastructure Network) demonstrating how AI + blockchain could make predictive solar monitoring affordable for underserved communities.

## Component Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  - Dashboard UI                                                 │
│  - Real-time data visualization                                │
│  - Chart.js for metrics                                        │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────────────────────────────┐
│                      BACKEND API (Node.js)                      │
│  - Request orchestration                                        │
│  - Hedera SDK integration                                      │
│  - Error handling & logging                                    │
└──────┬─────────────┬─────────────┬──────────────────────────────┘
       │             │             │
       │ HTTP        │ HTTP        │ Hedera SDK
       │             │             │
┌──────▼──────┐ ┌───▼────────┐ ┌──▼──────────────────────────────┐
│  SIMULATOR  │ │ AI SERVER  │ │    HEDERA TESTNET               │
│  (Node.js)  │ │  (Python)  │ │  - HCS: Consensus Service       │
│             │ │            │ │  - HTS: Token Service           │
│  Generates  │ │  Isolation │ │  - Mirror Node API              │
│  synthetic  │ │  Forest ML │ │                                 │
│  sensor     │ │  anomaly   │ │  Cost: $0.0001/tx (testnet free)│
│  readings   │ │  detection │ │  Finality: 3-5 seconds          │
└─────────────┘ └────────────┘ └─────────────────────────────────┘
```

## Data Flow

### 1. Sensor Reading Generation
```
Simulator → Backend → Frontend
```
- Simulator generates realistic voltage, temperature, power data
- Based on documented African solar conditions
- Returns JSON with device ID, timestamp, metrics

### 2. AI Prediction
```
Backend → AI Server → Backend
```
- Backend sends sensor data to Python AI server
- Isolation Forest model detects anomalies
- Returns prediction ("Normal" | "Failure Likely") + confidence

### 3. Blockchain Logging
```
Backend → Hedera SDK → HCS Topic
```
- Sensor reading + prediction logged to Hedera Consensus Service
- Immutable audit trail with 3-5s finality
- Costs $0.0001 per message on mainnet (free on testnet)

### 4. Token Rewards
```
Backend → Hedera SDK → HTS Token
```
- If prediction is "Normal", mint 1.0 ETK
- Token rewards hypothesis: incentivize proactive maintenance
- Currently simulated (no real token configured)

## Technology Stack Rationale

### Frontend: React
**Why**: Fast development, component reusability, real-time updates via state management  
**Trade-offs**: Large bundle size (needs optimization for production)

### Backend: Node.js + Express
**Why**: Async I/O ideal for IoT data streams, JavaScript consistency across stack  
**Trade-offs**: Single-threaded (would need clustering at scale)

### AI: Python + scikit-learn
**Why**: Industry standard ML tools, excellent documentation, fast prototyping  
**Trade-offs**: Separate process (can't run in browser), requires Python runtime

### Blockchain: Hedera Hashgraph
**Why**: $0.0001/tx (100x cheaper than Ethereum), 3-5s finality, carbon-negative  
**Trade-offs**: Smaller ecosystem than Ethereum, less mature tooling

### Simulation: Custom Node.js
**Why**: Full control over failure scenarios, easy integration with backend  
**Trade-offs**: NOT a replacement for real hardware

## Deployment Architecture (Production-Ready Version)
```
┌──────────────┐
│   Vercel     │  Frontend (CDN, auto-scaling)
└──────┬───────┘
       │ HTTPS
┌──────▼───────┐
│   Railway/   │  Backend API (containerized)
│   Render     │
└──────┬───────┘
       │
┌──────▼───────────────────────────────────────┐
│  Hedera Mainnet                              │
│  - HCS Topic: 0.0.XXXXXX                    │
│  - HTS Token: 0.0.YYYYYY                    │
│  - Mirror Node for transaction history      │
└──────────────────────────────────────────────┘
```

**Database**: PostgreSQL + TimescaleDB for time-series sensor data  
**Caching**: Redis for frequently accessed predictions  
**Monitoring**: Datadog/Prometheus for system observability  
**Security**: Cloudflare WAF, rate limiting, API authentication

## Current Prototype Limitations

### What's NOT Production-Ready
1. **No Real Hardware**: All sensor data is simulated
2. **In-Memory Storage**: No persistent database (data lost on restart)
3. **Single Instance**: No load balancing or high availability
4. **Testnet Only**: Not deployed to Hedera mainnet
5. **No Authentication**: API endpoints are public
6. **Limited Error Recovery**: Assumes all services are always available

### What Would Change for Real Deployment
1. **Real IoT Sensors**: ESP32 + INA219 (voltage) + DS18B20 (temp)
2. **PostgreSQL Database**: Persist all sensor readings and predictions
3. **Kubernetes**: Container orchestration for scalability
4. **Hedera Mainnet**: Actual blockchain costs (~$10.50/year/panel)
5. **JWT Authentication**: Secure API access
6. **Circuit Breakers**: Graceful degradation when services fail

## Security Considerations

### Current Prototype
- ✅ No personal data collected
- ✅ Environment variables for secrets (.env)
- ✅ CORS configured for known origins
- ❌ No API authentication
- ❌ No rate limiting implemented
- ❌ No input validation on all endpoints

### Production Requirements
- API key authentication
- Rate limiting (100 requests/15 min per IP)
- Input validation with joi/express-validator
- SQL injection prevention (parameterized queries)
- DDoS protection (Cloudflare)
- Hedera private keys in HSM (Hardware Security Module)

## Scalability Analysis

### Current Capacity (Single Instance)
- Frontend: ~1,000 concurrent users
- Backend: ~500 requests/second
- AI Server: ~100 predictions/second
- Hedera: 10,000 transactions/second (network limit)

### Bottlenecks
1. **AI Server**: Python single-threaded, CPU-bound
2. **Backend**: Single Node.js process
3. **No Caching**: Every request hits services

### Scale-Up Strategy (10,000 panels)
1. **Horizontal Scaling**: Multiple AI server instances behind load balancer
2. **Batch Processing**: Group sensor readings (10 readings/HCS message)
3. **Caching**: Redis for recent predictions (5-minute TTL)
4. **Database**: TimescaleDB with compression (1-minute aggregates)
5. **Expected Cost**: 10,000 panels × $10.50/year = $105,000/year blockchain fees

## Future Enhancements

### Phase 2 (After Field Validation)
- [ ] Real-time websocket updates
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Offline-first architecture (service workers)

### Phase 3 (If Validated at Scale)
- [ ] Carbon credit marketplace integration
- [ ] DAO governance for token economics
- [ ] Predictive maintenance scheduling
- [ ] Integration with solar installation ERP systems

## Development Setup

See [DEPLOYMENT.md](DEPLOYMENT.md) for full setup instructions.

**Quick Start**:
```bash
npm install           # Install all dependencies
npm run dev          # Start all services
```

**Services**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- AI Server: http://localhost:5000
- Simulator: http://localhost:4000