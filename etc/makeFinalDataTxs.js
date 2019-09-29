var Rpc = require('isomorphic-rpc')
// var rpc = new Rpc('http://etc-parity.0xinfra.com')
var rpc = new Rpc('http://localhost:8545')
var rlp = require('rlp')
var final_data = require('../data/final_data.json');
console.log("final_data.length = ", final_data.length)

var { toHex, keccak } = require('eth-util-lite')

const EthereumTx = require('ethereumjs-tx')
const privateKey = Buffer.from(
  // 'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex',
)





function makeTx(finalDataElem, nonce){
  // nonce++
  var funcSig = "53f11cb3" //asm_clean
  // var funcSig = "39846a67" //sol_clean

  var num = toHex(finalDataElem['num']).slice(2).toString(16).padStart(64, '0')
  var seed = toHex(finalDataElem['seed']).slice(2)
  var input = '0x'+funcSig+seed+num

  var txParams = {
    nonce: toHex(nonce),
    gasPrice: '0x00184e7200',
    gasLimit: '0x07a120',
    to: '0x39856bb3305997aD7acA33f8b21a8af9B86B79F4',
    value: '0x00',
    data: input,
  }

  var tx = new EthereumTx(txParams)
  tx.sign(privateKey)
  var serializedTx = tx.serialize()
  // console.log("TX: ", tx.from)
  let hexTx = '0x'+serializedTx.toString('hex')
  // 0x4830ddf0cb309944b39633e97e673f81fb20a798
  // console.log("obj ", rlp.decode(hexTx))
  // console.log("HEX ", hexTx)

  return hexTx
}

nonce = 14
var final_data_with_txs = {}
for (var i = 0; i < final_data.length; i++) {
  var finalTxData = final_data[i]
  finalTxData['signedTx'] = makeTx(final_data[i], nonce)
  finalTxData['txHash'] = toHex(keccak(Buffer.from(finalTxData['signedTx'].slice(2), 'hex')))
  final_data_with_txs[nonce] = finalTxData
  nonce++
}


var fs = require("fs");
fs.writeFile("./data/final_data_with_txs.json", JSON.stringify(final_data_with_txs), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("File has been created");
});

// var hexTx = makeTx(final_data[0])
// console.log("HEX TX : ", hexTx)
// rpc.eth_sendRawTransaction(hexTx).then(console.log)


// async function serve(){
//   let txhash = await rpc.eth_sendRawTransaction(hexTx)
//   console.log("txhash ", txhash)
//   return txhash
// }


// serve()
// var fs = require("fs");

// var sbto = []
// var missing = []

// gas price 400 Mwei is getting mined right now almost right away. 
// blocks are only 5% full at best. at that price this will cost:
// its a little less then 1000 gas per iteration (a single account erase)
// so for 13785000 accounts, thats 13,785,000,000
