import asyncio

from server.btcrpc import *
from binascii import *
from server.decode_block import *
import time


# BLOCK HEADER
# 80 BYTES HEADER
# TX DATA


# HEADER
# 4 BYTES VERSION
# 32 BYTES LAST BLOCK HASH
# 32 BYTES MERKLE ROOT FOR TX
# 4 BYTES BLOCK TIEM
# 4 BYTES FROM BLOCK TEMPLATE, "BITS"
# 4 BYTES FOR NONCE

# THEN 2xSHA

# TXS
# INPUT
# 32 BYTES FOR TX, 0X000 FOR CONIBASE
# 4 BYTES OUTUT, 0XFF FOR COINBASE
# 1-4 BYTES, SCRIPTLEN, SCRIPTSIG LEN
# SOMETHING SOMETHING BIP34
# SOME SCRIPT, NOT REQUIRED FOR COINBASE
# SEQUENCE, FOR COINBASE: 0Xff ff ff ff

def get_header(template):
    version = b'\x00\x00\x00\x20'

    previous = unhexlify(template['result']['previousblockhash'][::-1])
    timestamp = int(time.time()).to_bytes(4, 'little')
    bits = unhexlify(template['result']['bits'][::-1])
    nonce = b'\x00\x00\x00\x04'[::-1]
    merkle = b'\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF'

    header = (version + previous + merkle + timestamp + bits + nonce)
    return header

def get_transactions():
    txver = b'\x01\x00\x00\x00'
    txcount = b'\x01'
    return txver + txcount + get_inputs() + get_outputs()


def get_inputs():
    count = b'\x01'
    hash =  b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
    index = b'\xff\xff\xff\xff'
    scriptLen = b'\x03'
    script = b'\x02\xbc\x04'
    sequence = b'\xFF\xFF\xFF\xFF'
    return count + hash + index + scriptLen + script + sequence

def get_outputs():
    count = b'\x01'
    toshis = int(50 * 1_000_000).to_bytes(8, 'little')
    pubScript = unhexlify('76a914071e31b8289aa9d80b970230cb1b8b76466f2ec488ac')
    scriptLen = len(pubScript).to_bytes(1, 'little')
    lock = b'\x00\x00\x00\x00'
    return count + toshis + scriptLen + pubScript + lock

async def run():
    rpc = BTCRPC("userbob", "secret")
    template = await rpc.blocktemplate()

    header = get_header(template)
    transactions = get_transactions()

    decodeBlock(header + transactions)

    print(template)


try:
    loop = asyncio.get_event_loop()
    loop.create_task(run())
    loop.run_forever()
except KeyboardInterrupt:
    print("sigterm by user")

#{'result': {'capabilities': ['proposal'], 'version': 536870912, 'rules': ['csv', '!segwit'], 'vbavailable': {},
#            'vbrequired': 0, 'previousblockhash': '000000000ea9dc6077225e90c31954ed2bdbfb3f5eeb433a14aa871ad47d959f',
#            'transactions': [], 'coinbaseaux': {}, 'coinbasevalue': 5000000000,
#            'longpollid': '000000000ea9dc6077225e90c31954ed2bdbfb3f5eeb433a14aa871ad47d959f144067',
#            'target': '00000000e04b0000000000000000000000000000000000000000000000000000', 'mintime': 1620672761,
#            'mutable': ['time', 'transactions', 'prevblock'], 'noncerange': '00000000ffffffff', 'sigoplimit': 80000,
#            'sizelimit': 4000000, 'weightlimit': 4000000, 'curtime': 1620676057, 'bits': '1d00e04b', 'height': 144065,
#            'default_witness_commitment': '6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9'},
# 'error': None, 'id': None}
