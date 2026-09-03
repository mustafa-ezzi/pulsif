import { useEffect } from "react";

export function useLockBody(lock) {
  useEffect(() => {
    if (!lock) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lock]);
}
