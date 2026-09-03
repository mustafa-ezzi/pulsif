import { useLockBody } from "../../hooks/useLockBody";

export function SizeGuide({ guide, onClose }) {
  useLockBody(Boolean(guide));
  if (!guide) return null;

  const headers = guide.headers || [];
  const rows = guide.rows || [];
  const how = guide.how || [];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-paper"
        role="dialog"
        aria-labelledby="size-guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">Fit</p>
        <h2 id="size-guide-title" className="display">
          Size guide
        </h2>
        {rows.length ? (
          <table className="size-table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.join("-")}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No chart on this piece. Write us from Contact if you need a size read.</p>
        )}
        {how.length ? (
          <ul className="size-how">
            {how.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <button className="cta-volt neu-btn" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
