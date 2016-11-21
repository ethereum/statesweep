## State Cleaning

The primary bloat to the state have been generated from the following contracts. 

1. Sequentially increasing
	* `0x6a0a0fc761c612c340a0e98d33b37a75e5268472`
2. Non sequential (identical contracts)
	* [`0x7c20218efc2e07c8fe2532ff860d4a5d8287cb31`](https://etherscan.io/address/0x7c20218efc2e07c8fe2532ff860d4a5d8287cb31)
	* [`0x8a2e29e7d66569952ecffae4ba8acb49c1035b6f`](https://etherscan.io/address/0x8a2e29e7d66569952ecffae4ba8acb49c1035b6f)


### `0x6a0a0fc761c612c340a0e98d33b37a75e5268472`

This one generated suicides into sequentially increasing addresses, from

		0x0000000000000000000000000000000000000001 -> 0x0000000000000000000000000000000000346b60

So the cleanup from that is pretty trivial. 

### `0x7c20218efc2e07c8fe2532ff860d4a5d8287cb31`

These are a bit more tricky, using two sources for seeding and generating destination addresses from these. See [reverse_engineering.md](reverse_engineering.md) for details. 

In order to generate the same addresses, we need to two pieces of data from each original transcation: 

*  `CALLDATA` 
* The hash of the previous block (which is not available on-chain any longer, since we've passed 256 blocks)


Also the exploit-contract worked like this: 

1. `0x7c20218efc2e07c8fe2532ff860d4a5d8287cb31` created contract `x`. 
2. It `CALL`:ed `x` 40 times with an address of a sucide beneficiary. Before each call, generate a new address. During each call, `x` performed suicide to the supplied address.
3. If we have more than 1800 gas, repeat step 2. 

One more piece of data that we need is the number of suicides performed, in order to know when to stop our sweep.

## Files in this repo


### Contracts

This repository contains a solidity implementation of a Sweeper contract, with the following signature: 

    function asm_clean(uint s, uint i);

    function sol_clean(uint256 s, uint i);

These should be equivalent, but with `asm_clean` requiring less gas. The first parameter `s` is the initial seed, and the `i` is the number of touches to perform. 

### Data files

The files in `/data` are: 

* `state_bloat_transactions_original.json` - A file containing some basic data about all transactions into the two attack-contracts listed above. 
	* `blh` the block hash of the preceding block
	* `txhash` the transaction hash
* `state_bloat_transactions.json` - Generated from `state_bloat_transactions_original.json` by using a web3 API to fetch some more data for each transaction: 
	* `input` - the input to the transactoin
    * `gasUsed` - the gas used by the transaction
* `mappings_gas_suicidecount.json` - Generated from `state_bloat_transactions_original.json`, by using a web3 API to perform traces of transcations, and mapping `gasUsed` to number of suicides performed. 
* `final_data.json` - Generated from  `state_bloat_transactions_original.json` and `mappings_gas_suicidecount.json`. This calculates the `seed` and `iter` values to send into the solidity contract. The json file has the following data points: 
	* `seed` - Seed value
	* `num` - Number of addresses to touch

The file `state_bloat_transactions_original.json` was generated from the Etherchain API, which has been hugely helpful in gathering data. The scripts to create this file is not included in this repository. This file is the _only_ file required to generate the rest of the files. 

### Python 

The `preprocess_data.py` generates all data based on the `state_bloat_transactions_original.json`. During execution, it saves results to files, and can be aborted/resumed. In this repo, the files are already generated and the script does not need to actually do much work. 

If you want to regenerate the data based on `state_bloat_transactions_original.json` from scratch, you need to delete the other json-files and ensure that you have a http-api with `debug` available: `geth --rpc --rpcapi "debug,eth"`


## Live contracts

The `Sweeper.sol` contract was deployed on the main net in [0xad4ceddc9e345ac9f3076bf657ee1e22e382b98de6d351d35c7f8e28e8398021](https://etherscan.io/tx/0xad4ceddc9e345ac9f3076bf657ee1e22e382b98de6d351d35c7f8e28e8398021), and lives on [0xa43ebd8939d8328f5858119a3fb65f65c864c6dd](https://etherscan.io/address/0xa43ebd8939d8328f5858119a3fb65f65c864c6dd)

```javascript

var sweeperAbi = [{"constant":false,"inputs":[{"name":"s","type":"uint256"},{"name":"i","type":"uint256"}],"name":"sol_clean","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"s","type":"uint256"},{"name":"i","type":"uint256"}],"name":"asm_clean","outputs":[],"payable":false,"type":"function"}];
var sweeperContract = web3.eth.contract(sweeperAbi).at("0xa43ebd8939d8328f5858119a3fb65f65c864c6dd");
```
