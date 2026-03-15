import { fetchIncidents } from "../../lib/api";

function severityClass(severity: string) {
  const value = severity.toLowerCase();
  if (value === "high") return "severity severity-high";
  if (value === "medium") return "severity severity-medium";
  return "severity severity-low";
}

export default async function IncidentsPage() {
  const incidents = await fetchIncidents();

  return (
    <main>
      <div className="page-header">
        <h1 className="page-title">Incidents</h1>
        <p className="page-subtitle">
          Review active anomaly rollups and their operational severity.
        </p>
      </div>

      <section className="card">
        <h2 className="card-title">Active Incident Feed</h2>
        <p className="card-subtitle">
          Each incident is created from synthetic anomaly patterns detected by
          the backend service.
        </p>

        {incidents.length === 0 ? (
          <div className="empty-state">
            <div className="incident-title">No incidents detected</div>
            <div className="incident-meta">
              The plant is operating under a stable baseline condition.
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
                  Incident ID: {incident.incident_id}
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
    </main>
  );
}
