# CYBERNEXUS AI

> *"From scattered security events to explainable threat intelligence."*  
> *Alternative Tagline: "AI-powered detection, correlation and prioritization for digital resilience."*

---

### **INTELLECT HACK 2026**
**SEC IEEE Reliability Society SBC**  
**Problem Statement 5: AI for Cybersecurity & Digital Resilience**

---

## 1. Executive Summary & Core Philosophy

In modern enterprise architectures, organizations produce massive volumes of fragmented telemetry:
- **Authentication Logs** (SSO, MFA, IAM, VPN)
- **Network Telemetry** (Firewalls, NetFlow, DNS, egress gateways)
- **Application & DB Logs** (SQL queries, API gateways, CloudTrail)
- **Endpoint Telemetry** (EDR, process executions, filesystem audit trails)

Individually, suspicious events often appear benign or low-severity. However, a sequence of coordinated activities distributed across disparate systems indicates an active cyber threat.

### **The Central Axiom**
$$\textbf{ONE EVENT MAY LOOK HARMLESS. MULTIPLE RELATED EVENTS CAN REVEAL A THREAT.}$$

**CYBERNEXUS AI** is an enterprise-grade, **strictly defensive** Security Operations Center (SOC) intelligence platform that:
1. Ingests and normalizes multi-source logs into a canonical schema.
2. Performs statistical anomaly scoring and behavioural deviation profiling.
3. Correlates disparate events across identity vectors (User, IP, Device, Target Resource) and configurable temporal windows.
4. Detects multi-stage coordinated attack patterns (Account Compromise, Data Exfiltration, Privilege Abuse, Lateral Movement).
5. Prioritizes incidents using a 5-factor mathematical risk engine.
6. Delivers transparent **Explainable AI (XAI)** justifications detailing why each alert was prioritized.
7. Recommends actionable, **strictly defensive Incident Response (IR) standard operating procedures**.

> [!IMPORTANT]
> **Strictly Defensive Solution**: CyberNexus AI contains **NO** malware, exploit automation, credential harvesters, or ransomware. All threat simulations use safely generated synthetic logs with standard documentation IP addresses (`10.0.0.x`, `192.0.2.x`, `198.51.100.x`) and fictional identities (`alex`, `maya`, `sam`, `arun`, `dev_user`).

> [!NOTE]
> **Zero External Dependency Guarantee**: Operates completely in **LOCAL AI MODE** out-of-the-box without requiring any external API key. Optional integrations for Gemini and OpenAI-compatible providers are included with automatic local fallback.

---

## 2. Hero Demo Scenario

The core capability is demonstrated through the following synthetic scenario:

```
[09:00:15 UTC] AUTHENTICATION  -> Repeated failed login attempts (user: alex, IP: 198.51.100.20)
[09:03:40 UTC] AUTHENTICATION  -> Successful login from unusual location (Bucharest, RO vs Chennai HQ)
[09:05:10 UTC] ENDPOINT        -> Unrecognized hardware fingerprint detected (LINUX-ROGUE-TERMINAL)
[09:07:30 UTC] ENDPOINT        -> High-value asset touched (customer_financial_records_2026.xlsx)
[09:09:45 UTC] NETWORK         -> Abnormal egress data spike (840MB compressed transfer to remote IP)
```

### **Individual Log Assessment vs Correlated Intelligence**
| Telemetry Event | Isolated Evaluation | CyberNexus AI Correlated Synthesis |
| :--- | :--- | :--- |
| Failed Logins | Low/Medium (Common typo) | **THREAT DETECTED: Potential Account Compromise** |
| Successful Login | Low/Medium (Possible travel/VPN) | **Final Risk Score: 91/100 (CRITICAL)** |
| New Device | Medium (Contractor hardware) | **Confidence: 91% (High Certainty)** |
| File Read | Medium (Quarterly reporting) | **Temporal Density: All within 10 minutes** |
| Outbound Network | Medium (Cloud synchronization) | **Recommended Action: Immediate account restriction, out-of-band identity verification, endpoint isolation** |

