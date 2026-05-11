// server.js
// Tutorial Node.js HTTP server built on Express.js. Exposes two GET endpoints:
//   GET /              -> responds with the plain-text body "Hello world"
//   GET /good-evening  -> responds with the plain-text body "Good evening"
// This file is the only application source file in the project; the entrypoint
// is declared in package.json under the "main" field.

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Baseline tutorial endpoint. Preserves the response body the user described
// as the existing behavior of the project.
app.get('/', (req, res) => {
  res.send('Hello world');
});

// New endpoint added per the user's request. The path /good-evening is the
// kebab-case route name chosen because the user specified the response body
// but did not specify a path; kebab-case is the idiomatic Express convention.
app.get('/good-evening', (req, res) => {
  res.send('Good evening');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
