const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';
const TENANT_ID_KEY = 'tenant_id';

/**
 * Storage utilities for managing authentication tokens and user data
 */

export const storage = {
  /**
   * Sets the access token in localStorage
   */
  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Gets the access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Sets the refresh token in localStorage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Gets the refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Sets user data in localStorage
   */
  setUserData(data: unknown): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  },

  /**
   * Gets user data from localStorage
   */
  getUserData<T>(): T | null {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  /**
   * Sets tenant ID in localStorage
   */
  setTenantId(tenantId: string): void {
    localStorage.setItem(TENANT_ID_KEY, tenantId);
  },

  /**
   * Gets tenant ID from localStorage
   */
  getTenantId(): string | null {
    return localStorage.getItem(TENANT_ID_KEY);
  },

  /**
   * Clears all authentication data
   */
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(TENANT_ID_KEY);
  },
};

