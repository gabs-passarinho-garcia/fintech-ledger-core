/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/require-await */
import { createHmac } from 'node:crypto';
import type { IOAuth, IVariable, OAuthSignInOutput } from '@/common/interfaces';
import { InternalError, NotFoundError, NotSignedError } from '@/common/errors';
import type { PrismaHandler } from '../PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

/**
 * Mock implementation of CognitoHandler for local development.
 * Simulates Cognito responses without requiring actual AWS Cognito service.
 */
export class MockCognitoHandler implements IOAuth {
  private readonly prisma: PrismaHandler;
  private readonly mockUsers: Map<string, MockUser>;

  public constructor(opts: {
    envVariableHandler: IVariable;
    secretsHandler: IVariable;
    [AppProviders.prisma]: PrismaHandler;
  }) {
    // Dependencies are accepted but not currently used
    // They are kept in the constructor signature for consistency with CognitoHandler
    void opts.envVariableHandler;
    void opts.secretsHandler;
    this.prisma = opts[AppProviders.prisma];
    this.mockUsers = new Map();

    // Initialize with users from database asynchronously
    this.initializeUsersFromDatabase().catch((error) => {
      console.error('Failed to initialize users from database:', error);
    });
  }

  private async initializeUsersFromDatabase(): Promise<void> {
    try {
      // Check if User model exists in Prisma schema
      // For now, we'll use fallback users since the schema might not have User model
      const hasUserModel = 'user' in this.prisma;

      if (hasUserModel) {
        // Fetch users from database
        const users = await (
          this.prisma as unknown as {
            user: {
              findMany: (args: unknown) => Promise<Array<{ username: string; useremail: string }>>;
            };
          }
        ).user.findMany({
          where: {
            deletedAt: null,
          },
          select: {
            username: true,
            useremail: true,
          },
        });

        console.info(`🔍 Found ${users.length} users in database`);

        // Create mock users for each database user
        users.forEach((user) => {
          const mockUser: MockUser = {
            username: user.username,
            email: user.useremail,
            password: 'Teste@123', // Default password for all mock users
            status: 'CONFIRMED',
            accessToken: this.generateMockToken(user.username, 'access'),
            refreshToken: this.generateMockToken(user.username, 'refresh'),
          };

          this.mockUsers.set(user.username, mockUser);
          console.info(`✅ Added mock user: ${user.username} (${user.useremail})`);
        });
      }

      // If no users found, add some fallback users
      if (this.mockUsers.size === 0) {
        console.info('⚠️  No users found in database, adding fallback users');
        this.addFallbackUsers();
      }
    } catch (error) {
      console.error('❌ Error loading users from database:', error);
      console.info('⚠️  Falling back to hardcoded users');
      this.addFallbackUsers();
    }
  }

  private addFallbackUsers(): void {
    const fallbackUsers = [
      {
        username: 'br:12345678901',
        email: 'teste1@klema.com',
        password: 'Teste@123',
        status: 'CONFIRMED' as const,
      },
      {
        username: 'br:98765432100',
        email: 'teste2@klema.com',
        password: 'Teste@123',
        status: 'CONFIRMED' as const,
      },
      {
        username: 'us:123456789',
        email: 'teste3@klema.com',
        password: 'Teste@123',
        status: 'CONFIRMED' as const,
      },
    ];

    fallbackUsers.forEach((user) => {
      this.mockUsers.set(user.username, {
        ...user,
        accessToken: this.generateMockToken(user.username, 'access'),
        refreshToken: this.generateMockToken(user.username, 'refresh'),
      });
    });
  }

