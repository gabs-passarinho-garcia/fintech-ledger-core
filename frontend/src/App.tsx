import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import UsersManagement from "./pages/UsersManagement";
import ProfilesManagement from "./pages/ProfilesManagement";
import LedgerEntryCreate from "./pages/LedgerEntryCreate";
import LedgerEntryDetail from "./pages/LedgerEntryDetail";
import LedgerEntryEdit from "./pages/LedgerEntryEdit";

/**
 * Main App component with routing
 */
function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <ProfilesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ledger/create"
          element={
            <ProtectedRoute>
              <LedgerEntryCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ledger/:id"
          element={
            <ProtectedRoute>
              <LedgerEntryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ledger/:id/edit"
          element={
            <ProtectedRoute>
              <LedgerEntryEdit />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
