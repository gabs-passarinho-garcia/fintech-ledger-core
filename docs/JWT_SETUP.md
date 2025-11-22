# JWT Authentication Setup Guide

This guide explains how to set up JWT authentication for the Fintech Ledger Core application.

## Prerequisites

- OpenSSL installed (for shell script) OR
- Node.js/Bun runtime (for JavaScript script)

## Generating ECDSA Keys

The application uses ES256 (ECDSA using P-256 and SHA-256) for JWT signing. You need to generate a pair of ECDSA keys.

### Option 1: Using OpenSSL (Shell Script)

```bash
./scripts/generate-jwt-keys.sh
```

This script will:

- Generate a private key using P-256 curve
- Extract the public key
- Save both keys to `keys/` directory
- Set appropriate file permissions

### Option 2: Using Bun (TypeScript Script)

```bash
bun scripts/generate-jwt-keys.ts
```

or directly:

```bash
./scripts/generate-jwt-keys.ts
```

### Option 3: Manual Generation with OpenSSL

If you prefer to generate keys manually:

```bash
# Create keys directory
mkdir -p keys

# Generate private key
openssl ecparam -genkey -name prime256v1 -noout -out keys/jwt-private-key.pem

# Extract public key
openssl ec -in keys/jwt-private-key.pem -pubout -out keys/jwt-public-key.pem

# Set secure permissions
chmod 600 keys/jwt-private-key.pem
chmod 644 keys/jwt-public-key.pem
```

## Configuring Environment Variables

After generating the keys, you need to add them to your `.env` file. The keys must be formatted as single-line strings with `\n` for newlines.

### Converting Keys to Single-Line Format

**On Linux/macOS:**

```bash
# Private key
JWT_PRIVATE_KEY="$(cat keys/jwt-private-key.pem | tr '\n' '\\n')"

# Public key
JWT_PUBLIC_KEY="$(cat keys/jwt-public-key.pem | tr '\n' '\\n')"
```

**On Windows (PowerShell):**

```powershell
# Private key
$JWT_PRIVATE_KEY = (Get-Content keys/jwt-private-key.pem -Raw) -replace "`n", "\n"
$JWT_PRIVATE_KEY = "`"$JWT_PRIVATE_KEY`""

# Public key
$JWT_PUBLIC_KEY = (Get-Content keys/jwt-public-key.pem -Raw) -replace "`n", "\n"
$JWT_PUBLIC_KEY = "`"$JWT_PUBLIC_KEY`""
```

### Complete .env Configuration

Add these variables to your `.env` file:

```env
# JWT Authentication Configuration
JWT_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Token Expiration (optional, defaults shown)
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Authentication Provider (JWT or COGNITO)
AUTH_PROVIDER=JWT

# Master User Seed Configuration (for initial setup)
MASTER_USER_USERNAME=admin
MASTER_USER_PASSWORD=ChangeMe123!
```

### Token Expiration Format

The expiration times support the following formats:

- `s` - seconds (e.g., `30s`)
- `m` - minutes (e.g., `15m`)
- `h` - hours (e.g., `2h`)
- `d` - days (e.g., `7d`)

## Creating the Master User

After setting up the database and environment variables, run the seed to create the initial master user:

```bash
bun db:seed
```

The master user will be created with:

- Username: Value from `MASTER_USER_USERNAME` (default: `admin`)
- Password: Value from `MASTER_USER_PASSWORD` (default: `ChangeMe123!`)
- `isMaster: true` - Allows impersonation of other users

**⚠️ IMPORTANT:** Change the default password immediately after first login!

## Security Best Practices

1. **Never commit private keys to version control**
   - The `keys/` directory is already in `.gitignore`
   - Always use environment variables or secrets management

2. **Use strong passwords for master users**
   - The default password should be changed immediately
   - Use a password manager to generate strong passwords

3. **Rotate keys periodically**
   - Generate new keys and update environment variables
   - Invalidate old tokens by updating the public key

4. **Protect private keys**
   - Set file permissions to `600` (owner read/write only)
   - Use secrets management services in production (AWS Secrets Manager, etc.)

5. **Use different keys per environment**
   - Development, staging, and production should have separate key pairs
   - Never reuse production keys in development

## Troubleshooting

### Error: "Invalid key format"

- Ensure keys are formatted as single-line strings with `\n` for newlines
- Verify that the keys are complete (include BEGIN/END markers)

### Error: "Key does not match"

- Ensure you're using the correct key pair (private and public must match)
- Check that environment variables are loaded correctly

### Error: "Token verification failed"

- Verify that `JWT_PUBLIC_KEY` matches the private key used for signing
- Check token expiration settings
- Ensure the token hasn't been tampered with

## Additional Resources

- [JWT.io](https://jwt.io/) - JWT debugger and information
- [OpenSSL Documentation](https://www.openssl.org/docs/) - OpenSSL command reference
- [ECDSA Algorithm](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm) - ECDSA overview
