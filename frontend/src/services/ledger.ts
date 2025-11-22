import { endpoints } from "../api/endpoints";
import type { LedgerEntry, ListResponse } from "../types";

/**
 * Ledger service
 * Handles ledger entry operations
 */

export interface CreateLedgerEntryInput {
  tenantId: string;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  amount: number | string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  createdBy: string;
}

export interface UpdateLedgerEntryInput {
  status: "PENDING" | "COMPLETED" | "FAILED";
}

export interface ListLedgerEntriesQuery {
  status?: "PENDING" | "COMPLETED" | "FAILED";
  type?: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  dateFrom?: Date | string;
  dateTo?: Date | string;
  page?: number;
  limit?: number;
}

/**
 * Creates a new ledger entry
 */
export async function createLedgerEntry(
  input: CreateLedgerEntryInput,
): Promise<LedgerEntry> {
  const response = await endpoints.ledger.createEntry(input);

  if (!response.data?.data) {
    throw new Error("Failed to create ledger entry");
  }

  return response.data.data;
}

/**
 * Lists ledger entries
 */
export async function listLedgerEntries(
  query?: ListLedgerEntriesQuery,
): Promise<ListResponse<LedgerEntry>> {
  const response = await endpoints.ledger.listEntries(query);

  if (!response.data?.data) {
    throw new Error("Failed to list ledger entries");
  }

  return response.data.data;
}

/**
 * Gets a ledger entry by ID
 */
export async function getLedgerEntry(id: string): Promise<LedgerEntry> {
  const response = await endpoints.ledger.getEntry(id);

  if (!response.data?.data) {
    throw new Error("Ledger entry not found");
  }

  return response.data.data;
}

/**
 * Updates a ledger entry
 */
export async function updateLedgerEntry(
  id: string,
  input: UpdateLedgerEntryInput,
): Promise<LedgerEntry> {
  const response = await endpoints.ledger.updateEntry(id, input);

  if (!response.data?.data) {
    throw new Error("Failed to update ledger entry");
  }

  return response.data.data;
}

/**
 * Deletes a ledger entry
 */
export async function deleteLedgerEntry(id: string): Promise<void> {
  const response = await endpoints.ledger.deleteEntry(id);

  if (response.error) {
    throw new Error("Failed to delete ledger entry");
  }
}
