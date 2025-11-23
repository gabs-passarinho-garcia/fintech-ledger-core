import { PrismaClient } from './client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Decimal } from 'decimal.js';
import { uuidv7 } from 'uuidv7';
import argon2 from 'argon2';

const adapter = new PrismaPg({
  connectionString: Bun.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates a random integer between min and max (inclusive).
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random decimal between min and max.
 */
function randomDecimal(min: number, max: number): Decimal {
  const value = Math.random() * (max - min) + min;
  return new Decimal(value.toFixed(2));
}

/**
 * Generates a random date between start and end dates.
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Picks a random element from an array.
 */
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a realistic account name based on type.
 */
function generateAccountName(type: string, index: number): string {
  const prefixes: Record<string, string[]> = {
    operacional: ['Conta Operacional', 'Conta Principal', 'Conta Corrente', 'Conta de Operações'],
    poupanca: ['Conta Poupança', 'Reserva de Emergência', 'Fundo de Reserva', 'Poupança'],
    investimento: ['Conta de Investimentos', 'Portfólio de Investimentos', 'Fundo de Investimento'],
    reserva: ['Reserva Estratégica', 'Fundo de Reserva', 'Reserva de Capital'],
    caixa: ['Caixa', 'Caixa Pequeno', 'Caixa Operacional'],
  };

  const prefix = prefixes[type.toLowerCase()] || ['Conta'];
  return `${randomElement(prefix)} ${index > 1 ? index : ''}`.trim();
}

/**
 * Tenant profiles with realistic names and characteristics.
 */
const TENANT_PROFILES = [
  { name: 'Zion Church São Paulo', type: 'church', scale: 'large' },
  { name: 'TechStart Solutions', type: 'startup', scale: 'small' },
  { name: 'Global Finance Corp', type: 'corporation', scale: 'large' },
  { name: 'Hope Foundation', type: 'ngo', scale: 'medium' },
  { name: 'Freelance Developer Co', type: 'freelancer', scale: 'small' },
  { name: 'Igreja Batista Central', type: 'church', scale: 'medium' },
  { name: 'Innovation Labs', type: 'startup', scale: 'small' },
  { name: 'MegaCorp Industries', type: 'corporation', scale: 'large' },
  { name: 'Community Care NGO', type: 'ngo', scale: 'medium' },
  { name: 'Digital Agency Pro', type: 'agency', scale: 'medium' },
  { name: 'Igreja Presbiteriana Vida', type: 'church', scale: 'small' },
  { name: 'Green Energy Solutions', type: 'startup', scale: 'small' },
  { name: 'Financial Services Group', type: 'corporation', scale: 'large' },
  { name: 'Social Impact Initiative', type: 'ngo', scale: 'medium' },
  { name: 'Creative Studio', type: 'agency', scale: 'small' },
];

/**
 * Account types with realistic names.
 */
const ACCOUNT_TYPES = [
  { type: 'operacional', minBalance: 10000, maxBalance: 500000 },
  { type: 'poupanca', minBalance: 5000, maxBalance: 200000 },
  { type: 'investimento', minBalance: 50000, maxBalance: 2000000 },
  { type: 'reserva', minBalance: 20000, maxBalance: 1000000 },
  { type: 'caixa', minBalance: 1000, maxBalance: 50000 },
];

/**
 * Transaction type distribution weights.
 */
const TRANSACTION_TYPE_WEIGHTS = {
  DEPOSIT: 0.4,
  WITHDRAWAL: 0.3,
  TRANSFER: 0.3,
};

/**
 * Transaction status distribution weights.
 */
const TRANSACTION_STATUS_WEIGHTS = {
  COMPLETED: 0.8,
  PENDING: 0.15,
  FAILED: 0.05,
};

/**
 * Selects a transaction type based on weighted distribution.
 */
function selectTransactionType(): 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' {
  const rand = Math.random();
  if (rand < TRANSACTION_TYPE_WEIGHTS.DEPOSIT) return 'DEPOSIT';
  if (rand < TRANSACTION_TYPE_WEIGHTS.DEPOSIT + TRANSACTION_TYPE_WEIGHTS.WITHDRAWAL) {
    return 'WITHDRAWAL';
  }
  return 'TRANSFER';
}

/**
 * Selects a transaction status based on weighted distribution.
 */
function selectTransactionStatus(): 'PENDING' | 'COMPLETED' | 'FAILED' {
  const rand = Math.random();
  if (rand < TRANSACTION_STATUS_WEIGHTS.COMPLETED) return 'COMPLETED';
  if (rand < TRANSACTION_STATUS_WEIGHTS.COMPLETED + TRANSACTION_STATUS_WEIGHTS.PENDING) {
    return 'PENDING';
  }
  return 'FAILED';
}

/**
 * Generates a realistic transaction amount based on type and tenant scale.
 */
function generateTransactionAmount(
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER',
  scale: string,
): Decimal {
  const scaleMultipliers: Record<string, { min: number; max: number }> = {
    small: { min: 10, max: 50000 },
    medium: { min: 100, max: 200000 },
    large: { min: 1000, max: 1000000 },
  };

  const multiplier = scaleMultipliers[scale] || scaleMultipliers.medium;

  // Deposits tend to be larger, withdrawals and transfers vary
  if (type === 'DEPOSIT') {
    return randomDecimal(multiplier.min * 1.5, multiplier.max);
  }

  return randomDecimal(multiplier.min, multiplier.max * 0.8);
}

// ============================================================================
// UNIQUE DATA GENERATION HELPERS
// ============================================================================

/**
 * Tracks used usernames and emails to ensure uniqueness.
 */
const usedUsernames = new Set<string>();
const usedEmails = new Set<string>();

/**
 * Brazilian first names pool for realistic data generation.
 */
const FIRST_NAMES = [
  'Ana', 'Carlos', 'Maria', 'João', 'Fernanda', 'Ricardo', 'Juliana', 'Pedro',
  'Patricia', 'Lucas', 'Camila', 'Gabriel', 'Amanda', 'Rafael', 'Bruna', 'Felipe',
  'Larissa', 'Thiago', 'Mariana', 'André', 'Beatriz', 'Rodrigo', 'Isabela', 'Marcos',
  'Vanessa', 'Bruno', 'Carolina', 'Daniel', 'Tatiana', 'Eduardo', 'Renata', 'Guilherme',
  'Priscila', 'Diego', 'Leticia', 'Vinicius', 'Adriana', 'Leonardo', 'Cristina', 'Paulo',
];

/**
 * Brazilian last names pool for realistic data generation.
 */
const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Ribeiro', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes',
  'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Monteiro', 'Cardoso', 'Reis', 'Araujo',
  'Cavalcanti', 'Costa', 'Martins', 'Nascimento', 'Moreira', 'Freitas', 'Mendes', 'Azevedo',
];

