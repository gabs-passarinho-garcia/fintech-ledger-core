import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { SignInUseCase } from './usecases/SignInUseCase';
import { RefreshTokenUseCase } from './usecases/RefreshTokenUseCase';
import { CreateUserRepository } from './infra/repositories/CreateUserRepository';
import { GetUserRepository } from './infra/repositories/GetUserRepository';
import { GetUserByUsernameRepository } from './infra/repositories/GetUserByUsernameRepository';
import { UpdateUserPasswordRepository } from './infra/repositories/UpdateUserPasswordRepository';
import { CreateProfileRepository } from './infra/repositories/CreateProfileRepository';
import { GetProfileRepository } from './infra/repositories/GetProfileRepository';
import { ListProfilesByUserIdRepository } from './infra/repositories/ListProfilesByUserIdRepository';
import { CreateRefreshTokenRepository } from './infra/repositories/CreateRefreshTokenRepository';
import { GetRefreshTokenRepository } from './infra/repositories/GetRefreshTokenRepository';
import { DeleteRefreshTokenRepository } from './infra/repositories/DeleteRefreshTokenRepository';

export const AuthModule: ModuleDefinition = {
  name: 'AuthModule',
  providers: {
    // Repositories
    [AppProviders.createUserRepository]: provideClass(CreateUserRepository, Lifecycle.SCOPED),
    [AppProviders.getUserRepository]: provideClass(GetUserRepository, Lifecycle.SCOPED),
    [AppProviders.getUserByUsernameRepository]: provideClass(
      GetUserByUsernameRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.updateUserPasswordRepository]: provideClass(
      UpdateUserPasswordRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.createProfileRepository]: provideClass(CreateProfileRepository, Lifecycle.SCOPED),
    [AppProviders.getProfileRepository]: provideClass(GetProfileRepository, Lifecycle.SCOPED),
    [AppProviders.listProfilesByUserIdRepository]: provideClass(
      ListProfilesByUserIdRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.createRefreshTokenRepository]: provideClass(
      CreateRefreshTokenRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.getRefreshTokenRepository]: provideClass(
      GetRefreshTokenRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.deleteRefreshTokenRepository]: provideClass(
      DeleteRefreshTokenRepository,
      Lifecycle.SCOPED,
    ),
    // Use cases
    [AppProviders.signInUseCase]: provideClass(SignInUseCase, Lifecycle.SCOPED),
    [AppProviders.refreshTokenUseCase]: provideClass(RefreshTokenUseCase, Lifecycle.SCOPED),
  },
};