---

## 3. Mathematical Formulation for Risk Scoring

In accordance with problem requirements, the Risk Engine implements the exact 5-factor weighted formula:

$$\text{Risk Score} = 0.30 \cdot A + 0.25 \cdot C + 0.20 \cdot B + 0.15 \cdot S + 0.10 \cdot V$$

Where:
- $A \in [0, 100]$: **Anomaly Score** (Statistical deviation in frequency, off-hours, geo-ip, and bursts)
- $C \in [0, 100]$: **Correlation Score** (Identity intersection, multi-source convergence, temporal proximity decay)
- $B \in [0, 100]$: **Behavioural Deviation Score** (Profile deviation against baseline working hours and known assets)
- $S \in [0, 100]$: **Asset Sensitivity Score** (Criticality weight of touched resource e.g. financial DB = 95)
- $V \in [0, 100]$: **Event Severity Score** (Mapped raw severity weight: Critical=100, High=75, Med=50, Low=25)

### **Severity Classification Mapping**
- **$0 - 25$**: **LOW** (Informational baseline telemetry)
- **$26 - 50$**: **MEDIUM** (Elevated monitoring required)
- **$51 - 75$**: **HIGH** (Active incident investigation initiated)
- **$76 - 100$**: **CRITICAL** (Urgent coordinated threat containment)

---

## 4. Coordinated Attack-Chain Pattern Recognition

The correlation engine identifies multi-stage sequences across disparate sensors:

1. **Potential Account Compromise**:
   - `LOGIN_FAILED` $\times N \to$ `LOGIN_SUCCESS` (unusual location) $\to$ `NEW_DEVICE_LOGIN` $\to$ `SENSITIVE_DATA_ACCESS` $\to$ `OUTBOUND_ANOMALY`.
2. **Potential Data Exfiltration**:
   - `SENSITIVE_DATA_ACCESS` $\to$ `UNUSUAL_QUERY` (bulk export) $\to$ `OUTBOUND_ANOMALY` (high-volume egress).
3. **Potential Privilege Abuse**:
   - `MFA_FAILURE` / `UNUSUAL_LOGIN` $\to$ `PRIVILEGE_CHANGE` / `PERMISSION_CHANGE` $\to$ `SENSITIVE_DATA_ACCESS` (root keys / vault).
4. **Potential Lateral Movement**:
   - `UNUSUAL_LOGIN` $\to$ `PORT_SCAN_INDICATOR` (internal host sweep) $\to$ `UNUSUAL_CONNECTION` (remote WMI / RPC dispatch).

---

## 5. System Architecture

