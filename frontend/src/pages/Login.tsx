import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import Input from "../components/Input";

/**
 * Login page
 */
export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const { signIn, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    if (!formData.username || !formData.password) {
      setFormError("Username and password are required");
      return;
    }

    try {
      await signIn({
        username: formData.username,
        password: formData.password,
      });
      navigate("/profile-selection");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to sign in");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full card animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Fintech Ledger Core
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        {(formError || error) && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm animate-fade-in">
            {formError || error?.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
            placeholder="Enter your username"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
