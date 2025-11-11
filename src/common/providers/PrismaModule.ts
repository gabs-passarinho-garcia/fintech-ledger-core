import { AppProviders } from '../interfaces/IAppContainer';
import type { ModuleDefinition } from '../container/ContainerHandler';
import { provideClass, Lifecycle } from '../container/ContainerHandler';
import { PrismaHandler } from './PrismaHandler';
import { PrismaTransactionManager } from './TransactionManager';

export const PrismaModule: ModuleDefinition = {
  name: 'PrismaModule',
  providers: {
    [AppProviders.prisma]: provideClass(PrismaHandler, Lifecycle.SINGLETON),
    [AppProviders.transactionManager]: provideClass(PrismaTransactionManager, Lifecycle.SINGLETON),
  },
};
