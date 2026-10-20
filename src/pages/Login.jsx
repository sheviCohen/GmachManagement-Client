import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Alert from "../components/Alert.jsx";
import Field, { fieldErrors } from "../components/Field.jsx";
import AuthLayout from "./AuthLayout.jsx";

export default function Login() {
  const { login, notice, clearNotice } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null); setErrors({}); clearNotice(); setBusy(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(user.role === "Admin" ? "/admin/requests" : "/loans", { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err.status === 401 ? "האימייל או הסיסמה שגויים." : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="ברוכים השבים"
      subtitle="התחברו כדי לראות הלוואות ולנהל בקשות."
      footer={<>עדיין אין לכם חשבון? <Link to="/register">הרשמה</Link></>}
    >
      {notice && <Alert tone="warning">{notice}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <form onSubmit={submit} noValidate>
        <Field label="אימייל" error={errors.email}>
          <input name="email" type="email" autoComplete="email" dir="ltr" value={form.email}
            onChange={change} required autoFocus />
        </Field>
        <Field label="סיסמה" error={errors.password}>
          <input name="password" type="password" autoComplete="current-password" dir="ltr"
            value={form.password} onChange={change} required />
        </Field>
        <button className="btn btn-primary btn-block" disabled={busy || !form.email || !form.password}>
          {busy ? "מתחברים..." : "התחברות"}
        </button>
      </form>
    </AuthLayout>
  );
}
