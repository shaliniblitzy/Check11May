const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('returns 200 with "Hello world" body', async () => {
    await request(app)
      .get('/')
      .expect(200)
      .expect('Hello world');
  });

  it('returns text/html content type', async () => {
    await request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('is case-sensitive (HELLO → 404)', async () => {
    await request(app)
      .get('/HELLO')
      .expect(404);
  });

  it('rejects non-GET methods (POST → 404)', async () => {
    await request(app)
      .post('/')
      .expect(404);
  });

  it('is idempotent across repeated calls', async () => {
    await request(app)
      .get('/')
      .expect(200)
      .expect('Hello world');
    await request(app)
      .get('/')
      .expect(200)
      .expect('Hello world');
  });
});

describe('GET /good-evening', () => {
  it('returns 200 with "Good evening" body', async () => {
    await request(app)
      .get('/good-evening')
      .expect(200)
      .expect('Good evening');
  });

  it('returns text/html content type', async () => {
    await request(app)
      .get('/good-evening')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('is case-sensitive (Good-Evening → 404)', async () => {
    await request(app)
      .get('/Good-Evening')
      .expect(404);
  });

  it('rejects non-GET methods (POST → 404)', async () => {
    await request(app)
      .post('/good-evening')
      .expect(404);
  });

  it('is idempotent across repeated calls', async () => {
    await request(app)
      .get('/good-evening')
      .expect(200)
      .expect('Good evening');
    await request(app)
      .get('/good-evening')
      .expect(200)
      .expect('Good evening');
  });
});

describe('unknown routes', () => {
  it('unmatched path returns 404', async () => {
    await request(app)
      .get('/does-not-exist')
      .expect(404);
  });
});
