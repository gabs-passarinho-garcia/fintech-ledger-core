import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLedgerEntry } from "../services/ledger";
import { listTenants } from "../services/tenants";
import { storage } from "../utils/storage";
import Button from "../components/Button";
import Input from "../components/Input";
import Loading from "../components/Loading";
import type { CreateLedgerEntryInput } from "../services/ledger";
import type { Tenant } from "../types";

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
    createdBy: "",
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTenants = async (): Promise<void> => {
    setIsLoadingTenants(true);
    try {
      const response = await listTenants();
      setTenants(response.tenants);

      // Se houver apenas uma tenant, pré-selecionar
      if (response.tenants.length === 1 && !formData.tenantId) {
        setFormData((prev) => ({
          ...prev,
          tenantId: response.tenants[0]?.id || "",
        }));
      }
      // Se o tenantId do storage existir e estiver na lista, manter selecionado
      else if (formData.tenantId) {
        const tenantExists = response.tenants.some(
          (t) => t.id === formData.tenantId,
        );
        if (!tenantExists && response.tenants.length > 0) {
          // Se o tenant do storage não existe mais, selecionar o primeiro
          setFormData((prev) => ({
            ...prev,
            tenantId: response.tenants[0]?.id || "",
          }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.tenantId || !formData.amount || !formData.type) {
      setError("Tenant ID, amount, and type are required");
      setIsLoading(false);
      return;
    }

    try {
      const amount =
        typeof formData.amount === "string"
          ? parseFloat(formData.amount)
          : formData.amount;
      if (isNaN(amount) || amount <= 0) {
        setError("Amount must be a positive number");
        setIsLoading(false);
        return;
      }

      await createLedgerEntry({
        ...formData,
        amount,
        fromAccountId: formData.fromAccountId || null,
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create Ledger Entry
        </h1>
      </div>
      <div className="card">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <Input
            label="From Account ID (Optional)"
            name="fromAccountId"
            type="text"
            value={formData.fromAccountId || ""}
            onChange={handleChange}
            placeholder="Leave empty for deposits"
          />

          <Input
            label="To Account ID (Optional)"
            name="toAccountId"
            type="text"
            value={formData.toAccountId || ""}
            onChange={handleChange}
            placeholder="Leave empty for withdrawals"
          />

          <Input
            label="Created By"
            name="createdBy"
            type="text"
            value={formData.createdBy}
            onChange={handleChange}
            required
            placeholder="User ID or name"
          />

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