/**
 * Generates a unique username based on a name.
 * Ensures alphanumeric characters and underscores only, minimum 3 characters.
 */
function generateUniqueUsername(firstName: string, lastName: string, index?: number): string {
  const base = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`.replace(/[^a-z0-9_]/g, '');
  let username = base;
  let counter = index || 1;

  while (usedUsernames.has(username) || username.length < 3) {
    username = `${base}${counter}`;
    counter++;
  }

  usedUsernames.add(username);
  return username;
}

/**
 * Generates a unique email based on a name.
 */
function generateUniqueEmail(firstName: string, lastName: string, tenantName?: string): string {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
  const domain = tenantName
    ? `${tenantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    : 'example.com';
  let email = `${base}@${domain}`;
  let counter = 1;

  while (usedEmails.has(email)) {
    email = `${base}${counter}@${domain}`;
    counter++;
  }

  usedEmails.add(email);
  return email;
}

/**
 * Generates a random realistic name (first and last).
 */
function generateRandomName(): { firstName: string; lastName: string } {
  return {
    firstName: randomElement(FIRST_NAMES),
    lastName: randomElement(LAST_NAMES),
  };
}

// ============================================================================
// SEED DATA GENERATION
// ============================================================================

interface UserData {
  id: string;
  username: string;
  profiles: Array<{
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

interface TenantData {
  id: string;
  name: string;
  type: string;
  scale: string;
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    initialBalance: Decimal;
    profileId?: string;
  }>;
  profiles: Array<{
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

/**
 * Creates regular users for the system.
 * Creates 2-4 users per tenant with unique usernames and hashed passwords.
 */
async function createRegularUsers(tenants: TenantData[]): Promise<UserData[]> {
  console.log('👥 Creating regular users...');

  const defaultPassword = Bun.env.SEED_USER_PASSWORD || 'User123!';
  const passwordHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
  });

  const users: UserData[] = [];
  let userIndex = 1;

  for (const _tenant of tenants) {
    const userCount = randomInt(2, 4);

    for (let i = 0; i < userCount; i++) {
      const { firstName, lastName } = generateRandomName();
      const username = generateUniqueUsername(firstName, lastName, userIndex);

      const user = await prisma.user.create({
        data: {
          id: uuidv7(),
          username,
          passwordHash,
          isMaster: false,
        },
      });

      users.push({
        id: user.id,
        username: user.username,
        profiles: [],
      });

      userIndex++;
    }
  }

  console.log(`   ✅ Created ${users.length} regular users`);
  if (defaultPassword === 'User123!') {
    console.log(`   ⚠️  Default password: ${defaultPassword} (set SEED_USER_PASSWORD to customize)`);
  }

  return users;
}

/**
 * Creates profiles connecting users to tenants.
 * Each user gets 1-2 profiles, ensuring at least one profile per user.
 */
async function createProfiles(
  users: UserData[],
  tenants: TenantData[],
): Promise<{ users: UserData[]; tenants: TenantData[] }> {
  console.log('👤 Creating profiles...');

  const tenantProfilesMap = new Map<string, TenantData['profiles']>();

  // Initialize profiles array for each tenant
  for (const tenant of tenants) {
    tenantProfilesMap.set(tenant.id, []);
  }

  for (const user of users) {
    // Each user gets 1-2 profiles
    const profileCount = randomInt(1, 2);
    // Shuffle tenants for each user to distribute profiles randomly
    const shuffledTenants = [...tenants].sort(() => Math.random() - 0.5);
    // Ensure we don't select more tenants than available
    const maxProfiles = Math.min(profileCount, shuffledTenants.length);
    const selectedTenants = shuffledTenants.slice(0, maxProfiles);

    for (const tenant of selectedTenants) {
      const { firstName, lastName } = generateRandomName();
      const email = generateUniqueEmail(firstName, lastName, tenant.name);

      // Generate profile balance based on tenant scale
      const scaleMultipliers: Record<string, { min: number; max: number }> = {
        small: { min: 100, max: 5000 },
        medium: { min: 1000, max: 20000 },
        large: { min: 5000, max: 100000 },
      };
      const multiplier = scaleMultipliers[tenant.scale] || scaleMultipliers.medium;
      const balance = randomDecimal(multiplier.min, multiplier.max);

      const profile = await prisma.profile.create({
        data: {
          id: uuidv7(),
          userId: user.id,
          tenantId: tenant.id,
          firstName,
          lastName,
          email,
          balance,
        },
      });

      const profileData = {
        id: profile.id,
        userId: user.id,
        firstName,
        lastName,
        email,
      };

      user.profiles.push({
        id: profile.id,
        tenantId: tenant.id,
        firstName,
        lastName,
        email,
      });

      const tenantProfiles = tenantProfilesMap.get(tenant.id) || [];
      tenantProfiles.push(profileData);
      tenantProfilesMap.set(tenant.id, tenantProfiles);
    }
  }

  // Update tenants with their profiles
  for (const tenant of tenants) {
    tenant.profiles = tenantProfilesMap.get(tenant.id) || [];
  }

  const totalProfiles = users.reduce((sum, user) => sum + user.profiles.length, 0);
  console.log(`   ✅ Created ${totalProfiles} profiles`);

  return { users, tenants };
}

/**
 * Creates all tenants with their initial accounts (institutional and personal).
 * Distribution: 60% institutional accounts, 40% personal accounts.
 */
async function createTenants(): Promise<TenantData[]> {
  console.log('📦 Creating tenants and accounts...');

  const tenants: TenantData[] = [];

  for (const profile of TENANT_PROFILES) {
    const tenantId = uuidv7();
    const tenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        name: profile.name,
        createdBy: 'seed-system',
      },
    });

    tenants.push({
      id: tenant.id,
      name: tenant.name,
      type: profile.type,
      scale: profile.scale,
      accounts: [],
      profiles: [],
    });

    console.log(`   ✅ ${tenant.name}: tenant created`);
  }

  return tenants;
}

