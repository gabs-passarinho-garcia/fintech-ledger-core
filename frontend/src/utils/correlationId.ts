import { uuidv7 } from 'uuidv7';

const CORRELATION_ID_KEY = 'x-correlation-id';

/**
 * Generates a new correlation ID using uuidv7
 * @returns A new correlation ID string
 */
export function generateCorrelationId(): string {
  return uuidv7();
}

/**
 * Gets the current correlation ID from sessionStorage or generates a new one
 * @returns The current correlation ID
 */
export function getCorrelationId(): string {
  const stored = sessionStorage.getItem(CORRELATION_ID_KEY);
  if (stored) {
    return stored;
  }

  const newId = generateCorrelationId();
  setCorrelationId(newId);
  return newId;
}

/**
 * Sets the correlation ID in sessionStorage
 * @param correlationId - The correlation ID to store
 */
export function setCorrelationId(correlationId: string): void {
  sessionStorage.setItem(CORRELATION_ID_KEY, correlationId);
}

/**
 * Clears the correlation ID from sessionStorage
 */
export function clearCorrelationId(): void {
  sessionStorage.removeItem(CORRELATION_ID_KEY);
}

/**
 * Resets the correlation ID by generating a new one
 * @returns The new correlation ID
 */
export function resetCorrelationId(): string {
  const newId = generateCorrelationId();
  setCorrelationId(newId);
  return newId;
}

