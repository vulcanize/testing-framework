const solcjs = require('@truffle/compile-solidity');
const memory = require('./memory');
const web3 = require('./web3');

const schema = {
  body: {
    type: 'object',
    properties: {
      source: { type: 'string' },
      compiler: { type: 'string' },
      contract: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          name: { type: 'string' },
          args: { type: 'array' },
        },
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        uuid: { type: 'string' },
        address: { type: 'string' },
      },
    },
  },
};

async function handler(req, reply) {
  const { compilations } = await solcjs.Compile.sources({
    sources: {
      'contract.sol': req.body.source,
    },
    options: {
      contracts_directory: '',
      compilers: {
        solc: {
          version: req.body.compiler,
          settings: {
            optimizer: {
              enabled: false,
              runs: 200,
            },
          },
        },
      }
    },
  });

  const metadata = compilations[0]?.contracts?.find(({ contractName }) => contractName == req.body.contract.name);
  if (!metadata) {
    throw new Error(`Contract "${req.body.contract.name}" not found`);
  }

  const abi = metadata?.abi;
  if (!metadata?.abi) {
    throw new Error(`Abi for "${req.body.contract.name}" not found`);
  }

  const bytecode = metadata?.bytecode?.bytes;
  if (!metadata?.bytecode?.bytes) {
    throw new Error(`Bytecodes for "${req.body.contract.name}" not found`);
  }

  const from = req.body.contract?.from;
  const data = (new web3.instance.eth.Contract(metadata.abi))
    .deploy({ data: bytecode, arguments: req.body.contract.args })
    .encodeABI();
  const [nonce, gas] = await Promise.all([
    web3.instance.eth.getTransactionCount(from, 'pending'),
    web3.instance.eth.estimateGas({ from, data }),
  ]);
  const tx = await web3.sign(from, { nonce, gas, data });
  const re = await web3.instance.eth.sendSignedTransaction(tx.rawTransaction);

  reply.send({
    uuid: memory.save({ address: re.contractAddress, bytecode, abi }),
    address: re.contractAddress,
    abi,
  });
}

module.exports = function (fastify, opts, done) {
  fastify.post('/deploy', schema, handler);
  done();
}