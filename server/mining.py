import asyncio

from server.btcrpc import *
from server.decode_block import *
from binascii import *

import io
import time

coinbase = b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
address = '76a914071e31b8289aa9d80b970230cb1b8b76466f2ec488ac'


def to_bytes(int, size=1):
    return int.to_bytes(size, 'little')


def get_header(template, merkle, nonce=1):
    version = b'\x00\x00\x00\x20'

    previous = unhexlify(template['previousblockhash'][::-1])
    timestamp = to_bytes(int(time.time()), 4)
    bits = unhexlify(template['bits'][::-1])
    nonce = to_bytes(nonce, 4)
    txcount = b'\x01'

    header = (version + previous + merkle + timestamp + bits + nonce + txcount)
    return header


def get_transaction(template):
    txver = b'\x01\x00\x00\x00'
    return txver + get_inputs(template) + get_outputs(template)


def get_inputs(template):
    count = b'\x01'
    hash = coinbase
    index = b'\xff\xff\xff\xff'
    height = to_bytes(template["height"], 3)
    script_len = to_bytes(len(height) + 1)
    script = to_bytes(len(height)) + height
    sequence = b'\xFF\xFF\xFF\xFF'
    return count + hash + index + script_len + script + sequence


def get_outputs(template):
    count = b'\x01'
    toshis = to_bytes(template['coinbasevalue'], 8)
    pubScript = unhexlify(address)
    scriptLen = to_bytes(len(pubScript))
    lock = b'\x00\x00\x00\x00'
    return count + toshis + scriptLen + pubScript + lock


def b2str(rawbytes):
    return binascii.hexlify(rawbytes).decode()


def dsha256(b):
    return hashlib.sha256(hashlib.sha256(b).digest()).digest()

def hash50k(template):
    block = None
    best = None
    transactions = get_transaction(template)
    merkle = dsha256(transactions)

    start = time.time()
    for i in range(0, 850000):
        header = get_header(template, merkle, i)
        hash = b2str(dsha256(header))

        if block is None:
            block = header


        if hash < best:
            best = hash
            block = header
            print("new best hash: " + best)

    print("best hash is: ")
    print(best)

    # submit block+transactions

    end = time.time()
    print(f"finish in {end - start}s")

async def run():
    rpc = BTCRPC("userbob", "secret")
    template = (await rpc.blocktemplate())["result"]

    transactions = get_transaction(template)
    merkle = dsha256(transactions)
    header = get_header(template, merkle)

    hash50k(template)

    block = header + transactions
    raw = io.BytesIO(block)

    print(b2str(dsha256(raw.read(80))[::-1]))
    print(b2str(dsha256(transactions)[::-1]))

    decodeBlock(header + transactions)

    print(template)


try:
    loop = asyncio.get_event_loop()
    loop.create_task(run())
    loop.run_forever()
except KeyboardInterrupt:
    print("sigterm by user")