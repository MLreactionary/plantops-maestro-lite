import Link from "next/link";

export default function Nav() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div>
          <div className="brand">PlantOps Maestro Lite</div>
          <div className="brand-subtitle">
            Industrial operations monitoring demo
          </div>
        </div>

        <nav className="nav-links">
          <Link className="nav-link" href="/">
            Dashboard
          </Link>
          <Link className="nav-link" href="/incidents">
            Incidents
          </Link>
          <Link className="nav-link" href="/copilot">
            Copilot
          </Link>
        </nav>
      </div>
    </header>
  );
}
