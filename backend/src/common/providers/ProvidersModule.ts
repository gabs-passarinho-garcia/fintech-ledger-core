import type { ModuleDefinition } from '../container/ContainerHandler';
import { provideClass, provideFactory, Lifecycle } from '../container/ContainerHandler';
import { AppProviders } from '../interfaces/IAppContainer';
import { EnvVariableHandler } from './EnvVariableHandler';
import { SecretsHandler } from './AWS/SecretsHandler';
import { providePasswordHandler } from './auth/PasswordHandlerFactory';
import { provideJwtHelper } from './auth/JwtHelperFactory';
import { SessionModule } from './SessionModule';
import { PrismaModule } from './PrismaModule';
import { LoggerModule } from './LoggerModule';
import { AwsModule } from './AWS/AwsModule';
import { AuthModule as ModelsAuthModule } from '@/models/auth/AuthModule';

export const ProvidersModule: ModuleDefinition = {
  name: 'ProvidersModule',
  providers: {
    [AppProviders.envVariableHandler]: provideClass(EnvVariableHandler, Lifecycle.SINGLETON),
    [AppProviders.secretsHandler]: provideClass(SecretsHandler, Lifecycle.SINGLETON),
    [AppProviders.passwordHandler]: provideFactory(providePasswordHandler, Lifecycle.SINGLETON),
    [AppProviders.jwtHelper]: provideFactory(provideJwtHelper, Lifecycle.SINGLETON),
  },
  imports: [
    SessionModule,
    PrismaModule,
    LoggerModule,
    AwsModule,
    ModelsAuthModule, // Must be after AwsModule in list (but processed before due to LIFO) as AwsModule depends on AuthModule repositories
  ],
};
