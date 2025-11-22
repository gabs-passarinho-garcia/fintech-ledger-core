import { api } from './client';
import { withAuthRefresh } from './client';
import { storage } from '../utils/storage';

/**
 * API endpoints organized by domain
 * All endpoints use the Eden Treaty client with automatic auth refresh
 */

export const endpoints = {
  /**
   * Authentication endpoints
   */
  auth: {
    signIn: async (data: { username: string; password: string; tenantId?: string }) =>
      withAuthRefresh(() => api.auth.login.post(data)),

    signUp: async (data: {
      username: string;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      tenantId?: string;
    }) => withAuthRefresh(() => api.users.signup.post(data)),

    refreshToken: async (refreshToken: string) => {
      const userData = storage.getUserData<{ username: string }>();
      if (!userData?.username) {
        throw new Error('Username not found in storage');
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
    getProfile: async (profileId: string) =>
      withAuthRefresh(() => api.users.profiles[':profileId'].get({ params: { profileId } })),

    getMyProfile: async () => withAuthRefresh(() => api.users.profiles.me.get()),

    updateProfile: async (
      profileId: string,
      data: {
        firstName?: string;
        lastName?: string;
        email?: string;
      },
    ) =>
      withAuthRefresh(() =>
        api.users.profiles[':profileId'].put({ params: { profileId }, body: data }),
      ),

    listProfiles: async (query?: { page?: number; limit?: number }) =>
      withAuthRefresh(() => api.users.profiles.get({ query })),

    listAllUsers: async (query?: { page?: number; limit?: number }) =>
      withAuthRefresh(() => api.users.all.get({ query })),

    listAllProfiles: async (query?: { page?: number; limit?: number }) =>
      withAuthRefresh(() => api.users.profiles.all.get({ query })),

    deleteUser: async (userId: string) =>
      withAuthRefresh(() => api.users[':userId'].delete({ params: { userId } })),

    deleteProfile: async (profileId: string) =>
      withAuthRefresh(() => api.users.profiles[':profileId'].delete({ params: { profileId } })),
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
      type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
      createdBy: string;
    }) => withAuthRefresh(() => api.ledger.entries.post(data)),

    listEntries: async (query?: {
      status?: 'PENDING' | 'COMPLETED' | 'FAILED';
      type?: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
      dateFrom?: Date | string;
      dateTo?: Date | string;
      page?: number;
      limit?: number;
    }) => withAuthRefresh(() => api.ledger.entries.get({ query })),

    getEntry: async (id: string) =>
      withAuthRefresh(() => api.ledger.entries[':id'].get({ params: { id } })),

    updateEntry: async (
      id: string,
      data: {
        status: 'PENDING' | 'COMPLETED' | 'FAILED';
      },
    ) => withAuthRefresh(() => api.ledger.entries[':id'].put({ params: { id }, body: data })),

    deleteEntry: async (id: string) =>
      withAuthRefresh(() => api.ledger.entries[':id'].delete({ params: { id } })),
  },
};
