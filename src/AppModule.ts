import type { ModuleDefinition } from './common/container/ContainerHandler';
import { ProvidersModule } from './common/providers/ProvidersModule';
import { AuthModule as CommonAuthModule } from './common/providers/AuthModule';
import { LedgerModule } from './models/ledger/LedgerModule';
import { AuthModule } from './models/auth/AuthModule';

export const AppModule: ModuleDefinition = {
  name: 'AppModule',
  imports: [ProvidersModule, CommonAuthModule, LedgerModule, AuthModule],
};
