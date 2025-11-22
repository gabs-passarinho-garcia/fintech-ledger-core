import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { SignInUseCase } from './usecases/SignInUseCase';
import { RefreshTokenUseCase } from './usecases/RefreshTokenUseCase';
import { SignUpUseCase } from './usecases/SignUpUseCase';
import { GetProfileUseCase } from './usecases/GetProfileUseCase';
import { GetMyProfileUseCase } from './usecases/GetMyProfileUseCase';
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
    [AppProviders.createUserRepository]: provideClass(CreateUserRepository, Lifecycle.SINGLETON),
    [AppProviders.getUserRepository]: provideClass(GetUserRepository, Lifecycle.SINGLETON),
    [AppProviders.getUserByUsernameRepository]: provideClass(
      GetUserByUsernameRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.updateUserPasswordRepository]: provideClass(
      UpdateUserPasswordRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.createProfileRepository]: provideClass(
      CreateProfileRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.getProfileRepository]: provideClass(GetProfileRepository, Lifecycle.SINGLETON),
    [AppProviders.listProfilesByUserIdRepository]: provideClass(
      ListProfilesByUserIdRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.updateProfileRepository]: provideClass(
      UpdateProfileRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.deleteProfileRepository]: provideClass(
      DeleteProfileRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.deleteUserRepository]: provideClass(DeleteUserRepository, Lifecycle.SINGLETON),
    [AppProviders.listAllUsersRepository]: provideClass(
      ListAllUsersRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listAllProfilesRepository]: provideClass(
      ListAllProfilesRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.createRefreshTokenRepository]: provideClass(
      CreateRefreshTokenRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.getRefreshTokenRepository]: provideClass(
      GetRefreshTokenRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.deleteRefreshTokenRepository]: provideClass(
      DeleteRefreshTokenRepository,
      Lifecycle.SINGLETON,
    ),
    // Use cases
    [AppProviders.signInUseCase]: provideClass(SignInUseCase, Lifecycle.SINGLETON),
    [AppProviders.refreshTokenUseCase]: provideClass(RefreshTokenUseCase, Lifecycle.SINGLETON),
    [AppProviders.signUpUseCase]: provideClass(SignUpUseCase, Lifecycle.SINGLETON),
    [AppProviders.getProfileUseCase]: provideClass(GetProfileUseCase, Lifecycle.SINGLETON),
    [AppProviders.getMyProfileUseCase]: provideClass(GetMyProfileUseCase, Lifecycle.SINGLETON),
    [AppProviders.updateProfileUseCase]: provideClass(UpdateProfileUseCase, Lifecycle.SINGLETON),
    [AppProviders.listProfilesByUserUseCase]: provideClass(
      ListProfilesByUserUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listAllUsersUseCase]: provideClass(ListAllUsersUseCase, Lifecycle.SINGLETON),
    [AppProviders.listAllProfilesUseCase]: provideClass(
      ListAllProfilesUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.deleteProfileUseCase]: provideClass(DeleteProfileUseCase, Lifecycle.SINGLETON),
    [AppProviders.deleteUserUseCase]: provideClass(DeleteUserUseCase, Lifecycle.SINGLETON),
  },
};