/**
 * Creates accounts for tenants (institutional and personal).
 * Distribution: 60% institutional, 40% personal.
 */
async function createAccounts(tenants: TenantData[]): Promise<TenantData[]> {
  console.log('💳 Creating accounts (institutional and personal)...');

  for (const tenant of tenants) {
    // Create 3-5 institutional accounts per tenant
    const institutionalAccountCount = randomInt(3, 5);
    const accounts: TenantData['accounts'] = [];

    // Select random account types for institutional accounts
    const selectedTypes = [...ACCOUNT_TYPES]
      .sort(() => Math.random() - 0.5)
      .slice(0, institutionalAccountCount);

    // Create institutional accounts (60% of total)
    for (let i = 0; i < institutionalAccountCount; i++) {
      const accountType = selectedTypes[i];
      const accountId = uuidv7();
      const accountName = generateAccountName(accountType.type, i + 1);
      const initialBalance = randomDecimal(
        accountType.minBalance,
        accountType.maxBalance,
      );

      await prisma.account.create({
        data: {
          id: accountId,
          tenantId: tenant.id,
          name: accountName,
          balance: initialBalance,
          createdBy: 'seed-system',
        },
      });

      accounts.push({
        id: accountId,
        name: accountName,
        type: accountType.type,
        initialBalance,
      });
    }

    // Create personal accounts (40% of institutional count, rounded)
    // These will be created after profiles are created
    tenant.accounts = accounts;

    console.log(
      `   ✅ ${tenant.name}: ${institutionalAccountCount} institutional accounts`,
    );
  }

  return tenants;
}

