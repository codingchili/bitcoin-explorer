import concurrent.futures

from server.btcrpc import *
from server.decode_block import *
from binascii import *

import time

coinbase = b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
address = '76a914071e31b8289aa9d80b970230cb1b8b76466f2ec488ac'
workers = 16


async def stripmine(template):
    """ spawns child processes to perform concurrent mining with the given template. """
    loop = asyncio.get_event_loop()
    executor = concurrent.futures.ProcessPoolExecutor(max_workers=workers)
    worker_range = 0xfffff  # range per worker, reduced to limit mining to ~20s.
    tasks = set()
    start = time.time()

    for i in range(0, workers):
        range_from, range_to = i * worker_range, (i + 1) * worker_range
        log(f"started hash worker {i} for range {range_from}->{range_to} ..")
        tasks.add(loop.run_in_executor(executor, hash_nonce_range, template, range_from, range_to, i == 0))

    blocks = await asyncio.wait(fs=tasks, return_when=asyncio.ALL_COMPLETED)
    proposed_block = find_best_block(blocks)
    end = time.time()

    hashes = worker_range * workers
    hash_rate = int((worker_range * workers) / (end - start))
    log(f"tried {'{:,}'.format(hashes)} hashes in {int(end - start)}s, rate {'{:,}'.format(hash_rate)} H/s")

    return proposed_block


def hash_nonce_range(template, nonce_from, nonce_to, report):
    """ finds the nonce which gives the best (lowest) block hash in the given nonce range. """
    proposed_block = None
    transactions = get_transaction(template)
    merkle = x2_sha256(transactions)

    for i in range(nonce_from, nonce_to):
        header = get_header(template, merkle, i)
        hash = bytes_to_string(x2_sha256(header))

        if report and i % 20_000 == 0:
            log(f"hashing progress {int(abs((nonce_from - i / nonce_to - nonce_from)) * 100)}%")

        if proposed_block is None or hash < proposed_block["hash"]:
            proposed_block = {
                "hash": hash,
                "block": header + transactions,
                "valid": hash < template["target"]
            }

    return proposed_block


def find_best_block(hashed):
    """
     finds the best block out of a list of block proposals. this method is used to select the
     best block/hash produced by multiple workers.
     """
    proposed_block = None
    for item in hashed[0]:
        block = item.result()
        if proposed_block is None or block["hash"] < proposed_block["hash"]:
            proposed_block = block

    return proposed_block


def get_header(template, merkle, nonce=1):
    """ builds the block header from the given template, merkle root and nonce. """
    version = b'\x00\x00\x00\x20'

    previous = unhexlify(template['previousblockhash'][::-1])
    timestamp = to_bytes(int(time.time()), 4)
    bits = unhexlify(template['bits'][::-1])
    nonce = to_bytes(nonce, 4)
    txcount = b'\x01'

    header = (version + previous + merkle + timestamp + bits + nonce + txcount)
    return header


def get_transaction(template):
    """ transaction header """
    txver = b'\x01\x00\x00\x00'
    return txver + get_inputs(template) + get_outputs(template)


def get_inputs(template):
    """ creates the inputs for a single transaction, only supports the coinbase transaction/input. """
    count = b'\x01'
    hash = coinbase
    index = b'\xff\xff\xff\xff'
    height = to_bytes(template["height"], 3)
    script_len = to_bytes(len(height) + 1)
    script = to_bytes(len(height)) + height
    sequence = b'\xFF\xFF\xFF\xFF'
    return count + hash + index + script_len + script + sequence


def get_outputs(template):
    """ creates the outputs for a single transaction, only supports the coinbase transaction/output. """
    count = b'\x01'
    toshis = to_bytes(template['coinbasevalue'], 8)
    pub_script = unhexlify(address)
    script_len = to_bytes(len(pub_script))
    lock = b'\x00\x00\x00\x00'
    return count + toshis + script_len + pub_script + lock


def bytes_to_string(rawbytes):
    return binascii.hexlify(rawbytes).decode()


def x2_sha256(b):
    return hashlib.sha256(hashlib.sha256(b).digest()).digest()


def to_bytes(int, size=1):
    return int.to_bytes(size, 'little')
