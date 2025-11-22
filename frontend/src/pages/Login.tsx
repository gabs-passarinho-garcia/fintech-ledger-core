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
    tenantId: "",
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
        tenantId: formData.tenantId || undefined,
      });
      navigate("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full card animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fintech Ledger Core
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {(formError || error) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
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

          <Input
            label="Tenant ID (Optional)"
            name="tenantId"
            type="text"
            value={formData.tenantId}
            onChange={handleChange}
            placeholder="Enter tenant ID"
            helperText="Leave empty if not using multi-tenant"
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
