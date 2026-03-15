"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { KPIResponse } from "@/lib/types";

const prompts = [
  "What changed in the cooling loop over the last hour?",
  "Summarize current plant risk in plain language.",
  "Which asset is closest to an alert threshold?",
];

export default function CopilotPage() {
  const [kpis, setKpis] = useState<KPIResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setKpis(await api.getKpis());
      } catch {
        setKpis(null);
      }
    };
    void load();
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card lg:col-span-1">
        <p className="card-title">Plant Context</p>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>Status: <span className="text-text">{kpis?.plant_status ?? "unknown"}</span></li>
          <li>Anomalies: <span className="text-text">{kpis?.anomaly_count ?? "--"}</span></li>
          <li>Open incidents: <span className="text-text">{kpis?.open_incidents ?? "--"}</span></li>
          <li>Active scenario: <span className="text-text">{kpis?.active_scenario ?? "none"}</span></li>
        </ul>
      </div>

      <div className="card lg:col-span-2">
        <p className="card-title">Operations Copilot (Preview)</p>
        <p className="mt-2 text-sm text-muted">A full chat backend is not connected yet. This UI shows interview-ready scaffolding and suggested analysis prompts.</p>
        <div className="mt-4 space-y-2">
          {prompts.map((prompt) => (
            <button key={prompt} className="w-full rounded border border-border bg-panelAlt px-3 py-2 text-left text-sm text-muted" disabled>
              {prompt}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded border border-border bg-panelAlt p-3">
          <label className="mb-2 block text-xs uppercase tracking-widest text-muted">Chat (disabled placeholder)</label>
          <textarea className="h-28 w-full resize-none rounded border border-border bg-bg p-2 text-sm text-muted" placeholder="Copilot chat will be enabled once backend chat APIs are available." disabled />
          <div className="mt-2 flex justify-end">
            <button className="rounded bg-accent/50 px-3 py-1.5 text-sm text-white" disabled>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
