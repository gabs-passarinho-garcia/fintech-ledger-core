import { ModuleDefinition, provideClass, Lifecycle } from '@/common/container/ContainerHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

import {
  GetAccountRepository,
  UpdateAccountBalanceRepository,
  CreateLedgerEntryRepository,
} from './infra/repositories';
import { CreateLedgerEntryUseCase } from './usecases/CreateLedgerEntry.usecase';

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
    // Use cases
    [AppProviders.createLedgerEntryUseCase]: provideClass(
      CreateLedgerEntryUseCase,
      Lifecycle.SCOPED,
    ),
  },
};
