"use server";
import { headers, cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { FilterPimmsDto, ResponsePimms, ResponseToken } from '../../app/dashboard/dashboard.types';
import { IncomingMessage } from 'http';

const URL = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/api`;

type FetchParams<T = unknown> = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: T;
};

// Create a minimal request-like object that satisfies NextAuth's requirements
const createNextAuthRequest = async (): Promise<IncomingMessage & { 
  cookies: Partial<{ [key: string]: string }>; 
  headers: Record<string, string | string[] | undefined>; 
}> => {
  const headerMap = headers();
  const cookieMap = cookies();

  return {
    headers: Object.fromEntries((await headerMap).entries()),
    cookies: Object.fromEntries(
      (await cookieMap).getAll().map((c) => [c.name, c.value])
    ),
    method: 'GET',
    url: '',
    statusCode: undefined,
    statusMessage: undefined,
    aborted: false,
    complete: false,
  } as unknown as IncomingMessage & {
    cookies: Partial<{ [key: string]: string }>;
  };
};

export async function fetchData<T = unknown, U = unknown>(
  url: string, 
  params: FetchParams<T>
): Promise<U> {
  const { method, headers: customHeaders = {}, body } = params;

  const token = await getToken({
    req: await createNextAuthRequest(),
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.accessToken) {
    throw new Error('No access token found');
  }

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.accessToken}`,
    ...customHeaders,
  };

  const response = await fetch(URL.concat(url), {
    method,
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<U>;
}

export async function fetchPIMMs(parameters: FilterPimmsDto): Promise<ResponsePimms> {
  return fetchData<FilterPimmsDto, ResponsePimms>('/pimms', { 
    method: 'POST', 
    body: parameters 
  });
}

export async function fetchCredentialsCore(): Promise<ResponseToken> {
  return fetchData<never, ResponseToken>('/pimms/iot/credentials', { 
    method: 'GET' 
  });
}