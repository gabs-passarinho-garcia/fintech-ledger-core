import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

import { ListTenantsByUserRepository, ListAllTenantsRepository } from './infra/repositories';
import { ListTenantsByUserUseCase } from './usecases/ListTenantsByUserUseCase';
import { ListAllTenantsUseCase } from './usecases/ListAllTenantsUseCase';

export const TenantModule: ModuleDefinition = {
  name: 'TenantModule',
  providers: {
    // Repositories
    [AppProviders.listTenantsByUserRepository]: provideClass(
      ListTenantsByUserRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listAllTenantsRepository]: provideClass(
      ListAllTenantsRepository,
      Lifecycle.SINGLETON,
    ),
    // Use cases
    [AppProviders.listTenantsByUserUseCase]: provideClass(
      ListTenantsByUserUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listAllTenantsUseCase]: provideClass(ListAllTenantsUseCase, Lifecycle.SINGLETON),
  },
};
