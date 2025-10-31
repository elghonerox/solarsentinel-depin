# ⚡ SolarSentinel DePIN
### Proof-of-Concept: AI-Powered Predictive Solar Monitoring for Rural Africa

<div align="center">

[![Hedera Testnet](https://img.shields.io/badge/Hedera-Testnet-00D4AA?style=for-the-badge)](https://hedera.com)
[![Prototype](https://img.shields.io/badge/Status-Prototype-yellow?style=for-the-badge)](/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[🚀 Live Demo](#) · [📺 Video](#) · [📖 Documentation](docs/) · [🏆 Hackathon](https://dorahacks.io/hackathon/hederahackafrica)

**⚠️ This is a prototype built for educational and demonstration purposes. Real-world deployment requires field validation.**

</div>

---

## 🌍 The Problem We're Exploring

**600 million Africans lack reliable electricity.** Solar panels offer hope, but unexpected failures devastate rural communities when professional monitoring systems cost $20-50 per panel monthly—pricing out underserved populations.

### The Core Challenge

According to World Bank research (2024):
- Rural solar installations lose $5,000-$10,000 annually to maintenance delays
- 40% average downtime due to reactive (not predictive) monitoring
- Low-income communities can't afford industrial monitoring solutions
- Lack of trusted audit trails makes impact verification difficult for NGO funders

### Our Hypothesis

**What if AI + blockchain could make professional-grade predictive monitoring affordable for communities currently priced out?**

---

## 💡 What We Built

**SolarSentinel** is a proof-of-concept decentralized physical infrastructure network (DePIN) demonstrating how this might work.

### 🎯 System Architecture
```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Simulated Sensors│───▶│  AI Predictor    │───▶│ Hedera Testnet   │
│ (IoT Telemetry)  │    │ (Isolation Forest)│   │  (HCS + HTS)     │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                │                         │
                                ▼                         ▼
                       ┌──────────────────┐    ┌──────────────────┐
                       │    Dashboard     │◀───│  Test Tokens     │
                       │  (Real-time UI)  │    │  (ETK on testnet)│
                       └──────────────────┘    └──────────────────┘
```

### What's Actually Working

✅ **Sensor Simulation**: Generates realistic solar panel telemetry based on documented African climate patterns  
✅ **AI Prediction**: Isolation Forest model trained on 10,000 synthetic readings  
✅ **Hedera Integration**: Successfully logging to HCS and minting test tokens  
✅ **Dashboard**: Real-time visualization of predictions and system status  
✅ **End-to-End Flow**: Complete prototype from data generation → prediction → blockchain → display  

### What's Not Yet Real

⚠️ **No Physical Hardware**: Currently using simulated sensors, not actual IoT devices  
⚠️ **Synthetic Data Only**: AI trained on generated data, not field measurements  
⚠️ **No Field Deployments**: Zero real-world installations (this is a prototype)  
⚠️ **Untested Token Economics**: Token incentive hypothesis requires user behavior validation  
⚠️ **Testnet Only**: Not deployed to Hedera mainnet (requires production-ready code + business model validation)  

---

## 🚀 Quick Start (5-Minute Setup)

### Prerequisites
```bash
Node.js 18+ (tested on v22.16)
Python 3.8+
Hedera testnet account (free at portal.hedera.com)
```

### Installation
```bash
# 1. Clone repository
git clone https://github.com/yourusername/solarsentinel-depin
cd solarsentinel-depin

# 2. Install all dependencies
npm install

# 3. Set up AI server
cd ai-server
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 4. Configure Hedera credentials
cd backend
cp .env.example .env
# Edit .env with your testnet account ID and private key
cd ..

# 5. Start all services (use separate terminals)

# Terminal 1: AI Server
cd ai-server
source venv/bin/activate
python server.py

# Terminal 2: Backend
cd backend
npm start

# Terminal 3: Simulator
cd simulator
npm start

# Terminal 4: Frontend
cd frontend
npm start
```

### Access
- Dashboard: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- AI Server: `http://localhost:5000`
- Simulator: `http://localhost:4000`

---

## 🔬 Technical Validation: What We Can Defend

### AI Model Performance (Synthetic Dataset)

**Algorithm**: Isolation Forest (scikit-learn 1.3.0)  
**Training Approach**: Unsupervised anomaly detection  
**Dataset**: 10,000 simulated readings representing:
- Voltage degradation patterns (9-13V range for 12V panels)
- Temperature variations (20-45°C, based on Kenya/Nigeria climate data)
- Power output anomalies (dust accumulation, thermal issues)

**Results on Synthetic Data**:

| Metric | Value | Baseline (Threshold) | Improvement |
|--------|-------|---------------------|-------------|
| **Precision** | 87% | 72% | +15 percentage points |
| **Recall** | 91% | 85% | +6 percentage points |
| **F1-Score** | 89% | 78% | +11 percentage points |
| **False Positive Rate** | 8% | 18% | 2.25x better |

**What This Tells Us**:
- ✅ On synthetic data, the AI demonstrates strong anomaly detection
- ✅ Significantly outperforms simple voltage threshold approach
- ⚠️ Real-world performance unknown—synthetic data may not capture all failure modes
- 📋 Next step: Collect 90 days of real sensor data to retrain and validate

[See full validation methodology →](docs/ML_VALIDATION.md)

---

## ⛓️ Hedera Integration: Why This Stack?

### Why Blockchain?

**Use Case Analysis**:

1. **Multi-Stakeholder Trust**: Panel owners, maintenance workers, NGO funders, and insurers need to verify system data
2. **Impact Verification**: Development organizations require tamper-proof evidence of outcomes
3. **Token Incentive Hypothesis**: Testing whether programmable rewards improve maintenance response times

**Counter-Argument We Acknowledge**: A centralized database would be simpler for pure monitoring. Our hypothesis is that trust/incentive benefits outweigh complexity in multi-stakeholder rural contexts—but this requires field validation.

### Why Hedera Specifically?

| Requirement | Hedera | Ethereum | Polygon |
|-------------|--------|----------|---------|
| **Transaction Cost** | $0.0001 | $1-50 | $0.01 |
| **Finality Speed** | 3-5s | 12+ min | 2s |
| **Carbon Footprint** | Negative | High | Medium |

**Cost Analysis** (mainnet projections):
- 288 readings/day × $0.0001 = **$10.50/year per panel**
- Compare to prevented $6,298 loss = **61,780% ROI** (if deployed)

[See detailed integration docs →](docs/HEDERA_INTEGRATION.md)

---

## 🚧 Honest Limitations & Open Questions

### Technical Limitations

- Simulated data may not capture all real-world failure modes
- Model untested on diverse panel types/manufacturers
- No stress testing for 1,000+ panels simultaneously
- Connectivity assumptions may not hold in rural areas

### Business Model Uncertainties

- Will communities pay $0.12/panel/month?
- Do token rewards actually motivate faster maintenance?
- Can we compete with established players at scale?

### Regulatory Unknowns

- Data privacy requirements across 54 African countries
- Cryptocurrency regulations vary by region
- Electrical certification requirements for sensors

[See complete limitations →](docs/LIMITATIONS.md)

---

## 🛣️ Realistic Roadmap: Validation-First Approach

### Phase 1 (Months 1-3): Real-World Validation

**Goal**: Deploy to 1 actual installation, collect 90 days of real data

- Purchase ESP32 + sensors (~$50/panel)
- Partner with local solar installer
- Collect 25,000+ real sensor readings
- Retrain model on actual data
- **Decision Point**: If accuracy <70%, pivot to simpler system

### Phase 2 (Months 4-6): Iteration Based on Learnings

**If Phase 1 validates** (>70% accuracy):
- Expand to 3-5 installations
- Build mobile app for maintainers
- Migrate to Hedera mainnet
- A/B test token rewards

**If Phase 1 reveals issues**:
- Document learnings for community
- Pivot to different market or simpler approach

[See detailed roadmap →](docs/ROADMAP.md)

---

## 📚 Complete Documentation

- 📖 [Architecture Guide](docs/ARCHITECTURE.md)
- 🤖 [ML Validation Methodology](docs/ML_VALIDATION.md)
- ⛓️ [Hedera Integration Deep Dive](docs/HEDERA_INTEGRATION.md)
- 🚧 [Known Limitations](docs/LIMITATIONS.md)
- 🛣️ [Product Roadmap](docs/ROADMAP.md)
- 🔌 [API Documentation](docs/API.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md)
- 🔒 [Security Policy](SECURITY.md)

---

## 🤝 Contributing & Community

### Built for Hedera Africa Hackathon 2025

**Track**: AI & DePIN  
**Team**: [Your Name/Team Name]

### We're Seeking

**For Phase 1 Validation**:
- 1-2 solar installations willing to pilot
- Hardware engineers experienced with IoT
- Solar maintenance technicians for feedback

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

I have successfully completed the Hedera Africa Hackathon 2025 and would like to share my certificate of participation. You can view and download my certificate from the following link: https://drive.google.com/file/d/1mtUd6K7sxVMXWLco33X3gV9W4fWMtVS1/view?usp=drive_link

## 🌟 Our Commitment

**SolarSentinel is a prototype built to explore a hypothesis**: Can AI + blockchain make professional solar monitoring affordable for underserved communities?

We don't know if this will work at scale. We don't know if token incentives matter. We don't know if our simulations match reality.

**What we DO know**:
- We built a complete technical system demonstrating feasibility
- We've identified specific validation steps needed
- We're committed to honest transparency about results

<div align="center">

### We're not claiming to have solved anything yet.
### We're claiming we've built something worth validating.

**⭐ Star this repo if you believe in honest innovation**```
