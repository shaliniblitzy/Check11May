const express = require('express');

const app = express();

app.set('case sensitive routing', true);

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.get('/good-evening', (req, res) => {
  res.send('Good evening');
});

module.exports = app;
