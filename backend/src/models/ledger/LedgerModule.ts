import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

import {
  GetAccountRepository,
  UpdateAccountBalanceRepository,
  CreateLedgerEntryRepository,
  GetLedgerEntryRepository,
  ListLedgerEntriesRepository,
  UpdateLedgerEntryRepository,
  DeleteLedgerEntryRepository,
  ListAllLedgerEntriesRepository,
} from './infra/repositories';
import { CreateLedgerEntryUseCase } from './usecases/CreateLedgerEntry.usecase';
import { GetLedgerEntryUseCase } from './usecases/GetLedgerEntry.usecase';
import { ListLedgerEntriesUseCase } from './usecases/ListLedgerEntries.usecase';
import { UpdateLedgerEntryUseCase } from './usecases/UpdateLedgerEntry.usecase';
import { DeleteLedgerEntryUseCase } from './usecases/DeleteLedgerEntry.usecase';
import { ListAllLedgerEntriesUseCase } from './usecases/ListAllLedgerEntriesUseCase';

export const LedgerModule: ModuleDefinition = {
  name: 'LedgerModule',
  providers: {
    // Repositories
    [AppProviders.getAccountRepository]: provideClass(GetAccountRepository, Lifecycle.SINGLETON),
    [AppProviders.updateAccountBalanceRepository]: provideClass(
      UpdateAccountBalanceRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.createLedgerEntryRepository]: provideClass(
      CreateLedgerEntryRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.getLedgerEntryRepository]: provideClass(
      GetLedgerEntryRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listLedgerEntriesRepository]: provideClass(
      ListLedgerEntriesRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.updateLedgerEntryRepository]: provideClass(
      UpdateLedgerEntryRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.deleteLedgerEntryRepository]: provideClass(
      DeleteLedgerEntryRepository,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listAllLedgerEntriesRepository]: provideClass(
      ListAllLedgerEntriesRepository,
      Lifecycle.SINGLETON,
    ),
    // Use cases
    [AppProviders.createLedgerEntryUseCase]: provideClass(
      CreateLedgerEntryUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.getLedgerEntryUseCase]: provideClass(GetLedgerEntryUseCase, Lifecycle.SINGLETON),
    [AppProviders.listLedgerEntriesUseCase]: provideClass(
      ListLedgerEntriesUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.updateLedgerEntryUseCase]: provideClass(
      UpdateLedgerEntryUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.deleteLedgerEntryUseCase]: provideClass(
      DeleteLedgerEntryUseCase,
      Lifecycle.SINGLETON,
    ),
    [AppProviders.listAllLedgerEntriesUseCase]: provideClass(
      ListAllLedgerEntriesUseCase,
      Lifecycle.SINGLETON,
    ),
  },
};
