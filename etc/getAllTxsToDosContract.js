// worked flawlessly as is. Ran overnight (approx. 30 minutes)

var Rpc = require('isomorphic-rpc')
var rpc = new Rpc()

var fs = require("fs");

let histogram = {}
let keys = []
let data = {}
let total = 0
let start = Date.now()

async function run(){
  // for (var currBlockNum = 2420438; currBlockNum < 2421438; currBlockNum++) {
  for (var currBlockNum = 2420437; currBlockNum < 2500000; currBlockNum++) {

    let currBlock = await rpc.eth_getBlockByNumber('0x'+currBlockNum.toString(16), false)

    for (var i = 0; i < currBlock.transactions.length; i++) {
      let tx = await rpc.eth_getTransactionByHash(currBlock['transactions'][i])
      let to = tx['to']
      if(to){
        if(data[to] == undefined ) { data[to] = [] }
        data[to].push(tx['hash'])

        keys.push(to)

        histogram[to] = histogram[to] == undefined ? 1 : histogram[to] + 1

        total++
      }
    }
  }

  console.log("\n\n\n\ntotal", total)
  console.log("\n\n\n\ntime", (Date.now() - start)/1000)

  histogramFloor(histogram, 100)
  // console.log("\n\n\n\n\nhistogram", histogram)

  dataFloor(data, 100)
  // console.log("\n\n\n\n\ndata", data)


  fs.writeFile("./data/histogram_by_destination_address.json", JSON.stringify(histogram), (err) => {
      if (err) {
          console.error(err);
          return;
      };
      console.log("Histogram file has been created");
  });
  fs.writeFile("./data/transactions_by_destination_address.json", JSON.stringify(data), (err) => {
      if (err) {
          console.error(err);
          return;
      };
      console.log("Data file has been created too");
  });
}


function histogramFloor(h, floor){
  let keys = Object.keys(h)
  for (var i = 0; i < keys.length; i++) {
    if(h[keys[i]] < floor){
      delete h[keys[i]]
    }
  }
  return h
}

function dataFloor(d, floor){
  let keys = Object.keys(d)
  // console.log(keys)
  for (var i = 0; i < keys.length; i++) {
    if(d[keys[i]].length < floor){
      delete d[keys[i]]
    }
  }
  return d
}


run()
