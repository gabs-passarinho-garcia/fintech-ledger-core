import { treaty } from "@elysiajs/eden";
import { storage } from "../utils/storage";
import { logger } from "../utils/logger";
import { App } from "@/types/app";

/**
 * Base URL for the API
 * Vite automatically loads .env file and exposes VITE_ prefixed variables via import.meta.env
 * The VITE_ prefix is required for client-side environment variables
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3010";

const UNKNOWN_ERROR_MESSAGE = "Unknown error";

/**
 * Creates and configures the Eden Treaty client
 * Automatically adds correlation ID and authorization headers
 * @returns Configured Eden Treaty client instance
 */
function createApiClient(): ReturnType<typeof treaty<App>> {
  return treaty<App>(API_BASE_URL);
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
    logger.warn(
      { hasRefreshToken: false },
      "refresh_access_token:no_token",
      "ApiClient",
    );
    return null;
  }

  // Get username from stored user data
  const userData = storage.getUserData<{ username: string }>();
  if (!userData?.username) {
    logger.warn(
      { hasUserData: !!userData, hasUsername: !!userData?.username },
      "refresh_access_token:no_username",
      "ApiClient",
    );
    return null;
  }

  try {
    logger.debug(
      { username: userData.username, hasRefreshToken: !!refreshToken },
      "refresh_access_token:attempting",
      "ApiClient",
    );

    const response = await api.auth.refresh.post({
      refreshToken,
      username: userData.username,
    });

    if (response.data?.data?.accessToken && response.data?.data?.refreshToken) {
      storage.setAccessToken(response.data.data.accessToken);
      storage.setRefreshToken(response.data.data.refreshToken);
      logger.info(
        {
          username: userData.username,
          hasNewAccessToken: !!response.data.data.accessToken,
          hasNewRefreshToken: !!response.data.data.refreshToken,
        },
        "refresh_access_token:success",
        "ApiClient",
      );
      return {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    }

    logger.warn(
      {
        hasAccessToken: !!response.data?.data?.accessToken,
        hasRefreshToken: !!response.data?.data?.refreshToken,
        responseStructure: {
          hasData: !!response.data,
          hasNestedData: !!response.data?.data,
        },
      },
      "refresh_access_token:invalid_response",
      "ApiClient",
    );
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    const errorDetails = isUnauthorizedError(error)
      ? "401 Unauthorized"
      : errorMessage;

    logger.error(
      {
        error: errorDetails,
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
        isUnauthorized: isUnauthorizedError(error),
      },
      "refresh_access_token:error",
      "ApiClient",
    );
    // Refresh failed, clear tokens
    storage.clear();
    return null;
  }
}

/**
 * Checks if an error object contains NOT_SIGNED error information
 * @param errorObj - Error object to check
 * @returns True if contains NOT_SIGNED error
 */
function hasNotSignedError(errorObj: Record<string, unknown>): boolean {
  // Check for errorName: "NOT_SIGNED"
  if (
    "errorName" in errorObj &&
    typeof errorObj.errorName === "string" &&
    errorObj.errorName === "NOT_SIGNED"
  ) {
    return true;
  }

  // Check for statusCode: 401
  if (
    "statusCode" in errorObj &&
    typeof errorObj.statusCode === "number" &&
    errorObj.statusCode === 401
  ) {
    return true;
  }

  // Check for errorCode: 401
  if (
    "errorCode" in errorObj &&
    typeof errorObj.errorCode === "number" &&
    errorObj.errorCode === 401
  ) {
    return true;
  }

  return false;
}

/**
 * Gets HTTP status from error object
 * @param errorObj - Error object
 * @returns HTTP status code or null
 */
function getHttpStatus(errorObj: Record<string, unknown>): number | null {
  if ("status" in errorObj && typeof errorObj.status === "number") {
    return errorObj.status;
  }
  if ("statusCode" in errorObj && typeof errorObj.statusCode === "number") {
    return errorObj.statusCode;
  }
  return null;
}

/**
 * Checks nested object structures for NOT_SIGNED error
 * @param errorObj - Error object to check
 * @returns True if NOT_SIGNED found in nested structures
 */
