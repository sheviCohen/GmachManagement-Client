import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Alert from "../components/Alert.jsx";
import Field, { fieldErrors } from "../components/Field.jsx";
import AuthLayout from "./AuthLayout.jsx";

// אותם כללים כמו בשרת, כדי לתת משוב מיידי. השרת הוא הסמכות הסופית.
const PHONE = /^0\d{8,9}$/;
const PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){2,})[A-Za-z\d]{8,64}$/;

function validate(f) {
  const e = {};
  if (!f.firstName.trim()) e.firstName = "נא למלא שם פרטי.";
  if (!f.lastName.trim()) e.lastName = "נא למלא שם משפחה.";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "כתובת האימייל אינה תקינה.";
  if (!PHONE.test(f.phone)) e.phone = "9-10 ספרות, מתחיל ב-0.";
  if (!PASSWORD.test(f.password)) e.password = "לפחות 8 תווים: אות גדולה, אות קטנה (באנגלית) ושתי ספרות.";
  return e;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setBusy(true);
    try {
      await register({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() });
      navigate("/loans", { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err.status === 409 ? "כתובת האימייל כבר רשומה. נסו להתחבר." : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="יצירת חשבון"
      subtitle="ההרשמה לוקחת דקה, ואחריה אפשר לבקש הלוואה."
      footer={<>כבר רשומים? <Link to="/login">התחברות</Link></>}
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <form onSubmit={submit} noValidate>
        <div className="row">
          <Field label="שם פרטי" error={errors.firstName}>
            <input name="firstName" value={form.firstName} onChange={change} autoComplete="given-name" autoFocus />
          </Field>
          <Field label="שם משפחה" error={errors.lastName}>
            <input name="lastName" value={form.lastName} onChange={change} autoComplete="family-name" />
          </Field>
        </div>
        <Field label="אימייל" error={errors.email}>
          <input name="email" type="email" dir="ltr" value={form.email} onChange={change} autoComplete="email" />
        </Field>
        <Field label="טלפון" error={errors.phone} hint="לדוגמה: 0501234567">
          <input name="phone" type="tel" dir="ltr" value={form.phone} onChange={change} autoComplete="tel" />
        </Field>
        <Field label="סיסמה" error={errors.password} hint="לפחות 8 תווים: אות גדולה, אות קטנה ושתי ספרות">
          <input name="password" type="password" dir="ltr" value={form.password} onChange={change} autoComplete="new-password" />
        </Field>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "יוצרים חשבון..." : "הרשמה"}
        </button>
      </form>
    </AuthLayout>
  );
}
