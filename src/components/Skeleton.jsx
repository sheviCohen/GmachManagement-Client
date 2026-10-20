// שלד טעינה: מראה מבנה עמוד לפני שהמידע מגיע, במקום מסך ריק
export default function Skeleton({ count = 6 }) {
  return (
    <div className="grid" aria-busy="true" aria-label="טוען">
      {Array.from({ length: count }, (_, i) => (
        <div className="card skeleton" key={i}>
          <div className="sk-line sk-lg" /><div className="sk-line" /><div className="sk-line sk-sm" />
        </div>
      ))}
    </div>
  );
}
