import asyncio
import aiohttp
import json

from server.log import log

URL = "http://localhost:8332"
BLOCK_TAIL_LIMIT = 2000


class BTCRPC:

    def __init__(self, username, password):
        # simple cache, no limit to how big this can get..
        self.index_to_hash = {}
        self.blocks = {}
        self.transactions = {}
        con = aiohttp.TCPConnector(limit=32)
        auth = aiohttp.BasicAuth(username, password)
        self.session = aiohttp.ClientSession(connector=con, auth=auth)

    async def info(self):
        return await (self.call({"method": "getblockchaininfo"}))

    async def blockhash(self, index):
        if index in self.index_to_hash:
            return self.index_to_hash[index]
        else:
            hash = await (self.call({"method": "getblockhash", "params": [index]}))
            self.index_to_hash[index] = hash
            return hash

    async def block(self, hash):
        if hash in self.blocks:
            return self.blocks[hash]
        else:
            block = await (self.call({"method": "getblock", "params": [hash]}))
            self.blocks[hash] = block
            return block

    async def transaction(self, txid):
        if txid in self.transactions:
            return self.transactions[txid]
        else:
            transaction = await (self.call({"method": "getrawtransaction", "params": [txid, True]}))
            self.transactions[txid] = transaction
            return transaction

    async def block_transactions(self, index):
        transactions = []
        hash = (await self.blockhash(index))["result"]
        block = (await self.block(hash))["result"]

        if "tx" in block:
            for txid in block["tx"]:
                transactions.append(await self.transaction(txid))

        return transactions

    async def outputs(self, address):
        result = (await self.info())
        current = (await self.info())["result"]["blocks"]
        start = current - BLOCK_TAIL_LIMIT
        tasks = []

        for index in range(start, current):
            tasks.append(asyncio.create_task(self.block_transactions(index)))

        return {"result": self.filter(await asyncio.gather(*tasks, return_exceptions=False), address)}

    def filter(self, transactions, address):
        transactions = [item for sublist in transactions for item in sublist]
        transactions = list(filter(
            lambda transaction: self.includes_address_output(transaction, address),
            transactions
        ))
        return list(map(lambda transaction: transaction["result"], transactions))

    def includes_address_output(self, transaction, address):
        for output in transaction["result"]["vout"]:
            pubkey = output["scriptPubKey"]
            if "addresses" in pubkey and address in pubkey["addresses"]:
                return True
        return False

    async def call(self, data):
        try:
            async with self.session.post(URL, data=json.dumps(data)) as response:
                return json.loads(await response.text())
        except Exception as e:
            log("Failed to call {}, {}".format(URL, repr(e)))
            return None
