const { app } = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  process.stdout.write(`Auth service listening on ${port}\n`);
});
