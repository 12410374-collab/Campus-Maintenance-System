/* eslint-disable react-refresh/only-export-components */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Helper to determine default home route based on user role
 * @param {string} roleName
 * @returns {string}
 */
export const getRoleHomePath = (roleName) => {
  switch (roleName) {
    case 'Technician':
      return '/technician';
    case 'Admin':
      return '/admin';
    case 'Student':
    case 'Lecturer':
    case 'Staff':
      return '/reporter';
    default:
      return '/login';
  }
};

/**
 * ProtectedRoute component
 * Validates authentication status and role-based permissions
 *
 * @param {Object} props
 * @param {Array<string>} [props.allowedRoles] - Roles allowed to access the route
 * @param {React.ReactNode} [props.children] - Optional custom children
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Loading state fallback
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login with return location state
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permission if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(user.role);

    // If role is unauthorized, redirect to their own role dashboard
    if (!hasPermission) {
      const authorizedHome = getRoleHomePath(user.role);
      return <Navigate to={authorizedHome} replace />;
    }
  }

  // Authorized -> render nested routes or custom children
  return children ? children : <Outlet />;
}
