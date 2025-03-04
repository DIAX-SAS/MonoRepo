import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  logLevel: keyof typeof LogLevel;
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
  };
  maxObjects:number;
}

export const config: Config = {
  site: {
    name: 'DIAX"s DASHBOARD',
    description: '',
    themeColor: '#090a0b',
    url: getSiteURL(),
  },
  logLevel:
    (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) ??
    LogLevel.ALL,
  socketURL: 'wss://d0978261uk2h0hot7q0x-ats.iot.us-east-1.amazonaws.com',
  lapseLive: 2 * 60 * 60 * 1000, // must be in miliseconds
  paginationLength: 500,
  maxObjects:7200,
  stateKeys: ['MI31', 'MI19', 'ML1', 'ML5', 'ML3','MI18'],
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
    logoutUri: 'http://localhost/auth/sign-in',
    cognitoDomain: 'https://crud-diax.auth.us-east-1.amazoncognito.com',
  }
};
