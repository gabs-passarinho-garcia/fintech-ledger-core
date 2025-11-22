import { ModuleDefinition, provideClass, Lifecycle } from '../container/ContainerHandler';
import { AppProviders } from '../interfaces/IAppContainer';
import { KeyAuthHandler } from '../auth/KeyAuthHandler';
import { TokenAuthHandler } from '../auth/TokenAuthHandler';
import { ProvidersModule } from './ProvidersModule';
import { AuthModule as ModelsAuthModule } from '../../models/auth/AuthModule';

/**
 * Authentication module for dependency injection.
 * Registers authentication handlers (KeyAuthHandler and TokenAuthHandler).
 */
export const AuthModule: ModuleDefinition = {
  name: 'AuthModule',
  providers: {
    [AppProviders.keyAuthHandler]: provideClass(KeyAuthHandler, Lifecycle.SCOPED),
    [AppProviders.tokenAuthHandler]: provideClass(TokenAuthHandler, Lifecycle.SCOPED),
  },
  imports: [ProvidersModule, ModelsAuthModule],
};
