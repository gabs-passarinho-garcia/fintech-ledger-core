import { Decimal } from 'decimal.js';
import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { PaymentManager } from '@/common/providers/payment/PaymentManager';
import type { CreateLedgerEntryUseCase } from '@/models/ledger/usecases/CreateLedgerEntry.usecase';
import { InvoiceStatusType } from '@/common/enums/InvoiceStatusType';
import { PaymentMethodType } from '@/common/enums/PaymentMethodType';
import { DomainError } from '@/common/errors';
import type { ProcessPaymentRequest, ProcessPaymentResponse } from '../dtos/ProcessPayment.dto';

/**
 * Use case for processing payments and creating ledger entries.
 *
 * This use case orchestrates the payment processing flow:
 * 1. Creates a payment invoice via PaymentManager
 * 2. Creates a corresponding ledger entry when payment is successful
 * 3. Handles payment status and integrates with the ledger system
 *
 * @class ProcessPaymentUseCase
 * @implements {IService<ProcessPaymentRequest, ProcessPaymentResponse>}
 */
export class ProcessPaymentUseCase
  implements IService<ProcessPaymentRequest, ProcessPaymentResponse>
{
  private readonly paymentManager: PaymentManager;
  private readonly createLedgerEntryUseCase: CreateLedgerEntryUseCase;
  private readonly logger: ILogger;

  public constructor(opts: {
    [AppProviders.paymentManager]: PaymentManager;
    [AppProviders.createLedgerEntryUseCase]: CreateLedgerEntryUseCase;
    [AppProviders.logger]: ILogger;
  }) {
    this.paymentManager = opts[AppProviders.paymentManager];
    this.createLedgerEntryUseCase = opts[AppProviders.createLedgerEntryUseCase];
    this.logger = opts[AppProviders.logger];
  }

  /**
   * Executes the payment processing use case.
   *
   * This method:
   * 1. Validates the payment amount
   * 2. Creates a payment invoice via PaymentManager
   * 3. Creates a ledger entry when payment status is PAID or OPEN
   * 4. Returns both payment and ledger entry information
   *
   * @param input - The payment processing request
   * @returns The payment and ledger entry response
   * @throws {DomainError} If business rules are violated
   */
  public async execute(input: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    this.logger.info(
      {
        tenantId: input.tenantId,
        toAccountId: input.toAccountId,
        amount: input.amount.toString(),
        paymentMethodType: input.paymentMethodType,
      },
      'process_payment:start',
      ProcessPaymentUseCase.name,
    );

    const amount = new Decimal(input.amount);

    // Validate amount
    if (amount.lessThanOrEqualTo(0)) {
      throw new DomainError({
        message: 'Amount must be greater than zero',
      });
    }

    // Create payment invoice
    const paymentResult = await this.paymentManager.createInvoice({
      tenantId: input.tenantId,
      amount,
      paymentMethodType: input.paymentMethodType as PaymentMethodType,
      description: input.description,
      metadata: input.metadata,
    });

    if (!paymentResult) {
      throw new DomainError({
        message: 'Payment creation failed',
      });
    }

    this.logger.info(
      {
        externalInvoiceId: paymentResult.externalInvoiceId,
        status: paymentResult.status,
        provider: paymentResult.provider,
      },
      'process_payment:payment_created',
      ProcessPaymentUseCase.name,
    );

    // Create ledger entry only if payment is PAID or OPEN
    // OPEN status means payment is pending (e.g., PIX waiting for payment)
    // PAID status means payment was immediately processed (e.g., credit card)
    let ledgerEntry = null;

    if (
      paymentResult.status === InvoiceStatusType.PAID ||
      paymentResult.status === InvoiceStatusType.OPEN
    ) {
      try {
        ledgerEntry = await this.createLedgerEntryUseCase.execute({
          tenantId: input.tenantId,
          toAccountId: input.toAccountId,
          amount: paymentResult.status === InvoiceStatusType.PAID ? amount : new Decimal('0'),
          type: 'DEPOSIT',
          createdBy: input.createdBy,
        });

        this.logger.info(
          {
            ledgerEntryId: ledgerEntry.id,
            externalInvoiceId: paymentResult.externalInvoiceId,
          },
          'process_payment:ledger_entry_created',
          ProcessPaymentUseCase.name,
        );
      } catch (error) {
        // Log error but don't fail the payment
        // The payment was created successfully, ledger entry creation can be retried
        this.logger.error(
          {
            externalInvoiceId: paymentResult.externalInvoiceId,
            error: error instanceof Error ? error.message : String(error),
          },
          'process_payment:ledger_entry_creation_failed',
          ProcessPaymentUseCase.name,
        );
      }
    }

    if (!ledgerEntry) {
      throw new DomainError({
        message: 'Ledger entry creation failed or payment status does not allow ledger entry',
      });
    }

    return {
      payment: {
        externalInvoiceId: paymentResult.externalInvoiceId,
        status: paymentResult.status,
        provider: paymentResult.provider,
        tax: paymentResult.tax?.toString(),
        providerMessage: paymentResult.providerMessage,
        pix: paymentResult.pix,
      },
      ledgerEntry: {
        id: ledgerEntry.id,
        tenantId: ledgerEntry.tenantId,
        toAccountId: ledgerEntry.toAccountId || '',
        amount: ledgerEntry.amount,
        type: ledgerEntry.type,
        status: ledgerEntry.status,
        createdAt: ledgerEntry.createdAt,
      },
    };
  }
}
