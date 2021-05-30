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

  const result = await contract.methods[req.body.func](...(req.body.args || [])).call({
    from: req.body.from
  });

  reply.send(JSON.stringify(result));
}

module.exports = function (fastify, opts, done) {
  fastify.post('/read', schema, handler);
  done();
}