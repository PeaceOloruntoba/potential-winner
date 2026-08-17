import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types";

/** Redirects unauthenticated users to /login, and wrong-role users to their own home. */
export function ProtectedRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }
  return <Outlet />;
}

export function homeForRole(role: UserRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher";
  return "/parent";
}
