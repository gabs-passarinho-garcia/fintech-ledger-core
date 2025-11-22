import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Loading from "../components/Loading";
import { endpoints } from "../api/endpoints";
import type { LedgerEntry } from "../types";

/**
 * Dashboard page
 */
export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();
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
      const response = await endpoints.ledger.listEntries({
        page: 1,
        limit: 20,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Ledger Entries</h2>
        <Button onClick={() => navigate("/ledger/create")}>Create Entry</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No ledger entries found</p>
          <Button onClick={() => navigate("/ledger/create")}>
            Create Your First Entry
          </Button>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/ledger/${entry.id}`)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.amount}
                    </td>
                    <td className="px-4 py-3 text-sm">
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
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
