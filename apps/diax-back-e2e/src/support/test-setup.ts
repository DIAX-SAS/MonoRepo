import { AuthFlowType, CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({
  path: "../../.env"
});
module.exports = async function () {
  async function getFromCognito(): Promise<string> {
    const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
  
    const params = {
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: process.env.COGNITO_TEST_USER,
        PASSWORD: process.env.COGNITO_TEST_PASSWORD,
      },
    };
  
    try {
      const command = new InitiateAuthCommand(params);
      const response = await client.send(command);
  
      if (!response.AuthenticationResult || !response.AuthenticationResult.IdToken) {
        throw new Error('Failed to authenticate with Cognito');
      }
  
      return response.AuthenticationResult.IdToken;
    } catch (error) {
      console.error('Error getting token from Cognito:', error);
      throw error;
    }
  }
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.BACK_PORT ?? '3000';
  axios.defaults.headers.common['Authorization'] = `Bearer ${await getFromCognito()}`;
  axios.defaults.baseURL = `http://${host}:${port}`;
};
