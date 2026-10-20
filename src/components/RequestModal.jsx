import { useState } from "react";
import { api } from "../api/client.js";
import { formatDate, formatMoney } from "../utils/format.js";
import Alert from "./Alert.jsx";
import Field from "./Field.jsx";
import Modal from "./Modal.jsx";

// הגשת בקשה להלוואה. החלק החשוב: הצגה ברורה של 409 (מישהו הקדים אותנו).
export default function RequestModal({ loan, onClose, onSubmitted, onConflict }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null);

  async function submit() {
    setBusy(true); setError(null);
    try {
      await api.post("/api/loan-requests", { loanId: loan.id, note: note.trim() || null });
      onSubmitted();
    } catch (err) {
      if (err.status === 409) {
        setConflict(err.message);
        onConflict(); // מרעננים את הרשימה ברקע, כדי שהמצב המעודכן יופיע
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  if (conflict) {
    return (
      <Modal title="לא הצלחנו לשמור את ההלוואה" onClose={onClose}>
        <Alert tone="danger" title="מישהו הקדים אתכם">
          {conflict}
        </Alert>
        <p className="muted">הרשימה התעדכנה ברקע. אפשר לבחור הלוואה אחרת שעדיין זמינה.</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>חזרה לרשימה</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="בקשת הלוואה" onClose={onClose} busy={busy}>
      <div className="summary">
        <div><span className="muted">סכום</span><strong>{formatMoney(loan.amount)}</strong></div>
        <div><span className="muted">תאריך החזר</span><strong>{formatDate(loan.dueDate)}</strong></div>
      </div>
      <Field label="הערה למנהל (לא חובה)" hint="אפשר לכתוב כאן כל פרט שיעזור להחלטה.">
        <textarea rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      {error && <Alert tone="danger">{error}</Alert>}
      <p className="muted small">אחרי השליחה ההלוואה נשמרת עבורכם עד שהמנהל יחליט. אפשר לבטל את הבקשה כל עוד היא ממתינה.</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>ביטול</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? "שולחים..." : "שליחת הבקשה"}
        </button>
      </div>
    </Modal>
  );
}
