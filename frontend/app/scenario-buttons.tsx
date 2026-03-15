"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function ScenarioButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function run(path: string, label: string) {
    setLoading(label);
    try {
      await fetch(`${API}${path}`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="button-row">
      <button
        className="button button-primary"
        onClick={() => run("/demo/inject/sensor_drift", "sensor")}
      >
        {loading === "sensor" ? "Applying..." : "Inject Sensor Drift"}
      </button>

      <button
        className="button button-primary"
        onClick={() => run("/demo/inject/cooling_valve_stiction", "cooling")}
      >
        {loading === "cooling" ? "Applying..." : "Inject Cooling Valve"}
      </button>

      <button
        className="button button-primary"
        onClick={() => run("/demo/inject/pump_degradation", "pump")}
      >
        {loading === "pump" ? "Applying..." : "Inject Pump Degradation"}
      </button>

      <button
        className="button button-danger"
        onClick={() => run("/demo/reset", "reset")}
      >
        {loading === "reset" ? "Resetting..." : "Reset Plant"}
      </button>
    </div>
  );
}
