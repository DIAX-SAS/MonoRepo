import axios from 'axios';

describe('Account Endpoints', () => {
  let accountId;
  const accountPayload = {
    sub: 'Test Account 1'
  };

  beforeAll(async () => {
    try {
      const res = await axios.get('/api/account');
      if (res.status === 200 && Array.isArray(res.data)) {
        const accountsToDelete = res.data.filter(account => account.sub === accountPayload.sub);
        await Promise.all(
          accountsToDelete.map(account => axios.delete(`/api/account/${account._id}`))
        );
      }
    } catch (error) {
      console.error('Error cleaning up existing accounts:', error);
    }
  });
  
  it('POST /account should create an account', async () => {
    const res = await axios.post(`/api/account`, accountPayload);
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('_id');
    accountId = res.data._id;
    expect(res.data.sub).toEqual(accountPayload.sub);
  });

  it('GET /account should return list of accounts', async () => {
    const res = await axios.get(`/api/account`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data).toBeDefined();
  });

  it('GET /account/:id should return a specific account', async () => {
    const res = await axios.get(`/api/account/${accountId}`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('_id', accountId);
  });

  it('PATCH /account/:id should update an account', async () => {
    const noUpdatePayload = { sub: 'No Update Account' };
    const updatePayload = { sub: 'Updated Account' };
    const resCreate = await axios.post(`/api/account`, noUpdatePayload);
    const res = await axios.patch(`/api/account/${resCreate.data._id}`, updatePayload);
    expect(res.status).toBe(200);
    expect(res.data.sub).toEqual(updatePayload.sub);
  });

  it('GET /account/:id with invalid id should return 404', async () => {
    try {
      await axios.get(`/api/account/invalid-id`);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  it('DELETE /account/:id should delete an account', async () => {
    const resPost = await axios.post(`/api/account`, {sub:"delete me"});
    const res = await axios.delete(`/api/account/${resPost.data._id}`);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ deleted: true });
  });

  afterAll(async () => {
    try {
      const res = await axios.get('/api/account');
      if (res.status === 200 && Array.isArray(res.data)) {
        const testAccounts = res.data.filter(account =>
          ['Test Account 1', 'No Update Account', 'Updated Account', 'delete me'].includes(account.sub)
        );
        await Promise.all(
          testAccounts.map(account => axios.delete(`/api/account/${account._id}`))
        );
      }
    } catch (error) {
      console.error('Error cleaning up test accounts after tests:', error);
    }
  });
});
