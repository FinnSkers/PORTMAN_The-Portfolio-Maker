// Placeholder test for backend health endpoint
const axios = require('axios');

describe('Backend Health Check', () => {
  it('should return status ok', async () => {
    const res = await axios.get('http://localhost:5000/api/health');
    expect(res.data.status).toBe('ok');
  });
});
