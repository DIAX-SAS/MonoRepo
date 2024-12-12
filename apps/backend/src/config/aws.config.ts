import { getSecrets } from '@repo-hub/internal';
import * as AWS from 'aws-sdk';

// Your code goes here
export async function configureAWS  () {
  const secret = JSON.parse(await getSecrets("diax/dynamoDB"));
  AWS.config.update({
    region: process.env.DYNAMODB_REGION,
    accessKeyId: secret.CLIENT_ID,
    secretAccessKey: secret.CLIENT_SECRET,
  });
};
