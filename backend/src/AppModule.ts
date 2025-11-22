import type { ModuleDefinition } from './common/container/ContainerHandler';
import { ProvidersModule } from './common/providers/ProvidersModule';
import { AuthModule as CommonAuthModule } from './common/providers/AuthModule';
import { PaymentModule } from './common/providers/payment/PaymentModule';
import { LedgerModule } from './models/ledger/LedgerModule';
import { AuthModule } from './models/auth/AuthModule';
import { TenantModule } from './models/tenant/TenantModule';

export const AppModule: ModuleDefinition = {
  name: 'AppModule',
  imports: [
    ProvidersModule,
    AuthModule, // ModelsAuthModule - must be before CommonAuthModule
    CommonAuthModule, // Must be after AuthModule (ModelsAuthModule) as it depends on it
    PaymentModule,
    LedgerModule,
    TenantModule,
  ],
};
