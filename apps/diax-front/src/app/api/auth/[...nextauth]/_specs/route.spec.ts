/**
 * @jest-environment node
 */

import { JWT } from 'next-auth/jwt';
import { authOptions } from '../_lib/authOptions';
import { Account, Session, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';

describe('authOptions callbacks', () => {
  describe('jwt callback', () => {
    it('sets accessToken and idToken on token when account exists', async () => {
      const token: JWT = {};
      const account: Account = {
        providerAccountId: 'provider-account-id',
        provider: 'cognito',
        type: 'oauth',
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
      };

      const user: User = {
        id: '123',
        email: 'user@example.com',
      };

      if (!authOptions.callbacks?.jwt) {
        throw new Error('jwt callback is undefined');
      }


      const result = await Promise.resolve(
        authOptions.callbacks.jwt({
          token,
          account,
          user,
          profile: {},
          trigger: 'signIn',
          session: undefined,
        })
      );

      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('idToken', 'mock-id-token');
    });
  });

  describe('session callback', () => {
    it('adds accessToken and idToken to session from token', async () => {
      if (!authOptions.callbacks?.session) {
        throw new Error('session callback is undefined');
      }
  
      const session: Session = {
        user: {
          email: 'user@example.com',
        },
        expires: '2025-01-01T00:00:00Z',
      };
  
      const token: JWT = {
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
      };
  
      const user: AdapterUser = { 
        id: '123', 
        email: 'user@example.com', 
        emailVerified: null
      };
  
      const result = await authOptions.callbacks.session({
        session,
        token,
        user,
        trigger: 'update',
        newSession: null,
      });
  
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('idToken', 'mock-id-token');
    });
  
    it('returns session unchanged if tokens are missing', async () => {
      if (!authOptions.callbacks?.session) {
        throw new Error('session callback is undefined');
      }
  
      const session: Session = {
        user: {
          email: 'user@example.com',
        },
        expires: '2025-01-01T00:00:00Z',
      };
  
      const token: JWT = {};
      const user: AdapterUser = { 
        id: '123', 
        email: 'user@example.com', 
        emailVerified: null
      };
  
      const result = await authOptions.callbacks.session({
        session,
        token,
        user,
        trigger: 'update',
        newSession: null,
      });
  
      expect(result).toEqual(session);
    });

  });

});