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
import type { ListAllLedgerEntriesRepository } from '@/models/ledger/infra/repositories/ListAllLedgerEntriesRepository';
import type { CreateLedgerEntryUseCase } from '@/models/ledger/usecases/CreateLedgerEntry.usecase';
import type { GetLedgerEntryUseCase } from '@/models/ledger/usecases/GetLedgerEntry.usecase';
import type { ListLedgerEntriesUseCase } from '@/models/ledger/usecases/ListLedgerEntries.usecase';
import type { UpdateLedgerEntryUseCase } from '@/models/ledger/usecases/UpdateLedgerEntry.usecase';
import type { DeleteLedgerEntryUseCase } from '@/models/ledger/usecases/DeleteLedgerEntry.usecase';
import type { ListAllLedgerEntriesUseCase } from '@/models/ledger/usecases/ListAllLedgerEntriesUseCase';
import type { SignInUseCase } from '@/models/auth/usecases/SignInUseCase';
import type { RefreshTokenUseCase } from '@/models/auth/usecases/RefreshTokenUseCase';
import type { PaymentProviderFactory } from '@/common/providers/payment/PaymentProviderFactory';
import type { PaymentManager } from '@/common/providers/payment/PaymentManager';
import type { IPaymentProvider } from './IPaymentProvider';
import type { PasswordHandler } from '../providers/auth/PasswordHandler';
import type { JwtHelper } from '../providers/auth/JwtHelper';
import type { CreateUserRepository } from '@/models/auth/infra/repositories/CreateUserRepository';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { GetUserByUsernameRepository } from '@/models/auth/infra/repositories/GetUserByUsernameRepository';
import type { UpdateUserPasswordRepository } from '@/models/auth/infra/repositories/UpdateUserPasswordRepository';
import type { CreateProfileRepository } from '@/models/auth/infra/repositories/CreateProfileRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { ListProfilesByUserIdRepository } from '@/models/auth/infra/repositories/ListProfilesByUserIdRepository';
import type { UpdateProfileRepository } from '@/models/auth/infra/repositories/UpdateProfileRepository';
import type { DeleteProfileRepository } from '@/models/auth/infra/repositories/DeleteProfileRepository';
import type { DeleteUserRepository } from '@/models/auth/infra/repositories/DeleteUserRepository';
import type { ListAllUsersRepository } from '@/models/auth/infra/repositories/ListAllUsersRepository';
import type { ListAllProfilesRepository } from '@/models/auth/infra/repositories/ListAllProfilesRepository';
import type { CreateRefreshTokenRepository } from '@/models/auth/infra/repositories/CreateRefreshTokenRepository';
import type { GetRefreshTokenRepository } from '@/models/auth/infra/repositories/GetRefreshTokenRepository';
import type { DeleteRefreshTokenRepository } from '@/models/auth/infra/repositories/DeleteRefreshTokenRepository';
import type { SignUpUseCase } from '@/models/auth/usecases/SignUpUseCase';
import type { GetProfileUseCase } from '@/models/auth/usecases/GetProfileUseCase';
import type { UpdateProfileUseCase } from '@/models/auth/usecases/UpdateProfileUseCase';
import type { ListProfilesByUserUseCase } from '@/models/auth/usecases/ListProfilesByUserUseCase';
import type { ListAllUsersUseCase } from '@/models/auth/usecases/ListAllUsersUseCase';
import type { ListAllProfilesUseCase } from '@/models/auth/usecases/ListAllProfilesUseCase';
import type { DeleteProfileUseCase } from '@/models/auth/usecases/DeleteProfileUseCase';
import type { DeleteUserUseCase } from '@/models/auth/usecases/DeleteUserUseCase';
import type { ListTenantsByUserRepository } from '@/models/tenant/infra/repositories/ListTenantsByUserRepository';
import type { ListAllTenantsRepository } from '@/models/tenant/infra/repositories/ListAllTenantsRepository';
import type { ListTenantsByUserUseCase } from '@/models/tenant/usecases/ListTenantsByUserUseCase';
import type { ListAllTenantsUseCase } from '@/models/tenant/usecases/ListAllTenantsUseCase';

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
  passwordHandler: PasswordHandler;
  jwtHelper: JwtHelper;
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
  listAllLedgerEntriesRepository: ListAllLedgerEntriesRepository;
  // Ledger use cases
  createLedgerEntryUseCase: CreateLedgerEntryUseCase;
  getLedgerEntryUseCase: GetLedgerEntryUseCase;
  listLedgerEntriesUseCase: ListLedgerEntriesUseCase;
  updateLedgerEntryUseCase: UpdateLedgerEntryUseCase;
  deleteLedgerEntryUseCase: DeleteLedgerEntryUseCase;
  listAllLedgerEntriesUseCase: ListAllLedgerEntriesUseCase;
  // Auth repositories
  createUserRepository: CreateUserRepository;
  getUserRepository: GetUserRepository;
  getUserByUsernameRepository: GetUserByUsernameRepository;
  updateUserPasswordRepository: UpdateUserPasswordRepository;
  createProfileRepository: CreateProfileRepository;
  getProfileRepository: GetProfileRepository;
  listProfilesByUserIdRepository: ListProfilesByUserIdRepository;
  updateProfileRepository: UpdateProfileRepository;
  deleteProfileRepository: DeleteProfileRepository;
  deleteUserRepository: DeleteUserRepository;
  listAllUsersRepository: ListAllUsersRepository;
  listAllProfilesRepository: ListAllProfilesRepository;
  createRefreshTokenRepository: CreateRefreshTokenRepository;
  getRefreshTokenRepository: GetRefreshTokenRepository;
  deleteRefreshTokenRepository: DeleteRefreshTokenRepository;
  // Auth use cases
  signInUseCase: SignInUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  signUpUseCase: SignUpUseCase;
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  listProfilesByUserUseCase: ListProfilesByUserUseCase;
  listAllUsersUseCase: ListAllUsersUseCase;
  listAllProfilesUseCase: ListAllProfilesUseCase;
  deleteProfileUseCase: DeleteProfileUseCase;
  deleteUserUseCase: DeleteUserUseCase;
  // Tenant repositories
  listTenantsByUserRepository: ListTenantsByUserRepository;
  listAllTenantsRepository: ListAllTenantsRepository;
  // Tenant use cases
  listTenantsByUserUseCase: ListTenantsByUserUseCase;
  listAllTenantsUseCase: ListAllTenantsUseCase;
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
