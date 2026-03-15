import Link from "next/link";

export default function Nav() {
  return (
    <nav style={{ display: "flex", gap: 16, padding: 20, borderBottom: "1px solid #ddd" }}>
      <Link href="/">Dashboard</Link>
      <Link href="/incidents">Incidents</Link>
      <Link href="/copilot">Copilot</Link>
    </nav>
  );
}
