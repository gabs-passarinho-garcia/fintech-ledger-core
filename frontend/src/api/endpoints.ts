import { api } from "./client";
import { withAuthRefresh } from "./client";
import { storage } from "../utils/storage";

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
      Awaited<ReturnType<(typeof api.users.profiles)[":profileId"]["get"]>>
    > =>
      withAuthRefresh(() =>
        api.users.profiles[":profileId"].get({ params: { profileId } }),
      ),

    getMyProfile: async (): Promise<
      Awaited<ReturnType<typeof api.users.profiles.me.get>>
    > => withAuthRefresh(() => api.users.profiles.me.get()),

    updateProfile: async (
      profileId: string,
      data: {
        firstName?: string;
        lastName?: string;
        email?: string;
      },
    ): Promise<
      Awaited<ReturnType<(typeof api.users.profiles)[":profileId"]["put"]>>
    > =>
      withAuthRefresh(() =>
        api.users.profiles[":profileId"].put({
          params: { profileId },
          body: data,
        }),
      ),

    listProfiles: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.profiles.get>>> =>
      withAuthRefresh(() => api.users.profiles.get({ query })),

    listAllUsers: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.all.get>>> =>
      withAuthRefresh(() => api.users.all.get({ query })),

    listAllProfiles: async (query?: {
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.users.profiles.all.get>>> =>
      withAuthRefresh(() => api.users.profiles.all.get({ query })),

    deleteUser: async (
      userId: string,
    ): Promise<Awaited<ReturnType<(typeof api.users)[":userId"]["delete"]>>> =>
      withAuthRefresh(() =>
        api.users[":userId"].delete({ params: { userId } }),
      ),

    deleteProfile: async (
      profileId: string,
    ): Promise<
      Awaited<ReturnType<(typeof api.users.profiles)[":profileId"]["delete"]>>
    > =>
      withAuthRefresh(() =>
        api.users.profiles[":profileId"].delete({ params: { profileId } }),
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
      withAuthRefresh(() => api.ledger.entries.post(data)),

    listEntries: async (query?: {
      status?: "PENDING" | "COMPLETED" | "FAILED";
      type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
      dateFrom?: Date | string;
      dateTo?: Date | string;
      page?: number;
      limit?: number;
    }): Promise<Awaited<ReturnType<typeof api.ledger.entries.get>>> =>
      withAuthRefresh(() => api.ledger.entries.get({ query })),

    getEntry: async (
      id: string,
    ): Promise<
      Awaited<ReturnType<(typeof api.ledger.entries)[":id"]["get"]>>
    > =>
      withAuthRefresh(() => api.ledger.entries[":id"].get({ params: { id } })),

    updateEntry: async (
      id: string,
      data: {
        status: "PENDING" | "COMPLETED" | "FAILED";
      },
    ): Promise<
      Awaited<ReturnType<(typeof api.ledger.entries)[":id"]["put"]>>
    > =>
      withAuthRefresh(() =>
        api.ledger.entries[":id"].put({ params: { id }, body: data }),
      ),

    deleteEntry: async (
      id: string,
    ): Promise<
      Awaited<ReturnType<(typeof api.ledger.entries)[":id"]["delete"]>>
    > =>
      withAuthRefresh(() =>
        api.ledger.entries[":id"].delete({ params: { id } }),
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
      withAuthRefresh(() => api.ledger.entries.all.get({ query })),
  },

  /**
   * Tenant endpoints
   */
  tenants: {
    listTenants: async (): Promise<
      Awaited<ReturnType<typeof api.tenants.get>>
    > => withAuthRefresh(() => api.tenants.get()),

    listAllTenants: async (query?: {
      page?: number;
      limit?: number;
      includeDeleted?: boolean;
    }): Promise<Awaited<ReturnType<typeof api.tenants.all.get>>> =>
      withAuthRefresh(() => api.tenants.all.get({ query })),
  },
};
