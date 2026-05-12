// server.js — Express-based tutorial server for the Check11May project.
// Created as part of the feature: introduce Express and add a "Good evening" endpoint
// alongside the original "Hello world" endpoint that the tutorial expects.

const express = require('express');           // Import the Express framework (CommonJS require)
const app = express();                         // Create an Express application instance
const PORT = process.env.PORT || 3000;         // PORT is configurable via env; defaults to 3000 per tutorial convention

// Original tutorial endpoint: responds with "Hello world" at the root path.
// Implemented here because the repository had no prior server file — see Agent Action Plan §0.2.
app.get('/', (req, res) => {
  res.send('Hello world');
});

// New endpoint requested by the user: responds with "Good evening".
// The path "/good-evening" was chosen as the URL-safe lowercase-hyphenated form of the response phrase.
app.get('/good-evening', (req, res) => {
  res.send('Good evening');
});

// Start the HTTP listener. Logging the bound port helps tutorial learners verify the server is up.
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
