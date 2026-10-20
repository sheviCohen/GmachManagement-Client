export default function StatusChip({ map, status }) {
  const info = map[status] || { label: status, tone: "neutral" };
  return <span className={`chip chip-${info.tone}`}>{info.label}</span>;
}