/**
 * Creates personal accounts for profiles.
 * Each profile gets 1-2 personal accounts.
 */
async function createPersonalAccounts(tenants: TenantData[]): Promise<TenantData[]> {
  console.log('👤 Creating personal accounts for profiles...');

  let totalPersonalAccounts = 0;

  for (const tenant of tenants) {
    if (tenant.profiles.length === 0) continue;

    for (const profile of tenant.profiles) {
      // Each profile gets 1-2 personal accounts
      const accountCount = randomInt(1, 2);

      for (let i = 0; i < accountCount; i++) {
        // Select random account type for personal accounts
        const accountType = randomElement(ACCOUNT_TYPES);
        const accountId = uuidv7();
        const accountName = generateAccountName(accountType.type, i + 1);
        const initialBalance = randomDecimal(
          accountType.minBalance * 0.1, // Personal accounts tend to be smaller
          accountType.maxBalance * 0.3,
        );

        await prisma.account.create({
          data: {
            id: accountId,
            tenantId: tenant.id,
            profileId: profile.id,
            name: `${accountName} - ${profile.firstName} ${profile.lastName}`,
            balance: initialBalance,
            createdBy: 'seed-system',
          },
        });

        tenant.accounts.push({
          id: accountId,
          name: `${accountName} - ${profile.firstName} ${profile.lastName}`,
          type: accountType.type,
          initialBalance,
          profileId: profile.id,
        });

        totalPersonalAccounts++;
      }
    }
  }

  console.log(`   ✅ Created ${totalPersonalAccounts} personal accounts`);

  return tenants;
}

/**
 * Creates realistic transactions for all tenants.
 * Includes transactions between institutional, personal, and mixed accounts.
 */
