import { api } from "./client";
import { withAuthRefresh } from "./client";
import { storage } from "../utils/storage";
import { getCorrelationId } from "@/utils/correlationId";

/**
 * API endpoints organized by domain
 * All endpoints use the Eden Treaty client with automatic auth refresh
 */

export const endpoints = {
  /**
   * Authentication endpoints
   */
  auth: {
    signIn: async (data: {
      username: string;
      password: string;
      tenantId?: string;
    }): Promise<Awaited<ReturnType<typeof api.auth.login.post>>> =>
      withAuthRefresh(() => api.auth.login.post(data)),

    signUp: async (data: {
      username: string;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      tenantId?: string;
    }): Promise<Awaited<ReturnType<typeof api.users.signup.post>>> =>
      withAuthRefresh(() => api.users.signup.post(data)),

    refreshToken: async (
      refreshToken: string,
    ): Promise<Awaited<ReturnType<typeof api.auth.refresh.post>>> => {
      const userData = storage.getUserData<{ username: string }>();
      if (!userData?.username) {
        throw new Error("Username not found in storage");
      }
      return withAuthRefresh(() =>
        api.auth.refresh.post({ refreshToken, username: userData.username }),
      );
    },
  },

  /**
   * User endpoints
   */
  users: {
    getProfile: async (
      profileId: string,
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.users.profiles>["get"]>>
    > =>
      withAuthRefresh(() =>
        api.users.profiles({ profileId }).get({
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    getMyProfile: async (): Promise<
      Awaited<ReturnType<typeof api.users.profiles.me.get>>
    > =>
      withAuthRefresh(() =>
        api.users.profiles.me.get({
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    updateProfile: async (
      profileId: string,
      data: {
        firstName?: string;
        lastName?: string;
        email?: string;
      },
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.users.profiles>["put"]>>
    > =>
      withAuthRefresh(() =>
        api.users.profiles({ profileId }).put(data, {
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    listProfiles: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.profiles.get>>> =>
      withAuthRefresh(() =>
        api.users.profiles.get({
          query,
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    listAllUsers: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.all.get>>> =>
      withAuthRefresh(() =>
        api.users.all.get({
          query,
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    listAllProfiles: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.all.profiles.get>>> =>
      withAuthRefresh(() =>
        api.users.all.profiles.get({
          query,
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    deleteUser: async (): Promise<
      Awaited<ReturnType<typeof api.users.me.delete>>
    > =>
      withAuthRefresh(() =>
        api.users.me.delete(
          {},
          {
            headers: {
              "x-tenant-id": storage.getTenantId() ?? undefined,
              "x-correlation-id": getCorrelationId(),
              authorization: `Bearer ${storage.getAccessToken()}`,
            },
          },
        ),
      ),

    deleteProfile: async (
      profileId: string,
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.users.profiles>["delete"]>>
    > =>
      withAuthRefresh(() =>
        api.users.profiles({ profileId }).delete(
          {},
          {
            headers: {
              "x-tenant-id": storage.getTenantId() ?? undefined,
              "x-correlation-id": getCorrelationId(),
              authorization: `Bearer ${storage.getAccessToken()}`,
            },
          },
        ),
      ),
  },

  /**
   * Ledger endpoints
   */
  ledger: {
    createEntry: async (data: {
      tenantId: string;
      fromAccountId?: string | null;
      toAccountId?: string | null;
      amount: number | string;
      type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
      createdBy: string;
    }): Promise<Awaited<ReturnType<typeof api.ledger.entries.post>>> =>
      withAuthRefresh(() =>
        api.ledger.entries.post(data, {
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    listEntries: async (query?: {
      status?: "PENDING" | "COMPLETED" | "FAILED";
      type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
      dateFrom?: Date | string;
      dateTo?: Date | string;
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.ledger.entries.get>>> =>
      withAuthRefresh(() =>
        api.ledger.entries.get({
          query,
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    getEntry: async (
      id: string,
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.ledger.entries>["get"]>>
    > =>
      withAuthRefresh(() =>
        api.ledger.entries({ id }).get({
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    updateEntry: async (
      id: string,
      data: {
        status: "PENDING" | "COMPLETED" | "FAILED";
      },
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.ledger.entries>["put"]>>
    > =>
      withAuthRefresh(() =>
        api.ledger.entries({ id }).put(data, {
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    deleteEntry: async (
      id: string,
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.ledger.entries>["delete"]>>
    > =>
      withAuthRefresh(() =>
        api.ledger.entries({ id }).delete(
          {},
          {
            headers: {
              "x-tenant-id": storage.getTenantId() ?? undefined,
              "x-correlation-id": getCorrelationId(),
              authorization: `Bearer ${storage.getAccessToken()}`,
            },
          },
        ),
      ),

    listAllEntries: async (query?: {
      status?: "PENDING" | "COMPLETED" | "FAILED";
      type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
      dateFrom?: Date | string;
      dateTo?: Date | string;
      tenantId?: string;
      page?: number;
      limit?: number;
      includeDeleted?: boolean;
    }): Promise<Awaited<ReturnType<typeof api.ledger.entries.all.get>>> =>
      withAuthRefresh(() =>
        api.ledger.entries.all.get({
          query,
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),
  },

  /**
   * Tenant endpoints
   */
  tenants: {
    listTenants: async (): Promise<
      Awaited<ReturnType<typeof api.tenants.get>>
    > =>
      withAuthRefresh(() =>
        api.tenants.get({
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),

    listAllTenants: async (query?: {
      page?: number;
      limit?: number;
      includeDeleted?: boolean;
    }): Promise<Awaited<ReturnType<typeof api.tenants.all.get>>> =>
      withAuthRefresh(() =>
        api.tenants.all.get({
          query,
          headers: {
            "x-tenant-id": storage.getTenantId() ?? undefined,
            "x-correlation-id": getCorrelationId(),
            authorization: `Bearer ${storage.getAccessToken()}`,
          },
        }),
      ),
  },
};
