/**
 * Type definitions for the application
 */

/**
 * User data structure
 */
export interface User {
  id: string;
  username: string;
  createdAt: Date | string;
  isMaster?: boolean;
}

/**
 * Profile data structure
 */
export interface Profile {
  id: string;
  userId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Sign in response
 */
export interface SignInResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  tenantId?: string;
  userEmail?: string;
  username: string;
  status: string;
}

/**
 * Sign up response
 */
export interface SignUpResponse {
  user: User;
  profile?: Profile;
}

/**
 * Ledger entry
 */
export interface LedgerEntry {
  id: string;
  tenantId: string;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  amount: string;
  type: string;
  status: string;
  createdBy: string;
  createdAt: Date | string;
  updatedBy?: string | null;
  updatedAt: Date | string;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * List response with pagination
 */
export interface ListResponse<T> {
  entries: T[];
  pagination: Pagination;
}

/**
 * Tenant data structure
 */
export interface Tenant {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date | string;
  updatedBy?: string | null;
  updatedAt: Date | string;
  deletedBy?: string | null;
  deletedAt?: Date | string | null;
}

/**
 * API error response
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: unknown;
}
