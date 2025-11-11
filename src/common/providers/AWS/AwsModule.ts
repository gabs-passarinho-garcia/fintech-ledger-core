import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ModuleDefinition } from '@/common/container/ContainerHandler';
import { provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { SQSHandler } from './SQSHandler';
import { CognitoHandler } from './CognitoHandler';

export const AwsModule: ModuleDefinition = {
  name: 'AwsModule',
  providers: {
    [AppProviders.queueProducer]: provideClass(SQSHandler, Lifecycle.SINGLETON),
    [AppProviders.oauthHandler]: provideClass(CognitoHandler, Lifecycle.SINGLETON),
  },
};
