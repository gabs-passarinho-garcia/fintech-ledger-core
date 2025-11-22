import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { SignInUseCase } from './usecases/SignInUseCase';
import { RefreshTokenUseCase } from './usecases/RefreshTokenUseCase';
import { SignUpUseCase } from './usecases/SignUpUseCase';
import { GetProfileUseCase } from './usecases/GetProfileUseCase';
import { UpdateProfileUseCase } from './usecases/UpdateProfileUseCase';
import { ListProfilesByUserUseCase } from './usecases/ListProfilesByUserUseCase';
import { ListAllUsersUseCase } from './usecases/ListAllUsersUseCase';
import { ListAllProfilesUseCase } from './usecases/ListAllProfilesUseCase';
import { DeleteProfileUseCase } from './usecases/DeleteProfileUseCase';
import { DeleteUserUseCase } from './usecases/DeleteUserUseCase';
import { CreateUserRepository } from './infra/repositories/CreateUserRepository';
import { GetUserRepository } from './infra/repositories/GetUserRepository';
import { GetUserByUsernameRepository } from './infra/repositories/GetUserByUsernameRepository';
import { UpdateUserPasswordRepository } from './infra/repositories/UpdateUserPasswordRepository';
import { CreateProfileRepository } from './infra/repositories/CreateProfileRepository';
import { GetProfileRepository } from './infra/repositories/GetProfileRepository';
import { ListProfilesByUserIdRepository } from './infra/repositories/ListProfilesByUserIdRepository';
import { UpdateProfileRepository } from './infra/repositories/UpdateProfileRepository';
import { DeleteProfileRepository } from './infra/repositories/DeleteProfileRepository';
import { DeleteUserRepository } from './infra/repositories/DeleteUserRepository';
import { ListAllUsersRepository } from './infra/repositories/ListAllUsersRepository';
import { ListAllProfilesRepository } from './infra/repositories/ListAllProfilesRepository';
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
    [AppProviders.updateProfileRepository]: provideClass(UpdateProfileRepository, Lifecycle.SCOPED),
    [AppProviders.deleteProfileRepository]: provideClass(DeleteProfileRepository, Lifecycle.SCOPED),
    [AppProviders.deleteUserRepository]: provideClass(DeleteUserRepository, Lifecycle.SCOPED),
    [AppProviders.listAllUsersRepository]: provideClass(ListAllUsersRepository, Lifecycle.SCOPED),
    [AppProviders.listAllProfilesRepository]: provideClass(
      ListAllProfilesRepository,
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
    [AppProviders.signUpUseCase]: provideClass(SignUpUseCase, Lifecycle.SCOPED),
    [AppProviders.getProfileUseCase]: provideClass(GetProfileUseCase, Lifecycle.SCOPED),
    [AppProviders.updateProfileUseCase]: provideClass(UpdateProfileUseCase, Lifecycle.SCOPED),
    [AppProviders.listProfilesByUserUseCase]: provideClass(
      ListProfilesByUserUseCase,
      Lifecycle.SCOPED,
    ),
    [AppProviders.listAllUsersUseCase]: provideClass(ListAllUsersUseCase, Lifecycle.SCOPED),
    [AppProviders.listAllProfilesUseCase]: provideClass(ListAllProfilesUseCase, Lifecycle.SCOPED),
    [AppProviders.deleteProfileUseCase]: provideClass(DeleteProfileUseCase, Lifecycle.SCOPED),
    [AppProviders.deleteUserUseCase]: provideClass(DeleteUserUseCase, Lifecycle.SCOPED),
  },
};
