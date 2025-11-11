import type { SessionData } from '@/common/providers/SessionHandler';
import { DomainError } from '@/common/errors';

/**
 * Helper service for extracting context from session data.
 * Follows SRP by handling only session data extraction.
 */
export class SessionContextExtractor {
  /**
   * Extracts tenantId from session data.
   *
   * @param session - The session data
   * @returns The tenant ID
   * @throws {DomainError} If tenantId is not found in session
   */
  public static extractTenantId(session: SessionData): string {
    if (!session.tenantId) {
      throw new DomainError({
        message: 'Tenant ID not found in session',
      });
    }

    return session.tenantId;
  }

  /**
   * Extracts userId from session data.
   *
   * @param session - The session data
   * @returns The user ID
   * @throws {DomainError} If userId is not found in session
   */
  public static extractUserId(session: SessionData): string {
    if (!session.userId) {
      throw new DomainError({
        message: 'User ID not found in session',
      });
    }

    return session.userId;
  }
}
