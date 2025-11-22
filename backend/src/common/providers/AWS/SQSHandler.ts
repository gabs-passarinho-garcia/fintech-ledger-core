import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { fromEnv } from '@aws-sdk/credential-providers';
import type { IQueueProducer } from '../../interfaces/IQueueProducer';
import { ExternalSourceError } from '@/common/errors';
import { Logger } from '../Logger';

/**
 * SQSHandler implements IQueueProducer for sending messages to AWS SQS queues.
 * Supports both AWS and LocalStack endpoints for local development.
 */
export class SQSHandler implements IQueueProducer {
  private readonly logger: Logger;
  private readonly _initPromise: Promise<void>;

  private _sqsClient!: SQSClient;
  private _sqsUrl!: string;
  private readonly _env: string;
  private readonly _queuePrefix: string;

  public constructor() {
    this.logger = new Logger().setService(SQSHandler.name);
    this._env = process.env.APP_ENV || process.env.NODE_ENV || 'dev';
    this._queuePrefix = process.env.QUEUE_PREFIX || 'ledger-core';
    this._initPromise = this._initialize();
  }

  /**
   * Initializes the SQS client with appropriate configuration.
   * Uses LocalStack endpoint for local development.
   * Returns a Promise for consistency with async initialization pattern.
   */
  private async _initialize(): Promise<void> {
    return Promise.resolve().then(() => {
      if (!this._sqsClient) {
        const region = process.env.AWS_REGION || 'us-east-2';
        const isLocalDev = process.env.LOCAL_DEVELOPMENT === 'true' || this._env === 'dev';

        this._sqsClient = new SQSClient({
          region,
          credentials: fromEnv(),
          ...(isLocalDev && {
            endpoint: 'http://localhost:4566',
          }),
        });

        // For LocalStack, use the standard SQS URL format
        this._sqsUrl = isLocalDev
          ? 'http://localhost:4566/000000000000/'
          : process.env.SQS_URL || '';

        if (!isLocalDev && !this._sqsUrl) {
          throw new ExternalSourceError({
            additionalMessage: 'Error initializing SQS Handler: Missing SQS_URL',
          });
        }

        this.logger.info('SQS Handler initialized', 'aws_service');
      }
    });
  }

  /**
   * Sends a message to the specified SQS queue.
   *
   * @param args - The message configuration
   * @param args.queueName - The name of the queue to send the message to
   * @param args.message - The message body to send
   * @param args.delay - Optional delay in seconds before the message becomes available (default: 10)
   * @throws {ExternalSourceError} When SQS operation fails
   */
  public async sendMessage(args: {
    queueName: string;
    message: string;
    delay?: number;
  }): Promise<void> {
    try {
      await this._initPromise;

      const isLocalDev = process.env.LOCAL_DEVELOPMENT === 'true' || this._env === 'dev';
      const queueUrl = isLocalDev
        ? `${this._sqsUrl}${args.queueName}`
        : `${this._sqsUrl}${this._queuePrefix}-${args.queueName}-${this._env}`;

      this.logger.info(
        {
          queueUrl,
          queueName: args.queueName,
          messageLength: args.message.length,
        },
        'aws_service',
      );

      await this._sqsClient.send(
        new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: args.message,
          DelaySeconds: args.delay ?? 10,
        }),
      );

      this.logger.info({ queueName: args.queueName }, 'aws_service:message_sent');
    } catch (error) {
      this.logger.error({ queueName: args.queueName, error: error as Error }, 'aws_service');

      throw new ExternalSourceError({
        originalError: error,
        additionalMessage: `SQS Error: ${error}`,
      });
    }
  }
}
