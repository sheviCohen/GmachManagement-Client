// שדה טופס עם תווית, הודעת עזר והודעת שגיאה צמודה
export default function Field({ label, error, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

// המרת errors מהשרת ({ "Phone": ["..."] }) למפה לפי שם שדה באותיות קטנות בהתחלה
export function fieldErrors(apiError) {
  const result = {};
  Object.entries(apiError?.errors || {}).forEach(([key, messages]) => {
    const name = key.charAt(0).toLowerCase() + key.slice(1);
    result[name] = messages[0];
  });
  return result;
}