function checkNestedStructures(errorObj: Record<string, unknown>): boolean {
  // Check error.response (common in HTTP libraries)
  if (
    "response" in errorObj &&
    errorObj.response !== null &&
    typeof errorObj.response === "object" &&
    hasNotSignedError(errorObj.response as Record<string, unknown>)
  ) {
    return true;
  }

  // Check error.data (common in Eden Treaty)
  if (
    "data" in errorObj &&
    errorObj.data !== null &&
    typeof errorObj.data === "object" &&
    hasNotSignedError(errorObj.data as Record<string, unknown>)
  ) {
    return true;
  }

  // Check error.body
  if (
    "body" in errorObj &&
    errorObj.body !== null &&
    typeof errorObj.body === "object" &&
    hasNotSignedError(errorObj.body as Record<string, unknown>)
  ) {
    return true;
  }

  // Check error.error structure
  if (
    "error" in errorObj &&
    errorObj.error !== null &&
    typeof errorObj.error === "object"
  ) {
    const nestedError = errorObj.error as Record<string, unknown>;

    if (hasNotSignedError(nestedError)) {
      return true;
    }

    // Check deeply nested error.error.error
    if (
      "error" in nestedError &&
      nestedError.error !== null &&
      typeof nestedError.error === "object" &&
      hasNotSignedError(nestedError.error as Record<string, unknown>)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if an error is a 401 Unauthorized error
 * Handles multiple error structures from Eden Treaty
 * Also handles cases where server returns 500 but body contains NOT_SIGNED
 * @param error - The error to check
 * @returns True if the error is a 401 error
 */
function isUnauthorizedError(error: unknown): boolean {
  if (error === null || typeof error !== "object") {
    return false;
  }

  const errorObj = error as Record<string, unknown>;

  // Check direct HTTP status (401)
  const httpStatus = getHttpStatus(errorObj);
  if (httpStatus === 401) {
    return true;
  }

  // Check top-level error object for NOT_SIGNED
  if (hasNotSignedError(errorObj)) {
    return true;
  }

  // Check if status is 500 or any error status, but body contains NOT_SIGNED error
  // This handles the case where backend returns wrong HTTP status but correct error in body
  if (httpStatus === 500 || httpStatus !== null) {
    return checkNestedStructures(errorObj);
  }

  // Check nested structures even without explicit status
  return checkNestedStructures(errorObj);
}

/**
 * Checks if a value is a number
 * @param value - Value to check
 * @returns True if value is a number
 */
function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

/**
 * Gets status code from an error object
 * @param error - Error object to extract status code from
 * @returns Status code if found, null otherwise
 */
function getStatusCodeFromError(error: Record<string, unknown>): number | null {
  if ("status" in error && isNumber(error.status)) {
    return error.status;
  }
  if ("statusCode" in error && isNumber(error.statusCode)) {
    return error.statusCode;
  }
  return null;
}

/**
 * Gets message from nested error structure
 * @param nestedError - Nested error object
 * @returns Error message if found, null otherwise
 */
function getMessageFromNestedError(
  nestedError: Record<string, unknown>,
): string | null {
  const statusCode = getStatusCodeFromError(nestedError);
  if (statusCode !== null) {
    return `HTTP ${statusCode}`;
  }
  if ("message" in nestedError && typeof nestedError.message === "string") {
    return nestedError.message;
  }
  return null;
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

  if (!error || typeof error !== "object") {
    return UNKNOWN_ERROR_MESSAGE;
  }

  const errorObj = error as Record<string, unknown>;

  // Try to get status code from top level
  const statusCode = getStatusCodeFromError(errorObj);
  if (statusCode !== null) {
    return `HTTP ${statusCode}`;
  }

  // Try nested error structure
  if (
    "error" in errorObj &&
    errorObj.error !== null &&
    typeof errorObj.error === "object"
  ) {
    const nestedMessage = getMessageFromNestedError(
      errorObj.error as Record<string, unknown>,
    );
    if (nestedMessage !== null) {
      return nestedMessage;
    }
  }

  return UNKNOWN_ERROR_MESSAGE;
}

/**
 * Redirects user to login page and clears authentication data
 * Uses window.location.href to ensure redirect works outside React Router context
 */
function redirectToLogin(): void {
  logger.info({}, "redirect_to_login:start", "ApiClient");
  storage.clear();
  // Use window.location.href to ensure redirect works everywhere
  window.location.href = "/login";
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
    logger.info(
      { hasNewTokens: true },
      "with_auth_refresh:retry_after_refresh",
      "ApiClient",
    );
    return await apiCall();
  }
  logger.error(
    { hasNewTokens: false },
    "with_auth_refresh:refresh_failed",
    "ApiClient",
  );
  return null;
}

/**
 * Wrapper for API calls that handles token refresh on 401 errors
 * Automatically redirects to login if refresh fails
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
      logger.debug(
        {
          errorType:
            error instanceof Error ? error.constructor.name : typeof error,
          hasStatus: error && typeof error === "object" && "status" in error,
          hasStatusCode:
            error && typeof error === "object" && "statusCode" in error,
        },
        "with_auth_refresh:401_detected",
        "ApiClient",
      );
      const result = await handleUnauthorizedError(apiCall);
      if (result !== null) {
        return result;
      }
      // Refresh failed, redirect to login
      logger.warn({}, "with_auth_refresh:redirecting_to_login", "ApiClient");
      redirectToLogin();
      // Throw error to prevent further execution
      throw error;
    } else {
      logger.error(
        { error: getErrorMessage(error), isUnauthorized: false },
        "with_auth_refresh:api_error",
        "ApiClient",
      );
    }
    throw error;
  }
}
