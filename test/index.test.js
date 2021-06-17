const fs = require('fs');
const assert = require('assert');
const fetch = require('node-fetch');

async function post(method, data) {
  const res = await fetch(`http://localhost:8889/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

describe('RPC', function () {
  describe('deploy', function () {
    it('empty contract', async function () {
      this.timeout(10000);
      const res = await post('deploy', {
        source: '//SPDX-License-Identifier: MIT\n pragma solidity ^0.8.1;\n',
        compiler: '0.8.1',
        contract: {
          from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
          name: 'Owner',
          args: [],
        }
      });
      assert.ok(res.error, 'should be error');
      assert.ok(res.message, 'Contract "Owner" not found');
    });
    it('bad source', async function () {
      const res = await post('deploy', {
        source: '//SPDX-License-Identifier: MIT\n pragma solidity ^0.8.1;\n contract Owner{ address owner }',
        compiler: '0.8.1',
        contract: {
          from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
          name: 'Owner',
          args: [],
        }
      });
      assert.ok(res.error, 'should be error');
    });
    it('good source', async function () {
      const res = await post('deploy', {
        source: '//SPDX-License-Identifier: MIT\n pragma solidity ^0.8.1;\n contract Owner {}',
        compiler: '0.8.1',
        contract: {
          from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
          name: 'Owner',
          args: [],
        }
      });
      assert.ok(res.uuid, 'should be uuid');
      assert.ok(res.address, 'should be address');
    });
  });
  describe('read', function () {
    let uuid;
    it('deploy', async function () {
      const res = await post('deploy', {
        source: fs.readFileSync('./test/Ownable.sol', { encoding: 'utf-8' }),
        compiler: '0.8.1',
        contract: {
          from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
          name: 'Ownable',
          args: [],
        }
      });
      assert.ok(res.uuid, 'should be uuid');
      uuid = res.uuid;
    });
    it('no function', async function () {
      const res = await post('read', {
        uuid,
        func: 'getOwner2',
        args: null,
        from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
      });
      assert.ok(res.error, 'should be error');
    });
    it('bad args', async function () {
      const res = await post('read', {
        uuid,
        func: 'getOwner',
        args: ['0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b'],
        from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
      });
      assert.ok(res.error, 'should be error');
    });
    it('good call', async function () {
      const res = await post('read', {
        uuid,
        func: 'getOwner',
        from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
      });
      assert.equal(res['0'], '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b');
      assert.equal(res['1'], '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b');
    });
  });
  describe('send', function () {
    let uuid;
    it('deploy', async function () {
      const res = await post('deploy', {
        source: fs.readFileSync('./test/Ownable.sol', { encoding: 'utf-8' }),
        compiler: '0.8.1',
        contract: {
          from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
          name: 'Ownable',
          args: [],
        }
      });
      uuid = res.uuid;
      assert.ok(res.uuid, 'should be uuid');
    });
    it('no function', async function () {
      const res = await post('send', {
        uuid,
        func: 'changeOwner2',
        args: ['0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b'],
        from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
      });
      assert.ok(res.error, 'should be error');
    });
    it('bad args', async function () {
      const res = await post('send', {
        uuid,
        func: 'changeOwner',
        args: ['0x'],
        from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
      });
      assert.ok(res.error, 'should be error');
    });
    it('good call', async function () {
      const res = await post('send', {
        uuid,
        func: 'changeOwner',
        args: ['0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b'],
        from: '0x2e8E6cBe91e4EFAb45Ebb21b9Aef64283F26833b',
      });
      assert.ok(res.transactionHash, 'should be hash');
      assert.ok(res.logs, 'should be hash');
    });
  });
});