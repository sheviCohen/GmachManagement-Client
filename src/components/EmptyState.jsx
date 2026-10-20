export default function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <div className="empty-art" aria-hidden="true">◌</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
