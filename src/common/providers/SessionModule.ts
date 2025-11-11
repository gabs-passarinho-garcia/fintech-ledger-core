import { AppProviders } from '../interfaces/IAppContainer';
import type { ModuleDefinition } from '../container/ContainerHandler';
import { provideClass, Lifecycle } from '../container/ContainerHandler';
import { SessionHandler } from './SessionHandler';

export const SessionModule: ModuleDefinition = {
  name: 'SessionModule',
  providers: {
    [AppProviders.sessionHandler]: provideClass(SessionHandler, Lifecycle.SCOPED),
  },
};
