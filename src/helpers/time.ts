// @ts-ignore
const pify = require('pify');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const ethAsync = pify(web3.eth);
const ethGetBlock = ethAsync.getBlock;

web3.currentProvider.sendAsync =  web3.currentProvider.send;

export async function advanceBlock () {
    console.log("\tadvancing ");
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: new Date().getTime()
    });
    console.log("\tadvanced");
}

