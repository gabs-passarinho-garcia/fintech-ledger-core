const UNKNOWN_CORRELATION_ID = 'unknown';
const UNKNOWN_ENDPOINT = 'unknown';

import { AccessType as AccessTypeEnum } from '../enums/AccessType';

/**
 * Access type for session authentication
 */
export type AccessType = AccessTypeEnum;

export type SessionData = {
  userId?: string;
  tenantId?: string;
  accessType: AccessType;
  correlationId?: string;
  endpoint?: string;
};

/**
 * Session handler for managing request-scoped session data.
 * Stores correlation ID, endpoint, and authentication context.
 */
export class SessionHandler {
  private data: SessionData;

  public constructor() {
    this.data = { accessType: AccessTypeEnum.NOT_AUTHENTICATED };
  }

  /**
   * Enriches the session data with partial updates.
   *
   * @param partial - Partial session data to merge
   */
  public enrich(partial: Partial<SessionData>): void {
    this.data = { ...this.data, ...partial };
  }

  /**
   * Gets a copy of the current session data.
   *
   * @returns A copy of the session data
   */
  public get(): SessionData {
    return { ...this.data };
  }

  /**
   * Gets an agent identifier for logging purposes.
   * Returns userId if available, otherwise a composite identifier.
   *
   * @returns Agent identifier string
   */
  public getAgent(): string {
    if (this.data.userId) return this.data.userId;
    const accessType = this.data.accessType || AccessTypeEnum.NOT_AUTHENTICATED;
    const correlationId = this.data.correlationId || UNKNOWN_CORRELATION_ID;
    const endpoint = this.data.endpoint || UNKNOWN_ENDPOINT;
    return `${accessType}:${correlationId}:${endpoint}`;
  }
}
