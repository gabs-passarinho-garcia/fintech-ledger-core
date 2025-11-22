import { AsyncLocalStorage } from 'node:async_hooks';
import { AccessType as AccessTypeEnum } from '../enums/AccessType';

const UNKNOWN_CORRELATION_ID = 'unknown';
const UNKNOWN_ENDPOINT = 'unknown';

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
 * @class SessionHandler
 * @description Handles session data using AsyncLocalStorage (CLS) for request-scoped isolation.
 * This class is stateless and manages session data through CLS context, allowing automatic
 * propagation through async operations without explicit dependency injection.
 */
export class SessionHandler {
  private static readonly context = new AsyncLocalStorage<SessionData>();

  /**
   * @method getDefaultSessionData
   * @description Returns default session data when context is not initialized.
   * @returns Default SessionData with NOT_AUTHENTICATED access type
   */
  private static getDefaultSessionData(): SessionData {
    return { accessType: AccessTypeEnum.NOT_AUTHENTICATED };
  }

  /**
   * @method getContextData
   * @description Retrieves session data from AsyncLocalStorage context with fallback to default.
   * @returns Current session data or default if context is not initialized
   */
  private getContextData(): SessionData {
    const store = SessionHandler.context.getStore();
    return store || SessionHandler.getDefaultSessionData();
  }

  /**
   * @method initialize
   * @description Initializes AsyncLocalStorage context for the current async execution context.
   * This should be called at the beginning of each request to establish session isolation.
   * The context will remain active throughout the entire request lifecycle.
   */
  public initialize(): void {
    const initialData: SessionData = { ...SessionHandler.getDefaultSessionData() };
    SessionHandler.context.enterWith(initialData);
  }

  /**
   * @method run
   * @description Initializes AsyncLocalStorage context and executes callback within that context.
   * This method should be called at the beginning of each request to establish session isolation.
   * @template T Return type of the callback
   * @param callback Function to execute within the CLS context
   * @returns Result of the callback execution
   */
  public run<T>(callback: () => T): T {
    // Create a mutable object for the context store
    const initialData: SessionData = { ...SessionHandler.getDefaultSessionData() };
    return SessionHandler.context.run(initialData, callback);
  }

  /**
   * @method enrich
   * @description Enriches current session data with partial updates.
   * Merges new data with existing context data and updates the store.
   * @param partial Partial session data to merge with existing data
   */
  public enrich(partial: Partial<SessionData>): void {
    const store = SessionHandler.context.getStore();
    if (store) {
      // Directly modify the store object (it's mutable)
      Object.assign(store, partial);
    }
    // If context is not initialized, enrich() is a no-op
    // The context should be initialized via run() or initialize() before enrich() is called
  }

  /**
   * @method get
   * @description Retrieves a copy of current session data from CLS context.
   * @returns Copy of current session data or default if context is not initialized
   */
  public get(): SessionData {
    return { ...this.getContextData() };
  }

  /**
   * @method getAgent
   * @description Generates an agent identifier string from session data.
   * Returns userId if available, otherwise constructs identifier from accessType, correlationId, and endpoint.
   * @returns Agent identifier string
   */
  public getAgent(): string {
    const data = this.getContextData();
    if (data.userId) return data.userId;
    const accessType = data.accessType || AccessTypeEnum.NOT_AUTHENTICATED;
    const correlationId = data.correlationId || UNKNOWN_CORRELATION_ID;
    const endpoint = data.endpoint || UNKNOWN_ENDPOINT;
    return `${accessType}:${correlationId}:${endpoint}`;
  }

  /**
   * @method clear
   * @description Clears the current CLS context by entering with undefined.
   * This is primarily useful for testing to ensure clean state between tests.
   * @internal This method is exposed for testing purposes only.
   */
  public clear(): void {
    // Use enterWith with undefined to clear the context
    // This will make getStore() return undefined
    SessionHandler.context.enterWith(undefined as unknown as SessionData);
  }
}
