/**
 * Helper service for converting and validating query parameters.
 * Follows SRP by handling only type conversions and validations.
 */
export class QueryParameterConverter {
  /**
   * Converts a value to a Date object if possible.
   *
   * @param value - The value to convert (Date, string, or undefined)
   * @returns Date object or undefined
   */
  public static toDate(value: unknown): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      return new Date(value);
    }

    return undefined;
  }

  /**
   * Converts a value to a number if possible.
   *
   * @param value - The value to convert (number, string, or undefined)
   * @returns Number or undefined
   */
  public static toNumber(value: unknown): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }

    return undefined;
  }

  /**
   * Converts and validates pagination parameters.
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20, max: 100)
   * @returns Normalized pagination parameters
   */
  public static normalizePagination(
    page?: unknown,
    limit?: unknown,
  ): { page: number; limit: number } {
    const pageValue = this.toNumber(page) || 1;
    const limitValue = Math.min(this.toNumber(limit) || 20, 100);

    return {
      page: pageValue,
      limit: limitValue,
    };
  }
}