  private generateMockToken(username: string, type: 'access' | 'refresh'): string {
    // Generate a simple mock JWT-like token
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: username,
        username,
        token_use: type,
        exp: Math.floor(Date.now() / 1000) + (type === 'access' ? 3600 : 86400), // 1h for access, 24h for refresh
        iat: Math.floor(Date.now() / 1000),
      }),
    ).toString('base64url');

    const signature = createHmac('sha256', 'mock-secret')
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  public async changeTemporaryPassword(args: {
    username: string;
    temporaryPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    const user = this.mockUsers.get(args.username);

    if (!user) {
      throw new NotFoundError({
        message: 'User not found',
      });
    }

    if (user.password !== args.temporaryPassword) {
      throw new InternalError({
        additionalMessage: 'Invalid temporary password',
      });
    }

    // Update password
    user.password = args.newPassword;
    this.mockUsers.set(args.username, user);

    return { success: true };
  }

  public async signIn(args: { username: string; password: string }): Promise<OAuthSignInOutput> {
    const { username, password } = args;

    // If no users loaded yet, try to load them
    if (this.mockUsers.size === 0) {
      await this.initializeUsersFromDatabase();
    }

    const user = this.mockUsers.get(username);

    if (!user) {
      throw new NotFoundError({
        message: 'User not found',
      });
    }

    if (user.password !== password) {
      throw new NotSignedError({
        additionalMessage: 'Invalid credentials',
      });
    }

    // Generate new tokens
    const accessToken = this.generateMockToken(username, 'access');
    const refreshToken = this.generateMockToken(username, 'refresh');

    // Update user tokens
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    this.mockUsers.set(username, user);

    return {
      username: user.username,
      status: user.status,
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      userEmail: user.email,
    };
  }

  public async refreshToken(args: {
    refreshToken: string;
    username: string;
  }): Promise<OAuthSignInOutput> {
    const { refreshToken, username } = args;

    // If no users loaded yet, try to load them
    if (this.mockUsers.size === 0) {
      await this.initializeUsersFromDatabase();
    }

    const user = this.mockUsers.get(username);

    if (!user) {
      throw new NotFoundError({
        message: 'User not found',
      });
    }

    // Validate refresh token
    if (user.refreshToken !== refreshToken) {
      throw new NotSignedError({
        additionalMessage: 'Invalid refresh token',
      });
    }

    // Verify token is not expired
    try {
      const parts = refreshToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          throw new NotSignedError({
            additionalMessage: 'Refresh token expired',
          });
        }
      }
    } catch (error) {
      throw new NotSignedError({
        additionalMessage: 'Invalid refresh token format',
        originalError: error,
      });
    }

    // Generate new tokens
    const newAccessToken = this.generateMockToken(username, 'access');
    const newRefreshToken = this.generateMockToken(username, 'refresh');

    // Update user tokens
    user.accessToken = newAccessToken;
    user.refreshToken = newRefreshToken;
    this.mockUsers.set(username, user);

    return {
      username: user.username,
      status: user.status,
      tokenType: 'Bearer',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600, // 1 hour
      userEmail: user.email,
    };
  }

  public async changePassword(args: {
    username: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    const user = this.mockUsers.get(args.username);

    if (!user) {
      throw new NotFoundError({
        message: 'User not found',
      });
    }

    user.password = args.newPassword;
    this.mockUsers.set(args.username, user);

    return { success: true };
  }

  public async signUp(args: {
    username: string;
    useremail: string;
    password: string;
  }): Promise<void> {
    // Check if user already exists
    if (this.mockUsers.has(args.username)) {
      throw new InternalError({
        additionalMessage: 'User already exists',
      });
    }

    // Create new mock user
    const newUser: MockUser = {
      username: args.username,
      email: args.useremail,
      password: args.password,
      status: 'CONFIRMED',
      accessToken: this.generateMockToken(args.username, 'access'),
      refreshToken: this.generateMockToken(args.username, 'refresh'),
    };

    this.mockUsers.set(args.username, newUser);
  }

  public async authorize(args: { token: string }): Promise<{ username: string }> {
    try {
      // If no users loaded yet, try to load them
      if (this.mockUsers.size === 0) {
        await this.initializeUsersFromDatabase();
      }

      // Simple token validation for mock
      const parts = args.token.split('.');
      if (parts.length !== 3) {
        throw new NotSignedError({
          additionalMessage: 'Invalid token format',
        });
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      if (!payload.username || !payload.sub) {
        throw new NotSignedError({
          additionalMessage: 'Invalid token payload',
        });
      }

      // Check if user exists in our mock data
      const user = this.mockUsers.get(payload.username);
      if (!user) {
        throw new NotSignedError({
          additionalMessage: 'User not found',
        });
      }

      // Check token expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new NotSignedError({
          additionalMessage: 'Token expired',
        });
      }

      return { username: payload.username };
    } catch (error) {
      throw new NotSignedError({
        additionalMessage: `Error on authorize: ${error}`,
        originalError: error,
      });
    }
  }

  // Helper method to add mock users programmatically
  public addMockUser(user: {
    username: string;
    email: string;
    password: string;
    status?: 'CONFIRMED' | 'UNCONFIRMED' | 'FORCE_CHANGE_PASSWORD';
  }): void {
    const mockUser: MockUser = {
      ...user,
      status: user.status || 'CONFIRMED',
      accessToken: this.generateMockToken(user.username, 'access'),
      refreshToken: this.generateMockToken(user.username, 'refresh'),
    };

    this.mockUsers.set(user.username, mockUser);
  }

  // Helper method to get all mock users (for debugging)
  public getMockUsers(): MockUser[] {
    return Array.from(this.mockUsers.values());
  }
}

interface MockUser {
  username: string;
  email: string;
  password: string;
  status: 'CONFIRMED' | 'UNCONFIRMED' | 'FORCE_CHANGE_PASSWORD';
  accessToken: string;
  refreshToken: string;
}
