import crypto from 'node:crypto';
import { JwtHelper } from './JwtHelper';

const PEM_BEGIN_MARKER = '-----BEGIN';
const PEM_END_MARKER = '-----END';
const KEY_GENERATION_HINT = 'Run the key generation script: bun scripts/generate-jwt-keys.ts';

/**
 * Normalizes PEM key format by converting literal \n sequences to actual newlines.
 * This is necessary because environment variables often store keys as single-line strings
 * with \n escape sequences that need to be converted to real newlines for OpenSSL.
 *
 * Handles multiple formats:
 * - Literal backslash-n sequences: "\\n" (when Bun doesn't process escapes)
 * - Already normalized keys with actual newlines
 * - Keys that may have been processed by Bun's env parser
 *
 * @param key - The PEM key string (may contain literal \n sequences)
 * @returns The normalized PEM key with actual newlines
 */
function normalizePemKey(key: string): string {
  if (!key || key.trim().length === 0) {
    throw new Error('PEM key cannot be empty');
  }

  // Strategy 1: Trim whitespace from the entire key first
  // This is critical - OpenSSL requires the key to start with -----BEGIN
  // Any leading whitespace will cause NO_START_LINE error
  let normalized = key.trim();

  // Strategy 2: Replace literal backslash-n sequences (when stored as "\\n" in env)
  // This handles the case where the .env file has: JWT_PRIVATE_KEY="-----BEGIN...\\n-----END..."
  // Also handle cases where Bun might have already processed some escapes
  normalized = normalized
    .replace(/\\n/g, '\n') // Replace literal \n
    .replace(/\\r\\n/g, '\n') // Replace Windows-style \r\n
    .replace(/\\r/g, '\n'); // Replace \r

  // Strategy 3: If still no newlines, the key might be a true single-line
  // In this case, we need to check if it's valid PEM format
  // For EC keys, the format should be: -----BEGIN EC PRIVATE KEY-----\n<base64>\n-----END EC PRIVATE KEY-----
  if (
    !normalized.includes('\n') &&
    normalized.includes(PEM_BEGIN_MARKER) &&
    normalized.includes(PEM_END_MARKER)
  ) {
    // Try to insert newlines at logical points
    // This is a fallback for malformed keys
    normalized = normalized
      .replace(/-----BEGIN([^-]+)-----/, '-----BEGIN$1-----\n')
      .replace(/-----END([^-]+)-----/, '\n-----END$1-----');
  }

  // Ensure proper PEM formatting: filter out empty lines and keep valid content
  // CRITICAL: All lines should be trimmed to remove any accidental whitespace
  // PEM format requires: -----BEGIN...-----\n<base64>\n-----END...-----
  const formattedLines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((trimmed) => trimmed.length > 0);

  normalized = formattedLines.join('\n');

  // Ensure the key ends with a newline (PEM format requirement)
  if (!normalized.endsWith('\n')) {
    normalized += '\n';
  }

  // CRITICAL: Validate that the key starts with -----BEGIN
  // OpenSSL requires this exact format, otherwise it throws NO_START_LINE error
  const trimmedNormalized = normalized.trim();
  if (!trimmedNormalized.startsWith(PEM_BEGIN_MARKER)) {
    throw new Error(
      `Invalid PEM key format: key must start with "${PEM_BEGIN_MARKER}". ` +
        `Found start: "${trimmedNormalized.substring(0, 30)}...". ` +
        `This usually means the key has leading whitespace or is malformed. ` +
        `Ensure keys are properly formatted PEM keys.`,
    );
  }

  // Validate that the key has proper PEM markers
  const hasBeginMarker = normalized.includes(PEM_BEGIN_MARKER);
  const hasEndMarker = normalized.includes(PEM_END_MARKER);

  if (!hasBeginMarker || !hasEndMarker) {
    throw new Error(
      'Invalid PEM key format: missing BEGIN or END markers. Ensure keys are properly formatted.',
    );
  }

  return normalized;
}

/**
 * Factory function for creating JwtHelper instance.
 * Retrieves JWT keys from environment variables and normalizes their format.
 *
 * @returns JwtHelper instance
 * @throws {Error} If keys are missing or invalid
 */
export function provideJwtHelper(): JwtHelper {
  const privateKeyRaw = Bun.env.JWT_PRIVATE_KEY;
  const publicKeyRaw = Bun.env.JWT_PUBLIC_KEY;

  // Detailed validation with helpful error messages
  if (!privateKeyRaw) {
    throw new Error(
      'JWT_PRIVATE_KEY is not set in environment variables. ' +
        'Please set JWT_PRIVATE_KEY in your .env file or environment.',
    );
  }

  if (!publicKeyRaw) {
    throw new Error(
      'JWT_PUBLIC_KEY is not set in environment variables. ' +
        'Please set JWT_PUBLIC_KEY in your .env file or environment.',
    );
  }

  // Check if keys are empty strings (after trimming)
  if (privateKeyRaw.trim().length === 0) {
    throw new Error(
      'JWT_PRIVATE_KEY is set but is empty. ' +
        'Please ensure the key is properly configured in your .env file.',
    );
  }

  if (publicKeyRaw.trim().length === 0) {
    throw new Error(
      'JWT_PUBLIC_KEY is set but is empty. ' +
        'Please ensure the key is properly configured in your .env file.',
    );
  }

  try {
    // Normalize keys by converting \n literals to actual newlines
    const privateKey = normalizePemKey(privateKeyRaw);
    const publicKey = normalizePemKey(publicKeyRaw);

    // Validate that the keys are actually parseable by Node.js crypto
    // This will catch base64 decode errors early
    try {
      crypto.createPrivateKey({
        key: privateKey,
        format: 'pem',
      });
    } catch (keyError) {
      throw new Error(
        `Invalid private key format: ${keyError instanceof Error ? keyError.message : String(keyError)}. ` +
          `The key must be a valid EC private key in PEM format. ${KEY_GENERATION_HINT}`,
      );
    }

    try {
      crypto.createPublicKey({
        key: publicKey,
        format: 'pem',
      });
    } catch (keyError) {
      throw new Error(
        `Invalid public key format: ${keyError instanceof Error ? keyError.message : String(keyError)}. ` +
          `The key must be a valid EC public key in PEM format. ${KEY_GENERATION_HINT}`,
      );
    }

    return new JwtHelper({ privateKey, publicKey });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to normalize JWT keys: ${errorMessage}. ` +
        'This usually means: ' +
        '1) Keys are missing or empty in .env file, ' +
        '2) Keys are not properly formatted PEM keys, ' +
        '3) Keys have leading/trailing whitespace, or ' +
        `4) Keys need \\n escape sequences converted to actual newlines. ${KEY_GENERATION_HINT}`,
    );
  }
}
