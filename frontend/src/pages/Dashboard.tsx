import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Table from "../components/Table";
import Badge from "../components/Badge";
import StatsCard from "../components/StatsCard";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import SimpleChart from "../components/SimpleChart";
import Card from "../components/Card";
import { endpoints } from "../api/endpoints";
import { getMyProfile } from "../services/profile";
import { getMyAccounts } from "../services/accounts";
import type {
  LedgerEntry,
  Pagination as PaginationType,
  Profile,
  Account,
} from "../types";

/**
 * Enhanced Dashboard page with stats, charts, search, filters, and pagination
 */
export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const limit = 10;

  useEffect(() => {
    loadEntries();
    loadWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const loadWalletData = async (): Promise<void> => {
    setIsLoadingWallet(true);
    try {
      const [profileData, accountsData] = await Promise.all([
        getMyProfile(),
        getMyAccounts(),
      ]);
      setProfile(profileData);
      setAccounts(accountsData.accounts);
    } catch (err) {
      // Silently fail wallet data loading - not critical for dashboard
      console.error("Failed to load wallet data:", err);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const loadEntries = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const query: {
        page?: number;
        limit?: number;
        status?: "PENDING" | "COMPLETED" | "FAILED";
        type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
      } = {
        page: currentPage,
        limit,
      };

      if (filters.status) {
        query.status = filters.status as "PENDING" | "COMPLETED" | "FAILED";
      }
      if (filters.type) {
        query.type = filters.type as "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
      }

      const response = await endpoints.ledger.listEntries(query);
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
        if ("pagination" in response.data.data) {
          setPagination(response.data.data.pagination as PaginationType);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!searchQuery) {
      return entries;
    }
    const query = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.id.toLowerCase().includes(query) ||
        entry.type.toLowerCase().includes(query) ||
        entry.amount.toLowerCase().includes(query) ||
        entry.status.toLowerCase().includes(query),
    );
  }, [entries, searchQuery]);

  const stats = useMemo(() => {
    const total = entries.length;
    const completed = entries.filter((e) => e.status === "COMPLETED").length;
    const pending = entries.filter((e) => e.status === "PENDING").length;
    const totalAmount = entries.reduce((sum, e) => {
      return sum + parseFloat(e.amount || "0");
    }, 0);

    return {
      total,
      completed,
      pending,
      totalAmount: totalAmount.toFixed(2),
    };
  }, [entries]);

  const chartData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([label, value]) => ({
      label,
      value,
    }));
  }, [entries]);

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Record<string, string>): void => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your ledger entries
          </p>
        </div>
        <Button onClick={() => navigate("/ledger/create")}>
          <span className="mr-2">➕</span>
          Create Entry
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Wallet Balance"
          value={
            isLoadingWallet
              ? "..."
              : profile
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(parseFloat(profile.balance || "0"))
                : "$0.00"
          }
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
          }
          variant="info"
        />
        <StatsCard
          title="Total Entries"
          value={stats.total}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          }
          variant="primary"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          }
          variant="success"
          trend={{
            value: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
            label: "completion rate",
            positive: true,
          }}
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          }
          variant="warning"
        />
        <StatsCard
          title="My Accounts"
          value={isLoadingWallet ? "..." : accounts.length.toString()}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
          }
          variant="info"
        />
      </div>

      {chartData.length > 0 && (
        <Card className="animate-fade-in-up">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Transactions by Type
          </h2>
          <SimpleChart data={chartData} height={150} color="#2563eb" />
        </Card>
      )}

      <Card className="animate-fade-in-up">
        <div className="mb-4">
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            placeholder="Search by ID, type, amount, or status..."
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
          <>
            <Table
              columns={columns}
              data={filteredEntries}
              emptyMessage="No ledger entries found. Create your first entry to get started!"
              onRowClick={(entry) => {
                navigate(`/ledger/${entry.id}`);
              }}
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
