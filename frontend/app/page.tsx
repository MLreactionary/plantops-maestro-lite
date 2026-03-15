import KpiCard from "../components/kpi-card";
import LineChart from "../components/line-chart";
import {
  fetchAssets,
  fetchIncidents,
  fetchKpis,
  fetchTimeseries,
} from "../lib/api";
import ScenarioButtons from "./scenario-buttons";

function statusBadgeClass(status: string) {
  if (status === "healthy") return "badge badge-healthy";
  if (status === "critical") return "badge badge-critical";
  return "badge badge-degraded";
}

function severityClass(severity: string) {
  const value = severity.toLowerCase();
  if (value === "high") return "severity severity-high";
  if (value === "medium") return "severity severity-medium";
  return "severity severity-low";
}

function shortLabel(timestamp: string) {
  const raw = timestamp.split("T")[1] ?? timestamp;
  return raw.slice(0, 5);
}

export default async function Page() {
  const [kpis, assets, incidents, timeseries] = await Promise.all([
    fetchKpis(),
    fetchAssets(),
    fetchIncidents(),
    fetchTimeseries(),
  ]);

  const reactorTrend = timeseries
    .filter((row) => row.asset_id === "reactor_1")
    .slice(-6)
    .map((row) => ({
      label: shortLabel(row.timestamp),
      value: row.temperature,
    }));

  return (
    <main>
      <div className="page-header">
        <h1 className="page-title">Operations Dashboard</h1>
        <p className="page-subtitle">
          Live overview of plant health, synthetic KPI performance, and active
          operational deviations.
        </p>
      </div>

      <div className="grid grid-kpis">
        <KpiCard
          label="Plant Status"
          value={kpis.plant_status}
          meta={`${kpis.open_incidents} open incidents`}
        />
        <KpiCard
          label="Quality Score"
          value={kpis.avg_quality_score.toFixed(2)}
          meta="Average product quality"
        />
        <KpiCard
          label="Energy Usage"
          value={kpis.avg_energy_usage.toFixed(2)}
          meta="Average system energy draw"
        />
        <KpiCard
          label="Production Rate"
          value={kpis.avg_production_rate.toFixed(2)}
          meta={`${kpis.anomaly_count} anomalies detected`}
        />
      </div>

      <div className="grid grid-panels">
        <section className="card">
          <h2 className="card-title">Plant Health</h2>
          <p className="card-subtitle">
            Current operating condition derived from synthetic KPI signals and
            incident rollups.
          </p>

          <div className="metric-stack">
            <div className="metric-row">
              <span className="muted">Status</span>
              <span className={statusBadgeClass(kpis.plant_status)}>
                {kpis.plant_status}
              </span>
            </div>
            <div className="metric-row">
              <span className="muted">Anomalies</span>
              <strong>{kpis.anomaly_count}</strong>
            </div>
            <div className="metric-row">
              <span className="muted">Open Incidents</span>
              <strong>{kpis.open_incidents}</strong>
            </div>
            <div className="metric-row">
              <span className="muted">Active Scenario</span>
              <strong>{kpis.active_scenario ?? "none"}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Demo Controls</h2>
          <p className="card-subtitle">
            Trigger a synthetic failure mode to demonstrate anomaly detection
            and incident surfacing.
          </p>
          <ScenarioButtons />
        </section>
      </div>

      <div className="grid grid-panels">
        <LineChart
          title="Recent Trends"
          subtitle="Reactor-1 temperature over the latest six time steps."
          points={reactorTrend}
          unit="°"
        />

        <section className="card">
          <h2 className="card-title">Incidents</h2>
          <p className="card-subtitle">
            Incident rollups generated from detected plant anomalies.
          </p>

          {incidents.length === 0 ? (
            <div className="empty-state">
              <div className="incident-title">No active incidents</div>
              <div className="incident-meta">
                The plant is currently stable under the healthy baseline.
              </div>
            </div>
          ) : (
            <div className="incident-list">
              {incidents.map((incident: any) => (
                <div className="incident-item" key={incident.incident_id}>
                  <div className="incident-topline">
                    <div className="incident-title">{incident.title}</div>
                    <span className={severityClass(incident.severity)}>
                      {incident.severity}
                    </span>
                  </div>
                  <div className="incident-meta">
                    Asset: {incident.asset_id} · Status: {incident.status}
                  </div>
                  {incident.summary ? (
                    <div className="incident-meta" style={{ marginTop: 8 }}>
                      {incident.summary}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="card-title">Assets</h2>
        <p className="card-subtitle">
          Core assets currently tracked by the monitoring service.
        </p>

        <div className="asset-list">
          {assets.map((asset: any) => (
            <div className="asset-item" key={asset.asset_id}>
              <div className="asset-name">{asset.name}</div>
              <div className="asset-meta">
                Type: {asset.asset_type} · ID: {asset.asset_id}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
