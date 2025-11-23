import type { ModuleDefinition } from './common/container/ContainerHandler';
import { ProvidersModule } from './common/providers/ProvidersModule';
import { AuthModule as CommonAuthModule } from './common/providers/AuthModule';
import { PaymentModule } from './common/providers/payment/PaymentModule';
import { LedgerModule } from './models/ledger/LedgerModule';
import { AuthModule } from './models/auth/AuthModule';
import { TenantModule } from './models/tenant/TenantModule';
import { AccountsModule } from './models/accounts/AccountsModule';

export const AppModule: ModuleDefinition = {
  name: 'AppModule',
  imports: [
    TenantModule,
    LedgerModule,
    AccountsModule,
    PaymentModule,
    CommonAuthModule, // Must be after AuthModule (ModelsAuthModule) as it depends on it
    ProvidersModule, // Must be after ModelsAuthModule so repositories are available when AwsModule registers oauthHandler
    AuthModule, // ModelsAuthModule - must be last (processed first due to LIFO) to ensure repositories are registered before AwsModule
  ],
};
