import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAllTenants } from "../services/tenants";
import Button from "../components/Button";
import Table from "../components/Table";
import Loading from "../components/Loading";
import type { Tenant } from "../types";

/**
 * Tenants management page (master/admin)
 */
export default function TenantsManagement(): JSX.Element {
  const navigate = useNavigate();
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
      const response = await listAllTenants({ page: 1, limit: 100 });
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
      key: "createdBy",
      header: "Created By",
      render: (tenant: Tenant): string => tenant.createdBy,
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (tenant: Tenant): string =>
        new Date(tenant.createdAt).toLocaleDateString(),
    },
    {
      key: "deletedAt",
      header: "Status",
      render: (tenant: Tenant): JSX.Element =>
        tenant.deletedAt ? (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Deleted
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Active
          </span>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Tenants Management
            </h1>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <Table
          columns={columns}
          data={tenants}
          emptyMessage="No tenants found"
        />
      </main>
    </div>
  );
}
