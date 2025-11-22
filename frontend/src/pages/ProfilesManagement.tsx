/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAllProfiles, deleteProfile } from "../services/users";
import Button from "../components/Button";
import Table from "../components/Table";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import type { Profile } from "../types";

/**
 * Profiles management page (master/admin)
 */
export default function ProfilesManagement(): JSX.Element {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    profile: Profile | null;
  }>({
    isOpen: false,
    profile: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAllProfiles({ page: 1, limit: 100 });
      setProfiles(response.profiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteModal.profile) return;

    setIsDeleting(true);
    try {
      await deleteProfile(deleteModal.profile.id);
      setDeleteModal({ isOpen: false, profile: null });
      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile");
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
      render: (profile: Profile) => (
        <span className="font-mono text-xs">{profile.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (profile: Profile) => `${profile.firstName} ${profile.lastName}`,
    },
    {
      key: "email",
      header: "Email",
      render: (profile: Profile) => profile.email,
    },
    {
      key: "tenantId",
      header: "Tenant ID",
      render: (profile: Profile) => profile.tenantId,
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (profile: Profile) =>
        new Date(profile.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (profile: Profile) => (
        <Button
          variant="danger"
          onClick={() => setDeleteModal({ isOpen: true, profile })}
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
              Profiles Management
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
          data={profiles}
          emptyMessage="No profiles found"
        />

        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, profile: null })}
          title="Delete Profile"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ isOpen: false, profile: null })}
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
            Are you sure you want to delete profile for{" "}
            <strong>
              {deleteModal.profile?.firstName} {deleteModal.profile?.lastName}
            </strong>
            ? This action cannot be undone.
          </p>
        </Modal>
      </main>
    </div>
  );
}
