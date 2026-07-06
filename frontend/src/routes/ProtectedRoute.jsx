import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

/**
 * Wraps a page in DashboardLayout and enforces authentication + role.
 * - Not logged in  → /login
 * - Wrong role     → their own dashboard (not /login to avoid confusion)
 * - OK             → renders inside DashboardLayout
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  /* Still reading cookie / validating token */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  /* Not authenticated */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* Wrong role — redirect to their own dashboard */
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;
