import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";
import Skeleton from "../components/Skeleton.jsx";
import StatusChip from "../components/StatusChip.jsx";
import { useToast } from "../components/Toast.jsx";
import { REQUEST_STATUS, formatDate, formatMoney } from "../utils/format.js";

export default function MyRequests() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    api.get("/api/loan-requests/mine")
      .then((list) => setItems([...list].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  async function cancel() {
    setBusy(true); setCancelError(null);
    try {
      await api.post(`/api/loan-requests/${cancelTarget.id}/cancel`);
      setCancelTarget(null);
      toast("הבקשה בוטלה וההלוואה חזרה למאגר.");
      load();
    } catch (err) {
      setCancelError(err.message);
      if (err.status === 409) load(); // המנהל כבר החליט: מציגים את המצב המעודכן
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head"><div><h1>הבקשות שלי</h1>
        <p className="muted">כאן רואים את מצב כל בקשה ומה השלב הבא.</p></div></div>

      {error && <Alert tone="danger" action={<button className="btn btn-ghost" onClick={load}>נסו שוב</button>}>{error}</Alert>}
      {!items && !error && <Skeleton count={3} />}

      {items?.length === 0 && (
        <EmptyState title="עוד לא הגשתם בקשות"
          action={<Link className="btn btn-primary" to="/loans">לצפייה בהלוואות</Link>}>
          כשתגישו בקשה היא תופיע כאן.
        </EmptyState>
      )}

      <div className="stack">
        {items?.map((r) => (
          <article className="card request-card" key={r.id}>
            <div className="request-top">
              <div>
                <div className="loan-amount sm">{formatMoney(r.requestedAmount)}</div>
                <div className="muted small">הוגשה ב-{formatDate(r.requestDate)}</div>
              </div>
              <StatusChip map={REQUEST_STATUS} status={r.status} />
            </div>

            {r.note && <p className="note">“{r.note}”</p>}

            {r.status === "Pending" && (
              <>
                <p className="hint">הבקשה אצל המנהל. ההלוואה שמורה עבורכם עד להחלטה.</p>
                <button className="btn btn-ghost" onClick={() => { setCancelError(null); setCancelTarget(r); }}>ביטול הבקשה</button>
              </>
            )}
            {r.status === "Approved" && (
              <Alert tone="info" title="ההלוואה אושרה">להחזרה עד {formatDate(r.approvedDueDate)}.</Alert>
            )}
            {r.status === "Rejected" && (
              <Alert tone="danger" title="הבקשה נדחתה">{r.rejectionReason}</Alert>
            )}
            {r.status === "Completed" && (
              <p className="hint">תודה! ההלוואה הוחזרה.</p>
            )}
          </article>
        ))}
      </div>

      {cancelTarget && (
        <Modal title="ביטול הבקשה" onClose={() => setCancelTarget(null)} busy={busy}>
          <p>לבטל את הבקשה על {formatMoney(cancelTarget.requestedAmount)}? ההלוואה תחזור למאגר ומישהו אחר יוכל לבקש אותה.</p>
          {cancelError && <Alert tone="danger">{cancelError}</Alert>}
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setCancelTarget(null)} disabled={busy}>לא, להשאיר</button>
            <button className="btn btn-danger" onClick={cancel} disabled={busy}>{busy ? "מבטלים..." : "כן, לבטל"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
