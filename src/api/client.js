// כל הפניות לשרת עוברות כאן: כתובת אחת, טוקן אחד, ופורמט שגיאות אחד.
const BASE_URL = (import.meta.env.VITE_API_URL || "https://localhost:7092").replace(/\/$/, "");

// שגיאה שמגיעה מהשרת (או מהרשת) בצורה אחידה
export class ApiError extends Error {
  constructor(status, message, errors = null, traceId = null) {
    super(message);
    this.status = status;
    this.errors = errors; // { fieldName: ["הודעה", ...] } בשגיאות ולידציה (400)
    this.traceId = traceId;
  }
}

let token = null;
let onUnauthorized = () => {};

export const setToken = (value) => { token = value; };
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, path, { body, query, signal } = {}) {
  const url = new URL(BASE_URL + path);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(0, "אין חיבור לשרת. בדקו שהשרת פועל ונסו שוב.");
  }

  if (response.status === 204) return null;

  let data = null;
  try { data = await response.json(); } catch { /* תשובה בלי גוף */ }

  if (!response.ok) {
    // 401 עם טוקן = החיבור פג. בלי טוקן (למשל סיסמה שגויה) זו שגיאה רגילה.
    if (response.status === 401 && token) onUnauthorized();
    throw new ApiError(
      response.status,
      data?.message || "אירעה שגיאה. נסו שוב.",
      data?.errors || null,
      data?.traceId || null
    );
  }
  return data;
}

export const api = {
  get: (path, options) => request("GET", path, options),
  post: (path, body, options) => request("POST", path, { ...options, body }),
  put: (path, body, options) => request("PUT", path, { ...options, body }),
  delete: (path, options) => request("DELETE", path, options),
};
