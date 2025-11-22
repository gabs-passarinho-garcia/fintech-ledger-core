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
      Lifecycle.SCOPED,
    ),
    [AppProviders.listAllTenantsRepository]: provideClass(
      ListAllTenantsRepository,
      Lifecycle.SCOPED,
    ),
    // Use cases
    [AppProviders.listTenantsByUserUseCase]: provideClass(
      ListTenantsByUserUseCase,
      Lifecycle.SCOPED,
    ),
    [AppProviders.listAllTenantsUseCase]: provideClass(ListAllTenantsUseCase, Lifecycle.SCOPED),
  },
};
