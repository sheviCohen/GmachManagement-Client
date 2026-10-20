import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import AdminCustomers from "./pages/admin/AdminCustomers.jsx";
import AdminLoans from "./pages/admin/AdminLoans.jsx";
import AdminRequests from "./pages/admin/AdminRequests.jsx";
import Loans from "./pages/Loans.jsx";
import Login from "./pages/Login.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import Register from "./pages/Register.jsx";

// מגן על עמודים: בלי התחברות -> התחברות. תפקיד לא מתאים -> דף הבית של התפקיד שלה.
function Protected({ role }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role === "Admin" && !isAdmin) return <Navigate to="/loans" replace />;
  if (role === "User" && isAdmin) return <Navigate to="/admin/requests" replace />;
  return <><Navbar /><Outlet /></>;
}

// עמודי התחברות/הרשמה לא רלוונטיים למי שכבר מחוברת
function GuestOnly() {
  const { user, isAdmin } = useAuth();
  if (user) return <Navigate to={isAdmin ? "/admin/requests" : "/loans"} replace />;
  return <Outlet />;
}

export default function App() {
  const { user, isAdmin } = useAuth();
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<Protected role="User" />}>
        <Route path="/loans" element={<Loans />} />
        <Route path="/my-requests" element={<MyRequests />} />
      </Route>
      <Route element={<Protected role="Admin" />}>
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/loans" element={<AdminLoans />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? (isAdmin ? "/admin/requests" : "/loans") : "/login"} replace />} />
    </Routes>
  );
}
