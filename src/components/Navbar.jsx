import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Icon from "./Icon.jsx";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const links = isAdmin
    ? [["/admin/requests", "בקשות"], ["/admin/loans", "הלוואות"], ["/admin/customers", "לקוחות"]]
    : [["/loans", "הלוואות זמינות"], ["/my-requests", "הבקשות שלי"]];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand"><span className="brand-mark">✦</span> גמ"ח</div>
        <nav className="nav-links">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>{label}</NavLink>
          ))}
        </nav>
        <div className="nav-user">
          <span className="avatar" aria-hidden="true">{user.firstName?.[0]}</span>
          <span className="nav-name">{user.firstName} {user.lastName}{isAdmin ? " · מנהל" : ""}</span>
          <button className="btn btn-ghost" onClick={() => { logout(); navigate("/login"); }}>
            <Icon name="logout" /> יציאה
          </button>
        </div>
      </div>
    </header>
  );
}
