// var { isEmptyAccount, getAccount, wasEmptyAccount, wasErased } = require('./isEmptyAccount')
var Rpc = require('isomorphic-rpc')
var rpc = new Rpc()

var { keccak, encode, decode, toBuffer, toWord, toHex } = require('eth-util-lite')
var { GetAndVerify, GetProof, VerifyProof, ProofUtil} = require('eth-proof')
var { Account } = require('eth-object')

// var sbto = require('./data/state_bloat_transactions_original.json');
// var sbt = require('./data/state_bloat_transactions.json');

async function isEmptyAccount(address, blockhash){
  let account = await getAccount(address, blockhash)
  if(account){
    return Account.NULL.buffer.equals(account.toBuffer())
  }
  return false //specifically as defined in EIP 161
}

async function wasEmptyAccount(address){ // before eip161
  let account = await getAccount(address, "0xeed20bd3e793178f75cc2e86ddb3c19b4423f9e2915a087e265452f9c3c45efb")
  if(account){
    return Account.NULL.buffer.equals(account.toBuffer())
  }
  return false //specifically as defined in EIP 161
}

async function wasErased(address){ // before eip161
  let accountNow = await getAccount(address)
  let wasEmptyThen = await wasEmptyAccount(address)
  return wasEmptyThen && accountNow == null
}

async function getAccount(address, blockhash){
  let gp = new GetProof('http://localhost:8545')
  let p = await gp.accountProof(address, blockhash)
  let accountBuffer = await VerifyProof.proofContainsValueAt(p.accountProof, keccak(address))
  return accountBuffer ? Account.fromBuffer(accountBuffer) : null
}

module.exports = { isEmptyAccount, getAccount, wasEmptyAccount, wasErased }
