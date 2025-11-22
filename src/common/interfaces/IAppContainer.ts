import type { Logger } from '../providers/Logger';
import type { PrismaHandler } from '../providers/PrismaHandler';
import type { PrismaTransactionManager } from '../providers/TransactionManager';
import type { IQueueProducer } from './IQueueProducer';
import type { SessionHandler } from '../providers/SessionHandler';
import type { EnvVariableHandler } from '../providers/EnvVariableHandler';
import type { SecretsHandler } from '../providers/AWS/SecretsHandler';
import type { IOAuth } from './IOAuth';
import type { KeyAuthHandler } from '../auth/KeyAuthHandler';
import type { TokenAuthHandler } from '../auth/TokenAuthHandler';
import type { GetAccountRepository } from '@/models/ledger/infra/repositories/GetAccountRepository';
import type { UpdateAccountBalanceRepository } from '@/models/ledger/infra/repositories/UpdateAccountBalanceRepository';
import type { CreateLedgerEntryRepository } from '@/models/ledger/infra/repositories/CreateLedgerEntryRepository';
import type { GetLedgerEntryRepository } from '@/models/ledger/infra/repositories/GetLedgerEntryRepository';
import type { ListLedgerEntriesRepository } from '@/models/ledger/infra/repositories/ListLedgerEntriesRepository';
import type { UpdateLedgerEntryRepository } from '@/models/ledger/infra/repositories/UpdateLedgerEntryRepository';
import type { DeleteLedgerEntryRepository } from '@/models/ledger/infra/repositories/DeleteLedgerEntryRepository';
import type { CreateLedgerEntryUseCase } from '@/models/ledger/usecases/CreateLedgerEntry.usecase';
import type { GetLedgerEntryUseCase } from '@/models/ledger/usecases/GetLedgerEntry.usecase';
import type { ListLedgerEntriesUseCase } from '@/models/ledger/usecases/ListLedgerEntries.usecase';
import type { UpdateLedgerEntryUseCase } from '@/models/ledger/usecases/UpdateLedgerEntry.usecase';
import type { DeleteLedgerEntryUseCase } from '@/models/ledger/usecases/DeleteLedgerEntry.usecase';
import type { SignInUseCase } from '@/models/auth/usecases/SignInUseCase';
import type { RefreshTokenUseCase } from '@/models/auth/usecases/RefreshTokenUseCase';
import type { PaymentProviderFactory } from '@/common/providers/payment/PaymentProviderFactory';
import type { PaymentManager } from '@/common/providers/payment/PaymentManager';
import type { IPaymentProvider } from './IPaymentProvider';

/**
 * Application container interface defining all available providers.
 * This interface is used by Awilix for type-safe dependency injection.
 */
export interface IAppContainer {
  logger: Logger;
  prisma: PrismaHandler;
  transactionManager: PrismaTransactionManager;
  queueProducer: IQueueProducer;
  sessionHandler: SessionHandler;
  // Infrastructure handlers
  envVariableHandler: EnvVariableHandler;
  secretsHandler: SecretsHandler;
  oauthHandler: IOAuth;
  // Authentication handlers
  tokenAuthHandler: TokenAuthHandler;
  keyAuthHandler: KeyAuthHandler;
  // Ledger repositories
  getAccountRepository: GetAccountRepository;
  updateAccountBalanceRepository: UpdateAccountBalanceRepository;
  createLedgerEntryRepository: CreateLedgerEntryRepository;
  getLedgerEntryRepository: GetLedgerEntryRepository;
  listLedgerEntriesRepository: ListLedgerEntriesRepository;
  updateLedgerEntryRepository: UpdateLedgerEntryRepository;
  deleteLedgerEntryRepository: DeleteLedgerEntryRepository;
  // Ledger use cases
  createLedgerEntryUseCase: CreateLedgerEntryUseCase;
  getLedgerEntryUseCase: GetLedgerEntryUseCase;
  listLedgerEntriesUseCase: ListLedgerEntriesUseCase;
  updateLedgerEntryUseCase: UpdateLedgerEntryUseCase;
  deleteLedgerEntryUseCase: DeleteLedgerEntryUseCase;
  // Auth use cases
  signInUseCase: SignInUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  // Payment providers
  paymentProviderFactory: PaymentProviderFactory;
  paymentManager: PaymentManager;
  mockPaymentProvider: IPaymentProvider;
}

/**
 * Provider names that can be resolved from the container.
 */
export type AppProviderName = keyof IAppContainer;

/**
 * AppProviders is a Proxy that returns the key itself when accessed.
 * This allows type-safe provider name references.
 * Example: AppProviders.logger returns 'logger'
 */
export const AppProviders = new Proxy({} as Record<string, string>, {
  get: (_target, prop: string): string => prop,
}) as { [K in keyof IAppContainer]: K };
