import { useEffect, useState } from "react";
import { endpoints } from "../api/endpoints";
import Table from "../components/Table";
import Loading from "../components/Loading";
import type { LedgerEntry } from "../types";

/**
 * Ledgers management page (master/admin)
 */
export default function LedgersManagement(): JSX.Element {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await endpoints.ledger.listAllEntries({
        page: 1,
        limit: 100,
      });
      if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        response.data.data &&
        typeof response.data.data === "object" &&
        "entries" in response.data.data &&
        Array.isArray(response.data.data.entries)
      ) {
        setEntries(response.data.data.entries as LedgerEntry[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
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
      render: (entry: LedgerEntry): JSX.Element => (
        <span className="font-mono text-xs">{entry.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      render: (entry: LedgerEntry): JSX.Element => (
        <span className="font-mono text-xs">
          {entry.tenantId.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (entry: LedgerEntry): string => entry.type,
    },
    {
      key: "amount",
      header: "Amount",
      render: (entry: LedgerEntry): string => entry.amount,
    },
    {
      key: "status",
      header: "Status",
      render: (entry: LedgerEntry): JSX.Element => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            entry.status === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : entry.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {entry.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (entry: LedgerEntry): string =>
        new Date(entry.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ledgers Management</h1>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={entries}
        emptyMessage="No ledger entries found"
      />
    </div>
  );
}
