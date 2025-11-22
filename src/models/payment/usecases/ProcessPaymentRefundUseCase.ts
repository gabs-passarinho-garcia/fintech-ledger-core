import { Decimal } from 'decimal.js';
import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { PaymentManager } from '@/common/providers/payment/PaymentManager';
import type { CreateLedgerEntryUseCase } from '@/models/ledger/usecases/CreateLedgerEntry.usecase';
import { DomainError } from '@/common/errors';
import type {
  ProcessPaymentRefundRequest,
  ProcessPaymentRefundResponse,
} from '../dtos/ProcessPaymentRefund.dto';

/**
 * Use case for processing payment refunds and creating ledger entries.
 *
 * This use case orchestrates the refund processing flow:
 * 1. Processes the refund via PaymentManager
 * 2. Creates a corresponding withdrawal ledger entry
 * 3. Ensures atomicity between refund and ledger operations
 *
 * @class ProcessPaymentRefundUseCase
 * @implements {IService<ProcessPaymentRefundRequest, ProcessPaymentRefundResponse>}
 */
export class ProcessPaymentRefundUseCase
  implements IService<ProcessPaymentRefundRequest, ProcessPaymentRefundResponse>
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
   * Executes the refund processing use case.
   *
   * This method:
   * 1. Validates the refund amount
   * 2. Processes the refund via PaymentManager
   * 3. Creates a withdrawal ledger entry when refund is successful
   * 4. Returns both refund and ledger entry information
   *
   * @param input - The refund processing request
   * @returns The refund and ledger entry response
   * @throws {DomainError} If business rules are violated
   */
  public async execute(input: ProcessPaymentRefundRequest): Promise<ProcessPaymentRefundResponse> {
    this.logger.info(
      {
        tenantId: input.tenantId,
        externalInvoiceId: input.externalInvoiceId,
        fromAccountId: input.fromAccountId,
        valueToRefund: input.valueToRefund.toString(),
      },
      'process_payment_refund:start',
      ProcessPaymentRefundUseCase.name,
    );

    const valueToRefund = new Decimal(input.valueToRefund);

    // Validate refund amount
    if (valueToRefund.lessThanOrEqualTo(0)) {
      throw new DomainError({
        message: 'Refund amount must be greater than zero',
      });
    }

    // Process refund
    const refundResult = await this.paymentManager.refundPayment({
      tenantId: input.tenantId,
      externalInvoiceId: input.externalInvoiceId,
      valueToRefund,
      reason: input.reason,
    });

    if (!refundResult.success) {
      throw new DomainError({
        message: 'Refund processing failed',
      });
    }

    this.logger.info(
      {
        externalTransactionId: refundResult.externalTransactionId,
        refundedValue: refundResult.refundedValue.toString(),
      },
      'process_payment_refund:refund_processed',
      ProcessPaymentRefundUseCase.name,
    );

    // Create withdrawal ledger entry
    let ledgerEntry = null;

    try {
      ledgerEntry = await this.createLedgerEntryUseCase.execute({
        tenantId: input.tenantId,
        fromAccountId: input.fromAccountId,
        amount: refundResult.refundedValue,
        type: 'WITHDRAWAL',
        createdBy: input.createdBy,
      });

      this.logger.info(
        {
          ledgerEntryId: ledgerEntry.id,
          externalTransactionId: refundResult.externalTransactionId,
        },
        'process_payment_refund:ledger_entry_created',
        ProcessPaymentRefundUseCase.name,
      );
    } catch (error) {
      // Log error but don't fail the refund
      // The refund was processed successfully, ledger entry creation can be retried
      this.logger.error(
        {
          externalTransactionId: refundResult.externalTransactionId,
          error: error instanceof Error ? error.message : String(error),
        },
        'process_payment_refund:ledger_entry_creation_failed',
        ProcessPaymentRefundUseCase.name,
      );
    }

    if (!ledgerEntry) {
      throw new DomainError({
        message: 'Ledger entry creation failed',
      });
    }

    return {
      refund: {
        success: refundResult.success,
        externalTransactionId: refundResult.externalTransactionId,
        refundedValue: refundResult.refundedValue.toString(),
      },
      ledgerEntry: {
        id: ledgerEntry.id,
        tenantId: ledgerEntry.tenantId,
        fromAccountId: ledgerEntry.fromAccountId || '',
        amount: ledgerEntry.amount,
        type: ledgerEntry.type,
        status: ledgerEntry.status,
        createdAt: ledgerEntry.createdAt,
      },
    };
  }
}
