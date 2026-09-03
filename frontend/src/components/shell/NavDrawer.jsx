import { NavLink } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { DrawerFrame } from "./DrawerFrame";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/catalog", label: "Catalog" },
  { to: "/catalog/women", label: "Women" },
  { to: "/catalog/men", label: "Men" },
  { to: "/contact", label: "Contact" },
  { to: "/faqs", label: "FAQs" },
  { to: "/account", label: "Account" },
];

export function NavDrawer() {
  const open = useUiStore((state) => state.navOpen);
  const closeAll = useUiStore((state) => state.closeAll);
  const openSearch = useUiStore((state) => state.openSearch);

  return (
    <DrawerFrame open={open} onClose={closeAll} titleId="nav-title">
      <p className="eyebrow">Menu</p>
      <h2 id="nav-title" className="display site-drawer__title">
        Pulsif
      </h2>
      <nav className="nav-drawer" aria-label="Mobile">
        {LINKS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={closeAll}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button className="nav-drawer__search" type="button" onClick={openSearch}>
        Search
      </button>
    </DrawerFrame>
  );
}
