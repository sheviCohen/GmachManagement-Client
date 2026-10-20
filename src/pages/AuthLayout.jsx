// מסגרת משותפת להתחברות והרשמה: צד ערכי + צד טופס
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
        <div className="brand brand-lg"><span className="brand-mark">✦</span> גמ"ח</div>
        <h1>עזרה הדדית, <em>בלי ריבית.</em></h1>
        <ul>
          <li>הלוואות ללא ריבית</li>
          <li>בחירה פשוטה מתוך המאגר</li>
          <li>מעקב אחרי הבקשה בכל שלב</li>
          <li>שקיפות מלאה והחלטה מהירה</li>
        </ul>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </main>
    </div>
  );
}
