import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ModuleDefinition } from '@/common/container/ContainerHandler';
import type { IAppContainer } from '@/common/interfaces/IAppContainer';
import { provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { SQSHandler } from './SQSHandler';
import { CognitoHandler } from './CognitoHandler';
import { MockCognitoHandler } from './MockCognitoHandler';
import { LOCAL_DEVELOPMENT } from '../../enums';
import { Resolver } from 'awilix';

/**
 * Determines which OAuth handler to use based on environment.
 * Returns a factory function that creates the appropriate handler.
 */
function createOAuthHandlerFactory(): Resolver<IAppContainer['oauthHandler']> {
  const isLocalDev = Bun.env[LOCAL_DEVELOPMENT] === 'true';

  if (isLocalDev) {
    return provideClass(MockCognitoHandler, Lifecycle.SINGLETON);
  }

  return provideClass(CognitoHandler, Lifecycle.SINGLETON);
}

export const AwsModule: ModuleDefinition = {
  name: 'AwsModule',
  providers: {
    [AppProviders.queueProducer]: provideClass(SQSHandler, Lifecycle.SINGLETON),
    [AppProviders.oauthHandler]: createOAuthHandlerFactory(),
  },
};
