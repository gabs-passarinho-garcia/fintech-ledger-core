import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { PaymentManager } from '@/common/providers/payment/PaymentManager';
import type { CreateLedgerEntryUseCase } from '@/models/ledger/usecases/CreateLedgerEntry.usecase';
import { InvoiceStatusType } from '@/common/enums/InvoiceStatusType';
import { TransactionType } from '@/common/enums/TransactionType';
import { Decimal } from 'decimal.js';
import type {
  ProcessPaymentWebhookRequest,
  ProcessPaymentWebhookResponse,
} from '../dtos/ProcessPaymentWebhook.dto';

/**
 * Use case for processing payment webhook notifications.
 *
 * This use case handles webhook events from payment providers:
 * 1. Processes the webhook event via PaymentManager
 * 2. Creates or updates ledger entries based on payment status
 * 3. Handles both PAYMENT and REFUND transaction types
 *
 * @class ProcessPaymentWebhookUseCase
 * @implements {IService<ProcessPaymentWebhookRequest, ProcessPaymentWebhookResponse>}
 */
export class ProcessPaymentWebhookUseCase
  implements IService<ProcessPaymentWebhookRequest, ProcessPaymentWebhookResponse>
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
   * Executes the webhook processing use case.
   *
   * This method:
   * 1. Processes the webhook event via PaymentManager
   * 2. Creates a ledger entry if payment status is PAID and transaction type is PAYMENT
   * 3. Creates a withdrawal ledger entry if transaction type is REFUND
   * 4. Returns webhook and ledger entry information
   *
   * @param input - The webhook processing request
   * @returns The webhook and ledger entry response
   */
  public async execute(
    input: ProcessPaymentWebhookRequest,
  ): Promise<ProcessPaymentWebhookResponse> {
    this.logger.info(
      {
        tenantId: input.tenantId,
      },
      'process_payment_webhook:start',
      ProcessPaymentWebhookUseCase.name,
    );

    // Process webhook notification
    const webhookResult = await this.paymentManager.handleWebhookNotification({
      tenantId: input.tenantId,
      event: input.event,
    });

    this.logger.info(
      {
        externalInvoiceId: webhookResult.externalInvoiceId,
        status: webhookResult.status,
        transactionType: webhookResult.transactionType,
        amount: webhookResult.amount,
      },
      'process_payment_webhook:webhook_processed',
      ProcessPaymentWebhookUseCase.name,
    );

    let ledgerEntry = null;

    // Create ledger entry based on transaction type and status
    if (
      webhookResult.status === InvoiceStatusType.PAID &&
      webhookResult.transactionType === TransactionType.PAYMENT &&
      input.toAccountId
    ) {
      try {
        ledgerEntry = await this.createLedgerEntryUseCase.execute({
          tenantId: input.tenantId,
          toAccountId: input.toAccountId,
          amount: new Decimal(webhookResult.amount),
          type: 'DEPOSIT',
          createdBy: input.updatedBy,
        });

        this.logger.info(
          {
            ledgerEntryId: ledgerEntry.id,
            externalInvoiceId: webhookResult.externalInvoiceId,
          },
          'process_payment_webhook:ledger_entry_created',
          ProcessPaymentWebhookUseCase.name,
        );
      } catch (error) {
        this.logger.error(
          {
            externalInvoiceId: webhookResult.externalInvoiceId,
            error: error instanceof Error ? error.message : String(error),
          },
          'process_payment_webhook:ledger_entry_creation_failed',
          ProcessPaymentWebhookUseCase.name,
        );
      }
    } else if (webhookResult.transactionType === TransactionType.REFUND && input.toAccountId) {
      // For refunds, we create a withdrawal entry
      try {
        ledgerEntry = await this.createLedgerEntryUseCase.execute({
          tenantId: input.tenantId,
          fromAccountId: input.toAccountId,
          amount: new Decimal(webhookResult.amount),
          type: 'WITHDRAWAL',
          createdBy: input.updatedBy,
        });

        this.logger.info(
          {
            ledgerEntryId: ledgerEntry.id,
            externalInvoiceId: webhookResult.externalInvoiceId,
          },
          'process_payment_webhook:refund_ledger_entry_created',
          ProcessPaymentWebhookUseCase.name,
        );
      } catch (error) {
        this.logger.error(
          {
            externalInvoiceId: webhookResult.externalInvoiceId,
            error: error instanceof Error ? error.message : String(error),
          },
          'process_payment_webhook:refund_ledger_entry_creation_failed',
          ProcessPaymentWebhookUseCase.name,
        );
      }
    }

    return {
      webhook: {
        externalInvoiceId: webhookResult.externalInvoiceId,
        transactionType: webhookResult.transactionType,
        status: webhookResult.status,
        amount: webhookResult.amount,
      },
      ledgerEntry: ledgerEntry
        ? {
            id: ledgerEntry.id,
            tenantId: ledgerEntry.tenantId,
            toAccountId: ledgerEntry.toAccountId || '',
            amount: ledgerEntry.amount,
            type: ledgerEntry.type,
            status: ledgerEntry.status,
            createdAt: ledgerEntry.createdAt,
          }
        : undefined,
    };
  }
}
