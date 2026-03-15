import type { Asset, Incident, Kpis, TimeseriesPoint } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return res.json();
}

export async function fetchKpis(): Promise<Kpis> {
  return getJson<Kpis>("/kpis");
}

export async function fetchAssets(): Promise<Asset[]> {
  return getJson<Asset[]>("/assets");
}

export async function fetchIncidents(): Promise<Incident[]> {
  return getJson<Incident[]>("/incidents");
}

export async function fetchTimeseries(): Promise<TimeseriesPoint[]> {
  const raw = await getJson<any>("/timeseries");

  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.timeseries)
    ? raw.timeseries
    : Array.isArray(raw?.rows)
    ? raw.rows
    : [];

  return rows.map((row: any) => ({
    timestamp: String(row.timestamp ?? row.time ?? ""),
    asset_id: String(row.asset_id ?? row.asset ?? ""),
    temperature: Number(row.temperature ?? 0),
    pressure: Number(row.pressure ?? 0),
    flow: Number(row.flow ?? 0),
    energy_usage: Number(row.energy_usage ?? 0),
    production_rate: Number(row.production_rate ?? 0),
    quality_score: Number(row.quality_score ?? 0),
  }));
}

export async function injectScenario(name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/demo/inject/${name}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to inject scenario: ${name}`);
}

export async function resetDemo(): Promise<void> {
  const res = await fetch(`${BASE_URL}/demo/reset`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset demo");
}
