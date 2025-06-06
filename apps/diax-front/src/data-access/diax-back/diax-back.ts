"use server";
import { headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { FilterPimmsDto, ResponsePimms, ResponseToken } from '../../app/dashboard/dashboard.types';
import { NextRequest } from 'next/server';

const URL = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/api`;

export async function fetchWrapper(
  url: string, 
  params: RequestInit,
): Promise<Response> {
  // IMPLEMENTAR CON UN MIDDLEWARE
  // https://nextjs.org/docs/pages/building-your-application/routing/middleware
  // also handle session token for mqtt
  const { method, headers: customHeaders = {}, body } = params;

  const token = await getToken({
    req:  {
      headers: Object.fromEntries((await headers()).entries()),
      method: 'GET',
      url: '',
      statusCode: undefined,
      statusMessage: undefined,
      aborted: false,
      complete: false,
    } as unknown as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token?.accessToken}`,
    ...customHeaders,
  };

  const response = await fetch(URL.concat(url), {
    method,
    headers: fetchHeaders,
    body: JSON.stringify(body),
  });

  return response.json();
}

export async function fetchPIMMs(parameters: FilterPimmsDto): Promise<ResponsePimms> {
  return fetchWrapper<FilterPimmsDto, ResponsePimms>('/pimms', { 
    method: 'POST', 
    body: parameters 
  });
}

export async function fetchCredentialsCore(): Promise<ResponseToken> {
  return fetchWrapper<never, ResponseToken>('/pimms/iot/credentials', { 
    method: 'GET' 
  });
}