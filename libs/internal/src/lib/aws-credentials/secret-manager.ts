import {
    SecretsManagerClient,
    GetSecretValueCommand,
  } from '@aws-sdk/client-secrets-manager';


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