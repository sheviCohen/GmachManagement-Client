export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="דפדוף">
      <button className="btn btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>הקודם</button>
      <span>עמוד {page} מתוך {totalPages}</span>
      <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>הבא</button>
    </nav>
  );
}
