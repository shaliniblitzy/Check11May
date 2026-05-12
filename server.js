/**
 * server.js — Express Application Entry Point
 * ---------------------------------------------------------------------------
 * This file is the sole source module of the Check11May project. It boots a
 * minimal Express 5.x HTTP server that exposes exactly two GET endpoints
 * returning static-string responses, plus a baseline fingerprinting-reduction
 * default required by AAP § 0.5.1 and § 0.5.3.
 *
 * The user's literal request (preserved verbatim in AAP § 0.1.2) is:
 *   "this is a tutorial of node js server hosting one endpoint that returns
 *    the response 'Hello world'. Could you add expressjs into the project
 *    and add another endpoint that return the reponse of 'Good evening'?"
 *
 * Endpoints implemented:
 *   GET /              -> "Hello world"   (realizes the absent baseline)
 *   GET /good-evening  -> "Good evening"  (user's new endpoint)
 *
 * Security-conscious defaults applied from inception (AAP § 0.5.3 table):
 *   - app.disable('x-powered-by') removes the X-Powered-By: Express header,
 *     reducing trivial server fingerprinting per the Express maintainers'
 *     published guidance (AAP § 0.2.2 research).
 *   - Both endpoints return literal strings with no interpolation, no
 *     templating, and no use of req-derived input — eliminating XSS,
 *     injection, CSRF, SSRF, and deserialization surfaces by construction.
 *   - The listen address is left to Node's default (no explicit 0.0.0.0
 *     broadening of exposure).
 *
 * Module system: CommonJS (require / module-scoped state). The companion
 * package.json deliberately does NOT set "type": "module".
 * ---------------------------------------------------------------------------
 */

'use strict';

// Single direct dependency declared in package.json (express@^5.2.1).
// CommonJS interop with Express 5.x is fully supported per AAP § 0.2.2
// research, so `require` is the correct import form for this project.
const express = require('express');

// Instantiate the Express application exactly once. `app` is module-scoped
// and is not exported — the file is the runnable entry point invoked by
// `node server.js` (or `npm start`), not an importable library.
const app = express();

// ---------------------------------------------------------------------------
// Security-conscious defaults
// ---------------------------------------------------------------------------
// Disable the X-Powered-By response header BEFORE any route is registered.
// Although disabling this header is not itself a vulnerability remediation,
// the Express maintainers explicitly recommend it as a baseline measure to
// reduce server-fingerprinting attack reconnaissance (AAP § 0.5.1, § 0.5.3).
// This is the principal security-defaults verification performed by the AAP
// § 0.8.2 fingerprinting-header check.
app.disable('x-powered-by');

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------
// Both handlers return literal strings via res.send. They do not read from
// `req.body`, `req.query`, `req.params`, or `req.headers`, and they do not
// concatenate, template, or interpolate any value into the response body.
// This is what eliminates user-input-driven attack surfaces by construction
// (AAP § 0.5.3 "Endpoints return static strings, accept no input").

// GET / — returns the static string "Hello world".
// Express's res.send defaults the Content-Type to "text/html; charset=utf-8"
// for string payloads, which is acceptable for the static-text use case.
app.get('/', (req, res) => {
  res.send('Hello world');
});

// GET /good-evening — returns the static string "Good evening".
// The route path is the literal "/good-evening" (hyphenated), matching the
// AAP § 0.1.3 mapping for the user's new endpoint.
app.get('/good-evening', (req, res) => {
  res.send('Good evening');
});

// ---------------------------------------------------------------------------
// HTTP listener
// ---------------------------------------------------------------------------
// Port resolution: prefer process.env.PORT (set by container orchestrators,
// PaaS hosts, and many CI environments); fall back to 3000 otherwise. The
// fallback literal matches the AAP indicative shape (AAP § 0.6.2) exactly.
// No specific interface is bound — Node's default behaviour is preserved
// per AAP § 0.5.3 (no explicit broadening of exposure).
const port = process.env.PORT || 3000;

// Start listening. The callback runs once the socket is bound, logging the
// active port for operator visibility. console.log is sufficient — the AAP
// § 0.9.2 explicitly excludes structured logging libraries from scope.
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
