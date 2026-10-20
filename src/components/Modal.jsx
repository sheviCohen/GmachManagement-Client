import { useEffect } from "react";
import Icon from "./Icon.jsx";

// חלון קופץ: נסגר ב-Escape או בלחיצה על הרקע, ולא נסגר בזמן שליחה
export default function Modal({ title, children, onClose, busy = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, busy]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} disabled={busy} aria-label="סגירה">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
