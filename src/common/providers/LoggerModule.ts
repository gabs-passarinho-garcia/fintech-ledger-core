import { AppProviders } from '../interfaces/IAppContainer';
import type { ModuleDefinition } from '../container/ContainerHandler';
import { provideClass, Lifecycle } from '../container/ContainerHandler';
import { Logger } from './Logger';

export const LoggerModule: ModuleDefinition = {
  name: 'LoggerModule',
  providers: {
    [AppProviders.logger]: provideClass(Logger, Lifecycle.SINGLETON),
  },
};
