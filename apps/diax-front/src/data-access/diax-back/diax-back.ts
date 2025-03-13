import { config } from '../../config';
import { InfoSettings, ResponsePIMM } from '@repo-hub/internal';

const URL = config.backendURL;

export async function fetchData(auth: { accessToken: string | undefined }, infoSettings: InfoSettings) {
  const response = await fetch(URL.concat('/pimms'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.accessToken}`,
    },
    body: JSON.stringify(infoSettings),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const responseContent: ResponsePIMM = await response.json();
  return responseContent;
}

export async function fetchCredentialsCore(auth: { accessToken: string | undefined }) {
  const response = await fetch(URL.concat('/pimms/credentials'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
