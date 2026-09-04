const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Price ↑" },
  { id: "price_desc", label: "Price ↓" },
];

export function FilterBar({ query, onChange, onBeforeChange, facets }) {
  const colors = facets?.colors || [];
  const categories = facets?.categories || [];
  const price = facets?.price || { min: 0, max: 0 };

  const change = (key, value) => {
    onBeforeChange?.();
    onChange(key, value);
  };

  return (
    <div className="filter-bar">
      {categories.length ? (
        <div className="filter-bar__row">
          <button type="button" className={!query.category ? "is-on" : undefined} onClick={() => change("category", "")}>
            All types
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              className={query.category === category.slug ? "is-on" : undefined}
              onClick={() => change("category", query.category === category.slug ? "" : category.slug)}
            >
              {category.title}
            </button>
          ))}
        </div>
      ) : null}

      {colors.length ? (
        <div className="filter-bar__row">
          {colors.map((color) => (
            <button
              key={color.slug}
              type="button"
              className={query.color === color.slug ? "swatch-filter is-on" : "swatch-filter"}
              style={{ "--swatch": color.hex }}
              aria-label={color.name}
              title={color.name}
              onClick={() => change("color", query.color === color.slug ? "" : color.slug)}
            />
          ))}
        </div>
      ) : null}

      <div className="filter-bar__row filter-bar__row--tools">
        <label>
          Sort
          <select
            value={query.sort || "featured"}
            onChange={(event) => change("sort", event.target.value === "featured" ? "" : event.target.value)}
          >
            {SORTS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Min
          <input
            type="number"
            min={Math.floor(price.min || 0)}
            max={Math.ceil(price.max || 0)}
            placeholder={price.min ? String(Math.floor(price.min)) : "0"}
            defaultValue={query.price_min || ""}
            onBlur={(event) => change("price_min", event.target.value)}
          />
        </label>
        <label>
          Max
          <input
            type="number"
            min={Math.floor(price.min || 0)}
            max={Math.ceil(price.max || 0)}
            placeholder={price.max ? String(Math.ceil(price.max)) : ""}
            defaultValue={query.price_max || ""}
            onBlur={(event) => change("price_max", event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
