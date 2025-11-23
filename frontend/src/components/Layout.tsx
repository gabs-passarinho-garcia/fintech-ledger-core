import { type ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "./Button";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component with navigation
 */
export default function Layout({ children }: LayoutProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = (): void => {
    signOut();
    navigate("/login");
  };

  const isActive = (path: string): boolean => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/profile", label: "Profile", icon: "👤" },
    { to: "/tenants", label: "Tenants", icon: "🏢" },
  ];

  const adminLinks = user?.isMaster
    ? [
        { to: "/users", label: "Users", icon: "👥" },
        { to: "/profiles", label: "Profiles", icon: "📋" },
        { to: "/admin/tenants", label: "All Tenants", icon: "🏛️" },
        { to: "/admin/ledgers", label: "All Ledgers", icon: "📑" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl">💰</span>
                <span>Fintech Ledger Core</span>
              </Link>
              <nav className="hidden md:flex gap-2">
                {[...navLinks, ...adminLinks].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-1.5">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-3">
                <Avatar name={user?.username || "User"} size="sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.username || "User"}
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={handleSignOut}
                className="hidden sm:flex"
              >
                Sign Out
              </Button>
              <button
                onClick={() => {
                  setShowMobileMenu(!showMobileMenu);
                }}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showMobileMenu ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-3 space-y-2">
              {[...navLinks, ...adminLinks].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => {
                    setShowMobileMenu(false);
                  }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <Avatar name={user?.username || "User"} size="sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                  {user?.username || "User"}
                </span>
                <Button variant="secondary" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
