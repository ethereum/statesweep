var Rpc = require('isomorphic-rpc')
var rpc = new Rpc()

var fs = require("fs");
var orig = require('./data/state_bloat_transactions_original_etc.json');


var output = []
// let histogram = {}
// let keys = []
// let data = {}
// let total = 0
// let start = Date.now()

async function run(){
  // for (var currBlockNum = 2420438; currBlockNum < 2421438; currBlockNum++) {
  for (var index = 0; index < orig.length; index++) {

    let tx = await rpc.eth_getTransactionByHash(orig[index]['txhash'])
    let receipt = await rpc.eth_getTransactionReceipt(orig[index]['txhash'])
    
    let currTx = {}
    currTx['input'] = tx['input']
    currTx['txhash'] = tx['hash']
    currTx['blh'] = tx['blockHash']
    currTx['gasUsed'] = parseInt(receipt['gasUsed'])

    output.push(currTx)
  }

  fs.writeFile("./data/state_bloat_transactions_etc.json", JSON.stringify(output), (err) => {
      if (err) {
          console.error(err);
          return;
      };
      console.log("File has been created");
  });
}


// [{"input": "0xd750a61f90d7697bb4643f963d1293187db30e4044b271a08220a4e88612a5a6", "txhash": "0x116958068fbcc365cd7004c4195b477f68ad1d581b7c3f49956c46d1bfe163d6", "blh": "0x732e2b75b89d7589a2de0c958fb4ffae23d1b68775bd272b54d00fb93e2dd442", "gasUsed": 63280},
// [{"input": "0xd750a61f90d7697bb4643f963d1293187db30e4044b271a08220a4e88612a5a6", "txhash": "0x116958068fbcc365cd7004c4195b477f68ad1d581b7c3f49956c46d1bfe163d6", "blh": "0x1aba711258ccbfe42474f4786b434ff33622f3f6e57b945a5963ed543d98cd45", "gasUsed": 63280},
run()
