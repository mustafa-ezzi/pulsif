import { Minus, Plus } from "lucide-react";

export function QtyStepper({ value, onChange, label = "Quantity" }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" className="qty__btn" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}>
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <span className="qty__value">{value}</span>
      <button type="button" className="qty__btn" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
