import { fetchData, fetchPIMMs, fetchCredentialsCore } from '../diax-back.ts';
import { headers, cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { FilterPimmsDto, PimmsStepUnit } from '../../../app/dashboard/dashboard.types.ts';

jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Headers()),
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => [{ name: 'test-cookie', value: 'test-value' }])
  }))
}));

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  __esModule: true,
  getToken: jest.fn(() => Promise.resolve({ 
    accessToken: 'mock-access-token' 
  }))
}));


// Mock the global fetch
global.fetch = jest.fn();

// Type the mocks for TypeScript
const mockHeaders = headers as jest.MockedFunction<typeof headers>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;

describe('fetchData utilities', () => {
  const mockToken = { accessToken: 'test-token' };
  const mockResponse = { ok: true, json: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockHeaders.mockReturnValue(Promise.resolve(new Headers({})));
    mockCookies.mockReturnValue({
      getAll: jest.fn().mockReturnValue([{ name: 'cookie1', value: 'value1' }])
    } as any);
    mockGetToken.mockResolvedValue(mockToken);
    mockFetch.mockResolvedValue(mockResponse as any);
  });

  describe('fetchData', () => {
    it('should make a successful request with proper headers', async () => {
      mockResponse.json.mockResolvedValue({ data: 'test' });

      const result = await fetchData('/test', { method: 'GET' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('should include custom headers', async () => {
      await fetchData('/test', {
        method: 'GET',
        headers: { 'X-Custom': 'value' }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value'
          })
        })
      );
    });

    it('should include request body for POST requests', async () => {
      const testBody = { key: 'value' };
      await fetchData('/test', {
        method: 'POST',
        body: testBody
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testBody)
        })
      );
    });

    it('should throw error when no access token', async () => {
      mockGetToken.mockResolvedValue(null);

      await expect(fetchData('/test', { method: 'GET' }))
        .rejects.toThrow('No access token found');
    });

    it('should throw error when request fails', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: 'Server Error'
      };
      mockFetch.mockResolvedValue(errorResponse as any);

      await expect(fetchData('/test', { method: 'GET' }))
        .rejects.toThrow('Request failed with status 500');
    });
  });

  describe('fetchPIMMs', () => {
    it('should make POST request with parameters', async () => {
      const mockPIMMsResponse = { items: [], total: 0 };
      mockResponse.json.mockResolvedValue(mockPIMMsResponse);

      const params: FilterPimmsDto = { initTime: 0, endTime: 1, stepUnit: PimmsStepUnit.SECOND };
      const result = await fetchPIMMs(params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/pimms'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      expect(result).toEqual(mockPIMMsResponse);
    });
  });

  describe('fetchCredentialsCore', () => {
    it('should make GET request without body', async () => {
      const mockTokenResponse = { token: 'test-token', expires: '2023-01-01' };
      mockResponse.json.mockResolvedValue(mockTokenResponse);

      const result = await fetchCredentialsCore();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/pimms/iot/credentials'),
        expect.objectContaining({
          method: 'GET',
          body: undefined
        })
      );
      expect(result).toEqual(mockTokenResponse);
    });
  });
});