import { useState, useEffect } from "react";
import {
  getMyAccounts,
  listAccountsByProfile,
  createAccount,
  type CreateAccountInput,
} from "../services/accounts";
import { listTenants } from "../services/tenants";
import { listProfilesByTenant, getMyProfile } from "../services/profile";
import { getCurrentUser } from "../services/auth";
import { storage } from "../utils/storage";
import Button from "../components/Button";
import Input from "../components/Input";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import type { Account, Tenant, Profile } from "../types";

/**
 * Accounts management page
 */
export default function AccountsManagement(): JSX.Element {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    storage.getTenantId() || "",
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [myProfileId, setMyProfileId] = useState<string>("");
  const [isMaster, setIsMaster] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateAccountInput>({
    tenantId: storage.getTenantId() || "",
    profileId: "",
    name: "",
    initialBalance: 0,
  });

  useEffect(() => {
    const user = getCurrentUser();
    setIsMaster(user?.isMaster ?? false);
    loadTenants();
    if (!user?.isMaster) {
      loadMyProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      if (isMaster) {
        loadProfilesForMaster(selectedTenantId);
      } else {
        loadMyAccounts();
      }
    }
  }, [selectedTenantId, isMaster]);

  useEffect(() => {
    if (isMaster && selectedProfileId && selectedTenantId) {
      loadAccountsForProfile(selectedProfileId);
    }
  }, [selectedProfileId, isMaster, selectedTenantId]);

  const loadTenants = async (): Promise<void> => {
    setIsLoadingTenants(true);
    try {
      const response = await listTenants();
      setTenants(response.tenants);
      if (response.tenants.length === 1 && !selectedTenantId) {
        setSelectedTenantId(response.tenants[0]?.id || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const loadProfilesForMaster = async (tenantId: string): Promise<void> => {
    setIsLoadingProfiles(true);
    try {
      const response = await listProfilesByTenant(tenantId);
      setProfiles(response.profiles);
      setSelectedProfileId("");
      setAccounts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const loadMyProfile = async (): Promise<void> => {
    try {
      const profile = await getMyProfile();
      setMyProfileId(profile.id);
      setFormData((prev) => ({ ...prev, profileId: profile.id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    }
  };

  const loadMyAccounts = async (): Promise<void> => {
    setIsLoadingAccounts(true);
    try {
      const response = await getMyAccounts();
      setAccounts(response.accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadAccountsForProfile = async (profileId: string): Promise<void> => {
    setIsLoadingAccounts(true);
    try {
      const response = await listAccountsByProfile(profileId);
      setAccounts(response.accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleCreateAccount = async (): Promise<void> => {
    if (!formData.name || formData.name.trim().length < 2) {
      setError("Account name must be at least 2 characters long");
      return;
    }

    if (!formData.profileId) {
      setError("Profile ID is required");
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      await createAccount({
        tenantId: formData.tenantId,
        profileId: formData.profileId,
        name: formData.name.trim(),
        initialBalance: formData.initialBalance ?? 0,
      });
      setCreateModal({ isOpen: false });
      setFormData({
        tenantId: selectedTenantId,
        profileId: isMaster ? selectedProfileId : myProfileId,
        name: "",
        initialBalance: 0,
      });
      if (isMaster && selectedProfileId) {
        await loadAccountsForProfile(selectedProfileId);
      } else if (!isMaster) {
        await loadMyAccounts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsCreating(false);
    }
  };

  const formatBalance = (balance: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(balance || "0"));
  };

  if (isLoadingTenants) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Accounts Management
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="card space-y-4">
        {isMaster && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tenant
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => {
                  setSelectedTenantId(e.target.value);
                  setSelectedProfileId("");
                  setAccounts([]);
                }}
                className="input-field"
                aria-label="Select tenant"
              >
                <option value="">Select a tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTenantId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile
                </label>
                {isLoadingProfiles ? (
                  <div className="flex items-center gap-2">
                    <Loading size="sm" />
                    <span className="text-sm text-gray-500">
                      Loading profiles...
                    </span>
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                    No profiles available for this tenant.
                  </div>
                ) : (
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="input-field"
                    aria-label="Select profile"
                  >
                    <option value="">Select a profile</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.firstName} {profile.lastName} ({profile.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Accounts
            {isMaster && selectedProfileId && ` (${accounts.length})`}
            {!isMaster && ` (${accounts.length})`}
          </h2>
          <Button
            onClick={() => {
              const profileId = isMaster ? selectedProfileId : myProfileId;
              if (!profileId) {
                setError("Please select a profile first");
                return;
              }
              setFormData({
                tenantId: selectedTenantId,
                profileId,
                name: "",
                initialBalance: 0,
              });
              setCreateModal({ isOpen: true });
            }}
            disabled={isMaster && (!selectedTenantId || !selectedProfileId)}
          >
            Create Account
          </Button>
        </div>

        {isLoadingAccounts ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center text-gray-500 dark:text-gray-400">
            {isMaster && !selectedProfileId
              ? "Please select a profile to view accounts"
              : "No accounts found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatBalance(account.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={createModal.isOpen}
        onClose={() => setCreateModal({ isOpen: false })}
        title="Create Account"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCreateModal({ isOpen: false })}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAccount} isLoading={isCreating}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Account Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Savings Account"
          />
          <Input
            label="Initial Balance"
            name="initialBalance"
            type="number"
            step="0.01"
            value={formData.initialBalance?.toString() || "0"}
            onChange={(e) =>
              setFormData({
                ...formData,
                initialBalance: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
          />
        </div>
      </Modal>
    </div>
  );
}
