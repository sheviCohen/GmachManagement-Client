import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client.js";
import Alert from "../../components/Alert.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Field, { fieldErrors } from "../../components/Field.jsx";
import Icon from "../../components/Icon.jsx";
import Modal from "../../components/Modal.jsx";
import Pagination from "../../components/Pagination.jsx";
import Skeleton from "../../components/Skeleton.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import { useToast } from "../../components/Toast.jsx";
import { LOAN_STATUS, endOfDayIso, formatDate, formatMoney, hue, toDateInput, tomorrowInput } from "../../utils/format.js";

const TABS = [["", "הכול"], ["Available", "זמינות"], ["Reserved", "תפוסות"], ["Active", "פעילות"], ["AwaitingRenewal", "ממתינות לתאריך חדש"]];

export default function AdminLoans() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null); // { type: "edit" | "renew" | "delete", loan? }
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => { api.get("/api/categories").then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    api.get("/api/loans", { signal: controller.signal, query: { status, page, pageSize: 9, sortBy: "DueDate" } })
      .then(setData)
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [status, page, reloadKey]);

  const done = (message) => { setDialog(null); toast(message); reload(); };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>ניהול הלוואות</h1><p className="muted">המאגר שממנו לקוחות מבקשים הלוואות.</p></div>
        <button className="btn btn-gold" onClick={() => setDialog({ type: "edit" })}><Icon name="plus" /> הלוואה חדשה</button>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(([value, label]) => (
          <button key={label} role="tab" aria-selected={status === value}
            className={status === value ? "tab active" : "tab"}
            onClick={() => { setStatus(value); setPage(1); }}>{label}</button>
        ))}
      </div>

      {error && <Alert tone="danger" action={<button className="btn btn-ghost" onClick={reload}>נסו שוב</button>}>{error}</Alert>}
      {loading && !data ? <Skeleton /> : data && (
        data.items.length === 0 ? <EmptyState title="אין הלוואות במצב הזה" /> : (
          <>
            <div className={`grid ${loading ? "dim" : ""}`}>
              {data.items.map((loan) => (
                <article className={`card loan-card ${hue(loan.categories[0]?.id)}`} key={loan.id}>
                  <div className="request-top">
                    <div className="loan-amount">{formatMoney(loan.amount)}</div>
                    <StatusChip map={LOAN_STATUS} status={loan.status} />
                  </div>
                  <div className="loan-meta">להחזרה עד {formatDate(loan.dueDate)}</div>
                  <div className="tags">{loan.categories.map((c) => <span className={`tag ${hue(c.id)}`} key={c.id}>{c.name}</span>)}</div>
                  <div className="actions">
                    {loan.status === "AwaitingRenewal" && (
                      <button className="btn btn-primary" onClick={() => setDialog({ type: "renew", loan })}>קביעת תאריך חדש</button>
                    )}
                    <button className="btn btn-ghost" onClick={() => setDialog({ type: "edit", loan })}><Icon name="edit" /> עריכה</button>
                    <button className="btn btn-ghost danger-text" onClick={() => setDialog({ type: "delete", loan })}><Icon name="trash" /> מחיקה</button>
                  </div>
                </article>
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )
      )}

      {dialog?.type === "edit" && (
        <LoanFormModal loan={dialog.loan} categories={categories} onClose={() => setDialog(null)}
          onDone={() => done(dialog.loan ? "ההלוואה עודכנה." : "ההלוואה נוספה למאגר.")} />
      )}
      {dialog?.type === "renew" && (
        <RenewModal loan={dialog.loan} onClose={() => setDialog(null)} onDone={() => done("ההלוואה חזרה למאגר עם התאריך החדש.")} />
      )}
      {dialog?.type === "delete" && (
        <DeleteModal loan={dialog.loan} onClose={() => setDialog(null)} onDone={() => done("ההלוואה נמחקה.")} />
      )}
    </div>
  );
}

function LoanFormModal({ loan, categories, onClose, onDone }) {
  const [amount, setAmount] = useState(loan ? String(loan.amount) : "");
  const [dueDate, setDueDate] = useState(loan ? toDateInput(loan.dueDate) : tomorrowInput());
  const [selected, setSelected] = useState(loan ? loan.categories.map((c) => c.id) : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const toggle = (id) => setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null); setErrors({});
    const body = { amount: Number(amount), dueDate: endOfDayIso(dueDate), categoryIds: selected };
    try {
      if (loan) await api.put(`/api/loans/${loan.id}`, body);
      else await api.post("/api/loans", body);
      onDone();
    } catch (err) {
      setErrors(fieldErrors(err)); setError(err.message); setBusy(false);
    }
  }

  return (
    <Modal title={loan ? "עריכת הלוואה" : "הלוואה חדשה"} onClose={onClose} busy={busy}>
      <form onSubmit={submit}>
        <div className="row">
          <Field label="סכום (₪)" error={errors.amount}>
            <input type="number" min="1" step="1" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus required />
          </Field>
          <Field label="תאריך החזר" error={errors.dueDate}>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </Field>
        </div>
        <div className="field">
          <span className="field-label">קטגוריות</span>
          <div className="checks">
            {categories.map((c) => (
              <label key={c.id} className={selected.includes(c.id) ? "check on" : "check"}>
                <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /> {c.name}
              </label>
            ))}
          </div>
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>ביטול</button>
          <button className="btn btn-primary" disabled={busy || !amount || !dueDate}>{busy ? "שומרים..." : "שמירה"}</button>
        </div>
      </form>
    </Modal>
  );
}

function RenewModal({ loan, onClose, onDone }) {
  const [dueDate, setDueDate] = useState(tomorrowInput());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setBusy(true); setError(null);
    try { await api.post(`/api/loans/${loan.id}/renew`, { dueDate: endOfDayIso(dueDate) }); onDone(); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title="קביעת תאריך החזר חדש" onClose={onClose} busy={busy}>
      <p>הכסף ({formatMoney(loan.amount)}) חזר. אחרי קביעת תאריך ההלוואה תחזור למאגר וזמינה לבקשות.</p>
      <Field label="תאריך החזר חדש">
        <input type="date" min={tomorrowInput()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </Field>
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>ביטול</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy || !dueDate}>{busy ? "שומרים..." : "החזרה למאגר"}</button>
      </div>
    </Modal>
  );
}

function DeleteModal({ loan, onClose, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setBusy(true); setError(null);
    try { await api.delete(`/api/loans/${loan.id}`); onDone(); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title="מחיקת הלוואה" onClose={onClose} busy={busy}>
      <p>למחוק את ההלוואה של {formatMoney(loan.amount)}? אפשר למחוק רק הלוואה זמינה שלא הוגשו עליה בקשות.</p>
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>ביטול</button>
        <button className="btn btn-danger" onClick={submit} disabled={busy}>{busy ? "מוחקים..." : "מחיקה"}</button>
      </div>
    </Modal>
  );
}
