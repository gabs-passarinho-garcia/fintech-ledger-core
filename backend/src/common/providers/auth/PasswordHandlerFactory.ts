import { Logger } from '@/common/providers/Logger';
import { PasswordHandler } from './PasswordHandler';
import type { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Factory function for creating PasswordHandler instance.
 * Injects the logger dependency and uses default configuration values.
 *
 * @param deps - Container dependencies
 * @param deps.logger - Logger instance
 * @returns PasswordHandler instance
 */
export function providePasswordHandler(deps: { [AppProviders.logger]: Logger }): PasswordHandler {
  return new PasswordHandler({
    logger: deps.logger,
    // Using default values from PasswordHandler constants
    // hashLength, timeCost, memoryCost, and parallelism will use defaults
  });
}
