import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLedgerEntry, updateLedgerEntry } from '../services/ledger';
import Button from '../components/Button';
import Loading from '../components/Loading';
import type { LedgerEntry } from '../types';

/**
 * Ledger entry edit page
 */
export default function LedgerEntryEdit(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'FAILED'>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEntry();
    }
  }, [id]);

  const loadEntry = async (): Promise<void> => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getLedgerEntry(id);
      setEntry(data);
      setStatus(data.status as 'PENDING' | 'COMPLETED' | 'FAILED');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load ledger entry',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    setError(null);

    try {
      await updateLedgerEntry(id, { status });
      navigate(`/ledger/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update ledger entry',
      );
    } finally {
      setIsSaving(false);
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
          <p className="text-red-600 mb-4">{error || 'Entry not found'}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Edit Ledger Entry</h1>
            <Button variant="secondary" onClick={() => navigate(`/ledger/${id}`)}>
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Entry ID: {entry.id}</p>
            <p className="text-sm text-gray-600">Amount: {entry.amount}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'PENDING' | 'COMPLETED' | 'FAILED')
                }
                className="input-field"
                required
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/ledger/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

