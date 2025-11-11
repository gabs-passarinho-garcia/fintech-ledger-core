import type { ModuleDefinition } from '../container/ContainerHandler';
import { provideClass, Lifecycle } from '../container/ContainerHandler';
import { AppProviders } from '../interfaces/IAppContainer';
import { EnvVariableHandler } from './EnvVariableHandler';
import { SecretsHandler } from './AWS/SecretsHandler';
import { SessionModule } from './SessionModule';
import { PrismaModule } from './PrismaModule';
import { LoggerModule } from './LoggerModule';
import { AwsModule } from './AWS/AwsModule';

export const ProvidersModule: ModuleDefinition = {
  name: 'ProvidersModule',
  providers: {
    [AppProviders.envVariableHandler]: provideClass(EnvVariableHandler, Lifecycle.SINGLETON),
    [AppProviders.secretsHandler]: provideClass(SecretsHandler, Lifecycle.SINGLETON),
  },
  imports: [SessionModule, PrismaModule, LoggerModule, AwsModule],
};
