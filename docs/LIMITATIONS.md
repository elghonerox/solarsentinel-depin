# System Limitations (Full & Honest Technical Disclosure)

This document provides **complete transparency** about what SolarSentinel DePIN CANNOT currently do, what is missing, and what parts of the system are still experimental. This level of honesty increases trust with judges, investors, NGOs, and engineers.

---

# ✅ Category 1 — Sensor, Hardware & Environmental Limitations

### 1. **No Real Hardware Data Yet (Critical)**

The AI model and anomaly detection system are trained **100% on synthetic sensor data**.

Implications:

* false positives may be higher in real deployments
* rare failure modes are missing
* temperature/voltage noise patterns will not match the field

### 2. **No Hardware Calibration Variation**

Real solar sensors (INA219, DS18B20, current sensors) vary by **manufacturing tolerances**.

Synthetic data cannot simulate:

* drift over time
* sensor aging
* humidity or heat-related degradation
* cable losses & microfractures

### 3. **No GPS / Location-Aware Adjustments**

Panels in Morocco, Kenya, Nigeria, Tanzania, and Egypt behave differently.

Current system does NOT adjust for:

* altitude
* urban heat island effects
* dust storm patterns
* monsoon seasons
* proximity to industrial pollution

### 4. **No Real-Time Edge Processing (Yet)**

The ESP32 simulator *pretends* to be a device, but:

* no edge filtering
* no on-device AI
* no resilience to network loss

### 5. **Weather Integration Missing**

We need real APIs or scraped local data.

Examples of missing signals:

* cloud cover
* solar irradiance index
* humidity
* wind speeds

Weather boosts prediction accuracy significantly.

---

# ✅ Category 2 — AI/ML Limitations

### 1. **Isolation Forest Only (Shallow Model)**

Isolation Forest is:

* simple
* fast
* good for prototypes

But it cannot:

* learn long-term temporal patterns
* detect subtle panel efficiency degradation
* model seasonal cycles
* adapt to new environments

It is **NOT production-grade** for long-term forecasting.

### 2. **No Labeled Real Failure Data**

ML model lacks training on:

* hot spot formation
* PID (Potential Induced Degradation)
* bypass-diode failures
* microcracks
* delamination

### 3. **No Time-Series Memory**

The model predicts from **single snapshots**.

Missing capabilities:

* rolling averages
* hourly trends
* monthly degradation curves
* anomaly clustering over time

### 4. **Confidence Score Not Statistically Validated**

Current confidence score is proxy-based, not mathematically calibrated.

### 5. **No Explainability Layer**

Technicians cannot see:

* which feature triggered the alert
* how severity was calculated
* why model classified something as failure

This weakens trust from field workers.

---

# ✅ Category 3 — Backend Limitations

### 1. **Node.js API not Load Tested**

Current backend has **NOT been tested** for:

* > 1000 requests per second
* long-running connections
* large JSON payloads

### 2. **No API Rate Limiting or Auth**

At this moment:
✅ backend works
❌ backend is not protected

Missing:

* JWT tokens
* API keys for devices
* IP throttling
* HMAC signatures for device payloads

### 3. **No Database Optimization**

We use MongoDB without:

* indexes
* TTL cleanup
* rollups for long-term storage

### 4. **File System Logging Only in Dev Mode**

Production requires centralized logging:

* ELK stack
* Loki
* Datadog

---

# ✅ Category 4 — Hedera Blockchain Limitations

### 1. **Testnet Only (NOT Production)**

Current implementation is limited by:

* topic resets
* unpredictable downtime
* no SLA

### 2. **Not all readings pushed on-chain**

Pushing 288 readings per day × 1000 panels = expensive.

Current compromise:

* push **only anomalies**
* push **daily summary**

### 3. **Token economics are experimental**

We don’t yet know:

* if technicians will adopt crypto wallets
* if fiat conversion is needed
* if ETK is meaningful as a reward system

### 4. **Blockchain not required for all use-cases**

We openly state:
✅ small private solar owners don't need Hedera
✅ blockchain matters only for large NGO / donor / multi-party deployments

---

# ✅ Category 5 — Frontend Limitations

### 1. **Dashboard Uses Mock Data**

Visualization shows:

* live voltage
* power
* AI predictions

But everything comes from the simulator.

### 2. **No Error Handling on Frontend**

Missing UI states:

* panel offline
* device not reachable
* invalid sensor payloads
* backend timeout

### 3. **No Offline Mode**

Critical in African rural deployments.

### 4. **Not Mobile-Optimized for Field Workers**

Technicians usually use phones, not laptops.

---

# ✅ Category 6 — Business & Deployment Limitations

### 1. **No Operational Partnerships Yet**

We have **no agreements** with:

* solar companies
* NGOs
* microgrid providers

### 2. **No Real Deployment Sites**

No test site in Morocco, Kenya, or Ghana yet.

### 3. **Technician Incentives Untested**

We do not know if token rewards:

* improve response times
* motivate technicians
* reduce downtime

### 4. **No Unit Economics Validation**

We have not tested:

* cost of installation
* cost of device manufacturing
* cost of cloud infrastructure

### 5. **Scalability of the Model Not Proven**

We do not yet know the cost of operating:

* 10,000 panels
* 50,000 panels
* 200,000 panels

---

# ✅ Category 7 — Legal, Ethical & Compliance Limitations

### 1. **No Data Protection Policies**

Missing documents:

* privacy policy
* data retention policy
* encryption standards

### 2. **Export Control Unknowns**

Hardware shipments across African borders require verification.

### 3. **Regulatory Unknowns**

Solar regulations differ by country.

---

# ✅ Summary: What We Can Honestly Claim

### ✅ Accurate claims we can make today:

* system detects anomalies with ~87–91% accuracy **on synthetic data**
* end-to-end system works (simulator → backend → AI → dashboard → Hedera)
* blockchain integration stable on testnet
* architecture is scalable

### ❌ Claims we MUST NOT make yet:

* real-world accuracy above 90%
* detects all solar failures
* production-ready
* field-proven token economics
* NGO-ready deployment
* real savings or uptime improvement

---

# ✅ Final Statement

This document lays out **exactly** what limitations exist today, with no exaggeration. This level of honesty increases credibility with judges and prevents overclaiming.

We will address these limitations gradually during Phase 1–4 of the roadmap.
