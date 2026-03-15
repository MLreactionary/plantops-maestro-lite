"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function ScenarioButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function run(path: string, label: string) {
    setLoading(label);
    await fetch(`${API}${path}`, { method: "POST" });
    setLoading("");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
      <button onClick={() => run("/demo/inject/sensor_drift", "sensor")}>
        {loading === "sensor" ? "Working..." : "Inject Sensor Drift"}
      </button>

      <button onClick={() => run("/demo/inject/cooling_valve_stiction", "cooling")}>
        {loading === "cooling" ? "Working..." : "Inject Cooling Valve"}
      </button>

      <button onClick={() => run("/demo/inject/pump_degradation", "pump")}>
        {loading === "pump" ? "Working..." : "Inject Pump Degradation"}
      </button>

      <button onClick={() => run("/demo/reset", "reset")}>
        {loading === "reset" ? "Working..." : "Reset Plant"}
      </button>
    </div>
  );
}
