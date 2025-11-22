import { useEffect, useState } from "react";
import { listTenants } from "../services/tenants";
import Table from "../components/Table";
import Loading from "../components/Loading";
import type { Tenant } from "../types";

/**
 * Tenants list page - shows all tenants associated with user's profiles
 */
export default function TenantsList(): JSX.Element {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listTenants();
      setTenants(response.tenants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (tenant: Tenant): JSX.Element => (
        <span className="font-mono text-xs">{tenant.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (tenant: Tenant): string => tenant.name,
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (tenant: Tenant): string =>
        new Date(tenant.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Tenants</h1>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <Table columns={columns} data={tenants} emptyMessage="No tenants found" />
    </div>
  );
}