```
cybernexus-ai/
│
├── README.md                          # Comprehensive project documentation
├── .gitignore                         # Python and Node ignore definitions
├── docker-compose.yml                 # Multi-container orchestration
│
├── backend/                           # FastAPI Python Backend
│   ├── main.py                        # App entrypoint, CORS, lifecycle auto-seed
│   ├── requirements.txt               # Dependencies (FastAPI, SQLAlchemy, Pytest)
│   ├── .env.example                   # Environment configuration template
│   ├── Dockerfile                     # Container specification
│   │
│   ├── app/
│   │   ├── database.py                # Database connection (SQLite -> PostgreSQL ready)
│   │   ├── models.py                  # SQLAlchemy relational tables
│   │   ├── schemas.py                 # Pydantic input/output schemas
│   │   │
│   │   ├── routers/
│   │   │   ├── events.py              # Event ingestion, search, filter APIs
│   │   │   ├── incidents.py           # Priority triage, deep dive, status patching
│   │   │   ├── dashboard.py           # SOC telemetry stats and live stream
│   │   │   ├── analytics.py           # Recharts aggregation data endpoints
│   │   │   └── demo.py                # One-click seed and synthetic simulation
│   │   │
│   │   ├── services/
│   │   │   ├── event_normalizer.py    # Canonical multi-source normalization
│   │   │   ├── correlation_engine.py  # Temporal and identity graph correlation
│   │   │   ├── anomaly_engine.py      # Statistical and heuristic anomaly scorer
│   │   │   ├── behaviour_engine.py    # Baseline profiling and deviation detector
│   │   │   ├── risk_engine.py         # 5-factor weighted risk calculator
│   │   │   ├── incident_engine.py     # Incident synthesizer and priority ranker
│   │   │   ├── explanation_engine.py  # Explainable AI (XAI) report generator
│   │   │   ├── recommendation_engine.py # Defensive SOP playbooks
│   │   │   └── ai_provider.py         # Hybrid Local / Gemini / OpenAI provider
│   │   │
│   │   └── utils/
│   │       └── helpers.py             # IDs, sensitivity mappings, classification
│   │
│   ├── data/
│   │   └── demo_events.json           # 25+ realistic synthetic enterprise logs
│   │
│   └── tests/
│       ├── test_events.py             # Unit tests for canonical normalization
│       ├── test_correlation.py        # Unit tests for temporal correlation & chains
│       ├── test_risk.py               # Unit tests verifying exact math formula
│       └── test_api.py                # Integration tests for all REST endpoints
│
└── frontend/                          # React + Vite + Tailwind CSS SOC UI
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── components/
        │   ├── Sidebar.jsx            # SOC navigation bar
        │   ├── Topbar.jsx             # SOC operational status, live UTC clock
        │   ├── StatCard.jsx           # Metric display cards with trend indicators
        │   ├── SeverityBadge.jsx      # Color-coded severity badge
        │   ├── RiskScore.jsx          # Visual risk score gauge
        │   ├── EventTable.jsx         # Telemetry browser with JSON expander
        │   ├── IncidentTable.jsx      # Priority queue table (risk descending)
        │   ├── IncidentCard.jsx       # Card view for incidents
        │   ├── ThreatTimeline.jsx     # Chronological threat attack chain
        │   ├── CorrelationGraph.jsx   # Visual identity convergence graph
        │   ├── AIExplanation.jsx      # "Why Did AI Flag This?" panel
        │   ├── RecommendationPanel.jsx# Defensive SOP response checklist
        │   ├── EventSourceBadge.jsx   # Source type badges with icons
        │   ├── FilterBar.jsx          # Universal filtering controls
        │   ├── SearchBar.jsx          # Real-time search input
        │   ├── LiveEventStream.jsx    # Real-time streaming log ticker
        │   ├── SystemHealth.jsx       # Pipeline diagnostics & engine telemetry
        │   └── LoadingState.jsx       # Cybersecurity radar loading indicator
        │
        ├── pages/
        │   ├── Dashboard.jsx          # Executive SOC Command Center
        │   ├── Events.jsx             # Normalized event browser & manual injector
        │   ├── Incidents.jsx          # Incident triage center
        │   ├── IncidentDetails.jsx    # Incident investigation workspace
        │   ├── Analytics.jsx          # Recharts visualizations & KPIs
        │   └── DemoMode.jsx           # 10-step interactive hackathon walkthrough
        │
        ├── services/
        │   └── api.js                 # API service layer
        │
        └── data/
            └── demoData.js            # Demo scenarios and pipeline step definitions
```

---

## 6. Getting Started & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Local Development Setup

#### 1. Backend Setup
```bash
cd cybernexus-ai/backend

# Create virtual environment (optional)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server (starts on http://localhost:8000)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*The database automatically creates tables and seeds rich synthetic demo data on first boot.*

#### 2. Frontend Setup
```bash
cd cybernexus-ai/frontend

# Install dependencies
npm install

# Start Vite development server (starts on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser to interact with the CyberNexus AI SOC console!

---

## 7. Running via Docker Compose

To run the entire distributed stack with a single command:

