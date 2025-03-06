import { getSiteURL } from '@/components/utils/get-site-url';
import { ResponsePIMM } from '@repo-hub/internal';

const URL = getSiteURL('backend').concat('api');

export async function fetchData(
  infoSettings: {
    filters: {
      initTime: number;
      endTime: number;
      accUnit: 'second' | 'minute' | 'hour';
      lastID: number | null;
      length: number;
    };
  },
  accessToken: string | undefined
) {
  const response = await fetch(URL.concat('/pimms'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(infoSettings),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const responseContent: ResponsePIMM = await response.json();
  return responseContent;
}

export async function fetchCredentialsCore(accessToken: string | undefined) { 
    const response = await fetch(URL.concat('/pimms/credentials'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = response.json();
    return data;

}
