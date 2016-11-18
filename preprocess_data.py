#!/usr/bin/env python
import os,sys,locale,json, traceback
import datetime, time
from collections import defaultdict
import logging 
import requests

import rlp
from rlp.sedes import big_endian_int, BigEndianInt, Binary
from rlp.utils import decode_hex, encode_hex, ascii_chr, str_to_bytes

from web3 import Web3, RPCProvider

# We need longer timeouts for the debug traces
# Setting it to 5 minutes here
web3rpc = Web3(RPCProvider(host="127.0.0.1", port="8545",  connection_timeout=5*60,network_timeout=5*60))
here = os.path.dirname(os.path.abspath(__file__))


#-----------------------------------------------------
# Taken from the pyethereum project
# OBS; Assumes python 2
big_endian_to_int = lambda x: big_endian_int.deserialize(str_to_bytes(x).lstrip(b'\x00'))
int_to_big_endian = lambda x: big_endian_int.serialize(x)

is_numeric = lambda x: isinstance(x, (int, long))
is_string = lambda x: isinstance(x, (str, unicode))

def to_string(value):
    return str(value)

def int_to_bytes(value):
    if isinstance(value, str):
        return value
    return int_to_big_endian(value)

def to_string_for_regexp(value):
    return str(value)


def bytearray_to_bytestr(value):
    return bytes(''.join(chr(c) for c in value))

def parse_int_or_hex(s):
    if is_numeric(s):
        return s
    elif s[:2] in (b'0x', '0x'):
        s = to_string(s)
        tail = (b'0' if len(s) % 2 else b'') + s[2:]
        return big_endian_to_int(decode_hex(tail))
    else:
        return int(s)        

#-----------------------------------------------------

def int_to_hexstring(v):
    return "0x"+encode_hex(big_endian_int.serialize(parse_int_or_hex(v)))

def pad(inp):
    """ 0-pads a string to 66 width (32 bytes + '0x') """
    #0xb2551d22c4e1251431545e50032d6fbfaf93fe0d6c98a4daa44f387bdfe39d83
    return inp.ljust(66,"0")



def loadjson(fname):
    """Utility method to load data from a json file
    @return None if file is missing"""

    try:
        with open('%s/data/%s' % (here, fname), 'r') as infile:
            return json.loads(infile.read())
    except Exception, e:
        print(e)
        return None


def savejson(fname, obj):
    """ Utility method to save an object to a json file"""
    fqfn = '%s/data/%s' % (here, fname)
    with open(fqfn, 'w+') as outfile:
        outfile.write(json.dumps(obj))

    print("Wrote file %s" % fqfn)


def getTrace(txHash):
    """ Get's the suicide count through the traceTransaction API
    Returns either the number of suicides or None
    """

    with open('%s/suicide_counter.js' % (here), 'r') as infile:
        javascript = infile.read()

    # The following javascript tracer can be used to verify that
    # we get the beneficiaries right: 
    #with open('%s/beneficiaries.js' % (here), 'r') as infile:
    #    javascript = infile.read()

    # For tracing the 'heavy' transactions generated during the attack, 
    # we need to up the timeouts pretty heavily
    traceOpts = {
      "tracer": javascript,
      "timeout": "5m",
    }
    try:
        res =  web3rpc._requestManager.request_blocking("debug_traceTransaction", [txHash, traceOpts])
    except Exception as e:
        traceback.print_exc(file=sys.stdout)
        return None
    
    return int(res)

def getTxInputAndGas(txhash):
    """ Returns the transaction input data and gas used, as a tuple. This method uses
    eth.getTransaction and eth.getTransactionReceipt, which is is a lot faster
    than using the debug.traceTransaction"""
    try:
        tx = web3rpc.eth.getTransaction(txhash)
        txreceipt = web3rpc.eth.getTransactionReceipt(txhash)
        data = tx['input']
        gasUsed = txreceipt['gasUsed'] 
        return (data, gasUsed)
    except AttributeError:
        return None

