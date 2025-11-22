import { describe, it, expect, mock } from 'bun:test';
import { PaymentProviderFactory } from '../PaymentProviderFactory';
import { Providers } from '@/common/enums/Providers';
import { UnsupportedPaymentProviderError } from '@/common/errors';
import type { IPaymentProvider } from '@/common/interfaces/IPaymentProvider';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import Decimal from 'decimal.js';

describe('PaymentProviderFactory', () => {
  const setup = () => {
    const mockPaymentProvider: IPaymentProvider = {
      createPayment: mock(async () => ({
        externalInvoiceId: 'mock-inv-123',
        status: 'OPEN' as any,
        provider: Providers.MOCK,
      })),
      refundPayment: mock(async () => ({
        success: true,
        refundedValue: new Decimal('100'),
      })),
      handleWebhookNotification: mock(async () => ({
        externalInvoiceId: 'mock-inv-123',
        transactionType: null,
        status: 'PAID' as any,
        amount: 100,
      })),
      extractExternalInvoiceId: mock(async () => ({
        externalInvoiceId: 'mock-inv-123',
      })),
      computeTax: mock(async () => new Decimal('2')),
      createRecipient: mock(async () => ({
        externalRecipient: {
          recipientId: 'recipient-123',
          provider: Providers.MOCK,
        },
      })),
      updateRecipient: mock(async () => ({
        success: true,
      })),
    };

    const mockLogger: ILogger = {
      log: mock(() => {}),
      info: mock(() => {}),
      warn: mock(() => {}),
      error: mock(() => {}),
      debug: mock(() => {}),
    };

    const factory = new PaymentProviderFactory({
      [AppProviders.mockPaymentProvider]: mockPaymentProvider,
      [AppProviders.logger]: mockLogger,
    });

    return {
      factory,
      mockPaymentProvider,
      mockLogger,
    };
  };

  describe('getPaymentProvider', () => {
    it('should return mock provider for tenant', () => {
      const { factory, mockPaymentProvider } = setup();

      const result = factory.getPaymentProvider({
        tenantId: 'tenant-1',
      });

      expect(result).toBeDefined();
      expect(result.paymentProvider).toBe(mockPaymentProvider);
      expect(result.fallbackProvider).toBeUndefined();
    });

    it('should log provider selection', () => {
      const { factory, mockLogger } = setup();

      factory.getPaymentProvider({
        tenantId: 'tenant-1',
      });

      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('getSpecificPaymentProvider', () => {
    it('should return MOCK provider when requested', () => {
      const { factory, mockPaymentProvider } = setup();

      const provider = factory.getSpecificPaymentProvider({
        provider: Providers.MOCK,
      });

      expect(provider).toBe(mockPaymentProvider);
    });

    it('should throw UnsupportedPaymentProviderError for STRIPE', () => {
      const { factory } = setup();

      expect(() => {
        factory.getSpecificPaymentProvider({
          provider: Providers.STRIPE,
        });
      }).toThrow(UnsupportedPaymentProviderError);
    });

    it('should throw UnsupportedPaymentProviderError for STONE', () => {
      const { factory } = setup();

      expect(() => {
        factory.getSpecificPaymentProvider({
          provider: Providers.STONE,
        });
      }).toThrow(UnsupportedPaymentProviderError);
    });

    it('should throw UnsupportedPaymentProviderError for SAFE_2_PAY', () => {
      const { factory } = setup();

      expect(() => {
        factory.getSpecificPaymentProvider({
          provider: Providers.SAFE_2_PAY,
        });
      }).toThrow(UnsupportedPaymentProviderError);
    });

    it('should log provider retrieval', () => {
      const { factory, mockLogger } = setup();

      factory.getSpecificPaymentProvider({
        provider: Providers.MOCK,
      });

      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should log error for unsupported providers', () => {
      const { factory, mockLogger } = setup();

      try {
        factory.getSpecificPaymentProvider({
          provider: Providers.STRIPE,
        });
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});

