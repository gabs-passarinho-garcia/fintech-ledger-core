import { Providers } from '@/common/enums/Providers';
import { InvoiceStatusType } from '@/common/enums/InvoiceStatusType';
import { PaymentMethodType } from '@/common/enums/PaymentMethodType';
import { TransactionType } from '@/common/enums/TransactionType';
import Decimal from 'decimal.js';

/**
 * Payment data for PIX payments.
 */
export interface PixPaymentData {
  token: string;
  expiresAt: string;
  qrCodeUrl: string;
  copyAndPaste?: string;
}

/**
 * Result of a payment creation operation.
 */
export interface CreatePaymentResult {
  externalInvoiceId: string;
  pix?: PixPaymentData;
  status: InvoiceStatusType;
  providerMessage?: string;
  tax?: Decimal;
  provider: Providers;
}

/**
 * Arguments for creating a payment.
 */
export interface CreatePaymentArgs {
  tenantId: string;
  amount: Decimal;
  paymentMethodType: PaymentMethodType;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Result of a refund operation.
 */
export interface RefundPaymentResult {
  success: boolean;
  externalTransactionId?: string;
  refundedValue: Decimal;
}

/**
 * Arguments for refunding a payment.
 */
export interface RefundPaymentArgs {
  tenantId: string;
  externalInvoiceId: string;
  valueToRefund: Decimal;
  reason?: string;
}

/**
 * Result of webhook notification processing.
 */
export interface WebhookNotificationResult {
  externalInvoiceId: string;
  transactionType: TransactionType | null;
  status: InvoiceStatusType;
  amount: number;
}

/**
 * Arguments for handling webhook notifications.
 */
export interface HandleWebhookNotificationArgs {
  tenantId: string;
  event: unknown;
}

/**
 * Result of extracting external invoice ID from webhook event.
 */
export interface ExtractExternalInvoiceIdResult {
  externalInvoiceId: string;
}

/**
 * Arguments for computing tax.
 */
export interface ComputeTaxArgs {
  amount: Decimal;
  paymentMethodType: PaymentMethodType;
  hasAntifraud: boolean;
}

/**
 * Arguments for creating a recipient (for split payments).
 */
export interface CreateRecipientArgs {
  tenantId: string;
  recipientData: {
    name: string;
    document?: string;
    bankAccount?: {
      bankCode: string;
      agency: string;
      account: string;
      accountType: string;
    };
    metadata?: Record<string, unknown>;
  };
}

/**
 * Result of creating a recipient.
 */
export interface CreateRecipientResult {
  externalRecipient: {
    recipientId: string;
    provider: Providers;
    token?: string;
    additionalInformation?: unknown;
  };
}

/**
 * Arguments for updating a recipient.
 */
export interface UpdateRecipientArgs {
  tenantId: string;
  externalRecipientId: string;
  recipientData: {
    name?: string;
    document?: string;
    bankAccount?: {
      bankCode: string;
      agency: string;
      account: string;
      accountType: string;
    };
    metadata?: Record<string, unknown>;
  };
}

/**
 * Result of updating a recipient.
 */
export interface UpdateRecipientResult {
  success: boolean;
}

/**
 * Interface defining the contract for payment providers.
 * All payment gateway implementations must adhere to this interface.
 *
 * This interface is provider-agnostic and allows the system to switch
 * between different payment gateways without changing business logic.
 *
 * @interface IPaymentProvider
 */
export interface IPaymentProvider {
  /**
   * Creates a payment invoice with the payment provider.
   *
   * @param args - Payment creation arguments
   * @returns Promise resolving to payment creation result
   */
  createPayment(args: CreatePaymentArgs): Promise<CreatePaymentResult>;

  /**
   * Processes a refund for a previously created payment.
   *
   * @param args - Refund arguments
   * @returns Promise resolving to refund result
   */
  refundPayment(args: RefundPaymentArgs): Promise<RefundPaymentResult>;

  /**
   * Handles webhook notifications from the payment provider.
   * Extracts payment information and status updates from provider events.
   *
   * @param args - Webhook notification arguments
   * @returns Promise resolving to parsed webhook data
   */
  handleWebhookNotification(
    args: HandleWebhookNotificationArgs,
  ): Promise<WebhookNotificationResult>;

  /**
   * Extracts the external invoice ID from a webhook event.
   * This is useful for identifying which invoice an event refers to.
   *
   * @param args - Event extraction arguments
   * @param args.event - The webhook event from the provider
   * @returns Promise resolving to external invoice ID
   */
  extractExternalInvoiceId(args: { event: unknown }): Promise<ExtractExternalInvoiceIdResult>;

  /**
   * Computes the tax/fee for a payment based on amount, payment method, and antifraud settings.
   *
   * @param args - Tax computation arguments
   * @returns Promise resolving to calculated tax amount
   */
  computeTax(args: ComputeTaxArgs): Promise<Decimal>;

  /**
   * Creates a recipient for split payment scenarios.
   * Recipients are entities that receive a portion of the payment.
   *
   * @param args - Recipient creation arguments
   * @returns Promise resolving to recipient creation result
   */
  createRecipient(args: CreateRecipientArgs): Promise<CreateRecipientResult>;

  /**
   * Updates an existing recipient's information.
   *
   * @param args - Recipient update arguments
   * @returns Promise resolving to update success status
   */
  updateRecipient(args: UpdateRecipientArgs): Promise<UpdateRecipientResult>;
}
