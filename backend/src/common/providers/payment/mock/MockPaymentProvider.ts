/* eslint-disable @typescript-eslint/require-await */
import { Providers } from '@/common/enums/Providers';
import { InvoiceStatusType } from '@/common/enums/InvoiceStatusType';
import { PaymentMethodType } from '@/common/enums/PaymentMethodType';
import { TransactionType } from '@/common/enums/TransactionType';
import type { IPaymentProvider } from '@/common/interfaces/IPaymentProvider';
import type {
  CreatePaymentArgs,
  CreatePaymentResult,
  RefundPaymentArgs,
  RefundPaymentResult,
  HandleWebhookNotificationArgs,
  WebhookNotificationResult,
  ExtractExternalInvoiceIdResult,
  ComputeTaxArgs,
  CreateRecipientArgs,
  CreateRecipientResult,
  UpdateRecipientArgs,
  UpdateRecipientResult,
} from '@/common/interfaces/IPaymentProvider';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import Decimal from 'decimal.js';

/**
 * Mock implementation of IPaymentProvider for testing and development purposes.
 * This provider simulates payment gateway behavior without making actual external API calls.
 *
 * @class MockPaymentProvider
 * @implements {IPaymentProvider}
 */
export class MockPaymentProvider implements IPaymentProvider {
  private readonly logger?: ILogger;

  /**
   * @constructor
   * @param opts - Configuration options for the MockPaymentProvider
   * @param opts.logger - Optional logger instance for logging operations
   */
  public constructor(opts?: { [AppProviders.logger]?: ILogger }) {
    this.logger = opts?.[AppProviders.logger];
  }

