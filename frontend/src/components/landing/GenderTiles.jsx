import { Link } from "react-router-dom";

export function GenderTiles({ tiles }) {
  const items = tiles?.length
    ? tiles
    : [
        { label: "Women", href: "/catalog/women" },
        { label: "Men", href: "/catalog/men" },
        { label: "Shop All", href: "/catalog" },
      ];

  return (
    <section className="gender-tiles">
      {items.map((tile) => (
        <Link key={tile.href} to={tile.href} className="gender-tile">
          {tile.label}
        </Link>
      ))}
    </section>
  );
}
