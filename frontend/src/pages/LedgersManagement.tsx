import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../api/endpoints";
import Table from "../components/Table";
import Loading from "../components/Loading";
import Badge from "../components/Badge";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import type { LedgerEntry } from "../types";

/**
 * Ledgers management page (master/admin)
 */
export default function LedgersManagement(): JSX.Element {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEntries();
  }, [filters]);

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

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) {
      return true;
    }
    const query = searchQuery.toLowerCase();
    return (
      entry.id.toLowerCase().includes(query) ||
      entry.type.toLowerCase().includes(query) ||
      entry.amount.toLowerCase().includes(query) ||
      entry.status.toLowerCase().includes(query) ||
      entry.tenantId.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (entry: LedgerEntry): JSX.Element => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {entry.id.slice(0, 8)}...
        </span>
      ),
      sortable: true,
      sortFn: (a: LedgerEntry, b: LedgerEntry): number =>
        a.id.localeCompare(b.id),
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      render: (entry: LedgerEntry): JSX.Element => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {entry.tenantId.slice(0, 8)}...
        </span>
      ),
      sortable: true,
      sortFn: (a: LedgerEntry, b: LedgerEntry): number =>
        a.tenantId.localeCompare(b.tenantId),
    },
    {
      key: "type",
      header: "Type",
      render: (entry: LedgerEntry): JSX.Element => (
        <Badge
          variant={
            entry.type === "DEPOSIT"
              ? "success"
              : entry.type === "WITHDRAWAL"
                ? "warning"
                : "info"
          }
          size="sm"
        >
          {entry.type}
        </Badge>
      ),
      sortable: true,
      sortFn: (a: LedgerEntry, b: LedgerEntry): number =>
        a.type.localeCompare(b.type),
    },
    {
      key: "amount",
      header: "Amount",
      render: (entry: LedgerEntry): string => {
        const amount = parseFloat(entry.amount || "0");
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      },
      sortable: true,
      sortFn: (a: LedgerEntry, b: LedgerEntry): number =>
        parseFloat(a.amount || "0") - parseFloat(b.amount || "0"),
    },
    {
      key: "status",
      header: "Status",
      render: (entry: LedgerEntry): JSX.Element => (
        <Badge
          variant={
            entry.status === "COMPLETED"
              ? "success"
              : entry.status === "PENDING"
                ? "warning"
                : "error"
          }
          size="sm"
        >
          {entry.status}
        </Badge>
      ),
      sortable: true,
      sortFn: (a: LedgerEntry, b: LedgerEntry): number =>
        a.status.localeCompare(b.status),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (entry: LedgerEntry): string =>
        new Date(entry.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      sortable: true,
      sortFn: (a: LedgerEntry, b: LedgerEntry): number =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  if (isLoading && entries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Ledgers Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all ledger entries across all tenants
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <Card className="animate-fade-in-up">
        <div className="mb-4">
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setFilters}
            placeholder="Search by ID, type, amount, status, or tenant ID..."
            filters={[
              {
                key: "status",
                label: "Status",
                value: "",
              },
              {
                key: "type",
                label: "Type",
                value: "",
              },
            ]}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredEntries}
            emptyMessage="No ledger entries found"
            onRowClick={(entry) => {
              navigate(`/ledger/${entry.id}`);
            }}
          />
        )}
      </Card>
    </div>
  );
}
