import argon2 from 'argon2';
import { InternalError, DomainError } from '@/common/errors';
import { Logger } from '../Logger';

const DEFAULT_HASH_LENGTH = 32;
const DEFAULT_TIME_COST = 3;
const DEFAULT_MEMORY_COST = 65536; // 64 MB
const DEFAULT_PARALLELISM = 4;

/**
 * Password handler that provides secure password hashing and verification using Argon2id.
 * Argon2id is the recommended variant of Argon2, providing resistance against both
 * side-channel and time-memory trade-off attacks.
 */
export class PasswordHandler {
  private readonly hashLength: number;
  private readonly timeCost: number;
  private readonly memoryCost: number;
  private readonly parallelism: number;
  private readonly logger: Logger;

  /**
   * Creates a new PasswordHandler instance.
   *
   * @param opts - Configuration options
   * @param opts.hashLength - Length of the hash output in bytes (default: 32)
   * @param opts.timeCost - Time cost parameter (default: 3)
   * @param opts.memoryCost - Memory cost in KB (default: 65536 = 64 MB)
   * @param opts.parallelism - Parallelism parameter (default: 4)
   * @param opts.logger - Logger instance
   */
  public constructor(opts: {
    hashLength?: number;
    timeCost?: number;
    memoryCost?: number;
    parallelism?: number;
    logger: Logger;
  }) {
    this.hashLength = opts.hashLength ?? DEFAULT_HASH_LENGTH;
    this.timeCost = opts.timeCost ?? DEFAULT_TIME_COST;
    this.memoryCost = opts.memoryCost ?? DEFAULT_MEMORY_COST;
    this.parallelism = opts.parallelism ?? DEFAULT_PARALLELISM;
    this.logger = opts.logger.setService('PasswordHandler');
  }

  /**
   * Hashes a password using Argon2id.
   * The output format is: salt (hex) + ':' + hash (hex)
   *
   * @param password - The plaintext password to hash
   * @returns A promise that resolves to the hashed password string
   * @throws {InvalidInputError} If password is empty
   * @throws {InternalError} If hashing fails
   */
  public async hash(password: string): Promise<string> {
    if (!password || password.length === 0) {
      throw new DomainError({
        message: 'Password cannot be empty',
      });
    }

    try {
      // Hash the password with Argon2id
      // argon2 library handles salt generation internally
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: this.memoryCost,
        timeCost: this.timeCost,
        parallelism: this.parallelism,
        hashLength: this.hashLength,
      });
    } catch (error) {
      this.logger.error(
        {
          message: 'Failed to hash password',
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'password_hash_error',
        'PasswordHandler',
      );

      throw new InternalError({
        originalError: error,
        additionalMessage: `Failed to hash password: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * Verifies a password against a hash.
   *
   * @param password - The plaintext password to verify
   * @param hashString - The hashed password string (format: salt:hash)
   * @returns A promise that resolves to true if password matches, false otherwise
   * @throws {InvalidInputError} If password or hash is invalid
   * @throws {InternalError} If verification fails
   */
  public async verify(password: string, hashString: string): Promise<boolean> {
    if (!password || password.length === 0) {
      throw new DomainError({
        message: 'Password cannot be empty',
      });
    }

    if (!hashString || hashString.length === 0) {
      throw new DomainError({
        message: 'Hash string cannot be empty',
      });
    }

    try {
      // argon2.verify handles timing-safe comparison internally
      return await argon2.verify(hashString, password);
    } catch (error) {
      // If verification fails, argon2 throws an error
      // Return false instead of throwing to allow caller to handle
      if (error instanceof Error && error.message.includes('verification')) {
        return false;
      }

      this.logger.error(
        {
          message: 'Failed to verify password',
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'password_verify_error',
        'PasswordHandler',
      );

      throw new InternalError({
        originalError: error,
        additionalMessage: `Failed to verify password: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
}
