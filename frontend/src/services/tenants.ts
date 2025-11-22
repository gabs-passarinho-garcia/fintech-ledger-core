import { endpoints } from "../api/endpoints";
import type { Tenant } from "../types";

/**
 * Tenants service
 * Handles tenant management operations
 */

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
