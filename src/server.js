const app = require('./app');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error(`Server failed to bind to port ${PORT}: ${err.code} ${err.message}`);
  process.exit(1);
});