  /**
   * Creates a mock payment and returns simulated payment data.
   * For PIX payments, generates mock QR code data.
   *
   * @param args - Payment creation arguments
   * @returns Promise resolving to mock payment response
   */
  async createPayment(args: CreatePaymentArgs): Promise<CreatePaymentResult> {
    const { tenantId, amount, paymentMethodType, description } = args;

    this.logger?.info(
      {
        tenantId,
        amount: amount.toString(),
        paymentMethodType,
        description,
      },
      'mock_payment_create_start',
    );

    // Generate a mock external invoice ID
    const externalInvoiceId = `mock_inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Calculate mock tax (2% of amount)
    const tax = amount.mul(0.02);

    // Determine status based on payment method
    let status: InvoiceStatusType = InvoiceStatusType.OPEN;
    if (paymentMethodType === PaymentMethodType.PIX) {
      status = InvoiceStatusType.OPEN;
    } else if (paymentMethodType === PaymentMethodType.CREDIT_CARD) {
      status = InvoiceStatusType.PAID;
    }

    // Generate PIX data if payment method is PIX
    const pix =
      paymentMethodType === PaymentMethodType.PIX
        ? {
            token: `mock_pix_token_${Date.now()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            qrCodeUrl: `https://mock-qr-code.example.com/pix/${externalInvoiceId}`,
            copyAndPaste: `00020126580014br.gov.bcb.pix0136${externalInvoiceId}520400005303986540${amount.toFixed(2)}5802BR5925Mock Payment Provider6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          }
        : undefined;

    const result: CreatePaymentResult = {
      externalInvoiceId,
      pix,
      status,
      providerMessage: 'Mock payment created successfully',
      tax,
      provider: Providers.MOCK,
    };

    this.logger?.info(
      {
        externalInvoiceId,
        status,
        tax: tax.toString(),
        hasPix: pix !== undefined,
      },
      'mock_payment_create_success',
    );

    return result;
  }

  /**
   * Simulates a payment refund operation.
   *
   * @param args - Refund arguments
   * @returns Promise resolving to mock refund response
   */
  async refundPayment(args: RefundPaymentArgs): Promise<RefundPaymentResult> {
    const { tenantId, externalInvoiceId, valueToRefund, reason } = args;

    this.logger?.info(
      {
        tenantId,
        externalInvoiceId,
        valueToRefund: valueToRefund.toString(),
        reason,
      },
      'mock_payment_refund_start',
    );

    // Generate a mock external transaction ID for the refund
    const externalTransactionId = `mock_refund_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const result: RefundPaymentResult = {
      success: true,
      externalTransactionId,
      refundedValue: valueToRefund,
    };

    this.logger?.info(
      {
        externalTransactionId,
        refundedValue: valueToRefund.toString(),
      },
      'mock_payment_refund_success',
    );

    return result;
  }

  /**
   * Handles mock webhook notifications.
   * Extracts payment information from a mock event structure.
   *
   * @param args - Webhook notification arguments
   * @returns Promise resolving to parsed webhook data
   */
  async handleWebhookNotification(
    args: HandleWebhookNotificationArgs,
  ): Promise<WebhookNotificationResult> {
    const { tenantId, event } = args;

    this.logger?.info(
      {
        tenantId,
        eventType: typeof event,
        hasEvent: event !== null && event !== undefined,
      },
      'mock_webhook_notification_start',
    );

    // Try to extract data from mock event structure
    // Supports both object with properties and nested structures
    const eventData = event as Record<string, unknown>;

    const externalInvoiceId =
      (eventData.externalInvoiceId as string) ||
      (eventData.invoiceId as string) ||
      (eventData.id as string) ||
      `mock_webhook_${Date.now()}`;

    const transactionType =
      (eventData.transactionType as TransactionType) ||
      (eventData.type as TransactionType) ||
      TransactionType.PAYMENT;

    const amount =
      typeof eventData.amount === 'number'
        ? eventData.amount
        : typeof eventData.value === 'number'
          ? eventData.value
          : typeof eventData.amount === 'string'
            ? parseFloat(eventData.amount)
            : 0;

    const status =
      (eventData.status as InvoiceStatusType) ||
      (eventData.paymentStatus as InvoiceStatusType) ||
      InvoiceStatusType.PAID;

    const result: WebhookNotificationResult = {
      externalInvoiceId,
      transactionType,
      status,
      amount,
    };

    this.logger?.info(
      {
        externalInvoiceId,
        transactionType,
        status,
        amount,
      },
      'mock_webhook_notification_processed',
    );

    return result;
  }

  /**
   * Extracts the external invoice ID from a mock webhook event.
   *
   * @param args - Event extraction arguments
   * @param args.event - The webhook event from the provider
   * @returns Promise resolving to external invoice ID
   */
  async extractExternalInvoiceId(args: {
    event: unknown;
  }): Promise<ExtractExternalInvoiceIdResult> {
    const { event } = args;

    this.logger?.debug(
      {
        eventType: typeof event,
        hasEvent: event !== null && event !== undefined,
      },
      'mock_extract_external_invoice_id_start',
    );

    const eventData = event as Record<string, unknown>;

    const externalInvoiceId =
      (eventData.externalInvoiceId as string) ||
      (eventData.invoiceId as string) ||
      (eventData.id as string) ||
      `mock_extracted_${Date.now()}`;

    this.logger?.debug(
      {
        externalInvoiceId,
      },
      'mock_extract_external_invoice_id_success',
    );

    return {
      externalInvoiceId,
    };
  }

  /**
   * Computes mock tax based on amount, payment method type, and antifraud settings.
   * Tax rates:
   * - PIX: 0.5%
   * - BOLETO: 1%
   * - CREDIT_CARD: 2%
   * - DEBIT_CARD: 1.5%
   * - Antifraud adds 0.5% to all methods
   *
   * @param args - Tax computation arguments
   * @returns Promise resolving to calculated tax amount
   */
  async computeTax(args: ComputeTaxArgs): Promise<Decimal> {
    const { amount, paymentMethodType, hasAntifraud } = args;

    this.logger?.debug(
      {
        amount: amount.toString(),
        paymentMethodType,
        hasAntifraud,
      },
      'mock_compute_tax_start',
    );

    // Base tax rates by payment method
    const baseTaxRates: Record<PaymentMethodType, number> = {
      [PaymentMethodType.PIX]: 0.005, // 0.5%
      [PaymentMethodType.BOLETO]: 0.01, // 1%
      [PaymentMethodType.CREDIT_CARD]: 0.02, // 2%
      [PaymentMethodType.DEBIT_CARD]: 0.015, // 1.5%
      [PaymentMethodType.MANUAL_ENTRY]: 0.02, // 2%
    };

    const baseRate = baseTaxRates[paymentMethodType] || 0.02;
    const antifraudRate = hasAntifraud ? 0.005 : 0; // 0.5% if antifraud is enabled
    const totalRate = baseRate + antifraudRate;

    const tax = amount.mul(totalRate);

    this.logger?.debug(
      {
        baseRate,
        antifraudRate,
        totalRate,
        calculatedTax: tax.toString(),
      },
      'mock_compute_tax_success',
    );

    return tax;
  }

  /**
   * Creates a mock external recipient for split payment scenarios.
   *
   * @param args - Recipient creation arguments
   * @returns Promise resolving to mock recipient data
   */
  async createRecipient(args: CreateRecipientArgs): Promise<CreateRecipientResult> {
    const { tenantId, recipientData } = args;

    this.logger?.info(
      {
        tenantId,
        recipientName: recipientData.name,
        hasBankAccount: !!recipientData.bankAccount,
      },
      'mock_create_recipient_start',
    );

    const recipientId = `mock_recipient_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const token = `mock_token_${Date.now()}`;

    const result: CreateRecipientResult = {
      externalRecipient: {
        recipientId,
        provider: Providers.MOCK,
        token,
        additionalInformation: {
          createdAt: new Date().toISOString(),
          mock: true,
        },
      },
    };

    this.logger?.info(
      {
        recipientId,
        provider: Providers.MOCK,
      },
      'mock_create_recipient_success',
    );

    return result;
  }

  /**
   * Updates a mock external recipient.
   *
   * @param args - Recipient update arguments
   * @returns Promise resolving to update success status
   */
  async updateRecipient(args: UpdateRecipientArgs): Promise<UpdateRecipientResult> {
    const { tenantId, externalRecipientId, recipientData } = args;

    this.logger?.info(
      {
        tenantId,
        externalRecipientId,
        recipientName: recipientData.name,
      },
      'mock_update_recipient_start',
    );

    // Mock always succeeds
    const result: UpdateRecipientResult = {
      success: true,
    };

    this.logger?.info(
      {
        success: true,
      },
      'mock_update_recipient_success',
    );

    return result;
  }
}
