import { treaty } from "@elysiajs/eden";
import { getCorrelationId } from "../utils/correlationId";
import { storage } from "../utils/storage";
import { logger } from "../utils/logger";
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
function createApiClient(): ReturnType<typeof treaty<App>> {
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
  logger.debug({}, "refresh_access_token:start", "ApiClient");

  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) {
    logger.warn({}, "refresh_access_token:no_token", "ApiClient");
    return null;
  }

  // Get username from stored user data
  const userData = storage.getUserData<{ username: string }>();
  if (!userData?.username) {
    logger.warn({}, "refresh_access_token:no_username", "ApiClient");
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
      logger.debug({}, "refresh_access_token:success", "ApiClient");
      return {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    }

    logger.warn({}, "refresh_access_token:invalid_response", "ApiClient");
    return null;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "refresh_access_token:error",
      "ApiClient",
    );
    // Refresh failed, clear tokens
    storage.clear();
    return null;
  }
}

/**
 * Checks if an error is a 401 Unauthorized error
 * @param error - The error to check
 * @returns True if the error is a 401 error
 */
function isUnauthorizedError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status === 401
  );
}

/**
 * Extracts error message from an error object
 * @param error - The error to extract message from
 * @returns The error message
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "status" in error) {
    return `HTTP ${error.status}`;
  }
  return "Unknown error";
}

/**
 * Handles 401 errors by attempting token refresh
 * @param apiCall - The API call function to retry
 * @returns Promise with the API response or null if refresh failed
 */
async function handleUnauthorizedError<T>(
  apiCall: () => Promise<T>,
): Promise<T | null> {
  logger.warn({}, "with_auth_refresh:401_detected", "ApiClient");
  const newTokens = await refreshAccessToken();
  if (newTokens) {
    logger.debug({}, "with_auth_refresh:retry_after_refresh", "ApiClient");
    return await apiCall();
  }
  logger.error({}, "with_auth_refresh:refresh_failed", "ApiClient");
  return null;
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
    if (isUnauthorizedError(error)) {
      const result = await handleUnauthorizedError(apiCall);
      if (result !== null) {
        return result;
      }
      // Refresh failed, throw original error
    } else {
      logger.error(
        { error: getErrorMessage(error) },
        "with_auth_refresh:api_error",
        "ApiClient",
      );
    }
    throw error;
  }
}
