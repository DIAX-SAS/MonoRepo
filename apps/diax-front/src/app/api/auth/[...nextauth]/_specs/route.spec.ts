import { authOptions } from '../route';
import { Session } from 'next-auth';
import { ProviderType } from 'next-auth/providers/index';

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
global.TextEncoder = require('util').TextEncoder;

// Mock `next-auth/jwt`
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(() =>
    Promise.resolve({
      access_token: 'mocked_access_token',
      expires_at: Date.now() + 3600 * 1000,
    })
  ),
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        access_token: 'mocked_access_token',
        expires_in: 3600,
        refresh_token: 'mocked_refresh_token',
      }),
  })
) as jest.Mock;

describe('NextAuth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return token with access_token and expiry if account exists', async () => {
    const account = {
      access_token: 'test_access_token',
      expires_in: 3600,
      refresh_token: 'test_refresh_token',
      provider: 'mock_provider',
      providerAccountId: 'mock_provider_account_id',
      type: 'oauth' as ProviderType,
    };

    const token = await authOptions.callbacks?.jwt?.({
      token: {},
      account,
      user: {
        id: '123',
        name: 'Test',
        email: 'test@provider.com',
        emailVerified: null,
      },
    });

    expect(token?.access_token).toBe('test_access_token');
    expect(token?.expires_at).toBeGreaterThan(Date.now());
    expect(token?.refresh_token).toBe('test_refresh_token');
  });

  it('should refresh the token when expired', async () => {
    const expiredToken = {
      access_token: 'old_access_token',
      expires_at: Date.now() - 1000, // Expired
      refresh_token: 'valid_refresh_token',
    };

    const newToken = await authOptions.callbacks?.jwt?.({
      token: expiredToken,
      account: null,
      user: {
        id: '123',
        name: 'Test',
        email: 'test@provider.com',
        emailVerified: null,
      },
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(newToken?.access_token).toBe('mocked_access_token');
    expect(newToken?.refresh_token).toBe('mocked_refresh_token');
  });

  it('should return an error if refresh token is missing', async () => {
    const expiredToken = {
      access_token: 'old_access_token',
      expires_at: Date.now() - 1000,
    };

    const newToken = await authOptions.callbacks?.jwt?.({
      token: expiredToken,
      account: null,
      user: {
        id: '123',
        name: 'Test',
        email: 'test@provider.com',
        emailVerified: null,
      },
    });

    expect(newToken?.error).toBe('RefreshTokenError');
  });

  it('should return session with correct properties', async () => {
    interface SessionTest extends Session {
      accessToken?: string;
      expires_at?: number;
      error?: 'RefreshTokenError';
    }
    const session: SessionTest | undefined =
      await authOptions.callbacks?.session?.({
        session: {} as SessionTest,
        token: {
          access_token: 'test_token',
          expires_at: Date.now() + 10000,
        },
        user: {
          id: '123',
          name: 'Test',
          email: 'test@provider.com',
          emailVerified: null,
        },
        newSession: 'mock-new-session',
        trigger: 'update',
      });

    expect(session?.accessToken).toBe('test_token');
    expect(session?.expires_at).toBeDefined();
  });
});
