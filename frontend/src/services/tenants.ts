import { endpoints } from "../api/endpoints";
import type { Tenant } from "../types";

/**
 * Tenants service
 * Handles tenant management operations
 */

/**
 * Lists public tenants (no authentication required)
 */
export async function listPublicTenants(): Promise<{
  tenants: Array<{ id: string; name: string }>;
}> {
  const response = await endpoints.tenants.listPublicTenants();

  if (
    !response ||
    typeof response !== "object" ||
    !("data" in response) ||
    !response.data ||
    typeof response.data !== "object" ||
    !("data" in response.data) ||
    !response.data.data
  ) {
    throw new Error("Failed to list public tenants");
  }

  return response.data.data as { tenants: Array<{ id: string; name: string }> };
}

/**
 * Lists tenants for the authenticated user
 */
export async function listTenants(): Promise<{ tenants: Tenant[] }> {
  const response = await endpoints.tenants.listTenants();

  if (
    !response ||
    typeof response !== "object" ||
    !("data" in response) ||
    !response.data ||
    typeof response.data !== "object" ||
    !("data" in response.data) ||
    !response.data.data
  ) {
    throw new Error("Failed to list tenants");
  }

  return response.data.data as { tenants: Tenant[] };
}

/**
 * Lists all tenants (admin only)
 */
export async function listAllTenants(query?: {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}): Promise<{ tenants: Tenant[]; pagination: unknown }> {
  const response = await endpoints.tenants.listAllTenants(query);

  if (
    !response ||
    typeof response !== "object" ||
    !("data" in response) ||
    !response.data ||
    typeof response.data !== "object" ||
    !("data" in response.data) ||
    !response.data.data
  ) {
    throw new Error("Failed to list all tenants");
  }

  return response.data.data as { tenants: Tenant[]; pagination: unknown };
}
