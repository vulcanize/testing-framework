const memory = require('./memory');
const web3 = require('./web3');

const schema = {
  body: {
    type: 'object',
    properties: {
      uuid: { type: 'string' },
      func: { type: 'string' },
      args: { type: 'array' },
      from: { type: 'string' },
      value: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'any',
    },
  },
};

async function handler(req, reply) {
  const { address, abi } = memory.get(req.body.uuid);
  const contract = new web3.instance.eth.Contract(abi, address);

  if (!(req.body.func in contract.methods)) {
    throw new Error(`method "${req.body.func}" not found`);
  }

  const from = req.body.from;
  const value = req.body.value;

  const data = await contract.methods[req.body.func](...(req.body.args || [])).encodeABI();
  const [nonce, gas] = await Promise.all([
    web3.instance.eth.getTransactionCount(from, 'pending'),
    web3.instance.eth.estimateGas({ from, to: address, data, value }),
  ]);
  const tx = await web3.sign(from, { to: address, nonce, gas, data, value });
  const re = await web3.instance.eth.sendSignedTransaction(tx.rawTransaction);

  reply.send(re);
}

module.exports = function (fastify, opts, done) {
  fastify.post('/send', schema, handler);
  done();
}