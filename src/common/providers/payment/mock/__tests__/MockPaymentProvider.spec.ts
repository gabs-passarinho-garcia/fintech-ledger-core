import { describe, it, expect, mock } from 'bun:test';
import { MockPaymentProvider } from '../MockPaymentProvider';
import { Providers } from '@/common/enums/Providers';
import { InvoiceStatusType } from '@/common/enums/InvoiceStatusType';
import { PaymentMethodType } from '@/common/enums/PaymentMethodType';
import { TransactionType } from '@/common/enums/TransactionType';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import Decimal from 'decimal.js';

describe('MockPaymentProvider', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      log: mock(() => {}),
      info: mock(() => {}),
      warn: mock(() => {}),
      error: mock(() => {}),
      debug: mock(() => {}),
    };

    const provider = new MockPaymentProvider({
      [AppProviders.logger]: mockLogger,
    });

    return {
      provider,
      mockLogger,
    };
  };

  describe('createPayment', () => {
    it('should create a payment with PIX method and return OPEN status', async () => {
      const { provider } = setup();

      const result = await provider.createPayment({
        tenantId: 'tenant-1',
        amount: new Decimal('100.00'),
        paymentMethodType: PaymentMethodType.PIX,
        description: 'Test payment',
      });

      expect(result).toBeDefined();
      expect(result.externalInvoiceId).toContain('mock_inv_');
      expect(result.status).toBe(InvoiceStatusType.OPEN);
      expect(result.provider).toBe(Providers.MOCK);
      expect(result.pix).toBeDefined();
      expect(result.pix?.token).toBeDefined();
      expect(result.pix?.qrCodeUrl).toBeDefined();
      expect(result.tax).toBeDefined();
    });

    it('should create a payment with CREDIT_CARD method and return PAID status', async () => {
      const { provider } = setup();

      const result = await provider.createPayment({
        tenantId: 'tenant-1',
        amount: new Decimal('200.00'),
        paymentMethodType: PaymentMethodType.CREDIT_CARD,
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(InvoiceStatusType.PAID);
      expect(result.pix).toBeUndefined();
    });

    it('should calculate tax as 2% of amount', async () => {
      const { provider } = setup();

      const result = await provider.createPayment({
        tenantId: 'tenant-1',
        amount: new Decimal('100.00'),
        paymentMethodType: PaymentMethodType.PIX,
      });

      expect(result.tax).toBeDefined();
      expect(result.tax?.toString()).toBe('2');
    });
  });

  describe('refundPayment', () => {
    it('should process a refund successfully', async () => {
      const { provider } = setup();

      const result = await provider.refundPayment({
        tenantId: 'tenant-1',
        externalInvoiceId: 'external-inv-123',
        valueToRefund: new Decimal('50.00'),
        reason: 'Customer request',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.externalTransactionId).toContain('mock_refund_');
      expect(result.refundedValue.toString()).toBe('50');
    });
  });

  describe('handleWebhookNotification', () => {
    it('should extract webhook data from event', async () => {
      const { provider } = setup();

      const event = {
        externalInvoiceId: 'webhook-inv-123',
        transactionType: TransactionType.PAYMENT,
        status: InvoiceStatusType.PAID,
        amount: 100.0,
      };

      const result = await provider.handleWebhookNotification({
        tenantId: 'tenant-1',
        event,
      });

      expect(result).toBeDefined();
      expect(result.externalInvoiceId).toBe('webhook-inv-123');
      expect(result.transactionType).toBe(TransactionType.PAYMENT);
      expect(result.status).toBe(InvoiceStatusType.PAID);
      expect(result.amount).toBe(100.0);
    });

    it('should handle event with alternative field names', async () => {
      const { provider } = setup();

      const event = {
        invoiceId: 'alt-inv-123',
        type: TransactionType.REFUND,
        paymentStatus: InvoiceStatusType.CANCELED,
        value: 200.0,
      };

      const result = await provider.handleWebhookNotification({
        tenantId: 'tenant-1',
        event,
      });

      expect(result.externalInvoiceId).toBe('alt-inv-123');
      expect(result.transactionType).toBe(TransactionType.REFUND);
      expect(result.status).toBe(InvoiceStatusType.CANCELED);
      expect(result.amount).toBe(200.0);
    });
  });

  describe('extractExternalInvoiceId', () => {
    it('should extract invoice ID from event', async () => {
      const { provider } = setup();

      const event = {
        externalInvoiceId: 'extracted-inv-123',
      };

      const result = await provider.extractExternalInvoiceId({ event });

      expect(result).toBeDefined();
      expect(result.externalInvoiceId).toBe('extracted-inv-123');
    });

    it('should handle alternative field names', async () => {
      const { provider } = setup();

      const event = {
        invoiceId: 'alt-inv-456',
      };

      const result = await provider.extractExternalInvoiceId({ event });

      expect(result.externalInvoiceId).toBe('alt-inv-456');
    });
  });

  describe('computeTax', () => {
    it('should compute tax for PIX (0.5%)', async () => {
      const { provider } = setup();

      const tax = await provider.computeTax({
        amount: new Decimal('100.00'),
        paymentMethodType: PaymentMethodType.PIX,
        hasAntifraud: false,
      });

      expect(tax.toString()).toBe('0.5');
    });

    it('should compute tax for CREDIT_CARD (2%)', async () => {
      const { provider } = setup();

      const tax = await provider.computeTax({
        amount: new Decimal('100.00'),
        paymentMethodType: PaymentMethodType.CREDIT_CARD,
        hasAntifraud: false,
      });

      expect(tax.toString()).toBe('2');
    });

    it('should add antifraud fee (0.5%)', async () => {
      const { provider } = setup();

      const tax = await provider.computeTax({
        amount: new Decimal('100.00'),
        paymentMethodType: PaymentMethodType.PIX,
        hasAntifraud: true,
      });

      expect(tax.toString()).toBe('1'); // 0.5% + 0.5% = 1%
    });
  });

  describe('createRecipient', () => {
    it('should create a recipient successfully', async () => {
      const { provider } = setup();

      const result = await provider.createRecipient({
        tenantId: 'tenant-1',
        recipientData: {
          name: 'Test Recipient',
          document: '12345678900',
          bankAccount: {
            bankCode: '001',
            agency: '1234',
            account: '567890',
            accountType: 'CHECKING',
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.externalRecipient.recipientId).toContain('mock_recipient_');
      expect(result.externalRecipient.provider).toBe(Providers.MOCK);
      expect(result.externalRecipient.token).toBeDefined();
    });
  });

  describe('updateRecipient', () => {
    it('should update a recipient successfully', async () => {
      const { provider } = setup();

      const result = await provider.updateRecipient({
        tenantId: 'tenant-1',
        externalRecipientId: 'recipient-123',
        recipientData: {
          name: 'Updated Recipient',
        },
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});

