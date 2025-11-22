import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLedgerEntry, deleteLedgerEntry } from "../services/ledger";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import type { LedgerEntry } from "../types";

/**
 * Ledger entry detail page
 */
export default function LedgerEntryDetail(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const DASHBOARD_PATH = "/dashboard";

  useEffect(() => {
    if (id) {
      loadEntry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadEntry = async (): Promise<void> => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getLedgerEntry(id);
      setEntry(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load ledger entry",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await deleteLedgerEntry(id);
      navigate(DASHBOARD_PATH);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete ledger entry",
      );
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md w-full">
          <p className="text-red-600 mb-4">{error || "Entry not found"}</p>
          <Button onClick={() => navigate(DASHBOARD_PATH)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Ledger Entry Details
            </h1>
            <Button
              variant="secondary"
              onClick={() => navigate(DASHBOARD_PATH)}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <p className="text-gray-900 font-mono text-sm">{entry.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <p className="text-gray-900">{entry.type}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <p className="text-gray-900 text-lg font-semibold">
              {entry.amount}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                entry.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : entry.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {entry.status}
            </span>
          </div>

          {entry.fromAccountId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Account ID
              </label>
              <p className="text-gray-900 font-mono text-sm">
                {entry.fromAccountId}
              </p>
            </div>
          )}

          {entry.toAccountId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Account ID
              </label>
              <p className="text-gray-900 font-mono text-sm">
                {entry.toAccountId}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By
            </label>
            <p className="text-gray-900">{entry.createdBy}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-gray-900">
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Updated At
            </label>
            <p className="text-gray-900">
              {new Date(entry.updatedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button onClick={() => navigate(`/ledger/${entry.id}/edit`)}>
              Edit Status
            </Button>
            <Button variant="danger" onClick={() => setDeleteModal(true)}>
              Delete
            </Button>
          </div>
        </div>

        <Modal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          title="Delete Ledger Entry"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-gray-700">
            Are you sure you want to delete this ledger entry? This action
            cannot be undone.
          </p>
        </Modal>
      </main>
    </div>
  );
}
