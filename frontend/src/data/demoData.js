export const DEMO_SCENARIOS = [
  {
    id: "account_compromise",
    name: "Potential Account Compromise (Hero Scenario)",
    user: "alex",
    description: "Multiple failed logins followed by unusual geo-location access, rogue device fingerprint, customer financial data read, and abnormal network egress.",
    pattern: "Potential Account Compromise",
    severity: "CRITICAL",
    expectedRisk: "91/100"
  },
  {
    id: "data_exfiltration",
    name: "Potential Data Exfiltration",
    user: "maya",
    description: "Database queries dumping master tables followed by 2.4GB encrypted archive egress to external IP.",
    pattern: "Potential Data Exfiltration",
    severity: "CRITICAL",
    expectedRisk: "88/100"
  },
  {
    id: "privilege_abuse",
    name: "Potential Privilege Abuse",
    user: "dev_user",
    description: "MFA challenge rejections followed by unapproved AdministratorAccess role policy attachment and production root vault key access.",
    pattern: "Potential Privilege Abuse",
    severity: "CRITICAL",
    expectedRisk: "87/100"
  },
  {
    id: "lateral_movement",
    name: "Potential Lateral Movement",
    user: "sam",
    description: "Unusual geo-login followed by rapid internal host port sweep and remote WMI dispatch to primary domain controller.",
    pattern: "Potential Lateral Movement",
    severity: "HIGH",
    expectedRisk: "82/100"
  }
];

export const DEMO_STEPS = [
  {
    step: 1,
    title: "Multi-Source Log Arrival",
    desc: "Disparate logs arrive asynchronously from Okta SSO, CrowdStrike EDR, Palo Alto Perimeter, and Internal Database."
  },
  {
    step: 2,
    title: "Canonical Event Normalization",
    desc: "Heterogeneous log formats mapped to standardized schema with canonical fields (actor, device, IP, action, sensitivity)."
  },
  {
    step: 3,
    title: "Statistical Anomaly Scoring",
    desc: "Initial anomaly detection calculates deviations in off-hours activity, unfamiliar locations, and failure bursts."
  },
  {
    step: 4,
    title: "Graph & Temporal Correlation",
    desc: "Correlation engine identifies shared identity vectors across users and IPs within a 12-minute window (Temporal weight: 1.0)."
  },
  {
    step: 5,
    title: "Behavioural Baseline Profiling",
    desc: "Activity evaluated against historical baseline (unusual location Bucharest vs typical Chennai office)."
  },
  {
    step: 6,
    title: "5-Factor Weighted Risk Engine",
    desc: "Mathematical formula computes: 30% Anomaly + 25% Correlation + 20% Behaviour + 15% Sensitivity + 10% Severity = 91/100 (CRITICAL)."
  },
  {
    step: 7,
    title: "Prioritized Incident Formulation",
    desc: "Grouped events synthesized into Incident INC-2026-001 prioritized at the top of the SOC triage queue."
  },
  {
    step: 8,
    title: "Explainable AI (XAI) Synthesis",
    desc: "Deterministic XAI engine articulates exactly why this threat was prioritized with itemized risk drivers."
  },
  {
    step: 9,
    title: "Defensive Response Playbook",
    desc: "Actionable, non-offensive SOP recommendations generated for immediate SOC containment and user verification."
  },
  {
    step: 10,
    title: "SOC Action & Resolution",
    desc: "Analyst reviews threat timeline, acknowledges incident, isolates endpoints, and updates state to RESOLVED."
  }
];
