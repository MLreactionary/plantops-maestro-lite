import { fetchKpis } from "../../lib/api";

function statusBadgeClass(status: string) {
  if (status === "healthy") return "badge badge-healthy";
  if (status === "critical") return "badge badge-critical";
  return "badge badge-degraded";
}

export default async function CopilotPage() {
  const kpis = await fetchKpis();

  return (
    <main>
      <div className="page-header">
        <h1 className="page-title">Copilot</h1>
        <p className="page-subtitle">
          Lightweight operator-assist surface for contextual plant questions.
        </p>
      </div>

      <div className="grid grid-panels">
        <section className="card">
          <h2 className="card-title">Current Context</h2>
          <p className="card-subtitle">
            This page can evolve into a grounded assistant using the same plant
            state shown on the dashboard.
          </p>

          <div className="metric-stack">
            <div className="metric-row">
              <span className="muted">Plant Status</span>
              <span className={statusBadgeClass(kpis.plant_status)}>
                {kpis.plant_status}
              </span>
            </div>
            <div className="metric-row">
              <span className="muted">Open Incidents</span>
              <strong>{kpis.open_incidents}</strong>
            </div>
            <div className="metric-row">
              <span className="muted">Anomaly Count</span>
              <strong>{kpis.anomaly_count}</strong>
            </div>
            <div className="metric-row">
              <span className="muted">Active Scenario</span>
              <strong>{kpis.active_scenario ?? "none"}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Suggested Prompts</h2>
          <p className="card-subtitle">
            Example questions an operator or engineer might ask.
          </p>
          <ul className="prompt-list">
            <li>What changed in the plant over the last cycle?</li>
            <li>Why did plant health degrade?</li>
            <li>Which asset is most likely responsible for the issue?</li>
            <li>What should the operator check next?</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
