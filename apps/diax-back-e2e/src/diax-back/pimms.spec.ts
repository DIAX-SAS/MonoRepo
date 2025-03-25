import axios from 'axios';
import { AuthFlowType, CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';


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


describe('POST /pimms', () => {
  let infoSettings;
  let authHeaders;
  let axiosOptions;

  beforeEach(async () => {
    // Mock request payload

    infoSettings = {
      filters: {
        initTime: 700001,
        endTime: 700002,
        lastID: null,
        accUnit: 'second',
      },
    };
   const temporalToken = await getFromCognito();

    // Mock valid authorization header
    authHeaders = {
      headers: { "Authorization": `Bearer ${temporalToken}` },     
    };

    axiosOptions = {
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    }
  });

  it('should return an empty response with second as accUnit', async () => {
    const res = await axios.post(`/api/pimms`, infoSettings, {...authHeaders,...axiosOptions});
    expect(res.data).toEqual({ lastID: null, pimms: [], totalProcessed: 0 });
    expect(res.status).toBe(201);
  });
  it('should return an empty response with minute as accUnit', async () => {
    infoSettings.filters.accUnit = 'minute';
    const res = await axios.post(`/api/pimms`, infoSettings, {...authHeaders,...axiosOptions});
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ lastID: null, pimms: [], totalProcessed: 0 });
  });

  it('should return an empty response with hour as accUnit', async () => {
    infoSettings.filters.accUnit = 'hour';
    const res = await axios.post(`/api/pimms`, infoSettings, {...authHeaders,...axiosOptions});
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ lastID: null, pimms: [], totalProcessed: 0 });
  });

  it('should return error when initTime is not a number', async () => {
    const invalidSettings = { filters: { ...infoSettings.filters, initTime: 'mocked-initTime' } };
    const res = await axios.post(`/api/pimms`, invalidSettings, {...authHeaders,...axiosOptions});
    expect(res.status).toBe(400);
    expect(res.data.message.length).toBeGreaterThan(0);
  });

   it('should return error when endTime is not a number', async () => {
     const invalidSettings = { filters: { ...infoSettings.filters, endTime: 'mocked-endTime' } };
     const res = await axios.post(`/api/pimms`, invalidSettings, {...authHeaders,...axiosOptions});
     expect(res.status).toBe(400);
    expect(res.data.message.length).toBeGreaterThan(0);
   })
   it('should return error when accUnit is invalid', async () => {
     const invalidSettings = { filters: { ...infoSettings.filters, accUnit: 'mocked-accUnit' } };
     const res = await axios.post(`/api/pimms`, invalidSettings, {...authHeaders,...axiosOptions});
     expect(res.status).toBe(400);
      expect(res.data.message.length).toBeGreaterThan(0);
   })
   it('should return error when lastID is not a number', async () => {
     const invalidSettings = { filters: { ...infoSettings.filters, lastID: 'mocked-lastID' } };
     const res = await axios.post(`/api/pimms`, invalidSettings, {...authHeaders,...axiosOptions});
     expect(res.status).toBe(400);
    expect(res.data.message.length).toBeGreaterThan(0);
   })
  it('should return error when filters object is missing', async () => {
    const res = await axios.post(`/api/pimms`, {...infoSettings.filters}, {...authHeaders,...axiosOptions});
    expect(res.status).toBe(400);
    expect(res.data.message.length).toBeGreaterThan(0);
  })
   it('should return Invalid Request when token is missing', async () => {
     const res = await axios.post(`/api/pimms`, infoSettings,{...axiosOptions});   
     expect(res.status).toBe(400);
     expect(res.data).toHaveProperty("error");     
   });

   it('should return unauthorized when token is invalid', async () => {
     const invalidAuthHeaders = { headers: { Authorization: 'Bearer invalidToken' } };
     const res = await axios.post(`/api/pimms`, infoSettings, {...invalidAuthHeaders, ...axiosOptions});
     expect(res.status).toBe(401);
     expect(res.data).toHaveProperty("message");  
   });

});


 describe('GET /pimms/credentials', () => {
   let authHeaders;
   let axiosOptions
   beforeEach(async () => {
    const temporalToken = await getFromCognito()
     // Mock valid authorization header
     authHeaders = {
       headers: { "Authorization": `Bearer ${temporalToken}` },     
     }
     axiosOptions = {
       validateStatus: function (status) {
         return status < 500; // Resolve only if the status code is less than 500
       }
     }
   })
   it('should return a valid token', async () => {
     const res = await axios.get(`/api/pimms/credentials`, {...authHeaders,...axiosOptions});
     expect(res.status).toBe(200);
     expect(res.data).toHaveProperty('token'); // Allow any token value
   })
   it('should return invalid request if token is missing', async () => {
     const res = await axios.get(`/api/pimms/credentials`, {...axiosOptions});
     expect(res.status).toBe(400);
     expect(res.data).toHaveProperty("message"); 
   })
   it('should return forbidden if token is invalid', async () => {
     const invalidAuthHeaders = { headers: { Authorization: 'Bearer invalidToken' } };
     const res = await axios.get(`/api/pimms/credentials`, {...invalidAuthHeaders, ...axiosOptions});
     expect(res.status).toBe(401);
    expect(res.data).toHaveProperty("message"); 
   });
 });

