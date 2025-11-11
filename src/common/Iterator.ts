/**
 * Custom async Iterator class for sequential and batched operations.
 * Provides high-order functions for async array processing without traditional loops.
 */
export class Iterator {
  /**
   * Maps over an array sequentially, awaiting each callback before proceeding to the next.
   * This ensures operations happen in order, which is critical for database operations and
   * operations that depend on previous results.
   *
   * @template T The input array element type
   * @template R The return type of the callback
   * @param array - The array to iterate over
   * @param callback - The async function to apply to each element
   * @returns A promise that resolves to an array of results
   *
   * @example
   * ```typescript
   * const results = await Iterator.mapSeries([1, 2, 3], async (item) => {
   *   await someAsyncOperation(item);
   *   return item * 2;
   * });
   * ```
   */
  public static async mapSeries<T, R>(
    array: T[],
    callback: (item: T, index?: number, array?: T[]) => Promise<R>,
  ): Promise<R[]> {
    return array.reduce(
      async (promise, item, index) => {
        const acc = await promise;
        const result = await callback(item, index, array);
        acc.push(result);
        return acc;
      },
      Promise.resolve([] as R[]),
    );
  }

  /**
   * Maps over an array in batches, processing each batch sequentially but items within
   * a batch can be processed in parallel (depending on callback implementation).
   * Useful for database operations where you want to limit concurrency.
   *
   * @template T The input array element type
   * @template R The return type of the callback
   * @param array - The array to iterate over
   * @param batchSize - The number of items to process in each batch
   * @param callback - The async function to apply to each batch
   * @returns A promise that resolves to a flattened array of results
   *
   * @example
   * ```typescript
   * const results = await Iterator.batchedMap(
   *   [1, 2, 3, 4, 5],
   *   2,
   *   async (chunk, batchIndex) => {
   *     return chunk.map(item => item * 2);
   *   }
   * );
   * ```
   */
  public static async batchedMap<T, R>(
    array: T[],
    batchSize: number,
    callback: (chunk: T[], batchIndex: number, array: T[]) => Promise<R[] | void>,
  ): Promise<R[]> {
    const results: R[] = [];
    const totalBatches = Math.ceil(array.length / batchSize);

    // Generate batch indices: [0, 1, 2, ..., totalBatches - 1]
    const batchIndices = Array.from({ length: totalBatches }, (_, i) => i);

    await this.mapSeries(batchIndices, async (batchIndex: number) => {
      const start = batchIndex * batchSize;
      const chunk = array.slice(start, start + batchSize);
      const batchResult = await callback(chunk, batchIndex, array);
      if (batchResult) {
        results.push(...batchResult);
      }
    });

    return results;
  }
}