def processInputAndGasUsage():
    """ This method fetches gasUsed and input data for each transaction, 
    saving values in the 'state_bloat_transactions.json' file. 
    """

    transactions = loadjson("state_bloat_transactions.json")
    failures = 0

    def inputMissing(l):
        for el in l:
            if not el.has_key('input'):
                yield el

    for tx in inputMissing(transactions):
        d = getTxInputAndGas(tx['txhash'])
        if d is None:
            print("No data for tx")
            failures = failures +1;
            continue

        (indata, gasUsed) = d
        tx['input'] = indata
        tx['gasUsed'] = gasUsed
        # Save intermediary data
        savejson("state_bloat_transactions.json",transactions)

    return failures
        
def processTransactions():

    transactions = loadjson("state_bloat_transactions.json")
    mappings = loadjson("mappings_gas_suicidecount.json") or {}

    failures = 0

    def suicideCountMissing(l):
        for el in l:
            if not mappings.has_key(str(el['gasUsed'])):
                yield el

    for tx in suicideCountMissing(transactions):
        gasUsed = str(tx['gasUsed'])

        print("Suicide count for gasUsed=%s not known" % gasUsed)

        numSuicides = getTrace(tx['txhash'])

        if numSuicides == None:
            print("Trace failed")
            failures = failures +1
            continue

        mappings[gasUsed] = numSuicides

        savejson("mappings_gas_suicidecount.json", mappings)

        h = tx['txhash']
        i = tx['input']
        sc = mappings[gasUsed]
        print("hash %s input %s suicides: %d " % (h,i,sc))

    return failures


def outputResult():
    """
        Reads the intermediary files
            - state_bloat_transactions.json
            - mappings_gas_suicidecount.json
        These are expected to be 'complete'. 

        Generates the data points for 'seed' and 'input', and writes 
        the file 'final_data.json'
    """
    transactions = loadjson("state_bloat_transactions.json")
    mappings = loadjson("mappings_gas_suicidecount.json")

    def numSuicides(tx):
        return mappings[str(tx['gasUsed'])]


    totalSuicides = 0
    
    final_data = []
    for tx in transactions:
        totalSuicides = totalSuicides + int(numSuicides(tx))

        # input to transaction, right-padded with zeroes to 32 bytes
        inp = pad(tx['input'])
        # hash of preceding block
        h = tx['blh']

        # Calculate the seed
        # Blockhash(num -1) + input
        seed = parse_int_or_hex(h) + parse_int_or_hex(inp)
        seed = seed & 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        seed = int_to_hexstring(seed)

        print("%s %s %s %d %s" % (tx['txhash'], h,inp, numSuicides(tx), str(seed)))

        final_data.append({"seed": seed, "num": numSuicides(tx)})


    print("Total suicides: %d" % totalSuicides)
    savejson("final_data.json", final_data)


def main():

    # This script writes to 'state_bloat_transactions.json' during script execution. 
    # 
    # If no such file exists, it reads from state_bloat_transactions_original.json
    # which is expected to contain a list of transaction objects with the following fields
    # blh - block hash of the block _preceding_ this transactions block
    # txhash - the transaction hash
    # 
    stage_data = loadjson("state_bloat_transactions.json")
    if stage_data is None:
        stage_data = loadjson("state_bloat_transactions_original.json")
        savejson("state_bloat_transactions.json", stage_data)


    # Step 1 : get each transaction gasUsed and input data
    # Continue until there are no more failures
    f = 1
    while(f > 0):
        f = processInputAndGasUsage()
        print("Failures: %d" % f)

    # Step 2: get the suicide count for each transaction
    # Continue until there are no more failures
    f = 1
    while f > 0:
        f = processTransactions()
   
    # Output it
    outputResult()


if __name__ == '__main__':
    main()
 