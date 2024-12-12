import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  logLevel: keyof typeof LogLevel;
  socketURL:string;
}

export const config: Config = {
  site: { name: 'DIAX"s DASHBOARD', description: '', themeColor: '#090a0b', url: getSiteURL() },
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) ?? LogLevel.ALL,
  socketURL: "wss://49oysij3mj.execute-api.us-east-1.amazonaws.com/desarrollo/"
};

export async function getSecrets(secret_name:string){

const client = new SecretsManagerClient({
  region: 'us-east-1',
});

const response = await client.send(
  new GetSecretValueCommand({
    SecretId: secret_name,
    VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
  })
);
return (response.SecretString || "{}");
}