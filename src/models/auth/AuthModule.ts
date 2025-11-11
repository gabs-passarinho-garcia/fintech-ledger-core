import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { SignInUseCase } from './usecases/SignInUseCase';
import { RefreshTokenUseCase } from './usecases/RefreshTokenUseCase';

export const AuthModule: ModuleDefinition = {
  name: 'AuthModule',
  providers: {
    // Use cases
    [AppProviders.signInUseCase]: provideClass(SignInUseCase, Lifecycle.SCOPED),
    [AppProviders.refreshTokenUseCase]: provideClass(RefreshTokenUseCase, Lifecycle.SCOPED),
  },
};
