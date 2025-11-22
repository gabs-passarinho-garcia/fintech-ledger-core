import { treaty } from "@elysiajs/eden";
import { getCorrelationId } from "../utils/correlationId";
import { storage } from "../utils/storage";
import type { App } from "../../../backend/src/app";

/**
 * Base URL for the API
 * Vite automatically loads .env file and exposes VITE_ prefixed variables via import.meta.env
 * The VITE_ prefix is required for client-side environment variables
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3010";

/**
 * Creates and configures the Eden Treaty client
 * Automatically adds correlation ID and authorization headers
 * @returns Configured Eden Treaty client instance
 */
function createApiClient() {
  return treaty<App>(API_BASE_URL, {
    headers: () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add correlation ID
      const correlationId = getCorrelationId();
      if (correlationId) {
        headers["x-correlation-id"] = correlationId;
      }

      // Add authorization token
      const accessToken = storage.getAccessToken();
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      return headers;
    },
  });
}

/**
 * API client instance
 */
export const api = createApiClient();

/**
 * Refreshes the access token using the refresh token
 * @returns Promise with new tokens or null if refresh fails
 */
export async function refreshAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  // Get username from stored user data
  const userData = storage.getUserData<{ username: string }>();
  if (!userData?.username) {
    return null;
  }

  try {
    const response = await api.auth.refresh.post({
      refreshToken,
      username: userData.username,
    });

    if (response.data?.data?.accessToken && response.data?.data?.refreshToken) {
      storage.setAccessToken(response.data.data.accessToken);
      storage.setRefreshToken(response.data.data.refreshToken);
      return {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    }

    return null;
  } catch {
    // Refresh failed, clear tokens
    storage.clear();
    return null;
  }
}

/**
 * Wrapper for API calls that handles token refresh on 401 errors
 * @param apiCall - The API call function
 * @returns Promise with the API response
 */
export async function withAuthRefresh<T>(
  apiCall: () => Promise<T>,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    // Check if error is 401 Unauthorized
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 401
    ) {
      // Try to refresh token
      const newTokens = await refreshAccessToken();
      if (newTokens) {
        // Retry the original request with new token
        return await apiCall();
      }
      // Refresh failed, throw original error
    }
    throw error;
  }
}
