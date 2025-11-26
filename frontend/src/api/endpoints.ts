import { api } from "./client";
import { withAuthRefresh } from "./client";
import { storage } from "../utils/storage";
import { getCorrelationId } from "@/utils/correlationId";

/**
 * Builds headers for API requests with authentication and optional tenant/correlation IDs
 * @returns Headers object with authorization token and optional tenant/correlation IDs
 */
function buildHeaders(): {
  "x-tenant-id"?: string;
  "x-correlation-id"?: string;
  authorization: string;
} {
  const headers: {
    "x-tenant-id"?: string;
    "x-correlation-id"?: string;
    authorization: string;
  } = {
    authorization: `Bearer ${storage.getAccessToken()}`,
  };

  const tenantId = storage.getTenantId();
  if (tenantId) {
    headers["x-tenant-id"] = tenantId;
  }

  const correlationId = getCorrelationId();
  if (correlationId) {
    headers["x-correlation-id"] = correlationId;
  }

  return headers;
}

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
          headers: buildHeaders(),
        }),
      ),

    getMyProfile: async (): Promise<
      Awaited<ReturnType<typeof api.users.profiles.me.get>>
    > =>
      withAuthRefresh(() =>
        api.users.profiles.me.get({
          headers: buildHeaders(),
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
          headers: buildHeaders(),
        }),
      ),

    listProfiles: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.profiles.get>>> =>
      withAuthRefresh(() =>
        api.users.profiles.get({
          query,
          headers: buildHeaders(),
        }),
      ),

    listProfilesByTenant: async (
      tenantId: string,
    ): Promise<Awaited<ReturnType<typeof api.users.tenant.profiles.get>>> =>
      withAuthRefresh(() =>
        api.users.tenant.profiles.get({
          query: { tenantId },
          headers: buildHeaders(),
        }),
      ),

    createProfile: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      tenantId: string;
    }): Promise<Awaited<ReturnType<typeof api.users.profiles.post>>> =>
      withAuthRefresh(() =>
        api.users.profiles.post(data, {
          headers: buildHeaders(),
        }),
      ),

    listAllUsers: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.all.get>>> =>
      withAuthRefresh(() =>
        api.users.all.get({
          query,
          headers: buildHeaders(),
        }),
      ),

    listAllProfiles: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.all.profiles.get>>> =>
      withAuthRefresh(() =>
        api.users.all.profiles.get({
          query,
          headers: buildHeaders(),
        }),
      ),

    deleteUser: async (): Promise<
      Awaited<ReturnType<typeof api.users.me.delete>>
    > =>
      withAuthRefresh(() =>
        api.users.me.delete({}, { headers: buildHeaders() }),
      ),

    deleteProfile: async (
      profileId: string,
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.users.profiles>["delete"]>>
    > =>
      withAuthRefresh(() =>
        api.users
          .profiles({ profileId })
          .delete({}, { headers: buildHeaders() }),
      ),
  },

  /**
   * Ledger endpoints
   */
  ledger: {
    createEntry: async (data: {
      tenantId: string;
      fromAccountId: string;
      toAccountId?: string | null;
      amount: number | string;
      type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
    }): Promise<Awaited<ReturnType<typeof api.ledger.entries.post>>> =>
      withAuthRefresh(() =>
        api.ledger.entries.post(
          data as Parameters<typeof api.ledger.entries.post>[0],
          {
            headers: buildHeaders(),
          },
        ),
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
          headers: buildHeaders(),
        }),
      ),

    getEntry: async (
      id: string,
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.ledger.entries>["get"]>>
    > =>
      withAuthRefresh(() =>
        api.ledger.entries({ id }).get({
          headers: buildHeaders(),
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
          headers: buildHeaders(),
        }),
      ),

    deleteEntry: async (
      id: string,
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.ledger.entries>["delete"]>>
    > =>
      withAuthRefresh(() =>
        api.ledger.entries({ id }).delete({}, { headers: buildHeaders() }),
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
          headers: buildHeaders(),
        }),
      ),
  },

  /**
   * Tenant endpoints
   */
  tenants: {
    listPublicTenants: async (): Promise<
      Awaited<ReturnType<typeof api.tenants.public.get>>
    > => api.tenants.public.get(),

    listTenants: async (): Promise<
      Awaited<ReturnType<typeof api.tenants.get>>
    > =>
      withAuthRefresh(() =>
        api.tenants.get({
          headers: buildHeaders(),
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
          headers: buildHeaders(),
        }),
      ),
  },

  /**
   * Account endpoints
   */
  accounts: {
    getMyAccounts: async (): Promise<
      Awaited<ReturnType<typeof api.accounts.my.get>>
    > =>
      withAuthRefresh(() =>
        api.accounts.my.get({
          headers: buildHeaders(),
        }),
      ),

    listAccountsByProfile: async (
      profileId: string,
    ): Promise<
      Awaited<ReturnType<ReturnType<typeof api.accounts.profile>["get"]>>
    > =>
      withAuthRefresh(() =>
        api.accounts.profile({ profileId }).get({
          headers: buildHeaders(),
        }),
      ),

    listProfilesWithAccounts: async (): Promise<
      Awaited<ReturnType<typeof api.accounts.profiles.get>>
    > =>
      withAuthRefresh(() =>
        api.accounts.profiles.get({
          headers: buildHeaders(),
        }),
      ),

    createAccount: async (data: {
      tenantId: string;
      profileId: string | null;
      name: string;
      initialBalance?: number | string;
    }): Promise<Awaited<ReturnType<typeof api.accounts.post>>> =>
      withAuthRefresh(() =>
        api.accounts.post(
          {
            tenantId: data.tenantId,
            profileId: data.profileId ?? "",
            name: data.name,
            initialBalance: data.initialBalance,
          },
          {
            headers: buildHeaders(),
          },
        ),
      ),
  },
};
