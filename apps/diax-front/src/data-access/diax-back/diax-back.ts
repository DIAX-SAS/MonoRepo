"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../app/api/auth/[...nextauth]/_lib/authOptions"; // Asegúrate de exportar authOptions correctamente

import {
  FilterPimmsDto,
  ResponsePimms,
  ResponseToken,
} from "../../app/dashboard/dashboard.types";

const URL = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/api`;

export async function fetchWrapper<TRequest = unknown, TResponse = unknown>(
  url: string,
  params: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    body?: TRequest;
    headers?: HeadersInit;
  }
): Promise<TResponse> {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  const fetchHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
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
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

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