```bash
cd cybernexus-ai
docker-compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger Interactive Docs: `http://localhost:8000/docs`

---

## 8. Verification & Automated Test Suite

Run the comprehensive pytest suite to verify normalization, correlation, risk formulas, and API endpoints:

```bash
cd cybernexus-ai/backend
python -m pytest tests/ -v
```

Expected test results:
```
tests/test_api.py::test_health_endpoint PASSED                           [ 11%]
tests/test_api.py::test_demo_start_and_incidents PASSED                  [ 22%]
tests/test_api.py::test_dashboard_and_analytics PASSED                   [ 33%]
tests/test_correlation.py::test_temporal_weights PASSED                  [ 44%]
tests/test_correlation.py::test_account_compromise_pattern_detection PASSED [ 55%]
tests/test_events.py::test_normalize_dict_event PASSED                   [ 66%]
tests/test_events.py::test_normalize_raw_string_event PASSED             [ 77%]
tests/test_risk.py::test_risk_formula_calculation PASSED                 [ 88%]
tests/test_risk.py::test_severity_classifications PASSED                 [100%]
======================= 9 passed in 0.88s =======================
```

---

## 9. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, AI engine status, SOC status |
| `GET` | `/api/events` | List normalized events (filtering by source, severity, user, search) |
| `POST` | `/api/events` | Ingest and normalize new security log event |
| `GET` | `/api/events/{id}` | Inspect specific event payload |
| `GET` | `/api/incidents` | Get prioritized incident queue (sorted by risk_score desc) |
| `GET` | `/api/incidents/{id}` | Full incident details with timeline, XAI breakdown, and defensive SOP |
| `PATCH`| `/api/incidents/{id}/status` | Update lifecycle state (`ACKNOWLEDGED`, `INVESTIGATING`, `RESOLVED`) |
| `POST` | `/api/incidents/analyze` | Trigger on-demand multi-source correlation engine |
| `GET` | `/api/dashboard/stats` | Executive SOC telemetry statistics |
| `GET` | `/api/dashboard/live-events`| Real-time streaming log slice |
| `GET` | `/api/analytics` | Aggregated distributions and charts data for Recharts |
| `POST` | `/api/demo/start` | One-click reset & full 10-stage demo initialization |
| `POST` | `/api/demo/simulate` | Inject multi-stage synthetic attack telemetry on demand |
| `GET` | `/docs` | Interactive Swagger UI API documentation |

---

## 10. Hackathon Presentation Checklist (10-Step Walkthrough)

To present CyberNexus AI to judges:
1. Open the **Hero Demo Mode** tab in the sidebar.
2. Click **"START DEMO (10 STEPS)"** to run the complete automated pipeline.
3. Show the **Hero Scenario** section: Highlight how 5 events individually assessed as LOW or MEDIUM suspicion converge into a **CRITICAL (91/100)** threat.
4. Open the **Prioritized Incident Queue**: Demonstrate how incidents are automatically ranked by risk score.
5. Click **"Investigate"** on Incident `INC-2026-001`:
   - Point out the **Explainable AI (XAI)** panel explaining *why* the AI prioritized this alert with itemized causal vectors.
   - Point out the **Chronological Threat Timeline** illustrating the attack progression.
   - Point out the **Multi-Dimensional Correlation Graph** showing entity connections.
   - Point out the **Recommended Defensive Action (SOP)** checklist.
6. Click **"INVESTIGATING"** then **"RESOLVED"** to demonstrate real-time lifecycle tracking in the backend.
7. Show **Security Analytics**: Demonstrate Recharts telemetry visualizations (Events by Source, 24h Trend, Risk Spread, and Top Targeted Assets).

---

## License & Defense Disclaimer
Built exclusively for defensive cybersecurity demonstration purposes at **INTELLECT HACK 2026**.
All simulated threats use synthetic documentation IP addresses (`RFC 5737` & `RFC 1918`).
#   c y b e r n e x u s - a i  
 