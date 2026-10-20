const money = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });

export const formatMoney = (value) => money.format(value);
export const formatDate = (value) => (value ? date.format(new Date(value)) : "");

// ערך ל-<input type="date"> בפורמט yyyy-MM-dd לפי השעון המקומי
export const toDateInput = (value) => {
  const d = value ? new Date(value) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// תאריך שנבחר (yyyy-MM-dd) הופך לסוף אותו יום בשעון המקומי, ב-UTC
export const endOfDayIso = (dateInput) => new Date(`${dateInput}T23:59:59`).toISOString();

export const tomorrowInput = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateInput(d);
};

// כמה ימים נשארו עד תאריך ההחזר (לתגית על הכרטיס)
export const daysUntil = (value) =>
  Math.max(0, Math.ceil((new Date(value) - Date.now()) / 86400000));

// כל קטגוריה מקבלת גוון קבוע (לפי המספר שלה), כך שאותה קטגוריה תמיד באותו צבע
export const hue = (id) => `h${Math.abs(Number(id) || 0) % 6}`;

export const LOAN_STATUS = {
  Available: { label: "זמינה", tone: "success" },
  Reserved: { label: "תפוסה", tone: "warning" },
  Active: { label: "פעילה", tone: "info" },
  AwaitingRenewal: { label: "ממתינה לתאריך חדש", tone: "neutral" },
};

export const REQUEST_STATUS = {
  Pending: { label: "ממתינה להחלטה", tone: "warning" },
  Approved: { label: "אושרה", tone: "info" },
  Rejected: { label: "נדחתה", tone: "danger" },
  Cancelled: { label: "בוטלה", tone: "neutral" },
  Completed: { label: "הושלמה", tone: "success" },
};
