import { AppProviders } from '@/common/interfaces/IAppContainer';
import { PaymentProviderFactory } from './PaymentProviderFactory';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { IPaymentProvider } from '@/common/interfaces/IPaymentProvider';
import { InvoiceStatusType } from '@/common/enums/InvoiceStatusType';
import { ExternalSourceError } from '@/common/errors';
import type {
  CreatePaymentArgs,
  CreatePaymentResult,
  RefundPaymentArgs,
  RefundPaymentResult,
  HandleWebhookNotificationArgs,
  WebhookNotificationResult,
} from '@/common/interfaces/IPaymentProvider';

const CREATE_INVOICE_FINISHED_LOG_TYPE = 'createInvoice finished';

/**
 * Manager class responsible for orchestrating payment operations with provider selection
 * and fallback handling.
 *
 * This manager acts as a high-level coordinator for payment operations, handling:
 * - Provider selection through the PaymentProviderFactory
 * - Automatic fallback to secondary providers when the primary provider fails
 * - Error handling and logging for payment operations
 * - Status-based fallback (e.g., when payment is CANCELED)
 *
 * The manager ensures payment operations are resilient by attempting fallback providers
 * when the primary provider encounters errors or returns canceled status.
 *
 * This is the main layer used by services/use cases to process payments.
 *
 * @class PaymentManager
 */
export class PaymentManager {
  private readonly paymentProviderFactory: PaymentProviderFactory;
  private readonly logger: ILogger;

  /**
   * @constructor
   * @param opts - Configuration options for the PaymentManager
   * @param opts.paymentProviderFactory - Factory instance for selecting payment providers
   * @param opts.logger - Logger instance for tracking operations
   */
  public constructor(opts: {
    [AppProviders.paymentProviderFactory]: PaymentProviderFactory;
    [AppProviders.logger]: ILogger;
  }) {
    this.paymentProviderFactory = opts[AppProviders.paymentProviderFactory];
    this.logger = opts[AppProviders.logger];
  }

  /**
   * Retrieves the payment provider and fallback provider for the given tenant.
   *
   * This private method encapsulates the logic for obtaining payment providers from the factory
   * and logs the selection for audit purposes.
   *
   * @private
   * @param args - Arguments for provider selection
   * @param args.tenantId - The tenant ID requesting the payment provider
   * @returns {Object} An object containing the primary and optional fallback payment providers
   * @returns {IPaymentProvider} returns.paymentProvider - The primary payment provider instance
   * @returns {IPaymentProvider} [returns.fallbackProvider] - Optional fallback payment provider instance
   */
  private _getPaymentProvider(args: { tenantId: string }): {
    paymentProvider: IPaymentProvider;
    fallbackProvider?: IPaymentProvider;
  } {
    const { paymentProvider, fallbackProvider } =
      this.paymentProviderFactory.getPaymentProvider(args);

    this.logger.info(
      {
        tenantId: args.tenantId,
        paymentProvider: paymentProvider.constructor.name,
        fallbackProvider: fallbackProvider?.constructor.name ?? 'none',
      },
      'getPaymentProvider',
    );
    return {
      paymentProvider,
      fallbackProvider,
    };
  }

  /**
   * Attempts payment creation with the primary provider.
   *
   * @private
   * @param args - Payment creation arguments
   * @param paymentProvider - The primary payment provider
   * @returns Payment result from the primary provider
   */
  private async _attemptPrimaryProvider(
    args: CreatePaymentArgs,
    paymentProvider: IPaymentProvider,
  ): Promise<CreatePaymentResult> {
    this.logger.debug(
      {
        tenantId: args.tenantId,
        amount: args.amount.toString(),
        paymentMethodType: args.paymentMethodType,
        paymentProvider: paymentProvider.constructor.name,
      },
      'createInvoice attempting with primary provider',
    );

    const result = await paymentProvider.createPayment(args);

    this.logger.info(
      {
        tenantId: args.tenantId,
        externalInvoiceId: result.externalInvoiceId,
        status: result.status,
        provider: result.provider,
        paymentProvider: paymentProvider.constructor.name,
      },
      'createInvoice primary provider response received',
    );

    return result;
  }

