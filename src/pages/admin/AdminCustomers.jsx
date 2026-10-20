import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import Alert from "../../components/Alert.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Pagination from "../../components/Pagination.jsx";
import Skeleton from "../../components/Skeleton.jsx";

export default function AdminCustomers() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    api.get("/api/users", { signal: controller.signal, query: { page, pageSize: 15 } })
      .then(setData)
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [page]);

  return (
    <div className="page">
      <div className="page-head"><div><h1>לקוחות</h1>
        <p className="muted">ציון האמינות עולה בהחזר בזמן ויורד באיחור. הוא גלוי למנהל בלבד.</p></div></div>
      {error && <Alert tone="danger">{error}</Alert>}
      {!data && !error && <Skeleton count={4} />}
      {data && (data.items.length === 0 ? <EmptyState title="עדיין אין לקוחות רשומים" /> : (
        <>
          <div className="card table-card">
            <table className="table">
              <thead><tr><th>שם</th><th>אימייל</th><th>טלפון</th><th>ציון</th></tr></thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td dir="ltr" className="ltr-cell">{u.email}</td>
                    <td dir="ltr" className="ltr-cell">{u.phone}</td>
                    <td><span className="score">{u.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      ))}
    </div>
  );
}
