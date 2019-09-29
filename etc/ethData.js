var Rpc = require('isomorphic-rpc')
var rpc = new Rpc()

var json = require('./data/state-sweep-0x7c.json'); // ETH data
console.log("json.length = ", json.length)

var fs = require("fs");

var sbto = []
var missing = []

async function zip(){
  for (var i = 0; i < json.length; i++) {
    let tx = await rpc.eth_getTransactionByHash(json[i]['txhash'])
    if(tx){
      let block = await rpc.eth_getBlockByNumber('0x'+(parseInt(tx['blockNumber'])-1).toString(16), false)
      let obj = {}
      obj['txhash'] = tx['hash']
      obj['blh'] = block['hash']
      sbto.push(obj)
    }else{
      missing.push(json[i]['txhash'])
      console.log("missing tx at json index", i)
    }
  }
  // console.log("\nSBTO\n", sbto)

  fs.writeFile("./data/state_bloat_transactions_original_etc.json", JSON.stringify(sbto), (err) => {
      if (err) {
          console.error(err);
          return;
      };
      console.log("File has been created");
  });
  fs.writeFile("./data/missing_transactions.json", JSON.stringify(missing), (err) => {
      if (err) {
          console.error(err);
          return;
      };
      console.log("File 'missing' has been created too");
  });
}

zip()
