import asyncio
import aiohttp
import json

from server.log import log
from server.address import *

URL = "http://localhost:8332"
BLOCK_TAIL_LIMIT = 2000


class BTCRPC:
    """
    Bitcoin node rpc integration.
    """

    def __init__(self, username, password):
        con = aiohttp.TCPConnector(limit=128)
        auth = aiohttp.BasicAuth(username, password)
        self.cache = {}
        self.session = aiohttp.ClientSession(connector=con, auth=auth)

    async def info(self):
        return await self.call("getblockchaininfo")

    async def blockhash(self, index):
        return await self.call("getblockhash", [index], cache=True)

    async def block(self, hash):
        return await self.call("getblock", [hash], cache=True)

    async def transaction(self, txid):
        return await self.call("getrawtransaction", [txid, True], cache=True)

    async def send_transaction(self, address_from, address_to, amount, txid, vout):
        inputs = [{"txid": txid, "vout": vout}]
        outputs = [{address_to: amount}]

        tx = await self.call("createrawtransaction", [inputs, outputs])
        signed = await self.call("signrawtransactionwithkey", [tx["result"], [address_from]])
        sent = await self.call("sendrawtransaction", [signed["result"]["hex"], 0])
        return sent["result"]

    async def block_transactions(self, index):
        transactions = []
        hash = (await self.blockhash(index))["result"]
        block = (await self.block(hash))["result"]

        if "tx" in block:
            for txid in block["tx"]:
                transactions.append(await self.transaction(txid))

        return transactions

    async def outputs(self, address):
        current = (await self.info())["result"]["blocks"] - 1
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

    async def call(self, method, params=[], cache=False):
        data = {"method": method, "params": params}

        payload = json.dumps(data)
        tag = hash(payload)
        try:
            if cache and tag in self.cache:
                return self.cache[tag]
            else:
                async with self.session.post(URL, data=payload) as response:
                    response = json.loads(await response.text())
                    if cache:
                        self.cache[tag] = response
                    return response
        except Exception as e:
            log("Failed to call {}, {}".format(URL, repr(e)))
            return None

    async def hash(self, string):
        return hashlib.sha256(string.encode()).hexdigest()