  /**
   * Attempts fallback when primary provider returns CANCELED status.
   *
   * @private
   * @param args - Payment creation arguments
   * @param fallbackProvider - The fallback payment provider
   * @returns Payment result from the fallback provider
   */
  private async _attemptFallbackForCanceled(
    args: CreatePaymentArgs,
    fallbackProvider: IPaymentProvider,
    primaryResult: CreatePaymentResult,
    primaryProviderName: string,
  ): Promise<CreatePaymentResult> {
    this.logger.warn(
      {
        tenantId: args.tenantId,
        externalInvoiceId: primaryResult.externalInvoiceId,
        status: primaryResult.status,
        paymentProvider: primaryProviderName,
        fallbackProvider: fallbackProvider.constructor.name,
      },
      'createInvoice primary provider returned CANCELED, attempting fallback',
    );

    this.logger.debug(
      {
        tenantId: args.tenantId,
        fallbackProvider: fallbackProvider.constructor.name,
      },
      'createInvoice attempting with fallback provider',
    );

    const result = await fallbackProvider.createPayment(args);

    this.logger.info(
      {
        tenantId: args.tenantId,
        externalInvoiceId: result.externalInvoiceId,
        status: result.status,
        provider: result.provider,
        fallbackProvider: fallbackProvider.constructor.name,
      },
      'createInvoice fallback provider response received',
    );

    return result;
  }

