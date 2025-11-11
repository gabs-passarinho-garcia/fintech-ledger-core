import type { ModuleDefinition } from './common/container/ContainerHandler';
import { ProvidersModule } from './common/providers/ProvidersModule';
import { AuthModule } from './common/providers/AuthModule';
import { LedgerModule } from './modules/ledger/LedgerModule';

export const AppModule: ModuleDefinition = {
  name: 'AppModule',
  imports: [ProvidersModule, AuthModule, LedgerModule],
};
