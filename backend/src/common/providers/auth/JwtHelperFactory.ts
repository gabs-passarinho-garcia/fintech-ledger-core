import { JwtHelper } from './JwtHelper';

/**
 * Factory function for creating JwtHelper instance.
 * Retrieves JWT keys from environment variables.
 *
 * @returns JwtHelper instance
 */
export function provideJwtHelper(): JwtHelper {
  const privateKey = Bun.env.JWT_PRIVATE_KEY;
  const publicKey = Bun.env.JWT_PUBLIC_KEY;

  if (!privateKey || !publicKey) {
    throw new Error('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be set in environment variables');
  }

  return new JwtHelper({ privateKey, publicKey });
}
