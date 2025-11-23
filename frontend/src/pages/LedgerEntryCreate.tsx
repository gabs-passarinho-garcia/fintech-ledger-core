import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLedgerEntry } from "../services/ledger";
import { listTenants } from "../services/tenants";
import { listProfilesByTenant } from "../services/profile";
import { getMyAccounts, listAccountsByProfile } from "../services/accounts";
import { getCurrentUser } from "../services/auth";
import { storage } from "../utils/storage";
import Button from "../components/Button";
import Input from "../components/Input";
import Loading from "../components/Loading";
import type { CreateLedgerEntryInput } from "../services/ledger";
import type { Tenant, Profile, Account } from "../types";

/**
 * Create ledger entry page
 */
export default function LedgerEntryCreate(): JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateLedgerEntryInput>({
    tenantId: storage.getTenantId() || "",
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    type: "DEPOSIT",
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [isMaster, setIsMaster] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setIsMaster(user?.isMaster ?? false);
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.tenantId) {
      if (isMaster) {
        loadProfilesForMaster(formData.tenantId);
      } else {
        loadMyAccounts();
      }
    } else {
      setProfiles([]);
      setAccounts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tenantId, isMaster]);

  useEffect(() => {
    if (isMaster && selectedProfileId && formData.tenantId) {
      loadAccountsForProfile(selectedProfileId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfileId, isMaster, formData.tenantId]);

  const selectTenantFromResponse = (tenantsList: Tenant[]): void => {
    if (tenantsList.length === 1 && !formData.tenantId) {
      setFormData((prev) => ({
        ...prev,
        tenantId: tenantsList[0]?.id || "",
      }));
      return;
    }

    if (formData.tenantId) {
      const tenantExists = tenantsList.some((t) => t.id === formData.tenantId);
      if (!tenantExists && tenantsList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          tenantId: tenantsList[0]?.id || "",
        }));
      }
    }
  };

  const loadTenants = async (): Promise<void> => {
    setIsLoadingTenants(true);
    try {
      const response = await listTenants();
      setTenants(response.tenants);
      selectTenantFromResponse(response.tenants);
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
      resetAccountIds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const loadMyAccounts = async (): Promise<void> => {
    setIsLoadingAccounts(true);
    try {
      const response = await getMyAccounts();
      setAccounts(response.accounts);
      resetAccountIds();
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
      resetAccountIds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const validateForm = (): string | null => {
    if (
      !formData.tenantId ||
      !formData.amount ||
      !formData.type ||
      !formData.fromAccountId
    ) {
      return "Tenant, amount, type, and from account are required";
    }

    if (formData.type === "TRANSFER" && !formData.toAccountId) {
      return "To account is required for transfer transactions";
    }

    const amount =
      typeof formData.amount === "string"
        ? parseFloat(formData.amount)
        : formData.amount;
    if (isNaN(amount) || amount <= 0) {
      return "Amount must be a positive number";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const amount =
        typeof formData.amount === "string"
          ? parseFloat(formData.amount)
          : formData.amount;
      await createLedgerEntry({
        ...formData,
        amount,
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId || null,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create ledger entry",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetAccountIds = (): void => {
    setFormData((prev) => ({
      ...prev,
      fromAccountId: "",
      toAccountId: "",
    }));
  };

  const formatAccountBalance = (balance: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(balance || "0"));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileChange = (profileId: string): void => {
    setSelectedProfileId(profileId);
    resetAccountIds();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Ledger Entry
        </h1>
      </div>
      <div className="card">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tenant <span className="text-red-500">*</span>
            </label>
            {isLoadingTenants ? (
              <div className="flex items-center gap-2">
                <Loading size="sm" />
                <span className="text-sm text-gray-500">
                  Loading tenants...
                </span>
              </div>
            ) : tenants.length === 0 ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                No tenants available. Please contact your administrator.
              </div>
            ) : (
              <select
                name="tenantId"
                value={formData.tenantId || ""}
                onChange={handleChange}
                className="input-field"
                required
                aria-label="Select tenant"
              >
                <option value="">Select a tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
              required
              aria-label="Select entry type"
            >
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>

          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            placeholder="0.00"
          />

          {isMaster && (
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
                  No profiles available for this tenant. Please select a tenant
                  first.
                </div>
              ) : (
                <select
                  value={selectedProfileId}
                  onChange={(e) => handleProfileChange(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Account <span className="text-red-500">*</span>
            </label>
            {isLoadingAccounts ? (
              <div className="flex items-center gap-2">
                <Loading size="sm" />
                <span className="text-sm text-gray-500">
                  Loading accounts...
                </span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                {isMaster
                  ? "No accounts available. Please select a profile first."
                  : "No accounts available. Please contact your administrator."}
              </div>
            ) : (
              <select
                name="fromAccountId"
                value={formData.fromAccountId || ""}
                onChange={handleChange}
                className="input-field"
                required
                aria-label="Select from account"
                disabled={isMaster && !selectedProfileId}
              >
                <option value="">Select from account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} (Balance:{" "}
                    {formatAccountBalance(account.balance)})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Account
              {formData.type === "TRANSFER" && (
                <span className="text-red-500"> *</span>
              )}
            </label>
            {isLoadingAccounts ? (
              <div className="flex items-center gap-2">
                <Loading size="sm" />
                <span className="text-sm text-gray-500">
                  Loading accounts...
                </span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                {isMaster
                  ? "No accounts available. Please select a profile first."
                  : "No accounts available. Please contact your administrator."}
              </div>
            ) : (
              <select
                name="toAccountId"
                value={formData.toAccountId || ""}
                onChange={handleChange}
                className="input-field"
                required={formData.type === "TRANSFER"}
                aria-label="Select to account"
                disabled={isMaster && !selectedProfileId}
              >
                <option value="">Select to account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} (Balance:{" "}
                    {formatAccountBalance(account.balance)})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" isLoading={isLoading}>
              Create Entry
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