async function createTransactions(tenants: TenantData[]): Promise<void> {
  console.log('💸 Creating transactions...');

  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  let totalTransactions = 0;
  const targetTransactions = randomInt(500, 1000);

  // Create transactions for each tenant
  for (const tenant of tenants) {
    const tenantTransactionCount = Math.floor(
      (targetTransactions / tenants.length) * randomDecimal(0.8, 1.2).toNumber(),
    );

    // Separate institutional and personal accounts
    const institutionalAccounts = tenant.accounts.filter((acc) => !acc.profileId);
    const personalAccounts = tenant.accounts.filter((acc) => acc.profileId);
    const allAccountIds = tenant.accounts.map((acc) => acc.id);

    for (let i = 0; i < tenantTransactionCount && totalTransactions < targetTransactions; i++) {
      const type = selectTransactionType();
      const status = selectTransactionStatus();
      const amount = generateTransactionAmount(type, tenant.scale);
      const createdAt = randomDate(sixMonthsAgo, now);

      let fromAccountId: string | null = null;
      let toAccountId: string | null = null;

      // Set accounts based on transaction type
      if (type === 'DEPOSIT') {
        // Deposits can go to any account
        toAccountId = randomElement(allAccountIds);
      } else if (type === 'WITHDRAWAL') {
        // Withdrawals can come from any account
        fromAccountId = randomElement(allAccountIds);
      } else if (type === 'TRANSFER') {
        // Transfers: 40% institutional-to-institutional, 30% personal-to-personal, 30% mixed
        const transferType = Math.random();
        if (transferType < 0.4 && institutionalAccounts.length >= 2) {
          // Institutional to institutional
          const shuffled = [...institutionalAccounts]
            .sort(() => Math.random() - 0.5)
            .map((acc) => acc.id);
          fromAccountId = shuffled[0];
          toAccountId = shuffled[1];
        } else if (transferType < 0.7 && personalAccounts.length >= 2) {
          // Personal to personal
          const shuffled = [...personalAccounts]
            .sort(() => Math.random() - 0.5)
            .map((acc) => acc.id);
          fromAccountId = shuffled[0];
          toAccountId = shuffled[1];
        } else if (institutionalAccounts.length > 0 && personalAccounts.length > 0) {
          // Mixed transfers
          if (Math.random() < 0.5) {
            // Institutional to personal
            fromAccountId = randomElement(institutionalAccounts.map((acc) => acc.id));
            toAccountId = randomElement(personalAccounts.map((acc) => acc.id));
          } else {
            // Personal to institutional
            fromAccountId = randomElement(personalAccounts.map((acc) => acc.id));
            toAccountId = randomElement(institutionalAccounts.map((acc) => acc.id));
          }
        } else {
          // Fallback: any two different accounts
          const shuffled = [...allAccountIds].sort(() => Math.random() - 0.5);
          fromAccountId = shuffled[0];
          toAccountId = shuffled[1] || shuffled[0];
        }

        // If accounts are the same, skip this transaction
        if (fromAccountId === toAccountId) {
          continue;
        }
      }

      await prisma.ledgerEntry.create({
        data: {
          id: uuidv7(),
          tenantId: tenant.id,
          fromAccountId,
          toAccountId,
          amount,
          type,
          status,
          createdBy: 'seed-system',
          createdAt,
        },
      });

      totalTransactions++;

      // Log progress every 100 transactions
      if (totalTransactions % 100 === 0) {
        console.log(`   📊 Created ${totalTransactions} transactions...`);
      }
    }
  }

  console.log(`   ✅ Created ${totalTransactions} transactions`);
}

/**
 * Generates additional realistic transaction patterns.
 * Includes patterns for both institutional and personal accounts.
 */
