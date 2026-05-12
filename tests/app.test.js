/**
 * Integration test suite for the Express application exported from src/app.js.
 *
 * --------------------------------------------------------------------------
 * Strategy (per AAP §0.4 — Test Implementation Design)
 * --------------------------------------------------------------------------
 * Supertest invokes the Express request handler in-process against the
 * exported `app` instance (no TCP port is bound for the duration of the
 * test run; Supertest spins up an ephemeral listener per request internally
 * and tears it down immediately). This makes every test parallel-safe,
 * fast, and independent of the host network state.
 *
 * The suite follows the eleven `it()` blocks enumerated in AAP §0.4.2 with
 * exactly one documented deviation — see the comment on the
 * `case-insensitive routing` test inside `describe('GET /good-evening')`.
 *
 * --------------------------------------------------------------------------
 * Deviation from AAP §0.4.2 (resolved per QA Checkpoint 1 — Issue #1)
 * --------------------------------------------------------------------------
 * AAP §0.4.2 row #8 originally specified: `GET /Good-Evening returns 404`.
 *
 * That expectation was based on an incorrect assumption about Express's
 * default routing semantics. Per Express 5 documentation, the application
 * setting `case sensitive routing` defaults to `false` — i.e., routing is
 * case-INSENSITIVE unless explicitly enabled via
 * `app.set('case sensitive routing', true)`. Consequently, the registered
 * `GET /good-evening` handler matches `/Good-Evening`, `/GOOD-EVENING`,
 * and every other case permutation, returning HTTP 200 with the body
 * `Good evening` in each case.
 *
 * Two resolution options were available:
 *   (A) Adjust the tests to assert the actual Express default behavior
 *       (no source modification — honors AAP §0.10.3 "minimal change
 *       principle: do not modify source code unless absolutely necessary
 *       for testability").
 *   (B) Add `app.set('case sensitive routing', true);` to `src/app.js`
 *       (introduces behavior NOT requested by the user, violates §0.10.3).
 *
 * Per the QA Checkpoint 1 Report's Option A recommendation, this suite
 * adopts Option A: `src/app.js` is preserved exactly as authored (idiomatic
 * Express 5 with default case-insensitive routing), and the test below
 * asserts the actual runtime contract — `/Good-Evening` returns 200 with
 * body `Good evening`. This honestly documents the application's behavior
 * rather than asserting a behavior that does not exist.
 *
 * Row #3 of AAP §0.4.2 (`GET /HELLO returns 404`) is also reframed: the
 * underlying assertion (404 for unrelated paths) is preserved because it
 * passes correctly, but the `it()` description is rewritten to accurately
 * describe what is being tested — `/HELLO` is not actually a case variant
 * of `/` (the registered route is the empty path after the leading slash);
 * `/HELLO` is an entirely different path, and Express returns 404 because
 * no handler is registered for it. The functional coverage is identical;
 * only the test description is clarified.
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('returns 200 with "Hello world" body', async () => {
    // AAP §0.1.1 normative response string: literal `Hello world` (11 bytes).
    await request(app).get('/').expect(200).expect('Hello world');
  });

  it('returns text/html content type (Express res.send(string) default)', async () => {
    // Express's `res.send(string)` defaults Content-Type to
    // `text/html; charset=utf-8`. The regex tolerates any future charset
    // change while still asserting the primary content type.
    await request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('returns 404 for unrelated paths such as /HELLO', async () => {
    // Reframed from AAP §0.4.2 row #3: `/HELLO` is not a case variant of
    // `/` (the registered route is the root path; `/HELLO` is an entirely
    // different path). Express returns 404 because no `/HELLO` handler is
    // registered. The 404 behavior is unaffected by `case sensitive routing`.
    await request(app).get('/HELLO').expect(404);
  });

  it('rejects non-GET methods (POST /) with 404', async () => {
    // Express's default behavior for an unregistered method on a defined
    // path is 404, not 405 — see AAP §0.4.2 row #4. Only `GET /` is
    // registered, so `POST /` matches no route and falls through to the
    // default 404 handler.
    await request(app).post('/').expect(404);
  });

  it('is idempotent across repeated calls (statelessness)', async () => {
    // The handler is `res.send('Hello world')` — pure, deterministic,
    // stateless. Two sequential GETs must return identical responses.
    const first = await request(app).get('/').expect(200);
    const second = await request(app).get('/').expect(200);
    expect(first.text).toBe('Hello world');
    expect(second.text).toBe('Hello world');
    expect(first.text).toBe(second.text);
  });
});

describe('GET /good-evening', () => {
  it('returns 200 with "Good evening" body', async () => {
    // AAP §0.1.1 normative response string: literal `Good evening` (12 bytes).
    await request(app)
      .get('/good-evening')
      .expect(200)
      .expect('Good evening');
  });

  it('returns text/html content type (Express res.send(string) default)', async () => {
    await request(app)
      .get('/good-evening')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('matches case-insensitively per Express 5 defaults (e.g., /Good-Evening returns 200)', async () => {
    // ----------------------------------------------------------------------
    // DEVIATION FROM AAP §0.4.2 row #8 — see file-level comment for context
    // ----------------------------------------------------------------------
    // AAP §0.4.2 row #8 originally asserted `GET /Good-Evening returns 404`.
    // Express 5's `case sensitive routing` setting defaults to `false`, so
    // `/Good-Evening` matches the registered `/good-evening` route and
    // returns 200 with body `Good evening`.
    //
    // Per QA Checkpoint 1 Report Issue #1 (Option A — minimal change
    // principle, AAP §0.10.3), `src/app.js` is preserved unchanged and this
    // test asserts the actual Express default behavior.
    await request(app)
      .get('/Good-Evening')
      .expect(200)
      .expect('Good evening');
  });

  it('rejects non-GET methods (POST /good-evening) with 404', async () => {
    // Mirrors the equivalent assertion on `/` — only `GET /good-evening`
    // is registered, so any other method returns 404.
    await request(app).post('/good-evening').expect(404);
  });

  it('is idempotent across repeated calls (statelessness)', async () => {
    const first = await request(app).get('/good-evening').expect(200);
    const second = await request(app).get('/good-evening').expect(200);
    expect(first.text).toBe('Good evening');
    expect(second.text).toBe('Good evening');
    expect(first.text).toBe(second.text);
  });
});

describe('unknown routes', () => {
  it('returns 404 for /does-not-exist', async () => {
    // AAP §0.4.2 row #11 — the catch-all 404 assertion for any path that
    // does not match a registered route.
    await request(app).get('/does-not-exist').expect(404);
  });
});
