import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { ListAccountsByProfileIdRepository } from './infra/repositories/ListAccountsByProfileIdRepository';
import { CreateAccountRepository } from './infra/repositories/CreateAccountRepository';
import { GetMyAccountsUseCase } from './usecases/GetMyAccountsUseCase';
import { ListAccountsByProfileUseCase } from './usecases/ListAccountsByProfileUseCase';
import { ListProfilesWithAccountsUseCase } from './usecases/ListProfilesWithAccountsUseCase';
import { CreateAccountUseCase } from './usecases/CreateAccountUseCase';

export const AccountsModule: ModuleDefinition = {
  name: 'AccountsModule',
  providers: {
    // Repositories
    [AppProviders.listAccountsByProfileIdRepository]: provideClass(
      ListAccountsByProfileIdRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.createAccountRepository]: provideClass(
      CreateAccountRepository,
      Lifecycle.SINGLETON,
    ),
    // Use cases
    [AppProviders.getMyAccountsUseCase]: provideClass(GetMyAccountsUseCase, Lifecycle.SINGLETON),
    [AppProviders.listAccountsByProfileUseCase]: provideClass(
      ListAccountsByProfileUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listProfilesWithAccountsUseCase]: provideClass(
      ListProfilesWithAccountsUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.createAccountUseCase]: provideClass(CreateAccountUseCase, Lifecycle.SINGLETON),
  },
};
