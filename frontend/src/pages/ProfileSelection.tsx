import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listProfiles } from "../services/profile";
import { listTenants } from "../services/tenants";
import { storage } from "../utils/storage";
import Button from "../components/Button";
import Loading from "../components/Loading";
import type { Profile } from "../types";
import type { Tenant } from "../types";

/**
 * Profile selection page
 * Allows user to select which profile to use after login
 */
export default function ProfileSelection(): JSX.Element {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tenants, setTenants] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [profilesResponse, tenantsResponse] = await Promise.all([
        listProfiles(),
        listTenants(),
      ]);

      setProfiles(profilesResponse.profiles);

      // Create a map of tenantId -> tenant name for quick lookup
      const tenantMap = new Map<string, string>();
      tenantsResponse.tenants.forEach((tenant: Tenant) => {
        tenantMap.set(tenant.id, tenant.name);
      });
      setTenants(tenantMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProfile = (profile: Profile): void => {
    // Store tenantId and redirect to dashboard
    storage.setTenantId(profile.tenantId);
    navigate("/dashboard");
  };

  const handleCreateProfile = (): void => {
    navigate("/profile/create");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md w-full">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/login")}>Back to Login</Button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full card animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              No Profiles Found
            </h1>
            <p className="text-gray-600">
              You need to create a profile to continue
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Create a profile to associate your account with a tenant and start
              using the system.
            </p>

            <Button onClick={handleCreateProfile} className="w-full">
              Create Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full card animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Profile
          </h1>
          <p className="text-gray-600">Choose which profile you want to use</p>
        </div>

        <div className="space-y-4 mb-6">
          {profiles.map((profile) => {
            const tenantName =
              tenants.get(profile.tenantId) || "Unknown Tenant";
            return (
              <div
                key={profile.id}
                className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSelectProfile(profile)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {profile.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tenant: {tenantName}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProfile(profile);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleCreateProfile}
            variant="secondary"
            className="w-full"
          >
            Create New Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
