import { Link } from "react-router-dom";

const DEFAULT_TILES = [
  { label: "Boards", href: "/catalog?category=boards" },
  { label: "Bands", href: "/catalog?category=bands" },
  { label: "Shop All", href: "/catalog" },
];

export function GenderTiles({ tiles }) {
  const items = tiles?.length ? tiles : DEFAULT_TILES;

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
