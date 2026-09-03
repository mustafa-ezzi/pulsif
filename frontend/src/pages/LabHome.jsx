import { Link } from "react-router-dom";

export function LabHome() {
  return (
    <main className="lab-home">
      <p className="eyebrow">Phase 0</p>
      <h1 className="display">Motion lab</h1>
      <p>
        Prove Pellicor-level motion before we build the real storefront. The live shell is
        now at <Link to="/">the storefront</Link> — header, footer, drawers, and every public
        route.
      </p>
      <div className="lab-grid">
        <Link className="lab-tile" to="/lab/heroes">
          <p className="eyebrow">01</p>
          <h2>Hero stack</h2>
          <span className="text-link">Pin-snap vs fade-up →</span>
        </Link>
        <Link className="lab-tile" to="/lab/cards">
          <p className="eyebrow">02</p>
          <h2>Product cards</h2>
          <span className="text-link">Embla + pink / purple / black →</span>
        </Link>
        <Link className="lab-tile" to="/lab/drawers">
          <p className="eyebrow">03</p>
          <h2>Drawers</h2>
          <span className="text-link">Cart & search chrome →</span>
        </Link>
        <Link className="lab-tile" to="/lab/flip">
          <p className="eyebrow">04</p>
          <h2>Flip filters</h2>
          <span className="text-link">Catalog reflow →</span>
        </Link>
      </div>
      <div className="lab-notes">
        <p className="eyebrow">How to judge</p>
        <ul>
          <li>Heroes: four full-viewport chapters, Ken Burns, snap. Toggle fade-up if pin janks.</li>
          <li>Lenis starts off. Turn it on only on desktop and watch for double-scroll or pin slip.</li>
          <li>Reduce kills pin/scrub and plays instant states. Also respects OS reduced motion.</li>
          <li>Cards: drag, arrows, Choose, swatches that retarget slides and tint the wash.</li>
          <li>API pill in the bar should go green when Django is running on :8001.</li>
        </ul>
      </div>
    </main>
  );
}
