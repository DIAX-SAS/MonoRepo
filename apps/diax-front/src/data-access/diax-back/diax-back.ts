import { headers } from 'next/headers';
import { AccessToken, FilterPimmsDto, ResponsePimms } from '../../app/dashboard/dashboard.types';

const URL = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/api` ;


export async function fetchData(url, params) {
  [method, headers, body] = params;
  return fetch(URL.concat(url), {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.accessToken}`,
      ...headers
    },
    body: JSON.stringify(body),
  });
  
}


export async function fetchPIMMs(parameters:FilterPimmsDto ):Promise<ResponsePimms> {
  return fetchData('/pimms', 'POST', parameters);
}

export async function fetchCredentialsCore() {
  return fetchData('/pimms/iot/credentials', 'GET');
}
