import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

import {
  ListTenantsByUserRepository,
  ListAllTenantsRepository,
  ListPublicTenantsRepository,
  GetTenantRepository,
} from './infra/repositories';
import { ListTenantsByUserUseCase } from './usecases/ListTenantsByUserUseCase';
import { ListAllTenantsUseCase } from './usecases/ListAllTenantsUseCase';
import { ListPublicTenantsUseCase } from './usecases/ListPublicTenantsUseCase';

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
    [AppProviders.listPublicTenantsRepository]: provideClass(
      ListPublicTenantsRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.getTenantRepository]: provideClass(GetTenantRepository, Lifecycle.SINGLETON),
    // Use cases
    [AppProviders.listTenantsByUserUseCase]: provideClass(
      ListTenantsByUserUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listAllTenantsUseCase]: provideClass(ListAllTenantsUseCase, Lifecycle.SINGLETON),
    [AppProviders.listPublicTenantsUseCase]: provideClass(
      ListPublicTenantsUseCase,
      Lifecycle.SINGLETON,
    ),
  },
};
