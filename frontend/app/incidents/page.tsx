import { fetchIncidents } from "../../lib/api";

export default async function IncidentsPage() {
  const incidents = await fetchIncidents();

  return (
    <main style={{ padding: 40 }}>
      <h1>Incidents</h1>

      {incidents.length === 0 ? (
        <p>No incidents. Plant is healthy.</p>
      ) : (
        <ul>
          {incidents.map((i: any) => (
            <li key={i.incident_id}>
              <strong>{i.title}</strong> — {i.severity} — {i.status}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
