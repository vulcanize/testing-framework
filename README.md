# Testing Framework
To start the application, you need to enter the command `npm start`

__Environment variables__:
- `PORT`     - network listening port 
- `GETH`     - address of geth rpc server 
- `ACCOUNTS` - list of private keys separated by commas

To run the tests you need to enter the commands:
```
npm run test:ganache
npm run test:start
npm test
```

## List of http methods
### Deploy smart-contract
Request:
```
POST /deploy
Content-Type: application/json
{
  "source": "<smart contract source code>",
  "compiler": "<solidity compiler version>",
  "contract": {
    "name": "<the name of the smart contract, which will be deployed to the blockchain>",
    "args": "[<enumeration of smart contract constructor arguments>]",
    "from": "<the account address, which will be used when deploying>"
  }
}
```
Response:
```
{
  uuid: "<unique number of the deployed smart contract>",
  address: "<address of the deployed smart contract>"
}
```

### Read data from smart-contract
Request:
```
POST /read
{
  uuid: "<unique number of the deployed smart contract>",
  func: "<smart contract method>",
  args: "<smart contract method arguments>",
  from: "<the account address, which will be used when calling>",
}
```
Response: depends on smart contract

### Write data to smart-contract
Request:
```
POST /send
{
  uuid: "<unique number of the deployed smart contract>",
  func: "<smart contract method>",
  args: "<smart contract method arguments>",
  from: "<the account address, which will be used when calling>",
  value: "<amount of wei to be sent to the method>"
}
```
Response: [transaction receipt](https://web3js.readthedocs.io/en/v1.3.4/web3-eth.html#gettransactionreceipt) 
