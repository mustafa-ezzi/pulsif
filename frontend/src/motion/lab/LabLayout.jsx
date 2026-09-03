import { NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../api/client";
import { useLabStore } from "../../store/labStore";

const LINKS = [
  { to: "/lab", label: "Overview", end: true },
  { to: "/lab/heroes", label: "Heroes" },
  { to: "/lab/cards", label: "Cards" },
  { to: "/lab/drawers", label: "Drawers" },
  { to: "/lab/flip", label: "Flip" },
];

export function LabLayout() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: 1,
    refetchInterval: 15000,
  });

  const lenisEnabled = useLabStore((state) => state.lenisEnabled);
  const heroMode = useLabStore((state) => state.heroMode);
  const forceReducedMotion = useLabStore((state) => state.forceReducedMotion);
  const showMarkers = useLabStore((state) => state.showMarkers);
  const setLenisEnabled = useLabStore((state) => state.setLenisEnabled);
  const setHeroMode = useLabStore((state) => state.setHeroMode);
  const setForceReducedMotion = useLabStore((state) => state.setForceReducedMotion);
  const setShowMarkers = useLabStore((state) => state.setShowMarkers);

  const healthClass = isError ? "err" : data?.ok ? "ok" : "";

  return (
    <>
      <header className="lab-bar">
        <strong className="lab-brand">Pulsif</strong>
        <nav className="lab-nav" aria-label="Motion lab">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="lab-status">
          <span className={`lab-dot ${healthClass}`} />
          {isLoading ? "API…" : isError ? "API down" : `${data.service} · ${data.database}`}
        </div>
        <div className="lab-controls">
          <button
            type="button"
            className={lenisEnabled ? "lab-chip on" : "lab-chip"}
            onClick={() => setLenisEnabled(!lenisEnabled)}
          >
            Lenis
          </button>
          <button
            type="button"
            className={heroMode === "pin-snap" ? "lab-chip on" : "lab-chip"}
            onClick={() => setHeroMode(heroMode === "pin-snap" ? "fade-up" : "pin-snap")}
          >
            {heroMode}
          </button>
          <button
            type="button"
            className={forceReducedMotion ? "lab-chip on" : "lab-chip"}
            onClick={() => setForceReducedMotion(!forceReducedMotion)}
          >
            Reduce
          </button>
          <button
            type="button"
            className={showMarkers ? "lab-chip on" : "lab-chip"}
            onClick={() => setShowMarkers(!showMarkers)}
          >
            Markers
          </button>
        </div>
      </header>
      <Outlet />
    </>
  );
}
