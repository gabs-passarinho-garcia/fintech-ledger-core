import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import { listPublicTenants } from "../services/tenants";

/**
 * Signup page
 */
export default function Signup(): JSX.Element {
  const navigate = useNavigate();
  const { signUp, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    tenantId: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);

  useEffect(() => {
    const loadTenants = async (): Promise<void> => {
      try {
        const response = await listPublicTenants();
        setTenants(response.tenants);
      } catch (err) {
        console.error("Failed to load tenants:", err);
        // Don't block signup if tenants fail to load
      } finally {
        setIsLoadingTenants(false);
      }
    };

    loadTenants();
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    if (
      !formData.username ||
      !formData.password ||
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.tenantId
    ) {
      setFormError("All required fields must be filled");
      return;
    }

    if (!formData.email.includes("@")) {
      setFormError("Please enter a valid email address");
      return;
    }

    try {
      await signUp({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        tenantId: formData.tenantId || undefined,
      });
      // Redirect to login after successful signup
      navigate("/login", {
        state: { message: "Account created successfully. Please sign in." },
      });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create account",
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full card animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign up for a new account
          </p>
        </div>

        {(formError || error) && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {formError || error?.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="John"
            />

            <Input
              label="Last Name"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="john.doe@example.com"
          />

          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
            placeholder="johndoe"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Enter a secure password"
          />

          <Select
            label="Tenant"
            name="tenantId"
            value={formData.tenantId}
            onChange={handleChange}
            required
            options={tenants.map((tenant) => ({
              value: tenant.id,
              label: tenant.name,
            }))}
            disabled={isLoadingTenants}
            helperText={
              isLoadingTenants
                ? "Loading tenants..."
                : "Select a tenant to create your profile"
            }
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
