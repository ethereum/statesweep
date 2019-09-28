// var { isEmptyAccount, getAccount } = require('./isEmptyAccount')
var Rpc = require('isomorphic-rpc')
var rpc = new Rpc()

var { keccak, encode, decode, toBuffer, toWord, toHex } = require('eth-util-lite')
var { GetAndVerify, GetProof, VerifyProof, ProofUtil} = require('eth-proof')
var { Account } = require('eth-object')

// var sbto = require('./data/state_bloat_transactions_original.json');
// var sbt = require('./data/state_bloat_transactions.json');

async function isEmptyAccount(address){
  let account = await getAccount(address)
  if(account){
    return Account.NULL.buffer.equals(account.toBuffer())
  }
  return false //specifically as defined in EIP 161
}

async function getAccount(address){
  let gp = new GetProof('http://localhost:8545')
  let p = await gp.accountProof(address)
  let accountBuffer = await VerifyProof.proofContainsValueAt(p.accountProof, keccak(address))
  return accountBuffer ? Account.fromBuffer(accountBuffer) : null
}

module.exports = { isEmptyAccount, getAccount }
