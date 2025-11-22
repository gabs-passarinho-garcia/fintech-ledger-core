import { describe, it, expect, beforeEach, mock } from "bun:test";
import { listTenants, listAllTenants } from "../tenants";
import * as endpointsModule from "../../api/endpoints";

// Mock endpoints
const mockListTenants = mock();
const mockListAllTenants = mock();

mock.module("../../api/endpoints", () => ({
  endpoints: {
    tenants: {
      listTenants: mockListTenants,
      listAllTenants: mockListAllTenants,
    },
  },
}));

describe("tenants service", () => {
  beforeEach(() => {
    mock.restore();
  });

  describe("listTenants", () => {
    it("should list tenants successfully", async () => {
      const mockResponse = {
        data: {
          data: {
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
          },
        },
      };

      mockListTenants.mockResolvedValue(mockResponse);

      const result = await listTenants();

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(1);
      expect(result.tenants[0]?.id).toBe("tenant-1");
      expect(result.tenants[0]?.name).toBe("Tenant 1");
    });

    it("should throw error when response is invalid", async () => {
      mockListTenants.mockResolvedValue({});

      await expect(async () => {
        await listTenants();
      }).toThrow("Failed to list tenants");
    });
  });

  describe("listAllTenants", () => {
    it("should list all tenants successfully", async () => {
      const mockResponse = {
        data: {
          data: {
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
            pagination: {
              total: 1,
              page: 1,
              limit: 100,
              totalPages: 1,
            },
          },
        },
      };

      mockListAllTenants.mockResolvedValue(mockResponse);

      const result = await listAllTenants({ page: 1, limit: 100 });

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(1);
      expect(result.pagination).toBeDefined();
    });

    it("should pass query parameters", async () => {
      const mockResponse = {
        data: {
          data: {
            tenants: [],
            pagination: {},
          },
        },
      };

      mockListAllTenants.mockResolvedValue(mockResponse);

      await listAllTenants({ page: 2, limit: 50, includeDeleted: true });

      expect(mockListAllTenants).toHaveBeenCalledWith({
        page: 2,
        limit: 50,
        includeDeleted: true,
      });
    });

    it("should throw error when response is invalid", async () => {
      mockListAllTenants.mockResolvedValue({});

      await expect(async () => {
        await listAllTenants();
      }).toThrow("Failed to list all tenants");
    });
  });
});
