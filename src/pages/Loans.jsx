import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../components/Toast.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Pagination from "../components/Pagination.jsx";
import RequestModal from "../components/RequestModal.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { daysUntil, formatDate, formatMoney, hue } from "../utils/format.js";

const EMPTY_FILTERS = { categoryId: "", minAmount: "", maxAmount: "", sortBy: "Amount", descending: "false" };

export default function Loans() {
  const toast = useToast();
  const { user } = useAuth();
  const [filters, setFilters] = useState(EMPTY_FILTERS);       // מה שמוצג בטופס
  const [applied, setApplied] = useState(EMPTY_FILTERS);       // מה שנשלח לשרת
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    api.get("/api/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    Promise.all([
      api.get("/api/loans", { signal: controller.signal, query: { ...applied, page, pageSize: 9 } }),
      api.get("/api/loan-requests/mine", { signal: controller.signal }),
    ])
      .then(([loans, requests]) => { setData(loans); setMine(requests); })
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [applied, page, reloadKey]);

  // מותר בקשה אחת פתוחה: ממתינה, או מאושרת שטרם הוחזרה
  const open = mine.find((r) => r.status === "Pending" || r.status === "Approved");

  function apply(e) { e.preventDefault(); setPage(1); setApplied(filters); }
  function clear() { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setPage(1); }
  const set = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <span className="hero-kicker">הלוואות ללא ריבית</span>
          <h1>שלום {user.firstName}, מה נבחר היום?</h1>
          <p>בחרו הלוואה מהמאגר, שלחו בקשה והמתינו להחלטת המנהל. הכול שקוף וברור בכל שלב.</p>
        </div>
        <ol className="steps">
          <li><b>1</b><span>בוחרים הלוואה</span></li>
          <li><b>2</b><span>שולחים בקשה</span></li>
          <li><b>3</b><span>מקבלים החלטה</span></li>
        </ol>
        {data && (
          <div className="hero-stat">
            <strong>{data.totalCount}</strong>
            <span>הלוואות זמינות עכשיו</span>
          </div>
        )}
      </section>

      {open?.status === "Pending" && (
        <Alert tone="warning" title="יש לכם בקשה שממתינה להחלטה"
          action={<Link className="btn btn-ghost" to="/my-requests">לצפייה בבקשה</Link>}>
          בקשה על הלוואה של {formatMoney(open.requestedAmount)}. עד שתתקבל החלטה אי אפשר להגיש בקשה נוספת.
        </Alert>
      )}
      {open?.status === "Approved" && (
        <Alert tone="info" title="יש לכם הלוואה פעילה"
          action={<Link className="btn btn-ghost" to="/my-requests">פרטים</Link>}>
          {formatMoney(open.requestedAmount)} להחזרה עד {formatDate(open.approvedDueDate)}. אפשר לבקש הלוואה חדשה אחרי ההחזר.
        </Alert>
      )}

      <form className="filters" onSubmit={apply}>
        <label>קטגוריה
          <select name="categoryId" value={filters.categoryId} onChange={set}>
            <option value="">הכול</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>מסכום
          <input name="minAmount" type="number" min="0" inputMode="numeric" value={filters.minAmount} onChange={set} />
        </label>
        <label>עד סכום
          <input name="maxAmount" type="number" min="0" inputMode="numeric" value={filters.maxAmount} onChange={set} />
        </label>
        <label>מיון
          <select name="sortBy" value={filters.sortBy} onChange={set}>
            <option value="Amount">לפי סכום</option>
            <option value="DueDate">לפי תאריך החזר</option>
          </select>
        </label>
        <label>סדר
          <select name="descending" value={filters.descending} onChange={set}>
            <option value="false">מהקטן לגדול</option>
            <option value="true">מהגדול לקטן</option>
          </select>
        </label>
        <div className="filters-actions">
          <button className="btn btn-primary">סינון</button>
          <button type="button" className="btn btn-ghost" onClick={clear}>ניקוי</button>
        </div>
      </form>

      {error && <Alert tone="danger" title="לא הצלחנו לטעון את ההלוואות"
        action={<button className="btn btn-ghost" onClick={reload}>נסו שוב</button>}>{error}</Alert>}

      {loading && !data ? <Skeleton /> : data && (
        data.items.length === 0 ? (
          <EmptyState title="אין כרגע הלוואות שמתאימות"
            action={<button className="btn btn-ghost" onClick={clear}>ניקוי הסינון</button>}>
            ייתכן שכל ההלוואות תפוסות כרגע, או שהסינון צר מדי.
          </EmptyState>
        ) : (
          <>
            <div className={`grid ${loading ? "dim" : ""}`}>
              {data.items.map((loan) => (
                <article className={`card loan-card ${hue(loan.categories[0]?.id)}`} key={loan.id}>
                  <div className="loan-top">
                    <span className="coin">₪</span>
                    <span className="due-badge">עוד {daysUntil(loan.dueDate)} ימים להחזר</span>
                  </div>
                  <div className="loan-amount">{formatMoney(loan.amount)}</div>
                  <div className="loan-meta">להחזרה עד {formatDate(loan.dueDate)}</div>
                  <div className="tags">
                    {loan.categories.map((c) => <span className={`tag ${hue(c.id)}`} key={c.id}>{c.name}</span>)}
                  </div>
                  <button className="btn btn-primary btn-block" disabled={!!open}
                    title={open ? "יש לכם כבר בקשה פתוחה או הלוואה פעילה" : undefined}
                    onClick={() => setSelected(loan)}>
                    בקשת הלוואה
                  </button>
                </article>
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )
      )}

      {selected && (
        <RequestModal
          loan={selected}
          onClose={() => setSelected(null)}
          onConflict={reload}
          onSubmitted={() => {
            setSelected(null);
            toast("הבקשה נשלחה. נעדכן אותך כשהמנהל יחליט.");
            reload();
          }}
        />
      )}
    </div>
  );
}
