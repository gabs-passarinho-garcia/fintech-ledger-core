import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAllUsers, deleteUser } from "../services/users";
import Button from "../components/Button";
import Table from "../components/Table";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import type { User } from "../types";

/**
 * Users management page (master/admin)
 */
export default function UsersManagement(): JSX.Element {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAllUsers({ page: 1, limit: 100 });
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteModal.user) return;

    setIsDeleting(true);
    try {
      await deleteUser(deleteModal.user.id);
      setDeleteModal({ isOpen: false, user: null });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsDeleting(false);
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
      render: (user: User) => (
        <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "username",
      header: "Username",
      render: (user: User) => user.username,
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (user: User) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        <Button
          variant="danger"
          onClick={() => setDeleteModal({ isOpen: true, user })}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Users Management
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

        <Table columns={columns} data={users} emptyMessage="No users found" />

        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, user: null })}
          title="Delete User"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
              >
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
            Are you sure you want to delete user{" "}
            <strong>{deleteModal.user?.username}</strong>? This action cannot be
            undone.
          </p>
        </Modal>
      </main>
    </div>
  );
}
