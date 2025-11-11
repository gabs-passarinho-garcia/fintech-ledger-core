/**
 * Interface for queue producers.
 * Provides methods to send messages to message queues.
 */
export interface IQueueProducer {
  /**
   * Sends a message to the specified queue.
   *
   * @param args - The message configuration
   * @param args.queueName - The name of the queue to send the message to
   * @param args.message - The message body to send
   * @param args.delay - Optional delay in seconds before the message becomes available (default: 10)
   * @throws {Error} When queue operation fails
   */
  sendMessage(args: { queueName: string; message: string; delay?: number }): Promise<void>;
}
