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
} from './infra/repositories';
import { CreateLedgerEntryUseCase } from './usecases/CreateLedgerEntry.usecase';
import { GetLedgerEntryUseCase } from './usecases/GetLedgerEntry.usecase';
import { ListLedgerEntriesUseCase } from './usecases/ListLedgerEntries.usecase';
import { UpdateLedgerEntryUseCase } from './usecases/UpdateLedgerEntry.usecase';
import { DeleteLedgerEntryUseCase } from './usecases/DeleteLedgerEntry.usecase';

export const LedgerModule: ModuleDefinition = {
  name: 'LedgerModule',
  providers: {
    // Repositories
    [AppProviders.getAccountRepository]: provideClass(GetAccountRepository, Lifecycle.SCOPED),
    [AppProviders.updateAccountBalanceRepository]: provideClass(
      UpdateAccountBalanceRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.createLedgerEntryRepository]: provideClass(
      CreateLedgerEntryRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.getLedgerEntryRepository]: provideClass(
      GetLedgerEntryRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.listLedgerEntriesRepository]: provideClass(
      ListLedgerEntriesRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.updateLedgerEntryRepository]: provideClass(
      UpdateLedgerEntryRepository,
      Lifecycle.SCOPED,
    ),
    [AppProviders.deleteLedgerEntryRepository]: provideClass(
      DeleteLedgerEntryRepository,
      Lifecycle.SCOPED,
    ),
    // Use cases
    [AppProviders.createLedgerEntryUseCase]: provideClass(
      CreateLedgerEntryUseCase,
      Lifecycle.SCOPED,
    ),
    [AppProviders.getLedgerEntryUseCase]: provideClass(GetLedgerEntryUseCase, Lifecycle.SCOPED),
    [AppProviders.listLedgerEntriesUseCase]: provideClass(
      ListLedgerEntriesUseCase,
      Lifecycle.SCOPED,
    ),
    [AppProviders.updateLedgerEntryUseCase]: provideClass(
      UpdateLedgerEntryUseCase,
      Lifecycle.SCOPED,
    ),
    [AppProviders.deleteLedgerEntryUseCase]: provideClass(
      DeleteLedgerEntryUseCase,
      Lifecycle.SCOPED,
    ),
  },
};
