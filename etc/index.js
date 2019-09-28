var Rpc = require('isomorphic-rpc')
var rpc = new Rpc()
var rlp = require('rlp')
var u = require('eth-util-lite')
var MPT = require('merkle-patricia-tree')
var levelup = require('levelup')
var leveldown = require('leveldown')
var EP = require('eth-proof')
var EO = require('eth-object')
var Bn = require('bignumber.js')

// var chaindata = '/Users/zacharymitton/Library/Ethereum/geth/chaindata'
var chaindata = '/Users/zacharymitton/Library/Ethereum/classic/geth/chaindata'
// var _stateRoot =  '0x227150819354ba46ef562e0bc02848bc8dafba612f23ddfc267f92cb1d0cd8df' // from blknum 0x7b8d12
// var _stateRoot =  '0x6cffc82bed5eb45e78572ead669d553d44a36153884d6410e48af57b8d8f24ac' // from blknum 0x7d84ba
// var _stateRoot =  '0x46605ccb034390caef682bf0b82f33d7bbd8be78aa54395ef0b37b16110b8668' // from a bit before attack
// var _stateRoot =  '0xde84562cabbbaf999c4e1916c546290f8faba67639c906f9c13733b8d838b56c' // from a bit after attack
                  // 20001c3aa1c86dc4773e6bdb9556c36365db0a5193fd1d76f2f53ab6597e6dca first key from read stream?
// var _stateRoot =  '0xa5332ce7215a10247ea4bd9f679867677aee9541d1df08a0b98f097674609df0' // current (before account removal)
var _stateRoot =  '0x12580baf1e58ba8e22d2b0acdda7038e44f9068f64056ac7b609eaa821fa0190' // current (after account removal)
var stateRoot =  Buffer.from(_stateRoot.slice(2), 'hex') // from blknum 0x7b8d12
var db = levelup(leveldown(chaindata))

var tree = new MPT(db,stateRoot)

var nulls = 0
var nonNulls = 0
var ratio = ()=>{ return nulls/(nulls+nonNulls) }
var tally = (x)=> {
  if (x.equals(EO.Account.NULL.buffer)){
    console.log()
    nulls++
  }else{
    nonNulls++
  }
  return ratio()
}

var arrayToHex = (arr)=> {
  let str = ''
  if (arr.length != 64){ throw Error("YOUR MOM") }
  for (var i = 0; i < arr.length; i++) {
    str += arr[i].toString(16)
  }
  return str
}


var gav = new EP.GetAndVerify('http://localhost:8545')




// var arg0 = new Bn('0x6de0aa0cf1f9936e8564c853bda6aa3eb835133cde173e1b5d3f3f392a64f278')
// var t = arg0.plus(arg0)
// // var tAddy = t.div(new Bn('0x1000000000000000000000000'))
// var tAddy = t.toString(16).slice(0,40)
// var tbuf = Buffer.from(tAddy, 'hex')
// // var tbuf = Buffer.from('FBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98', 'hex')
// var ht = u.keccak(tbuf)

// tree.get(ht, console.log)




// tree.get(u.keccak(Buffer.from('FBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98', 'hex')), console.log)
// tree.get(u.keccak(Buffer.from('FBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98', 'hex')), (e,r)=>{console.log(rlp.decode(r))})

// 0xdbc15419e3f326dd0ac990a77b4d547d706a2679 calculated possible cleaned
// 0x8aE4Dbf7e75184D3FC0174461a6bc05d29ef3434 possible cleaned
// 0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98 - example address with some data

Buffer.from('ecd13f7b6fe12017a483e18d81bceb920b13be3e6a679297a889d9e114f5b356','hex')
// tree._findValueNodes((a,b,c,d)=>{
// // 01 00 00 00 00 00 0e 05 02 0a 00 0c 0a 0e 0e 0c 04 04 08 08 0f 0a 0c
//   // console.log("\n\na\n",a,"\n\nb\n",b,"\n\nc\n",c,"\n\nd\n",d,"\n\ne\n",e )
//   tally(x = b.raw[1])
//   if (x.equals(EO.Account.NULL.buffer)){
//     // db.get(Buffer.concat([Buffer.from('secure-key-'),u.keccak(Buffer.from('0cf78a320c9af1ed96a4a0ff3f2eadddb5ef1140025ff6e711e0a73347e7d046','hex'))]), (e,r)=>(console.log(r)))
//     console.log("RATIO: ", ratio())
//     console.log("TOTAL LEAVES SO FAR: ", nulls+nonNulls)
//     console.log("CURRENT key: ", a.toString('hex'),b,c,d)
//     console.log("account: ", rlp.decode(b['raw'][1]))
//     console.log("accountString: ", b['raw'][1].toString('hex'))

//     console.log("CURRENT KEY : ", c[0], c[1], c[2], c[3])
//     console.log("CURRENT FULL KEY : ", arrayToHex(c))
//   }
// }, console.log)

// beff0927f113f82d766f6133c67e85727e53fb09e75df12ff6b6574b64d9d67b
// e360a6a4210c7454906458a5a99ad61ef223b5bdb828f6251ea54d515858bf31
// ecc2e0611b0c6f24d8791f19f024f971772786188212e325d28ccdb13609c1f7
// 587d01b1a9c1d7e89b23144002f20fc4e013ef490512fd8211b78b9010919e58
// 5a11a3acadb8d7e548ce6d18eea9e056f4a92f256dd30e54779fdfb3855bed67
// c414b5a8edd9db6487767bf04527cfae65e2685b713d70be06e8c0a7ea6014ce 
// d80cd839dd3957d572b90780ada202a13936fa2875daea94216263371e9ef1d2
// 
// tree.get('', console.log)
// tree.findPath('', console.log)

// var s = tree.createReadStream()
// tree._findValueNodes(console.log, (a,b,c,d,e)=>{console.log("a\n",a,"b\n",b,"c\n",c,"d\n",d,"e\n",e )})

// EO.Account.NULL.hex ->
// f8448080a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
// EO.Account.NULL.buffer ->
// f8 44 80 80 a0 56 e8 1f 17 1b cc 55 a6 ff 83 45 e6 92 c0 f8 6e 5b 48 e0 1b 99 6c ad c0 01 62 2f b5 e3 63 b4 21 a0 c5 d2 46 01 86 f7 23 3c 92 7e 7d b2 ... 20 more bytes>

// a real empty account
// 

// db.get(Buffer.from('f059b27ab8a3c038cae5d71716fabea6ce35cc99404fd81af6a1e5ee45ecd89e','hex'),console.log)

// a real non-empty acccount from before blknum 5,012,707
// Buffer.from('bE2EC90c2e241eeD527ae436d7B388F215003e62','hex')
// u.keccak(Buffer.from('bE2EC90c2e241eeD527ae436d7B388F215003e62','hex'))
// tree.get(u.keccak(Buffer.from('bE2EC90c2e241eeD527ae436d7B388F215003e62','hex')),function(e,r){console.log(rlp.decode(r))})
// > db.get(Buffer.concat([Buffer.from('secure-key-'),u.keccak(Buffer.from('bE2EC90c2e241eeD527ae436d7B388F215003e62','hex'))]), (e,r)=>(console.log(r)))
// > db.get(Buffer.concat([Buffer.from('secure-key-'),Buffer.from('ba25eece61aaf645134952af7a6b0edb92a8540a0bf3ae888537dfafcbf4886b','hex')]), (e,r)=>(console.log(r)))
