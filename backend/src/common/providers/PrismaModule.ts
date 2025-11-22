import { AppProviders } from '../interfaces/IAppContainer';
import type { ModuleDefinition } from '../container/ContainerHandler';
import { provideClass, provideFactory, Lifecycle } from '../container/ContainerHandler';
import { providePrisma } from './PrismaHandler';
import { PrismaTransactionManager } from './TransactionManager';

export const PrismaModule: ModuleDefinition = {
  name: 'PrismaModule',
  providers: {
    [AppProviders.prisma]: provideFactory(providePrisma, Lifecycle.SINGLETON),
    [AppProviders.transactionManager]: provideClass(PrismaTransactionManager, Lifecycle.SINGLETON),
  },
};
