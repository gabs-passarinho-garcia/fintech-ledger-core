import { describe, it, expect, beforeEach } from 'bun:test';
import {
  generateCorrelationId,
  getCorrelationId,
  setCorrelationId,
  clearCorrelationId,
  resetCorrelationId,
} from '../correlationId';

describe('correlationId', () => {
  beforeEach(() => {
    clearCorrelationId();
  });

  it('should generate a correlation ID', () => {
    const id = generateCorrelationId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should get correlation ID from storage', () => {
    const id = generateCorrelationId();
    setCorrelationId(id);
    const retrieved = getCorrelationId();
    expect(retrieved).toBe(id);
  });

  it('should generate new ID if none exists', () => {
    clearCorrelationId();
    const id = getCorrelationId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('should clear correlation ID', () => {
    const id = generateCorrelationId();
    setCorrelationId(id);
    clearCorrelationId();
    const newId = getCorrelationId();
    expect(newId).not.toBe(id);
  });

  it('should reset correlation ID', () => {
    const id1 = generateCorrelationId();
    setCorrelationId(id1);
    const id2 = resetCorrelationId();
    expect(id2).not.toBe(id1);
    expect(getCorrelationId()).toBe(id2);
  });
});

