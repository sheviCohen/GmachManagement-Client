# גמ"ח – לקוח React

צד הלקוח של מערכת הגמ"ח (Vite + React + React Router).

## הרצה מקומית
1. ודאו שהשרת רץ (`https://localhost:7092`).
2. התקנה (פעם אחת):
```
npm install
```
3. הרצה:
```
npm run dev
```
4. פתחו http://localhost:5173

כתובת השרת נקבעת במשתנה `VITE_API_URL` (ראו `.env.example`). בלי קובץ `.env` ברירת המחדל היא `https://localhost:7092`.

## מסכים
- התחברות והרשמה
- הלוואות זמינות (סינון, מיון, דפדוף, הגשת בקשה)
- הבקשות שלי (מעקב וביטול)
- מנהל: בקשות, ניהול הלוואות, לקוחות

## פריסה (Render – Static Site)
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- משתנה סביבה: `VITE_API_URL` = כתובת ה-API ב-Render
- הקובץ `public/_redirects` דואג שרענון בכתובת פנימית (כמו `/loans`) יעבוד.
