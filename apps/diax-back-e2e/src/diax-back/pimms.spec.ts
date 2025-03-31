import axios from 'axios';

const axiosOptions = {
  validateStatus: function (status) {
    return status < 500; // Resolve only if the status code is less than 500
  }
}
describe('POST /pimms', () => {
  let infoSettings;

  beforeEach(async () => {  

    infoSettings = {
        initTime: 700001,
        endTime: 700002,
        lastID: null,
        stepUnit: 'second',
    };
  
  });

  it('should return an empty response with second as stepUnit', async () => {   
    const res = await axios.post(`/api/pimms`, infoSettings, {...axiosOptions});
    expect(res.data).toEqual({ lastID: null, pimms: [], totalProcessed: 0 });
    expect(res.status).toBe(201);   
  });
  it('should return an empty response with minute as stepUnit', async () => {
    infoSettings.stepUnit = 'minute';
    const res = await axios.post(`/api/pimms`, infoSettings, {...axiosOptions});
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ lastID: null, pimms: [], totalProcessed: 0 });
  });

  it('should return an empty response with hour as stepUnit', async () => {
    infoSettings.stepUnit = 'hour';
    const res = await axios.post(`/api/pimms`, infoSettings, {...axiosOptions});
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ lastID: null, pimms: [], totalProcessed: 0 });
  });

  it('should return error when initTime is not a number', async () => {
    const invalidSettings =  { ...infoSettings.filters, initTime: 'mocked-initTime' };
    const res = await axios.post(`/api/pimms`, invalidSettings, {...axiosOptions});
    expect(res.status).toBe(400);
    expect(res.data.message.length).toBeGreaterThan(0);
  });

   it('should return error when endTime is not a number', async () => {
     const invalidSettings ={ ...infoSettings.filters, endTime: 'mocked-endTime' };
     const res = await axios.post(`/api/pimms`, invalidSettings, {...axiosOptions});
     expect(res.status).toBe(400);
    expect(res.data.message.length).toBeGreaterThan(0);
   })
   it('should return error when stepUnit is invalid', async () => {
     const invalidSettings = { ...infoSettings.filters, stepUnit: 'mocked-stepUnit'  };
     const res = await axios.post(`/api/pimms`, invalidSettings, {...axiosOptions});
     expect(res.status).toBe(400);
      expect(res.data.message.length).toBeGreaterThan(0);
   })
   it('should return error when lastID is not a number', async () => {
     const invalidSettings = { ...infoSettings.filters, lastID: 'mocked-lastID'  };
     const res = await axios.post(`/api/pimms`, invalidSettings, {...axiosOptions});
     expect(res.status).toBe(400);
    expect(res.data.message.length).toBeGreaterThan(0);
   })
  it('should return error when filters object is missing', async () => {
    const res = await axios.post(`/api/pimms`, {...infoSettings.filters}, {...axiosOptions});
    expect(res.status).toBe(400);
    expect(res.data.message.length).toBeGreaterThan(0);
  })
   it('should return Invalid Request when token is missing', async () => {
    const invalidAuthHeaders = { headers:{"Authorization":""}};
     const res = await axios.post(`/api/pimms`, infoSettings,{...invalidAuthHeaders,...axiosOptions});   
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


 describe('GET /pimms/iot/credentials', () => { 
   it('should return a valid token', async () => {
     const res = await axios.get(`/api/pimms/iot/credentials`, {...axiosOptions});
     expect(res.status).toBe(200);
     expect(res.data).toHaveProperty('token'); // Allow any token value
   })
   it('should return invalid request if token is missing', async () => {
     const invalidAuthHeaders = { headers:{"Authorization":""}};
     const res = await axios.get(`/api/pimms/iot/credentials`, {...invalidAuthHeaders,...axiosOptions});
     expect(res.status).toBe(400);
     expect(res.data).toHaveProperty("message"); 
   })
   it('should return forbidden if token is invalid', async () => {
     const invalidAuthHeaders = { headers: { Authorization: 'Bearer invalidToken' } };
     const res = await axios.get(`/api/pimms/iot/credentials`, {...invalidAuthHeaders, ...axiosOptions});
     expect(res.status).toBe(401);
    expect(res.data).toHaveProperty("message"); 
   });
 });

