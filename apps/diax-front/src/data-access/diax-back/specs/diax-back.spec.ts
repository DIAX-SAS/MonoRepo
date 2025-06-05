import { fetchData, fetchPIMMs, fetchCredentialsCore } from '../diax-back.ts';
import { headers, cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { FilterPimmsDto, PimmsStepUnit } from '../../../app/dashboard/dashboard.types.ts';

// Mock next/headers with proper types
jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Headers()),
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => [{ name: 'test-cookie', value: 'test-value' }])
  }))
}));

// Mock next-auth/jwt with proper types
jest.mock('next-auth/jwt', () => ({
  __esModule: true,
  getToken: jest.fn(() => Promise.resolve({ 
    accessToken: 'mock-access-token' 
  }))
}));

// Mock the global fetch with proper typing
global.fetch = jest.fn();

// Type the mocks properly
const mockHeaders = headers as jest.MockedFunction<typeof headers>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockFetch = global.fetch as jest.Mock<Promise<Response>>;

describe('fetchData utilities', () => {
  const mockToken = { accessToken: 'test-token' };
  const mockResponse: Response = {
    ok: true,
    json: jest.fn(),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn()
  } as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockHeaders.mockReturnValue(Promise.resolve(new Headers({})));
    mockCookies.mockReturnValue({
      getAll: jest.fn().mockReturnValue([{ name: 'cookie1', value: 'value1' }])
    } as unknown as ReturnType<typeof cookies>);
    mockGetToken.mockResolvedValue(mockToken);
    mockFetch.mockResolvedValue(mockResponse);
  });

  describe('fetchData', () => {
    it('should make a successful request with proper headers', async () => {
      (mockResponse.json as jest.Mock).mockResolvedValue({ data: 'test' });

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
      const errorResponse: Response = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: '',
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        json: jest.fn(),
        text: jest.fn()
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(errorResponse);

      await expect(fetchData('/test', { method: 'GET' }))
        .rejects.toThrow('Request failed with status 500');
    });
  });

  describe('fetchPIMMs', () => {
    it('should make POST request with parameters', async () => {
      const mockPIMMsResponse = { items: [], total: 0 };
      (mockResponse.json as jest.Mock).mockResolvedValue(mockPIMMsResponse);

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
      (mockResponse.json as jest.Mock).mockResolvedValue(mockTokenResponse);

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