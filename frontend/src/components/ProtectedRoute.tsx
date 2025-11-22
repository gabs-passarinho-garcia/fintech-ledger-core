import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({
  children,
}: ProtectedRouteProps): JSX.Element {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

