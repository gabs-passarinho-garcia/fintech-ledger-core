import { describe, it, expect, beforeEach, mock } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TenantsManagement from "../TenantsManagement";

// Mock tenants service
const mockListAllTenants = mock();

mock.module("../../services/tenants", () => ({
  listAllTenants: mockListAllTenants,
}));

describe("TenantsManagement", () => {
  beforeEach(() => {
    mock.restore();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TenantsManagement />
      </BrowserRouter>,
    );
  };

  it("should render loading state initially", () => {
    mockListAllTenants.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    // Loading state should be shown
    expect(
      screen.getByText(/loading/i) || screen.queryByRole("progressbar"),
    ).toBeDefined();
  });

  it("should render tenants list", async () => {
    const mockTenants = {
      tenants: [
        {
          id: "tenant-1",
          name: "Tenant 1",
          createdBy: "user-1",
          createdAt: new Date("2024-01-01"),
          updatedBy: null,
          updatedAt: new Date("2024-01-01"),
          deletedBy: null,
          deletedAt: null,
        },
        {
          id: "tenant-2",
          name: "Tenant 2",
          createdBy: "user-2",
          createdAt: new Date("2024-01-02"),
          updatedBy: null,
          updatedAt: new Date("2024-01-02"),
          deletedBy: "user-3",
          deletedAt: new Date("2024-01-03"),
        },
      ],
      pagination: {},
    };

    mockListAllTenants.mockResolvedValue(mockTenants);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Tenant 1")).toBeDefined();
      expect(screen.getByText("Tenant 2")).toBeDefined();
    });
  });

  it("should show active status for non-deleted tenants", async () => {
    const mockTenants = {
      tenants: [
        {
          id: "tenant-1",
          name: "Tenant 1",
          createdBy: "user-1",
          createdAt: new Date("2024-01-01"),
          updatedBy: null,
          updatedAt: new Date("2024-01-01"),
          deletedBy: null,
          deletedAt: null,
        },
      ],
      pagination: {},
    };

    mockListAllTenants.mockResolvedValue(mockTenants);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeDefined();
    });
  });

  it("should show deleted status for deleted tenants", async () => {
    const mockTenants = {
      tenants: [
        {
          id: "tenant-1",
          name: "Tenant 1",
          createdBy: "user-1",
          createdAt: new Date("2024-01-01"),
          updatedBy: null,
          updatedAt: new Date("2024-01-01"),
          deletedBy: "user-2",
          deletedAt: new Date("2024-01-02"),
        },
      ],
      pagination: {},
    };

    mockListAllTenants.mockResolvedValue(mockTenants);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Deleted")).toBeDefined();
    });
  });

  it("should render empty state when no tenants", async () => {
    mockListAllTenants.mockResolvedValue({ tenants: [], pagination: {} });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no tenants found/i)).toBeDefined();
    });
  });

  it("should render error message on error", async () => {
    mockListAllTenants.mockRejectedValue(new Error("Failed to load tenants"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load tenants/i)).toBeDefined();
    });
  });

  it("should render page title", async () => {
    mockListAllTenants.mockResolvedValue({ tenants: [], pagination: {} });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Tenants Management")).toBeDefined();
    });
  });
});
