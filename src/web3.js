const Web3 = require('web3');

module.exports = {

  instance: null,

  accounts: {},

  init(addr, accounts) {
    this.instance = new Web3(addr);
    this.accounts = accounts.trim().split(',')
      .filter(v => !!v)
      .map(pkey => this.instance.eth.accounts.privateKeyToAccount(pkey))
      .reduce((obj, acc) => Object.assign(obj, { [acc.address]: acc }), {});
  },

  sign(sender, tx) {
    if (!(sender in this.accounts)) {
      throw new Error('sender not found');
    }
    return this.accounts[sender].signTransaction(tx);
  }

}