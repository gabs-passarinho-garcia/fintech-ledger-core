/**
 * JWT utility functions
 * Handles JWT token decoding and extraction
 */

/**
 * Decodes a JWT token without verification
 * Note: This is client-side only and should not be used for security validation
 * @param token - The JWT token string
 * @returns The decoded payload or null if invalid
 */
export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extracts user information from a JWT token
 * @param token - The JWT token string
 * @returns User information from token or null if invalid
 */
export function extractUserFromToken(token: string): {
  userId?: string;
  username?: string;
  isMaster?: boolean;
} | null {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  return {
    userId: decoded.userId as string | undefined,
    username: decoded.username as string | undefined,
    isMaster: decoded.isMaster as boolean | undefined,
  };
}
