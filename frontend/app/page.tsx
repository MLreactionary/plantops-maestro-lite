import { fetchAssets, fetchIncidents, fetchKpis } from "../lib/api";
import ScenarioButtons from "./scenario-buttons";

export default async function Page() {
  const [kpis, assets, incidents] = await Promise.all([
    fetchKpis(),
    fetchAssets(),
    fetchIncidents(),
  ]);

  return (
    <main style={{ padding: 40 }}>
      <h1>PLANTOPS DASHBOARD LIVE</h1>

      <h2>Plant Status</h2>
      <p>Status: {kpis.plant_status}</p>
      <p>Quality Score: {kpis.avg_quality_score}</p>
      <p>Energy Usage: {kpis.avg_energy_usage}</p>
      <p>Production Rate: {kpis.avg_production_rate}</p>
      <p>Anomalies: {kpis.anomaly_count}</p>
      <p>Open Incidents: {kpis.open_incidents}</p>

      <h2>Demo Controls</h2>
      <ScenarioButtons />

      <h2>Assets</h2>
      <ul>
        {assets.map((a: any) => (
          <li key={a.asset_id}>
            {a.name} ({a.asset_type})
          </li>
        ))}
      </ul>

      <h2>Incidents</h2>
      {incidents.length === 0 ? (
        <p>No incidents</p>
      ) : (
        <ul>
          {incidents.map((i: any) => (
            <li key={i.incident_id}>
              <strong>{i.title}</strong> — {i.severity}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
