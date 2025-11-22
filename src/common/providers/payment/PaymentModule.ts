import {
  Lifecycle,
  provideClass,
  type ModuleDefinition,
} from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { MockPaymentModule } from './mock/MockPaymentModule';
import { PaymentProviderFactory } from './PaymentProviderFactory';
import { PaymentManager } from './PaymentManager';

/**
 * Module definition for Payment system.
 * Registers PaymentProviderFactory and PaymentManager in the dependency injection container.
 */
export const PaymentModule: ModuleDefinition = {
  name: 'PaymentModule',
  providers: {
    [AppProviders.paymentProviderFactory]: provideClass(
      PaymentProviderFactory,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.paymentManager]: provideClass(PaymentManager, Lifecycle.SINGLETON),
  },
  imports: [MockPaymentModule],
};
