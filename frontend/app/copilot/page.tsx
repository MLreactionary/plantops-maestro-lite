import { fetchKpis } from "../../lib/api";

export default async function CopilotPage() {
  const kpis = await fetchKpis();

  return (
    <main style={{ padding: 40 }}>
      <h1>Copilot</h1>
      <p>Plant status: {kpis.plant_status}</p>
      <p>Open incidents: {kpis.open_incidents}</p>

      <h3>Suggested questions</h3>
      <ul>
        <li>What changed in the plant?</li>
        <li>Why did plant health drop?</li>
        <li>What should the operator do next?</li>
      </ul>
    </main>
  );
}
