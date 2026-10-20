import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client.js";
import Alert from "../../components/Alert.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Field from "../../components/Field.jsx";
import Modal from "../../components/Modal.jsx";
import Pagination from "../../components/Pagination.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import { useToast } from "../../components/Toast.jsx";
import { REQUEST_STATUS, formatDate, formatMoney, toDateInput } from "../../utils/format.js";

const TABS = [["Pending", "ממתינות"], ["Approved", "הלוואות פעילות"], ["Completed", "הושלמו"], ["Rejected", "נדחו"], ["Cancelled", "בוטלו"], ["", "הכול"]];

export default function AdminRequests() {
  const toast = useToast();
  const [status, setStatus] = useState("Pending");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null); // { type: "reject" | "repay", request }
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    api.get("/api/loan-requests", { signal: controller.signal, query: { status, page, pageSize: 10 } })
      .then(setData)
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [status, page, reloadKey]);

  async function approve(request) {
    try {
      await api.post(`/api/loan-requests/${request.id}/approve`);
      toast("הבקשה אושרה. ההלוואה פעילה.");
    } catch (err) {
      toast(err.message, "danger");
    }
    reload();
  }

  return (
    <div className="page">
      <div className="page-head"><div><h1>בקשות להלוואות</h1>
        <p className="muted">אישור או דחייה של בקשות, ורישום קבלת הכסף בחזרה.</p></div></div>

      <div className="tabs" role="tablist">
        {TABS.map(([value, label]) => (
          <button key={label} role="tab" aria-selected={status === value}
            className={status === value ? "tab active" : "tab"}
            onClick={() => { setStatus(value); setPage(1); }}>{label}</button>
        ))}
      </div>

      {error && <Alert tone="danger" action={<button className="btn btn-ghost" onClick={reload}>נסו שוב</button>}>{error}</Alert>}
      {loading && !data ? <Skeleton count={3} /> : data && (
        data.items.length === 0 ? <EmptyState title="אין כאן בקשות">כשיגיעו בקשות במצב הזה הן יופיעו כאן.</EmptyState> : (
          <>
            <div className={`stack ${loading ? "dim" : ""}`}>
              {data.items.map((r) => (
                <article className="card request-card" key={r.id}>
                  <div className="request-top">
                    <div>
                      <div className="loan-amount sm">{formatMoney(r.requestedAmount)}</div>
                      <div className="muted small">להחזרה עד {formatDate(r.approvedDueDate || r.loanDueDate)} · הוגשה ב-{formatDate(r.requestDate)}</div>
                    </div>
                    <StatusChip map={REQUEST_STATUS} status={r.status} />
                  </div>
                  <div className="customer">
                    <strong>{r.userFullName}</strong>
                    <span dir="ltr">{r.userEmail}</span>
                    <span className="score" title="ציון אמינות (גלוי למנהל בלבד)">ציון {r.userScore}</span>
                  </div>
                  {r.note && <p className="note">“{r.note}”</p>}
                  {r.rejectionReason && <p className="hint">סיבת הדחייה: {r.rejectionReason}</p>}
                  {r.status === "Pending" && (
                    <div className="actions">
                      <button className="btn btn-primary" onClick={() => approve(r)}>אישור</button>
                      <button className="btn btn-ghost" onClick={() => setAction({ type: "reject", request: r })}>דחייה</button>
                    </div>
                  )}
                  {r.status === "Approved" && (
                    <div className="actions">
                      <button className="btn btn-primary" onClick={() => setAction({ type: "repay", request: r })}>רישום קבלת כסף</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )
      )}

      {action?.type === "reject" && (
        <RejectModal request={action.request} onClose={() => setAction(null)}
          onDone={() => { setAction(null); toast("הבקשה נדחתה, וההלוואה חזרה למאגר."); reload(); }} />
      )}
      {action?.type === "repay" && (
        <RepayModal request={action.request} onClose={() => setAction(null)}
          onDone={() => { setAction(null); toast("הכסף נרשם. אפשר לקבוע תאריך חדש בעמוד ההלוואות."); reload(); }} />
      )}
    </div>
  );
}

function RejectModal({ request, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setBusy(true); setError(null);
    try {
      await api.post(`/api/loan-requests/${request.id}/reject`, { reason });
      onDone();
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title="דחיית הבקשה" onClose={onClose} busy={busy}>
      <p>הסיבה תוצג ללקוח/ה ({request.userFullName}).</p>
      <Field label="סיבת הדחייה (חובה)">
        <textarea rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
      </Field>
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>ביטול</button>
        <button className="btn btn-danger" onClick={submit} disabled={busy || reason.trim().length < 2}>
          {busy ? "שומרים..." : "דחיית הבקשה"}
        </button>
      </div>
    </Modal>
  );
}

function RepayModal({ request, onClose, onDone }) {
  const [date, setDate] = useState(toDateInput());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setBusy(true); setError(null);
    try {
      // בוחרים יום, והשרת מקבל סוף אותו יום (כדי שהחזר "ביום האחרון" ייחשב בזמן)
      const received = new Date(`${date}T23:59:59`);
      const body = { receivedDate: (received > new Date() ? new Date() : received).toISOString() };
      await api.post(`/api/loan-requests/${request.id}/repayment`, body);
      onDone();
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title="רישום קבלת כסף" onClose={onClose} busy={busy}>
      <p>{request.userFullName} מחזיר/ה {formatMoney(request.requestedAmount)}. תאריך ההחזר שנקבע: {formatDate(request.approvedDueDate)}.</p>
      <Field label="באיזה תאריך התקבל הכסף?" hint="ההחזר נחשב בזמן אם התקבל עד תאריך ההחזר. הציון של הלקוח יתעדכן אוטומטית.">
        <input type="date" value={date} max={toDateInput()} onChange={(e) => setDate(e.target.value)} />
      </Field>
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>ביטול</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy || !date}>{busy ? "שומרים..." : "רישום"}</button>
      </div>
    </Modal>
  );
}
