var { isEmptyAccount, getAccount } = require('./isEmptyAccount')

// var Rpc = require('isomorphic-rpc')
// var rpc = new Rpc()
var rlp = require('rlp')
var u = require('eth-util-lite')
var MPT = require('merkle-patricia-tree')
var levelup = require('levelup')
var leveldown = require('leveldown')
// var EP = require('eth-proof')
var EO = require('eth-object')
var chaindata = '/Users/zacharymitton/Library/Ethereum/classic/geth/chaindata'
var Bn = require('bignumber.js')

var sbt = require('./data/state_bloat_transactions.json');
