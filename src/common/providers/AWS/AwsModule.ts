import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ModuleDefinition } from '@/common/container/ContainerHandler';
import type { IAppContainer } from '@/common/interfaces/IAppContainer';
import { provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { SQSHandler } from './SQSHandler';
import { CognitoHandler } from './CognitoHandler';
import { MockCognitoHandler } from './MockCognitoHandler';
import { JwtOAuthHandler } from '../auth/JwtOAuthHandler';
import { LOCAL_DEVELOPMENT } from '../../enums';
import { Resolver } from 'awilix';

/**
 * Determines which OAuth handler to use based on environment.
 * Returns a factory function that creates the appropriate handler.
 * Defaults to JwtOAuthHandler, but can use Cognito if AUTH_PROVIDER=COGNITO is set.
 */
function createOAuthHandlerFactory(): Resolver<IAppContainer['oauthHandler']> {
  const authProvider = Bun.env.AUTH_PROVIDER || 'JWT';
  const isLocalDev = Bun.env[LOCAL_DEVELOPMENT] === 'true';

  // Use JWT handler by default
  if (authProvider === 'JWT') {
    return provideClass(JwtOAuthHandler, Lifecycle.SINGLETON);
  }

  // Fallback to Cognito if explicitly requested
  if (authProvider === 'COGNITO') {
    if (isLocalDev) {
      return provideClass(MockCognitoHandler, Lifecycle.SINGLETON);
    }

    return provideClass(CognitoHandler, Lifecycle.SINGLETON);
  }

  // Default to JWT
  return provideClass(JwtOAuthHandler, Lifecycle.SINGLETON);
}

export const AwsModule: ModuleDefinition = {
  name: 'AwsModule',
  providers: {
    [AppProviders.queueProducer]: provideClass(SQSHandler, Lifecycle.SINGLETON),
    [AppProviders.oauthHandler]: createOAuthHandlerFactory(),
  },
};
