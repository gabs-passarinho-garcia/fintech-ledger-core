import { Lifecycle, ModuleDefinition, provideClass } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { MockPaymentProvider } from './MockPaymentProvider';

/**
 * Module definition for Mock Payment Provider.
 * Registers the MockPaymentProvider in the dependency injection container.
 */
export const MockPaymentModule: ModuleDefinition = {
  name: 'MockPaymentModule',
  providers: {
    [AppProviders.mockPaymentProvider]: provideClass(MockPaymentProvider, Lifecycle.SINGLETON),
  },
};
