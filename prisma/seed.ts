import { PrismaClient } from './client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Decimal } from 'decimal.js';
import { uuidv7 } from 'uuidv7';

const adapter = new PrismaPg({
  connectionString: Bun.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

/**
 * Seeds the database with sample data for development and testing.
 * Creates tenants, accounts, and ledger entries.
 */
async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Create tenants with UUID v7
  const tenant1Id = uuidv7();
  const tenant2Id = uuidv7();

  const tenant1 = await prisma.tenant.upsert({
    where: { id: tenant1Id },
    update: {},
    create: {
      id: tenant1Id,
      name: 'Acme Corporation',
      createdBy: 'system',
    },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { id: tenant2Id },
    update: {},
    create: {
      id: tenant2Id,
      name: 'TechStart Inc',
      createdBy: 'system',
    },
  });

  console.log('✅ Created tenants:', { tenant1: tenant1.name, tenant2: tenant2.name });

  // Create accounts for tenant1
  const account1Id = uuidv7();
  const account2Id = uuidv7();

  const account1 = await prisma.account.upsert({
    where: { id: account1Id },
    update: {},
    create: {
      id: account1Id,
      tenantId: tenant1.id,
      name: 'Main Operating Account',
      balance: new Decimal('100000.00'),
      createdBy: 'system',
    },
  });

  const account2 = await prisma.account.upsert({
    where: { id: account2Id },
    update: {},
    create: {
      id: account2Id,
      tenantId: tenant1.id,
      name: 'Savings Account',
      balance: new Decimal('50000.00'),
      createdBy: 'system',
    },
  });

  // Create accounts for tenant2
  const account3Id = uuidv7();

  const account3 = await prisma.account.upsert({
    where: { id: account3Id },
    update: {},
    create: {
      id: account3Id,
      tenantId: tenant2.id,
      name: 'Business Account',
      balance: new Decimal('75000.00'),
      createdBy: 'system',
    },
  });

  console.log('✅ Created accounts');

  // Create ledger entries for tenant1
  const entry1 = await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant1.id,
      fromAccountId: null,
      toAccountId: account1.id,
      amount: new Decimal('5000.00'),
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdBy: 'system',
    },
  });

  const entry2 = await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant1.id,
      fromAccountId: account1.id,
      toAccountId: account2.id,
      amount: new Decimal('2000.00'),
      type: 'TRANSFER',
      status: 'COMPLETED',
      createdBy: 'system',
    },
  });

  const entry3 = await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant1.id,
      fromAccountId: account1.id,
      toAccountId: null,
      amount: new Decimal('1000.00'),
      type: 'WITHDRAWAL',
      status: 'PENDING',
      createdBy: 'system',
    },
  });

  // Create ledger entries for tenant2
  const entry4 = await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant2.id,
      fromAccountId: null,
      toAccountId: account3.id,
      amount: new Decimal('10000.00'),
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdBy: 'system',
    },
  });

  const entry5 = await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant2.id,
      fromAccountId: account3.id,
      toAccountId: null,
      amount: new Decimal('2500.00'),
      type: 'WITHDRAWAL',
      status: 'COMPLETED',
      createdBy: 'system',
    },
  });

  // Create more accounts for tenant1
  const account4Id = uuidv7();
  const account4 = await prisma.account.upsert({
    where: { id: account4Id },
    update: {},
    create: {
      id: account4Id,
      tenantId: tenant1.id,
      name: 'Investment Account',
      balance: new Decimal('250000.00'),
      createdBy: 'system',
    },
  });

  // Create more accounts for tenant2
  const account5Id = uuidv7();
  const account5 = await prisma.account.upsert({
    where: { id: account5Id },
    update: {},
    create: {
      id: account5Id,
      tenantId: tenant2.id,
      name: 'Reserve Account',
      balance: new Decimal('150000.00'),
      createdBy: 'system',
    },
  });

  // Create tenant3
  const tenant3Id = uuidv7();
  const tenant3 = await prisma.tenant.upsert({
    where: { id: tenant3Id },
    update: {},
    create: {
      id: tenant3Id,
      name: 'Global Finance Ltd',
      createdBy: 'system',
    },
  });

  const account6Id = uuidv7();
  const account6 = await prisma.account.upsert({
    where: { id: account6Id },
    update: {},
    create: {
      id: account6Id,
      tenantId: tenant3.id,
      name: 'Primary Account',
      balance: new Decimal('500000.00'),
      createdBy: 'system',
    },
  });

  console.log('✅ Created additional accounts and tenant');

  // Create more ledger entries with different dates and statuses
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // More entries for tenant1
  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant1.id,
      fromAccountId: account1.id,
      toAccountId: account4.id,
      amount: new Decimal('15000.00'),
      type: 'TRANSFER',
      status: 'COMPLETED',
      createdBy: 'system',
      createdAt: yesterday,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant1.id,
      fromAccountId: account4.id,
      toAccountId: null,
      amount: new Decimal('5000.00'),
      type: 'WITHDRAWAL',
      status: 'FAILED',
      createdBy: 'system',
      createdAt: lastWeek,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant1.id,
      fromAccountId: null,
      toAccountId: account2.id,
      amount: new Decimal('3000.00'),
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdBy: 'system',
      createdAt: lastMonth,
    },
  });

  // More entries for tenant2
  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant2.id,
      fromAccountId: account3.id,
      toAccountId: account5.id,
      amount: new Decimal('20000.00'),
      type: 'TRANSFER',
      status: 'COMPLETED',
      createdBy: 'system',
      createdAt: yesterday,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant2.id,
      fromAccountId: null,
      toAccountId: account5.id,
      amount: new Decimal('15000.00'),
      type: 'DEPOSIT',
      status: 'PENDING',
      createdBy: 'system',
      createdAt: now,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant2.id,
      fromAccountId: account5.id,
      toAccountId: null,
      amount: new Decimal('8000.00'),
      type: 'WITHDRAWAL',
      status: 'COMPLETED',
      createdBy: 'system',
      createdAt: lastWeek,
    },
  });

  // Entries for tenant3
  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant3.id,
      fromAccountId: null,
      toAccountId: account6.id,
      amount: new Decimal('100000.00'),
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdBy: 'system',
      createdAt: yesterday,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant3.id,
      fromAccountId: account6.id,
      toAccountId: null,
      amount: new Decimal('25000.00'),
      type: 'WITHDRAWAL',
      status: 'COMPLETED',
      createdBy: 'system',
      createdAt: lastWeek,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      id: uuidv7(),
      tenantId: tenant3.id,
      fromAccountId: account6.id,
      toAccountId: null,
      amount: new Decimal('50000.00'),
      type: 'WITHDRAWAL',
      status: 'PENDING',
      createdBy: 'system',
      createdAt: now,
    },
  });

  // Count final totals
  const tenantCount = await prisma.tenant.count({ where: { deletedAt: null } });
  const accountCount = await prisma.account.count({ where: { deletedAt: null } });
  const entryCount = await prisma.ledgerEntry.count({ where: { deletedAt: null } });

  console.log('✅ Created additional ledger entries');
  console.log('🎉 Database seed completed successfully!');
  console.log(`   - Tenants: ${tenantCount}`);
  console.log(`   - Accounts: ${accountCount}`);
  console.log(`   - Ledger Entries: ${entryCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

