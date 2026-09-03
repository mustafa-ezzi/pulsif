export function VariantPicker({ colors = [], colorIndex, onColor, sizes = [], size, onSize }) {
  const color = colors[colorIndex];

  return (
    <div className="pdp-variants">
      <div>
        <p className="eyebrow">Color — {color?.name || "Select"}</p>
        <div className="swatches" role="listbox" aria-label="Colors">
          {colors.map((entry, index) => (
            <button
              key={entry.slug}
              type="button"
              role="option"
              aria-selected={index === colorIndex}
              aria-label={entry.name}
              title={entry.name}
              className={index === colorIndex ? "swatch is-on" : "swatch"}
              style={{ "--swatch": entry.hex || entry.token }}
              onClick={() => onColor(index)}
            />
          ))}
        </div>
      </div>
      {sizes.length ? (
        <div>
          <p className="eyebrow">Size</p>
          <div className="size-chips">
            {sizes.map((entry) => (
              <button
                key={entry}
                type="button"
                className={entry === size ? "size-chip is-on" : "size-chip"}
                onClick={() => onSize(entry)}
              >
                {entry}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
