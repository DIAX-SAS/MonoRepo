"use server";

import { headers as nextHeaders } from "next/headers";
import { getToken } from "next-auth/jwt";
import {
  FilterPimmsDto,
  ResponsePimms,
  ResponseToken,
} from "../../app/dashboard/dashboard.types";

const URL = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/api`;

// Generic fetch wrapper
export async function fetchWrapper<TRequest = unknown, TResponse = unknown>(
  url: string,
  params: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    body?: TRequest;
    headers?: HeadersInit;
  }
): Promise<TResponse> {
  const requestHeaders = await nextHeaders(); // Read Next.js headers
  const { NextRequest } = await import("next/server");
  const token = await getToken({
    req: new NextRequest(process.env.NEXTAUTH_URL ?? "", {
      headers: requestHeaders,
    }),
    secret: process.env.NEXTAUTH_SECRET,
  });

  const fetchHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: token?.accessToken
      ? `Bearer ${token.accessToken}`
      : "",
    ...params.headers,
  };

  const fetchOptions: RequestInit = {
    method: params.method,
    headers: fetchHeaders,
  };

  if (params.body && params.method !== "GET") {
    fetchOptions.body = JSON.stringify(params.body);
  }

  const response = await fetch(`${URL}${url}`, fetchOptions);
  return response.json();
}

export async function fetchPIMMs(
  parameters: FilterPimmsDto
): Promise<ResponsePimms> {
  return fetchWrapper<FilterPimmsDto, ResponsePimms>("/pimms", {
    method: "POST",
    body: parameters,
  });
}

export async function fetchCredentialsCore(): Promise<ResponseToken> {
  return fetchWrapper<undefined, ResponseToken>("/pimms/iot/credentials", {
    method: "GET",
  });
}