  /**
   * Attempts fallback when primary provider throws an error.
   *
   * @private
   * @param args - Payment creation arguments
   * @param fallbackProvider - The fallback payment provider
   * @param primaryError - The error from the primary provider
   * @param primaryProviderName - Name of the primary provider
   * @returns Payment result from the fallback provider
   * @throws {ExternalSourceError} If fallback also fails
   */
  private async _attemptFallbackOnError(
    args: CreatePaymentArgs,
    fallbackProvider: IPaymentProvider,
    primaryError: unknown,
    primaryProviderName: string,
  ): Promise<CreatePaymentResult> {
    this.logger.warn(
      {
        tenantId: args.tenantId,
        paymentProvider: primaryProviderName,
        fallbackProvider: fallbackProvider.constructor.name,
      },
      'createInvoice attempting fallback after primary provider error',
    );

    try {
      this.logger.debug(
        {
          tenantId: args.tenantId,
          fallbackProvider: fallbackProvider.constructor.name,
        },
        'createInvoice attempting with fallback provider after error',
      );

      const result = await fallbackProvider.createPayment(args);

      this.logger.info(
        {
          tenantId: args.tenantId,
          externalInvoiceId: result.externalInvoiceId,
          status: result.status,
          provider: result.provider,
          paymentProvider: primaryProviderName,
          fallbackProvider: fallbackProvider.constructor.name,
          fallbackAttempted: true,
          success: true,
        },
        CREATE_INVOICE_FINISHED_LOG_TYPE,
      );

      return result;
    } catch (fallbackError) {
      this.logger.error(
        {
          tenantId: args.tenantId,
          paymentProvider: primaryProviderName,
          fallbackProvider: fallbackProvider.constructor.name,
          primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError),
          fallbackError:
            fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          fallbackErrorStack: fallbackError instanceof Error ? fallbackError.stack : undefined,
        },
        'createInvoice both primary and fallback providers failed',
      );

      this.logger.info(
        {
          tenantId: args.tenantId,
          paymentProvider: primaryProviderName,
          fallbackProvider: fallbackProvider.constructor.name,
          fallbackAttempted: true,
          success: false,
        },
        CREATE_INVOICE_FINISHED_LOG_TYPE,
      );

      throw new ExternalSourceError({
        originalError: fallbackError,
        additionalMessage: `createInvoice fallback failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
      });
    }
  }

  /**
   * Logs the final result of the invoice creation process.
   *
   * @private
   * @param args - Payment creation arguments
   * @param result - The payment result
   * @param paymentProvider - The primary payment provider
   * @param fallbackProvider - Optional fallback payment provider
   * @param fallbackAttempted - Whether fallback was attempted
   * @param success - Whether the operation was successful
   */
  private _logFinished(
    args: CreatePaymentArgs,
    result: CreatePaymentResult,
    paymentProvider: IPaymentProvider,
    fallbackProvider: IPaymentProvider | undefined,
    fallbackAttempted: boolean,
    success: boolean,
  ): void {
    this.logger.info(
      {
        tenantId: args.tenantId,
        externalInvoiceId: result.externalInvoiceId,
        status: result.status,
        provider: result.provider,
        paymentProvider: paymentProvider.constructor.name,
        fallbackProvider: fallbackProvider?.constructor.name ?? 'none',
        fallbackAttempted,
        success,
      },
      CREATE_INVOICE_FINISHED_LOG_TYPE,
    );
  }

  /**
   * Handles error when no fallback is available or already attempted.
   *
   * @private
   * @param args - Payment creation arguments
   * @param error - The error that occurred
   * @param paymentProvider - The primary payment provider
   * @param fallbackProvider - Optional fallback payment provider
   * @param fallbackAttempted - Whether fallback was attempted
   * @throws {ExternalSourceError} Always throws ExternalSourceError
   */
  private _handleErrorWithoutFallback(
    args: CreatePaymentArgs,
    error: unknown,
    paymentProvider: IPaymentProvider,
    fallbackProvider: IPaymentProvider | undefined,
    fallbackAttempted: boolean,
  ): never {
    this.logger.error(
      {
        tenantId: args.tenantId,
        paymentProvider: paymentProvider.constructor.name,
        fallbackProvider: fallbackProvider?.constructor.name ?? 'none',
        fallbackAvailable: !!fallbackProvider,
        fallbackAttempted,
        error: error instanceof Error ? error.message : String(error),
      },
      'createInvoice failed with no fallback available or already attempted',
    );

    this.logger.info(
      {
        tenantId: args.tenantId,
        paymentProvider: paymentProvider.constructor.name,
        fallbackProvider: fallbackProvider?.constructor.name ?? 'none',
        fallbackAttempted,
        success: false,
      },
      CREATE_INVOICE_FINISHED_LOG_TYPE,
    );

    throw new ExternalSourceError({
      originalError: error,
      additionalMessage: `createInvoice failed: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  /**
   * Creates a payment invoice using the appropriate payment provider with automatic fallback.
   *
   * This method orchestrates the payment creation process by:
   * 1. Selecting the appropriate payment provider based on tenant
   * 2. Attempting payment creation with the primary provider
   * 3. Automatically falling back to a secondary provider if:
   *    - The primary provider throws an error, OR
   *    - The payment status is CANCELED
   * 4. Logging all operations for audit and debugging purposes
   *
   * The fallback mechanism ensures payment operations are resilient and can recover from
   * temporary provider failures or canceled payments.
   *
   * @param args - Arguments for invoice creation
   * @param args.tenantId - The tenant ID for the payment
   * @param args.amount - The payment amount
   * @param args.paymentMethodType - The payment method type
   * @param args.description - Optional payment description
   * @param args.metadata - Optional metadata for the payment
   * @returns {Promise<CreatePaymentResult|null>} The payment result containing invoice details, or null if creation fails
   * @returns {string} returns.externalInvoiceId - External invoice ID from the payment provider
   * @returns {Object} [returns.pix] - PIX payment details (if payment method is PIX)
   * @returns {string} returns.pix.token - PIX token for payment
   * @returns {string} returns.pix.expiresAt - PIX expiration timestamp
   * @returns {string} returns.pix.qrCodeUrl - PIX QR code URL
   * @returns {InvoiceStatusType} returns.status - Current status of the invoice
   * @returns {string} [returns.providerMessage] - Optional message from the payment provider
   * @returns {Decimal} [returns.tax] - Calculated tax amount
   * @returns {Providers} returns.provider - The provider used for the payment
   *
   * @throws {ExternalSourceError} Throws error if both primary and fallback providers fail
   *
   * @example
   * ```typescript
   * const result = await paymentManager.createInvoice({
   *   tenantId: 'tenant-123',
   *   amount: new Decimal('100.00'),
   *   paymentMethodType: PaymentMethodType.PIX,
   *   description: 'Payment for services',
   * });
   *
   * if (result) {
   *   console.log(`Invoice created: ${result.externalInvoiceId}`);
   *   if (result.pix) {
   *     console.log(`PIX QR Code: ${result.pix.qrCodeUrl}`);
   *   }
   * }
   * ```
   */
  public async createInvoice(args: CreatePaymentArgs): Promise<CreatePaymentResult | null> {
    this.logger.info(
      {
        tenantId: args.tenantId,
        amount: args.amount.toString(),
        paymentMethodType: args.paymentMethodType,
      },
      'createInvoice started',
    );

    const { paymentProvider, fallbackProvider } = this._getPaymentProvider({
      tenantId: args.tenantId,
    });

    let fallbackAttempted = false;

    try {
      let result = await this._attemptPrimaryProvider(args, paymentProvider);

      if (result.status === InvoiceStatusType.CANCELED && fallbackProvider) {
        fallbackAttempted = true;
        result = await this._attemptFallbackForCanceled(
          args,
          fallbackProvider,
          result,
          paymentProvider.constructor.name,
        );
      }

      this._logFinished(args, result, paymentProvider, fallbackProvider, fallbackAttempted, true);

      return result;
    } catch (error) {
      this.logger.error(
        {
          tenantId: args.tenantId,
          paymentProvider: paymentProvider.constructor.name,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        },
        'createInvoice primary provider failed',
      );

      if (fallbackProvider && !fallbackAttempted) {
        fallbackAttempted = true;
        return await this._attemptFallbackOnError(
          args,
          fallbackProvider,
          error,
          paymentProvider.constructor.name,
        );
      }

      this._handleErrorWithoutFallback(
        args,
        error,
        paymentProvider,
        fallbackProvider,
        fallbackAttempted,
      );
    }
  }

  /**
   * Processes a refund for a previously created payment.
   *
   * @param args - Refund arguments
   * @returns Promise resolving to refund result
   */
  public async refundPayment(args: RefundPaymentArgs): Promise<RefundPaymentResult> {
    this.logger.info(
      {
        tenantId: args.tenantId,
        externalInvoiceId: args.externalInvoiceId,
        valueToRefund: args.valueToRefund.toString(),
      },
      'refundPayment started',
    );

    const { paymentProvider } = this._getPaymentProvider({
      tenantId: args.tenantId,
    });

    try {
      const result = await paymentProvider.refundPayment(args);

      this.logger.info(
        {
          tenantId: args.tenantId,
          externalInvoiceId: args.externalInvoiceId,
          success: result.success,
          refundedValue: result.refundedValue.toString(),
        },
        'refundPayment completed',
      );

      return result;
    } catch (error) {
      this.logger.error(
        {
          tenantId: args.tenantId,
          externalInvoiceId: args.externalInvoiceId,
          error: error instanceof Error ? error.message : String(error),
        },
        'refundPayment failed',
      );

      throw new ExternalSourceError({
        originalError: error,
        additionalMessage: `refundPayment failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * Handles webhook notifications from payment providers.
   *
   * @param args - Webhook notification arguments
   * @returns Promise resolving to parsed webhook data
   */
  public async handleWebhookNotification(
    args: HandleWebhookNotificationArgs,
  ): Promise<WebhookNotificationResult> {
    this.logger.info(
      {
        tenantId: args.tenantId,
      },
      'handleWebhookNotification started',
    );

    const { paymentProvider } = this._getPaymentProvider({
      tenantId: args.tenantId,
    });

    try {
      const result = await paymentProvider.handleWebhookNotification(args);

      this.logger.info(
        {
          tenantId: args.tenantId,
          externalInvoiceId: result.externalInvoiceId,
          status: result.status,
          transactionType: result.transactionType,
        },
        'handleWebhookNotification completed',
      );

      return result;
    } catch (error) {
      this.logger.error(
        {
          tenantId: args.tenantId,
          error: error instanceof Error ? error.message : String(error),
        },
        'handleWebhookNotification failed',
      );

      throw new ExternalSourceError({
        originalError: error,
        additionalMessage: `handleWebhookNotification failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
}
