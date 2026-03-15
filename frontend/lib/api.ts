const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return res.json();
}

export async function fetchKpis() {
  return getJson("/kpis");
}

export async function fetchAssets() {
  return getJson("/assets");
}

export async function fetchIncidents() {
  return getJson("/incidents");
}

export async function injectScenario(name: string) {
  const res = await fetch(`${BASE_URL}/demo/inject/${name}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to inject scenario: ${name}`);
}

export async function resetDemo() {
  const res = await fetch(`${BASE_URL}/demo/reset`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset demo");
}
