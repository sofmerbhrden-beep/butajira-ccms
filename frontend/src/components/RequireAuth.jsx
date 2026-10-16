import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-card">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-gray-400">
          Loading…
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (
    user.mustChangePassword &&
    user.role !== "staff" &&
    user.role !== "admin" &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  if (roles && !roles.includes(user.role)) {

    const home =
      user.role === "admin"
        ? "/admin/dashboard/overview"
        : user.role === "staff"
          ? "/staff/dashboard/overview"
          : "/applicant/dashboard";
    return <Navigate to={home} replace />;
  }
  return children;
}
