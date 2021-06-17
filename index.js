
const fastify = require('fastify')({ logger: true });
const web3 = require('./src/web3');

const port = process.env.PORT     || '3000';
const host = process.env.HOST     || '127.0.0.1';
const geth = process.env.GETH     || 'http://localhost:8545';
const accs = process.env.ACCOUNTS || '';

web3.init(geth, accs);
fastify.register(require('./src/deploy'));
fastify.register(require('./src/read'));
fastify.register(require('./src/send'));

fastify.listen(port, host, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
});