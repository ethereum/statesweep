# Ethereum Classic EIP-161 Cleanup
### Scripts, Tools, and Contracts


An etherscan example transaction record:
```
Function: asm_clean(uint256 s, uint256 i)

MethodID: 0x53f11cb3
[0]:  6de0aa0cf1f9936e8564c853bda6aa3eb835133cde173e1b5d3f3f392a64f278
[1]:  0000000000000000000000000000000000000000000000000000000000000550
```

### ETH statesweep repo
https://github.com/ethereum/statesweep

--- zacs notes ---

one of the 2 difficult contracts exits on ETC: 0x7c20218efc2e07c8fe2532ff860d4a5d8287cb31
the other 2: 0x6a0a0fc761c612c340a0e98d33b37a75e5268472 and 0x8a2e29e7d66569952ecffae4ba8acb49c1035b6f have empty accounts on my node, but gastracker says that they are involved in a bunch of transactions but they are NOT contracts 

0x8a2E29E7D66569952eCfFAe4BA8acB49C1035B6f has only 133 transactions to it according to blockscout.com (better ETC explorer)

0x6A0a0Fc761c612C340a0e98d33b37a75e5268472 seems to have 50 pages of 50 each (2458) but its too big a dataset to download the CSV (throw 500). Update: it let me download the CSV, and it has 2459 transactions.

As far as the actual transactions go, most of the ones I tested from that page seem to be findable on gastracker AND my node, but others are simply not there (on either)

I didnt seem to find the "sequential" addresses in the db (although 1 out of 4 may also have proofs that contain empty accounts at their dead ends)

so basically we need to make that original.json file that 
etherchain created, then we can run the python to generate the rest of the needed data.


CONTRACT 0x7c20218efc2e07c8fe2532ff860d4a5d8287cb31
---------------------------------------------------
according to blockscout it was created at block

2420438

and according to gastracker the last tx was at block 

2459860

current nonce is known to be 28249 (from my full node)
 -> histogram and destination array shows exactly 28249 txs 'to' 0x7c202 address
 -> using the ETH file there were 27928 matching txs found
 -> 0x7c2 data checks out. Issac's file had ZERO discrepancies



gas-repricing was on block (according to ECIP 1015)

2500000 


so let search 2420438 - 2500000


update: there are tons of transactions to 0x6a0a0fc761c612c340a0e98d33b37a75e5268472 even though there isnt a contract there


Full node results:
6a0a0fc761c612c340a0e98d33b37a75e5268472 contains an empty account
8a2e29e7d66569952ecffae4ba8acb49c1035b6f is also empty
7c20218efc2e07c8fe2532ff860d4a5d8287cb31 is known to have identical code to its ETH depolyment

nothing else with > 1000 txs from the histogram show suicides on the block explorers


state_bloat_txs -> input txhash blh gasused
final -> seed, num


ok so i am officially leaving it with 1 step left in order to make final.json
  1: Either I can try to get the shitty python script to take care of everything
  2: I can use bignum library to guess how "seed" was made. its from some sort of process on blh and input but it will take abit of fiddling to get the same results (can be ched against EF data)

Then of course there is the matter of running a server to send the txs
  check that the addresses all (were) indeed empty
  get some funding
  make a process that sends idk 20 transactions per minute for about 24 hours
  make sure it tallies off completed ones
  run it for a few seconds first
  
