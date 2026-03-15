"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/incidents", label: "Incidents" },
  { href: "/copilot", label: "Copilot" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-panelAlt/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">PlantOps Maestro Lite</h1>
          <p className="text-xs text-muted">Industrial operations command view</p>
        </div>
        <nav className="flex gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                  active
                    ? "border-accent bg-accent/20 text-white"
                    : "border-border bg-panel text-muted hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}