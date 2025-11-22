import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";
import Layout from "./Layout";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component
 * Redirects to login if user is not authenticated
 * Wraps authenticated pages with Layout for navigation
 */
export default function ProtectedRoute({
  children,
}: ProtectedRouteProps): JSX.Element {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}
