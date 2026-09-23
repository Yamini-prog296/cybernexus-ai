import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Cpu, 
  Brain, 
  Activity, 
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import RiskScore from '../components/RiskScore';
import AIExplanation from '../components/AIExplanation';
import RecommendationPanel from '../components/RecommendationPanel';
import ThreatTimeline from '../components/ThreatTimeline';
import { DEMO_STEPS, DEMO_SCENARIOS } from '../data/demoData';
import { api } from '../services/api';

export default function DemoMode({ onSelectIncident }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [demoOutput, setDemoOutput] = useState(null);

  const heroEvents = [
    {
      step: 1,
      source: 'AUTHENTICATION (Okta SSO)',
      time: '09:00:15 UTC',
      event: 'LOGIN_FAILED',
      desc: 'Repeated failed password verification attempt 1 from external IP 198.51.100.20 (Bucharest, RO)',
      individualSeverity: 'LOW (Isolated event looks like standard user typo)',
      severity: 'LOW',
      anomaly: 45
    },
    {
      step: 2,
      source: 'AUTHENTICATION (Okta SSO)',
      time: '09:03:40 UTC',
      event: 'LOGIN_SUCCESS',
      desc: 'Successful authentication for user=alex from atypical location (Bucharest, RO vs typical Chennai HQ)',
      individualSeverity: 'MEDIUM (Unusual travel or VPN login)',
      severity: 'MEDIUM',
      anomaly: 75
    },
    {
      step: 3,
      source: 'ENDPOINT (CrowdStrike EDR)',
      time: '09:05:10 UTC',
      event: 'NEW_DEVICE_LOGIN',
      desc: 'Hardware device fingerprint LINUX-ROGUE-TERMINAL has never been observed in baseline profile',
      individualSeverity: 'MEDIUM (New contractor or mobile hardware)',
      severity: 'MEDIUM',
      anomaly: 78
    },
    {
      step: 4,
      source: 'ENDPOINT (File Watcher)',
      time: '09:07:30 UTC',
      event: 'SENSITIVE_DATA_ACCESS',
      desc: 'User opened customer_financial_records_2026.xlsx and executed export command',
      individualSeverity: 'HIGH (Privileged document read during quarter close)',
      severity: 'HIGH',
      anomaly: 88
    },
    {
      step: 5,
      source: 'NETWORK (Palo Alto Perimeter)',
      time: '09:09:45 UTC',
      event: 'OUTBOUND_ANOMALY',
      desc: 'Workstation transferred 840MB compressed outbound session to remote IP 192.0.2.10 on port 443',
      individualSeverity: 'HIGH (High egress bandwidth transfer)',
      severity: 'HIGH',
      anomaly: 92
    }
  ];

  const handleRunFullDemo = async () => {
    setIsRunning(true);
    setCurrentStep(1);
    try {
      const res = await api.startDemo();
      setDemoOutput(res);
      // Automatically advance through steps
      let step = 1;
      const interval = setInterval(() => {
        step += 1;
        if (step <= 10) {
          setCurrentStep(step);
        } else {
          clearInterval(interval);
          setIsRunning(false);
        }
      }, 700);
    } catch (err) {
      console.error('Error starting demo:', err);
      setIsRunning(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 10) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner: Core Philosophy */}
      <div className="bg-gradient-to-r from-blue-950/60 via-[#0f1422] to-purple-950/60 border border-blue-500/40 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600 text-white uppercase">
                HACKATHON DEMO WALKTHROUGH
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                INTELLECT HACK 2026 • PROBLEM STATEMENT 5
              </span>
            </div>
            <h1 className="text-xl font-bold font-mono text-slate-100 mt-2">
              "ONE EVENT MAY LOOK HARMLESS. MULTIPLE RELATED EVENTS CAN REVEAL A THREAT."
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Watch disparate authentication, endpoint, and network telemetry converge through AI correlation into prioritized threat intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunFullDemo}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isRunning ? 'RUNNING PIPELINE...' : 'START DEMO (10 STEPS)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 10-Step Interactive Pipeline Progress Bar */}
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
              10-STAGE DEFENSIVE AI PIPELINE WALKTHROUGH
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-mono text-slate-300"
            >
              Back
            </button>
            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
              Stage {currentStep} / 10
            </span>
            <button
              onClick={handleNextStep}
              disabled={currentStep === 10}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-mono text-slate-300"
            >
              Next Step
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mt-4">
          {DEMO_STEPS.map((s) => {
            const isCompleted = s.step <= currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <div
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                    : 'bg-[#131b2e]/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                  <span>STEP {s.step}</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-[10px] font-mono text-slate-200 line-clamp-2 leading-tight">
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Active Step Deep Dive Card */}
        <div className="mt-4 p-4 rounded-lg bg-[#131b2e] border border-blue-500/30 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
              ACTIVE STAGE {currentStep}: {DEMO_STEPS[currentStep - 1].title}
            </div>
            <p className="text-xs font-mono text-slate-300 mt-1 leading-relaxed">
              {DEMO_STEPS[currentStep - 1].desc}
            </p>
          </div>
        </div>
      </div>

      {/* Hero Scenario Telemetry Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            HERO SCENARIO: DISPARATE LOG TELEMETRY FOR USER "alex"
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Compare: Isolated Severity vs Correlated Threat
          </span>
        </div>

        <div className="space-y-3">
          {heroEvents.map((evt, idx) => (
            <div
              key={idx}
              className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-cyan-400 font-bold">{evt.time}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-300 font-semibold">{evt.source}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-200 font-bold">{evt.event}</span>
                </div>
                <p className="text-slate-400 font-sans pl-7">
                  {evt.desc}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 pl-7 md:pl-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Isolated Evaluation</span>
                  <span className="text-xs text-slate-300">{evt.individualSeverity}</span>
                </div>
                <SeverityBadge severity={evt.severity} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The AI Synthesis Result */}
      <div className="bg-gradient-to-r from-red-950/40 via-[#0f1422] to-slate-900 border border-red-500/50 rounded-xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-red-600 text-slate-950 font-mono font-bold text-xs">
                THREAT DETECTED
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                Attack Pattern: Potential Account Compromise
              </span>
            </div>
            <h2 className="text-lg font-bold font-mono text-slate-100">
              Coordinated Account Takeover & Exfiltration Sequence Flagged
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              Individually: Low/medium suspicion. Together: Potential coordinated attack pattern with 91% confidence.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-center font-mono">
              <div className="text-3xl font-black text-red-400">91/100</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">RISK SCORE</div>
              <div className="text-[10px] text-red-400 font-bold">CRITICAL</div>
            </div>
            <div className="text-center font-mono">
              <div className="text-3xl font-black text-emerald-400">91%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">CONFIDENCE</div>
              <div className="text-[10px] text-emerald-400 font-bold">HIGH CERTAINTY</div>
            </div>
          </div>
        </div>

        {/* Explainability & Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Why */}
          <div className="bg-[#131b2e]/70 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2.5">
            <div className="font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <Brain className="w-4 h-4 text-blue-400" />
              EXPLAINABLE AI REASONING:
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">+</span>
                <span>Repeated authentication failures (3 failed attempts prior to breach)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">+</span>
                <span>Unusual successful login from foreign geolocation (Bucharest, RO)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">+</span>
                <span>Unrecognized hardware device fingerprint (LINUX-ROGUE-TERMINAL)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">+</span>
                <span>Sensitive enterprise resource access (customer_financial_records_2026.xlsx)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">+</span>
                <span>Abnormal outbound network egress spike (840MB compressed transfer)</span>
              </li>
            </ul>
          </div>

          {/* Recommended Defensive Actions */}
          <div className="bg-[#131b2e]/70 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2.5">
            <div className="font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              RECOMMENDED DEFENSIVE ACTION (SOP):
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <span>Investigate account activity and verify user identity via out-of-band channel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">2.</span>
                <span>Review affected resources and revoke active authorization tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">3.</span>
                <span>Isolate affected client endpoints according to organizational procedures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">4.</span>
                <span>Preserve forensic logs and coordinate with internal response team</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
