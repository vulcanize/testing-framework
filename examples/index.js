const fs = require('fs');
const fetch = require('node-fetch');

main().catch(console.log);

async function main() {
  const source = fs.readFileSync('./examples/Ownable.sol', { encoding: 'utf-8' });
  const client = tfclient('http://localhost:3000');

  const resp1 = await client.deploy({
    source: source,
    compiler: '0.8.1',
    contract: {
      from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
      name: 'Ownable',
      args: [],
    }
  })
  console.log(resp1);

  const resp2 = await client.read({
    uuid: resp1.uuid,
    func: 'getOwner',
    args: [],
    from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b'
  });
  console.log(resp2);

  const resp3 = await client.send({
    uuid: resp1.uuid,
    func: 'changeOwner',
    args: ['0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b'],
    from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b'
  });
  console.log(resp3);
}

function tfclient(basepath) {
  async function post(method, data) {
    const res = await fetch(`${basepath}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
  return {
    deploy(data) {
      return post('deploy', data)
    },
    read(data) {
      return post('read', data)
    },
    send(data) {
      return post('send', data)
    }
  }
}
