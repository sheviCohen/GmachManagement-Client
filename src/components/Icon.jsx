// אייקונים קטנים כ-SVG (בלי ספריה חיצונית)
const PATHS = {
  check: "M5 13l4 4L19 7",
  x: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  clock: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  alert: "M12 8v4m0 4h.01M10.3 3.9L2.5 17.5A2 2 0 004.2 20.5h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  info: "M12 11v5m0-8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  trash: "M5 7h14M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3",
  refresh: "M20 11a8 8 0 00-14-4M4 5v4h4M4 13a8 8 0 0014 4M20 19v-4h-4",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
