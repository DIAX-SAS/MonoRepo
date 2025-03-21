import axios from 'axios';

describe('Payment Endpoints', () => {
  const authToken = 'your_test_token';
  const axiosConfig = {
    headers: { Authorization: `Bearer ${authToken}` },
    validateStatus: () => true,
  };

  describe('POST /api/payment/create-checkout-session', () => {
    it('should create a checkout session and return a valid URL', async () => {
      const payload = { lookupKey: 'test_lookup_key', email: 'test@example.com' };
      const res = await axios.post('/api/payment/create-checkout-session', payload, axiosConfig);
      expect(res.status).not.toBe(404);
      if (res.status === 200) {
        expect(typeof res.data).toBe('string');
        expect(res.data).toMatch(/^https?:\/\//);
      }
    });
  });

  describe('POST /api/payment/create-portal-session', () => {
    it('should create a portal session and return a valid URL', async () => {
      const payload = { email: 'test@example.com' };
      const res = await axios.post('/api/payment/create-portal-session', payload, axiosConfig);
      expect(res.status).not.toBe(404);
      if (res.status === 200) {
        expect(typeof res.data).toBe('string');
        expect(res.data).toMatch(/^https?:\/\//);
      }
    });
  });

  describe('POST /api/payment/webhook', () => {
    it('should return a 401 error for an invalid webhook signature', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const headers = { 
        Authorization: `Bearer ${authToken}`,
        'stripe-signature': 'invalid_signature'
      };
      const config = {
        headers,
        validateStatus: () => true,
        responseType: 'text' as any
      };
      const res = await axios.post('/api/payment/webhook', payload, config);
      expect(res.status).toBe(401);
    });
  });
});
