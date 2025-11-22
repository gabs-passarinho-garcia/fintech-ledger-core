import type { IPaymentProvider } from '@/common/interfaces/IPaymentProvider';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ILogger } from '@/common/interfaces/ILogger';
import { Providers } from '@/common/enums/Providers';
import { UnsupportedPaymentProviderError } from '@/common/errors';

/**
 * Factory class responsible for selecting and providing the appropriate payment provider
 * based on tenant context and configuration.
 *
 * This factory implements the Factory pattern to encapsulate the logic for choosing
 * which payment gateway provider should be used for a given payment operation.
 * Currently, it returns the mock payment provider, but it's designed to be extended
 * to support multiple providers (e.g., Stripe, Safe2Pay, Stone) based on configuration
 * or tenant settings.
 *
 * @class PaymentProviderFactory
 */
export class PaymentProviderFactory {
  private static readonly LOG_MESSAGE_UNSUPPORTED_PROVIDER =
    'getSpecificPaymentProvider - unsupported provider requested';
  private static readonly LOG_MESSAGE_UNKNOWN_PROVIDER =
    'getSpecificPaymentProvider - unknown provider requested';
  private static readonly LOG_MESSAGE_PROVIDER_RETRIEVED =
    'getSpecificPaymentProvider - provider retrieved successfully';

  private readonly mockPaymentProvider: IPaymentProvider;
  private readonly logger: ILogger;

  /**
   * @constructor
   * @param opts - Configuration options for the PaymentProviderFactory
   * @param opts.mockPaymentProvider - The mock payment provider instance
   * @param opts.logger - Logger instance for tracking operations
   */
  public constructor(opts: {
    [AppProviders.mockPaymentProvider]: IPaymentProvider;
    [AppProviders.logger]: ILogger;
  }) {
    this.mockPaymentProvider = opts[AppProviders.mockPaymentProvider];
    this.logger = opts[AppProviders.logger];
  }

  /**
   * Retrieves the appropriate payment provider for the given tenant.
   *
   * This method determines which payment gateway provider should be used based on the
   * tenant's configuration. Currently returns the mock provider, but can be extended to support
   * provider selection logic based on tenant settings or payment method preferences.
   *
   * The method returns an object containing the primary payment provider and an optional
   * fallback provider. The fallback provider can be used as a backup in case the primary
   * provider fails or is unavailable.
   *
   * @param args - Arguments for provider selection
   * @param args.tenantId - The tenant ID requesting the payment provider
   * @returns {Object} An object containing the payment provider and optional fallback provider
   * @returns {IPaymentProvider} returns.paymentProvider - The primary payment provider instance
   * @returns {IPaymentProvider} [returns.fallbackProvider] - Optional fallback payment provider instance
   *
   * @example
   * ```typescript
   * const { paymentProvider, fallbackProvider } = paymentProviderFactory.getPaymentProvider({
   *   tenantId: 'tenant-123',
   * });
   *
   * const paymentResult = await paymentProvider.createPayment({
   *   tenantId: 'tenant-123',
   *   amount: new Decimal('100.00'),
   *   paymentMethodType: PaymentMethodType.PIX,
   * });
   * ```
   */
  public getPaymentProvider(args: { tenantId: string }): {
    paymentProvider: IPaymentProvider;
    fallbackProvider?: IPaymentProvider;
  } {
    const { tenantId } = args;
    const paymentProvider = this.mockPaymentProvider;

    this.logger.info(
      {
        tenantId,
      },
      'getPaymentProvider',
    );

    this.logger.info(
      {
        chosenProvider: paymentProvider.constructor.name,
      },
      'getPaymentProvider',
    );

    return {
      paymentProvider,
    };
  }

  /**
   * Retrieves a specific payment provider instance based on the provided provider type.
   *
   * This method allows direct selection of a payment provider by its type, bypassing
   * the tenant-based selection logic. It's useful when you need to explicitly request
   * a specific provider (e.g., for testing, fallback scenarios, or when the provider
   * is determined by external configuration).
   *
   * Currently, only the MOCK provider is supported. Attempting to retrieve unsupported
   * providers (Stripe, Stone, Safe2Pay) will result in an UnsupportedPaymentProviderError.
   *
   * @param args - Arguments for provider selection
   * @param args.provider - The specific payment provider type to retrieve
   * @returns {IPaymentProvider} The requested payment provider instance
   * @throws {UnsupportedPaymentProviderError} Throws when the requested provider is not supported or unknown
   *
   * @example
   * ```typescript
   * const mockProvider = paymentProviderFactory.getSpecificPaymentProvider({
   *   provider: Providers.MOCK,
   * });
   *
   * const paymentResult = await mockProvider.createPayment({
   *   tenantId: 'tenant-123',
   *   amount: new Decimal('100.00'),
   *   paymentMethodType: PaymentMethodType.PIX,
   * });
   * ```
   */
  public getSpecificPaymentProvider(args: { provider: Providers }): IPaymentProvider {
    this.logger.info(
      {
        requestedProvider: args.provider,
      },
      'getSpecificPaymentProvider',
    );

    switch (args.provider) {
      case Providers.MOCK:
        this.logger.info(
          {
            requestedProvider: args.provider,
            providerInstance: this.mockPaymentProvider.constructor.name,
          },
          PaymentProviderFactory.LOG_MESSAGE_PROVIDER_RETRIEVED,
        );
        return this.mockPaymentProvider;
      case Providers.STRIPE:
        this.logger.error(
          {
            requestedProvider: args.provider,
            error: 'Stripe payment provider is not supported yet',
          },
          PaymentProviderFactory.LOG_MESSAGE_UNSUPPORTED_PROVIDER,
        );
        throw new UnsupportedPaymentProviderError({
          additionalMessage: 'Stripe payment provider is not supported yet',
        });
      case Providers.STONE:
        this.logger.error(
          {
            requestedProvider: args.provider,
            error: 'Stone payment provider is not supported yet',
          },
          PaymentProviderFactory.LOG_MESSAGE_UNSUPPORTED_PROVIDER,
        );
        throw new UnsupportedPaymentProviderError({
          additionalMessage: 'Stone payment provider is not supported yet',
        });
      case Providers.SAFE_2_PAY:
        this.logger.error(
          {
            requestedProvider: args.provider,
            error: 'Safe2Pay payment provider is not supported yet',
          },
          PaymentProviderFactory.LOG_MESSAGE_UNSUPPORTED_PROVIDER,
        );
        throw new UnsupportedPaymentProviderError({
          additionalMessage: 'Safe2Pay payment provider is not supported yet',
        });
      default:
        this.logger.error(
          {
            requestedProvider: args.provider,
            error: `Unknown payment provider: ${args.provider}`,
          },
          PaymentProviderFactory.LOG_MESSAGE_UNKNOWN_PROVIDER,
        );
        throw new UnsupportedPaymentProviderError({
          additionalMessage: `Unknown payment provider: ${args.provider}`,
        });
    }
  }
}
