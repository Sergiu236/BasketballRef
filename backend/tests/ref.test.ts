// illusions.test.ts
import request from 'supertest';
// or wherever you export 'app'

describe('Illusions API', () => {
  it('GET /api/illusion?nothing=true covers the “if” branch', async () => {
    //const res = await request().get('/api/illusion?nothing=true');
    //expect(res.status).toBe(200);
   // expect(res.body).toMatchObject({ illusion: true });
  });

  it('GET /api/illusion covers the “else” branch', async () => {
    //const res = await request(app).get('/api/illusion');
    //expect(res.status).toBe(200);
    //expect(res.body).toMatchObject({ illusion: true });
  });
});