async function createRealisticTransactionPatterns(tenants: TenantData[]): Promise<void> {
  console.log('🎯 Creating realistic transaction patterns...');

  const now = new Date();
  const patterns = [
    // Monthly salary deposits (institutional)
    { name: 'Monthly Salaries', count: 6, type: 'DEPOSIT' as const, accountType: 'institutional' as const },
    // Weekly payments (institutional)
    { name: 'Weekly Payments', count: 24, type: 'WITHDRAWAL' as const, accountType: 'institutional' as const },
    // Investment transfers (institutional)
    { name: 'Investment Transfers', count: 12, type: 'TRANSFER' as const, accountType: 'institutional' as const },
    // Personal salary deposits
    { name: 'Personal Salary Deposits', count: 6, type: 'DEPOSIT' as const, accountType: 'personal' as const },
    // Personal expense withdrawals
    { name: 'Personal Expenses', count: 20, type: 'WITHDRAWAL' as const, accountType: 'personal' as const },
    // Personal transfers (savings, investments)
    { name: 'Personal Savings Transfers', count: 8, type: 'TRANSFER' as const, accountType: 'personal' as const },
  ];

  for (const tenant of tenants) {
    const institutionalAccounts = tenant.accounts.filter((acc) => !acc.profileId);
    const personalAccounts = tenant.accounts.filter((acc) => acc.profileId);

    for (const pattern of patterns) {
      const accounts =
        pattern.accountType === 'institutional' ? institutionalAccounts : personalAccounts;

      if (accounts.length === 0) continue;

      for (let i = 0; i < pattern.count; i++) {
        const monthsAgo = pattern.count - i;
        const createdAt = new Date(now.getTime() - monthsAgo * 30 * 24 * 60 * 60 * 1000);

        let fromAccountId: string | null = null;
        let toAccountId: string | null = null;
        let amount: Decimal;

        if (pattern.type === 'DEPOSIT') {
          toAccountId = randomElement(accounts.map((acc) => acc.id));
          amount =
            pattern.accountType === 'personal'
              ? randomDecimal(2000, 15000)
              : randomDecimal(5000, 50000);
        } else if (pattern.type === 'WITHDRAWAL') {
          fromAccountId = randomElement(accounts.map((acc) => acc.id));
          amount =
            pattern.accountType === 'personal'
              ? randomDecimal(100, 5000)
              : randomDecimal(1000, 20000);
        } else {
          // TRANSFER
          if (accounts.length < 2) continue;
          const shuffled = [...accounts].sort(() => Math.random() - 0.5).map((acc) => acc.id);
          fromAccountId = shuffled[0];
          toAccountId = shuffled[1];
          amount =
            pattern.accountType === 'personal'
              ? randomDecimal(500, 5000)
              : randomDecimal(10000, 100000);
        }

        if (fromAccountId === toAccountId) continue;

        await prisma.ledgerEntry.create({
          data: {
            id: uuidv7(),
            tenantId: tenant.id,
            fromAccountId,
            toAccountId,
            amount,
            type: pattern.type,
            status: 'COMPLETED',
            createdBy: 'seed-system',
            createdAt,
          },
        });
      }
    }
  }

  console.log('   ✅ Created realistic transaction patterns');
}

/**
 * Calculates and displays final statistics.
 */
async function displayStatistics(): Promise<void> {
  console.log('\n📊 Final Statistics:\n');

  const tenantCount = await prisma.tenant.count({ where: { deletedAt: null } });
  const userCount = await prisma.user.count({ where: { deletedAt: null } });
  const profileCount = await prisma.profile.count({ where: { deletedAt: null } });
  const accountCount = await prisma.account.count({ where: { deletedAt: null } });
  const entryCount = await prisma.ledgerEntry.count({ where: { deletedAt: null } });

  // Account distribution
  const institutionalAccounts = await prisma.account.count({
    where: { deletedAt: null, profileId: null },
  });
  const personalAccounts = await prisma.account.count({
    where: { deletedAt: null, profileId: { not: null } },
  });

  const entriesByType = await prisma.ledgerEntry.groupBy({
    by: ['type'],
    where: { deletedAt: null },
    _count: true,
  });

  const entriesByStatus = await prisma.ledgerEntry.groupBy({
    by: ['status'],
    where: { deletedAt: null },
    _count: true,
  });

  const totalAmount = await prisma.ledgerEntry.aggregate({
    where: { deletedAt: null, status: 'COMPLETED' },
    _sum: { amount: true },
  });

  console.log(`   🏢 Tenants: ${tenantCount}`);
  console.log(`   👥 Users: ${userCount}`);
  console.log(`   👤 Profiles: ${profileCount}`);
  console.log(`   💳 Accounts: ${accountCount}`);
  console.log(`      └─ Institutional: ${institutionalAccounts} (${((institutionalAccounts / accountCount) * 100).toFixed(1)}%)`);
  console.log(`      └─ Personal: ${personalAccounts} (${((personalAccounts / accountCount) * 100).toFixed(1)}%)`);
  console.log(`   📝 Ledger Entries: ${entryCount}`);
  console.log(`   💰 Total Amount (Completed): R$ ${totalAmount._sum.amount?.toFixed(2) || '0.00'}`);

  console.log('\n   📈 Entries by Type:');
  entriesByType.forEach((entry) => {
    const percentage = ((entry._count / entryCount) * 100).toFixed(1);
    console.log(`      ${entry.type}: ${entry._count} (${percentage}%)`);
  });

  console.log('\n   📊 Entries by Status:');
  entriesByStatus.forEach((entry) => {
    const percentage = ((entry._count / entryCount) * 100).toFixed(1);
    console.log(`      ${entry.status}: ${entry._count} (${percentage}%)`);
  });

  // Get top tenants by transaction count
  const topTenants = await prisma.ledgerEntry.groupBy({
    by: ['tenantId'],
    where: { deletedAt: null },
    _count: true,
    orderBy: { _count: { tenantId: 'desc' } },
    take: 5,
  });

  console.log('\n   🏆 Top 5 Tenants by Transaction Count:');
  for (const tenant of topTenants) {
    const tenantData = await prisma.tenant.findUnique({
      where: { id: tenant.tenantId },
    });
    console.log(`      ${tenantData?.name || 'Unknown'}: ${tenant._count} transactions`);
  }
}

