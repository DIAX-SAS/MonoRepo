export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  socketURL: string;
  lapseLive: number;
  paginationLength: number;
  stateKeys: string[];
  offsetKeys: string[];
  keyPIMMNumber: string;
  auth: {
    clientId: string;
    logoutUri: string;
    cognitoDomain: string;
    authority: string;
    redirectUri: string;
    response_type: string;
    scope: string;
  };
  maxObjects: number;
  backendURL: string;
}

export const config: Config = {
  site: {
    name: 'DIAX"s DASHBOARD',
    description: '',
    themeColor: '#090a0b',
    url: 'http://localhost:4000',
  },
  socketURL: 'wss://d0978261uk2h0hot7q0x-ats.iot.us-east-1.amazonaws.com',
  lapseLive: 2 * 60 * 60 * 1000, // must be in miliseconds
  paginationLength: 500,
  maxObjects: 7200,
  stateKeys: ['MI31', 'MI19', 'ML1', 'ML5', 'ML3', 'MI18'],
  offsetKeys: [
    'ML0',
    'ML131',
    'ML135',
    'MI100',
    'MI99',
    'MI121',
    'MI122',
    'MI123',
    'MI124',
    'MI125',
    'MI126',
    'MI127',
    'MI128',
    'MI129',
    'MI101',
    'MI102',
  ],
  keyPIMMNumber: 'MI31',
  auth: {
    clientId: '1dgddk7rc0bir0mt3g403kojcc',
    logoutUri: 'http://localhost:4000/sign-in',
    cognitoDomain: 'https://crud-diax.auth.us-east-1.amazoncognito.com',
    authority:
      'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_bHo9GIUJg',
    redirectUri: 'http://localhost:4000/'.concat('redirect'),
    response_type: 'code',
    scope: 'email openid phone',
  },
  backendURL: 'http://localhost:3000/api',
};
