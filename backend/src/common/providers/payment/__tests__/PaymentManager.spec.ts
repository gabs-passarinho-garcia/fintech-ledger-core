import { describe, it, expect, mock } from 'bun:test';
import { PaymentManager } from '../PaymentManager';
import { PaymentProviderFactory } from '../PaymentProviderFactory';
import { InvoiceStatusType } from '@/common/enums/InvoiceStatusType';
import { PaymentMethodType } from '@/common/enums/PaymentMethodType';
import { Providers } from '@/common/enums/Providers';
import { ExternalSourceError } from '@/common/errors';
import type { IPaymentProvider } from '@/common/interfaces/IPaymentProvider';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import Decimal from 'decimal.js';

describe('PaymentManager', () => {
  const setup = () => {
    const mockPrimaryProvider: IPaymentProvider = {
      createPayment: mock(async () => ({
        externalInvoiceId: 'primary-inv-123',
        status: InvoiceStatusType.OPEN,
        provider: Providers.MOCK,
        tax: new Decimal('2'),
      })),
      refundPayment: mock(async () => ({
        success: true,
        refundedValue: new Decimal('100'),
      })),
      handleWebhookNotification: mock(async () => ({
        externalInvoiceId: 'primary-inv-123',
        transactionType: null,
        status: InvoiceStatusType.PAID,
        amount: 100,
      })),
      extractExternalInvoiceId: mock(async () => ({
        externalInvoiceId: 'primary-inv-123',
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

    const mockFallbackProvider: IPaymentProvider = {
      createPayment: mock(async () => ({
        externalInvoiceId: 'fallback-inv-456',
        status: InvoiceStatusType.OPEN,
        provider: Providers.MOCK,
        tax: new Decimal('2'),
      })),
      refundPayment: mock(async () => ({
        success: true,
        refundedValue: new Decimal('100'),
      })),
      handleWebhookNotification: mock(async () => ({
        externalInvoiceId: 'fallback-inv-456',
        transactionType: null,
        status: InvoiceStatusType.PAID,
        amount: 100,
      })),
      extractExternalInvoiceId: mock(async () => ({
        externalInvoiceId: 'fallback-inv-456',
      })),
      computeTax: mock(async () => new Decimal('2')),
      createRecipient: mock(async () => ({
        externalRecipient: {
          recipientId: 'recipient-456',
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

    const mockFactory: PaymentProviderFactory = {
      getPaymentProvider: mock((args: { tenantId: string }) => ({
        paymentProvider: mockPrimaryProvider,
        fallbackProvider: mockFallbackProvider,
      })),
      getSpecificPaymentProvider: mock(() => mockPrimaryProvider),
    } as unknown as PaymentProviderFactory;

    const manager = new PaymentManager({
      [AppProviders.paymentProviderFactory]: mockFactory,
      [AppProviders.logger]: mockLogger,
    });

    return {
      manager,
      mockPrimaryProvider,
      mockFallbackProvider,
      mockLogger,
      mockFactory,
    };
  };

  describe('createInvoice', () => {
    it('should create invoice with primary provider successfully', async () => {
      const { manager, mockPrimaryProvider } = setup();

      const result = await manager.createInvoice({
        tenantId: 'tenant-1',
        amount: new Decimal('100.00'),
        paymentMethodType: PaymentMethodType.PIX,
      });

      expect(result).toBeDefined();
      expect(result?.externalInvoiceId).toBe('primary-inv-123');
      expect(mockPrimaryProvider.createPayment).toHaveBeenCalled();
    });

    it('should attempt fallback when primary provider returns CANCELED', async () => {
      const { manager, mockPrimaryProvider, mockFallbackProvider } = setup();

      (mockPrimaryProvider.createPayment as ReturnType<typeof mock>).mockResolvedValueOnce({
        externalInvoiceId: 'primary-inv-123',
        status: InvoiceStatusType.CANCELED,
        provider: Providers.MOCK,
        tax: new Decimal('2'),
      });

      const result = await manager.createInvoice({
        tenantId: 'tenant-1',
        amount: new Decimal('100.00'),
        paymentMethodType: PaymentMethodType.PIX,
      });

      expect(result).toBeDefined();
      expect(result?.externalInvoiceId).toBe('fallback-inv-456');
      expect(mockPrimaryProvider.createPayment).toHaveBeenCalled();
      expect(mockFallbackProvider.createPayment).toHaveBeenCalled();
    });

    it('should attempt fallback when primary provider throws error', async () => {
      const { manager, mockPrimaryProvider, mockFallbackProvider } = setup();

      (mockPrimaryProvider.createPayment as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error('Primary provider failed'),
      );

      const result = await manager.createInvoice({
        tenantId: 'tenant-1',
        amount: new Decimal('100.00'),
        paymentMethodType: PaymentMethodType.PIX,
      });

      expect(result).toBeDefined();
      expect(result?.externalInvoiceId).toBe('fallback-inv-456');
      expect(mockPrimaryProvider.createPayment).toHaveBeenCalled();
      expect(mockFallbackProvider.createPayment).toHaveBeenCalled();
    });

    it('should throw ExternalSourceError when both providers fail', async () => {
      const { manager, mockPrimaryProvider, mockFallbackProvider } = setup();

      (mockPrimaryProvider.createPayment as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error('Primary provider failed'),
      );
      (mockFallbackProvider.createPayment as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error('Fallback provider failed'),
      );

      await expect(
        manager.createInvoice({
          tenantId: 'tenant-1',
          amount: new Decimal('100.00'),
          paymentMethodType: PaymentMethodType.PIX,
        }),
      ).rejects.toThrow(ExternalSourceError);
    });

    it('should throw ExternalSourceError when primary fails and no fallback', async () => {
      const { manager, mockPrimaryProvider, mockFactory } = setup();

      (mockFactory.getPaymentProvider as ReturnType<typeof mock>).mockReturnValueOnce({
        paymentProvider: mockPrimaryProvider,
        fallbackProvider: undefined,
      });

      (mockPrimaryProvider.createPayment as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error('Primary provider failed'),
      );

      await expect(
        manager.createInvoice({
          tenantId: 'tenant-1',
          amount: new Decimal('100.00'),
          paymentMethodType: PaymentMethodType.PIX,
        }),
      ).rejects.toThrow(ExternalSourceError);
    });
  });

  describe('refundPayment', () => {
    it('should process refund successfully', async () => {
      const { manager, mockPrimaryProvider } = setup();

      const result = await manager.refundPayment({
        tenantId: 'tenant-1',
        externalInvoiceId: 'external-inv-123',
        valueToRefund: new Decimal('50.00'),
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(mockPrimaryProvider.refundPayment).toHaveBeenCalled();
    });

    it('should throw ExternalSourceError when refund fails', async () => {
      const { manager, mockPrimaryProvider } = setup();

      (mockPrimaryProvider.refundPayment as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error('Refund failed'),
      );

      await expect(
        manager.refundPayment({
          tenantId: 'tenant-1',
          externalInvoiceId: 'external-inv-123',
          valueToRefund: new Decimal('50.00'),
        }),
      ).rejects.toThrow(ExternalSourceError);
    });
  });

  describe('handleWebhookNotification', () => {
    it('should handle webhook notification successfully', async () => {
      const { manager, mockPrimaryProvider } = setup();

      const result = await manager.handleWebhookNotification({
        tenantId: 'tenant-1',
        event: {
          externalInvoiceId: 'webhook-inv-123',
          status: InvoiceStatusType.PAID,
        },
      });

      expect(result).toBeDefined();
      expect(result.externalInvoiceId).toBe('primary-inv-123');
      expect(mockPrimaryProvider.handleWebhookNotification).toHaveBeenCalled();
    });

    it('should throw ExternalSourceError when webhook handling fails', async () => {
      const { manager, mockPrimaryProvider } = setup();

      (mockPrimaryProvider.handleWebhookNotification as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error('Webhook handling failed'),
      );

      await expect(
        manager.handleWebhookNotification({
          tenantId: 'tenant-1',
          event: {},
        }),
      ).rejects.toThrow(ExternalSourceError);
    });
  });
});