// ============================================================================
// MASTER USER CREATION
// ============================================================================

/**
 * Creates a master user for authentication.
 * Master users have elevated privileges and can impersonate other users.
 */
async function createMasterUser(): Promise<void> {
  const username = Bun.env.MASTER_USER_USERNAME || 'admin';
  const password = Bun.env.MASTER_USER_PASSWORD || 'ChangeMe123!';

  // Check if master user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    console.log(`⚠️  Master user "${username}" already exists, skipping creation`);
    return;
  }

  // Hash password using Argon2id (same as PasswordHandler)
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
  });

  // Create master user
  const masterUser = await prisma.user.create({
    data: {
      id: uuidv7(),
      username,
      passwordHash,
      isMaster: true,
    },
  });

  console.log(`✅ Created master user: ${masterUser.username} (ID: ${masterUser.id})`);
  console.log(`   ⚠️  Please change the default password immediately!`);
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

/**
 * Main seed function that orchestrates the entire seeding process.
 * Order: master user → tenants → regular users → profiles → accounts → ledger entries → statistics
 */
async function main(): Promise<void> {
  console.log('🌱 Starting rich database seed...\n');

  try {
    // Step 0: Create master user
    await createMasterUser();
    console.log('');

    // Step 1: Create tenants (without accounts yet)
    const tenants = await createTenants();
    console.log(`\n✅ Created ${tenants.length} tenants\n`);

    // Step 2: Create regular users
    const users = await createRegularUsers(tenants);
    console.log('');

    // Step 3: Create profiles (connecting users to tenants)
    const { tenants: tenantsWithProfiles } = await createProfiles(users, tenants);
    console.log('');

    // Step 4: Create institutional accounts
    const tenantsWithInstitutionalAccounts = await createAccounts(tenantsWithProfiles);
    console.log('');

    // Step 5: Create personal accounts (requires profiles to exist)
    const tenantsWithAllAccounts = await createPersonalAccounts(tenantsWithInstitutionalAccounts);
    console.log('');

    // Step 6: Create random transactions
    await createTransactions(tenantsWithAllAccounts);
    console.log('');

    // Step 7: Create realistic transaction patterns
    await createRealisticTransactionPatterns(tenantsWithAllAccounts);
    console.log('');

    // Step 8: Display final statistics
    await displayStatistics();

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log(`   Master User: ${Bun.env.MASTER_USER_USERNAME || 'admin'}`);
    console.log(`   Master Password: ${Bun.env.MASTER_USER_PASSWORD || 'ChangeMe123!'}`);
    console.log(`   Regular Users Password: ${Bun.env.SEED_USER_PASSWORD || 'User123!'}`);
    console.log('\n   ⚠️  Please change default passwords immediately!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
