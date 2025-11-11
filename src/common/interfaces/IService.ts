/**
 * Generic service interface that all application services must implement.
 * This ensures a consistent contract across all services with a single public method.
 *
 * @template TInput The input type for the service
 * @template TOutput The output type returned by the service
 */
export interface IService<TInput, TOutput> {
  /**
   * Executes the service operation.
   *
   * @param data - The input data for the service operation
   * @returns A promise that resolves to the service output
   */
  execute(data: TInput): Promise<TOutput>;
}
