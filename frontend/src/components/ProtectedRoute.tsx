import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../services/auth";
import { storage } from "../utils/storage";
import Layout from "./Layout";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component
 * Redirects to login if user is not authenticated
 * Redirects to profile selection if user doesn't have a tenant selected (except for profile-selection and profile/create pages)
 * Wraps authenticated pages with Layout for navigation
 */
export default function ProtectedRoute({
  children,
}: ProtectedRouteProps): JSX.Element {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has a tenant selected
  const tenantId = storage.getTenantId();
  const isProfileSelectionPage =
    location.pathname === "/profile-selection" ||
    location.pathname === "/profile/create";

  // If no tenant selected and not on profile selection/create pages, redirect to profile selection
  if (!tenantId && !isProfileSelectionPage) {
    return <Navigate to="/profile-selection" replace />;
  }

  // Don't wrap profile selection pages with Layout
  if (isProfileSelectionPage) {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
}
