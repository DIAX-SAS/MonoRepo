// src/data-access/diax-back/diax-back.test.ts
import { fetchWrapper, fetchPIMMs, fetchCredentialsCore } from '../diax-back';
import { getServerSession } from 'next-auth';

// in diax-back.spec.ts
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({ accessToken: 'mocked-token' })),
}));

jest.mock('../../../app/api/auth/[...nextauth]/_lib/authOptions', () => ({
  authOptions: {},
}));

const mockFetch = global.fetch = jest.fn();

describe('fetchWrapper', () => {
  const mockToken = 'mocked-token';
  const mockSession = { accessToken: mockToken };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it('sends a POST request and returns JSON', async () => {
    const mockResponse = { data: 'hello' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchWrapper('/example', {
      method: 'POST',
      body: { test: 123 },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/example'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
        }),
        body: JSON.stringify({ test: 123 }),
      }),
    );

    expect(result).toEqual(mockResponse);
  });

  it('throws an error on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    await expect(
      fetchWrapper('/example', { method: 'GET' })
    ).rejects.toThrow('Error 401: Unauthorized');
  });
});

describe('fetchPIMMs', () => {
  it('calls fetchWrapper with correct params', async () => {
    const mockData = { result: 'success' };
    (getServerSession as jest.Mock).mockResolvedValue({ accessToken: 'abc' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const input = { equipos: {}, initTime: 0, endTime: 1, step: 'minute' };
    const result = await fetchPIMMs(input as any);

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/pimms'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      })
    );
  });
});

describe('fetchCredentialsCore', () => {
  it('calls fetchWrapper with correct path', async () => {
    const mockToken = { token: 'iot-token' };
    (getServerSession as jest.Mock).mockResolvedValue({ accessToken: 'abc' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockToken,
    });

    const result = await fetchCredentialsCore();
    expect(result).toEqual(mockToken);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/pimms/iot/credentials'),
      expect.objectContaining({ method: 'GET' })
    );
  });
});
