import { useEffect, useState } from "react";

export function Gallery({ images = [], alt, sku }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const current = images[index] || images[0];

  useEffect(() => {
    setIndex(0);
    setZoom(false);
  }, [images]);

  const onMove = (event) => {
    if (!zoom) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="pdp-gallery" style={{ "--sku": sku }}>
      <div className="pdp-thumbs" role="tablist" aria-label="Product images">
        {images.map((image, imageIndex) => (
          <button
            key={`${image.url}-${imageIndex}`}
            type="button"
            role="tab"
            aria-selected={imageIndex === index}
            className={imageIndex === index ? "is-on" : undefined}
            onClick={() => {
              setIndex(imageIndex);
              setZoom(false);
            }}
          >
            {image.url ? <img src={image.url} alt="" /> : <span className="pdp-thumbs__empty" />}
          </button>
        ))}
      </div>
      <div
        className={zoom ? "pdp-main is-zoom" : "pdp-main"}
        onClick={() => current?.url && setZoom((value) => !value)}
        onMouseMove={onMove}
        onMouseLeave={() => zoom && setOrigin({ x: 50, y: 50 })}
      >
        {current?.url ? (
          <img
            key={current.url}
            src={current.url}
            alt={current.alt || alt}
            style={
              zoom
                ? { transform: "scale(1.6)", transformOrigin: `${origin.x}% ${origin.y}%` }
                : undefined
            }
          />
        ) : (
          <div className="slide-face" data-kind="board">
            <div className="slide-object" />
          </div>
        )}
      </div>
    </div>
  );
}
