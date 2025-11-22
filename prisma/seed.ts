import { PrismaClient } from './client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Decimal } from 'decimal.js';
import { uuidv7 } from 'uuidv7';

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
// SEED DATA GENERATION
// ============================================================================

interface TenantData {
  id: string;
  name: string;
  type: string;
  scale: string;
  accounts: Array<{ id: string; name: string; type: string; initialBalance: Decimal }>;
}

/**
 * Creates all tenants with their initial accounts.
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

    // Create 3-5 accounts per tenant
    const accountCount = randomInt(3, 5);
    const accounts: TenantData['accounts'] = [];

    // Select random account types
    const selectedTypes = [...ACCOUNT_TYPES]
      .sort(() => Math.random() - 0.5)
      .slice(0, accountCount);

    for (let i = 0; i < accountCount; i++) {
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

    tenants.push({
      id: tenant.id,
      name: tenant.name,
      type: profile.type,
      scale: profile.scale,
      accounts,
    });

    console.log(`   ✅ ${tenant.name}: ${accountCount} accounts`);
  }

  return tenants;
}

/**
 * Creates realistic transactions for all tenants.
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

    const accountIds = tenant.accounts.map((acc) => acc.id);

    for (let i = 0; i < tenantTransactionCount && totalTransactions < targetTransactions; i++) {
      const type = selectTransactionType();
      const status = selectTransactionStatus();
      const amount = generateTransactionAmount(type, tenant.scale);
      const createdAt = randomDate(sixMonthsAgo, now);

      let fromAccountId: string | null = null;
      let toAccountId: string | null = null;

      // Set accounts based on transaction type
      if (type === 'DEPOSIT') {
        toAccountId = randomElement(accountIds);
      } else if (type === 'WITHDRAWAL') {
        fromAccountId = randomElement(accountIds);
      } else if (type === 'TRANSFER') {
        // Ensure different accounts for transfer
        const shuffled = [...accountIds].sort(() => Math.random() - 0.5);
        fromAccountId = shuffled[0];
        toAccountId = shuffled[1] || shuffled[0];
        // If only one account, skip this transaction
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
 */
async function createRealisticTransactionPatterns(tenants: TenantData[]): Promise<void> {
  console.log('🎯 Creating realistic transaction patterns...');

  const now = new Date();
  const patterns = [
    // Monthly salary deposits
    { name: 'Monthly Salaries', count: 6, type: 'DEPOSIT' as const },
    // Weekly payments
    { name: 'Weekly Payments', count: 24, type: 'WITHDRAWAL' as const },
    // Investment transfers
    { name: 'Investment Transfers', count: 12, type: 'TRANSFER' as const },
  ];

  for (const tenant of tenants) {
    const accountIds = tenant.accounts.map((acc) => acc.id);
    if (accountIds.length < 2) continue;

    for (const pattern of patterns) {
      for (let i = 0; i < pattern.count; i++) {
        const monthsAgo = pattern.count - i;
        const createdAt = new Date(now.getTime() - monthsAgo * 30 * 24 * 60 * 60 * 1000);

        let fromAccountId: string | null = null;
        let toAccountId: string | null = null;
        let amount: Decimal;

        if (pattern.type === 'DEPOSIT') {
          toAccountId = accountIds[0]; // Usually to operational account
          amount = randomDecimal(5000, 50000);
        } else if (pattern.type === 'WITHDRAWAL') {
          fromAccountId = accountIds[0];
          amount = randomDecimal(1000, 20000);
        } else {
          fromAccountId = accountIds[0];
          toAccountId = accountIds.find((id) => id !== fromAccountId) || accountIds[1];
          amount = randomDecimal(10000, 100000);
        }

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
  const accountCount = await prisma.account.count({ where: { deletedAt: null } });
  const entryCount = await prisma.ledgerEntry.count({ where: { deletedAt: null } });

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
  console.log(`   💳 Accounts: ${accountCount}`);
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
// MAIN SEED FUNCTION
// ============================================================================

/**
 * Main seed function that orchestrates the entire seeding process.
 */
async function main(): Promise<void> {
  console.log('🌱 Starting rich database seed...\n');

  try {
    // Step 1: Create tenants and accounts
    const tenants = await createTenants();
    console.log(`\n✅ Created ${tenants.length} tenants with accounts\n`);

    // Step 2: Create random transactions
    await createTransactions(tenants);
    console.log('');

    // Step 3: Create realistic transaction patterns
    await createRealisticTransactionPatterns(tenants);
    console.log('');

    // Step 4: Display final statistics
    await displayStatistics();

    console.log('\n🎉 Database seed completed successfully!');
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
