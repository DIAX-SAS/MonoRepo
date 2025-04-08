import { AccessToken, FilterPimmsDto, ResponsePimms } from '../../app/dashboard/dashboard.types';
import { config } from '../../config';

const URL = config.backendURL;


export async function fetchData(auth: AccessToken, parameters:FilterPimmsDto ):Promise<ResponsePimms> {
  const response = await fetch(URL.concat('/pimms'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.accessToken}`,
    },
    body: JSON.stringify(parameters),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const responseContent = await response.json();
  return responseContent;
}

export async function fetchCredentialsCore(auth: AccessToken) {
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
