import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken, setUnauthorizedHandler } from "../api/client.js";

const STORAGE_KEY = "gmach.auth";
const AuthContext = createContext(null);

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && new Date(saved.expiresAt) > new Date()) return saved;
  } catch { /* אין גישה ל-localStorage או מידע פגום */ }
  return null;
}

function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* ממשיכים בלי שמירה */ }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = loadSession();
    setToken(saved?.token ?? null); // חשוב: הטוקן חייב להיות מוגדר לפני הבקשה הראשונה
    return saved;
  });
  const [notice, setNotice] = useState(null);

  const logout = useCallback((message = null) => {
    setToken(null);
    saveSession(null);
    setSession(null);
    setNotice(message);
  }, []);

  const startSession = useCallback((response) => {
    const next = { token: response.token, expiresAt: response.expiresAt, user: response.user };
    setToken(next.token);
    saveSession(next);
    setSession(next);
    setNotice(null);
    return next.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return startSession(response);
  }, [startSession]);

  const register = useCallback(async (details) => {
    await api.post("/api/users", details);
    return login(details.email, details.password); // אחרי הרשמה נכנסים אוטומטית
  }, [login]);

  // אם השרת מחזיר 401 באמצע העבודה, הטוקן פג
  useEffect(() => {
    setUnauthorizedHandler(() => logout("ההתחברות פגה. התחברו מחדש כדי להמשיך."));
  }, [logout]);

  // יציאה אוטומטית ברגע שהטוקן פג, גם אם המשתמשת לא עושה כלום
  useEffect(() => {
    if (!session) return undefined;
    const msLeft = new Date(session.expiresAt) - new Date();
    const timer = setTimeout(
      () => logout("ההתחברות פגה. התחברו מחדש כדי להמשיך."),
      Math.max(msLeft, 0)
    );
    return () => clearTimeout(timer);
  }, [session, logout]);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    isAdmin: session?.user?.role === "Admin",
    notice,
    clearNotice: () => setNotice(null),
    login, register, logout,
  }), [session, notice, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
