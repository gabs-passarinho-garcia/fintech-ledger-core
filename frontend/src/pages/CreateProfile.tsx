import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../services/profile";
import { listPublicTenants } from "../services/tenants";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Loading from "../components/Loading";

/**
 * Create profile page
 * Allows authenticated user to create a new profile
 */
export default function CreateProfile(): JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tenantId: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTenants = async (): Promise<void> => {
      try {
        const response = await listPublicTenants();
        setTenants(response.tenants);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Failed to load tenants",
        );
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
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.tenantId
    ) {
      setFormError("All fields are required");
      return;
    }

    if (!formData.email.includes("@")) {
      setFormError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        tenantId: formData.tenantId,
      });
      // Redirect to profile selection after successful creation
      navigate("/profile-selection");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create profile",
      );
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full card animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Profile
          </h1>
          <p className="text-gray-600">
            Create a new profile to associate with a tenant
          </p>
        </div>

        {formError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {formError}
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

          {isLoadingTenants ? (
            <div className="flex items-center justify-center py-4">
              <Loading size="sm" />
            </div>
          ) : (
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
              helperText="Select a tenant for this profile"
            />
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/profile-selection")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isLoadingTenants}
              className="flex-1"
            >
              Create Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
