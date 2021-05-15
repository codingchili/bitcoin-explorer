import asyncio
import aiohttp
import json

from server.log import log
from server.address import *

URL = "http://localhost:8332"
BLOCK_TAIL_LIMIT = 2000
TX_FEE_RATIO = 0.1


class BTCRPC:
    """
    Bitcoin node rpc integration.
    """

    def __init__(self, username, password):
        con = aiohttp.TCPConnector(limit=128)
        auth = aiohttp.BasicAuth(username, password)
        self.cache = {}
        self.session = aiohttp.ClientSession(connector=con, auth=auth)
        log(f"using rpc node with user '{username}'")

    async def close(self):
        await self.session.close()

    async def info(self):
        return await self.call("getblockchaininfo")

    async def blockhash(self, index):
        return await self.call("getblockhash", [index], cache=True)

    async def block(self, hash):
        return await self.call("getblock", [hash], cache=True)

    async def blocktemplate(self):
        return await self.call("getblocktemplate", [{"rules": ["segwit"], "capabilities": ["coinbasetxn", "workid", "coinbase/append"]}])

    async def transaction(self, txid):
        return await self.call("getrawtransaction", [txid, True], cache=True)

    async def transaction_io(self, txid, vout, amount, address_from, address_to):
        # retrieve transaction output to spend, refund address_from with remainder.
        spendable = (await self.transaction(txid))
        if spendable["error"] is not None:
            return self.parse_response(spendable)

        spendable_value = round(spendable["result"]["vout"][vout]["value"], 2)

        return {
            "inputs": [{"txid": txid, "vout": vout}],
            "outputs": [
                {address_to: f"{amount:.4f}"},
                {address_from: f"{(spendable_value - (amount * TX_FEE_RATIO) - amount):.4f}"}
            ],
            "error": None
        }

    async def send_transaction(self, wif, address_from, address_to, amount, txid, vout):
        io = await self.transaction_io(txid, vout, amount, address_from, address_to)

        if io["inputs"] is None:
            return io
        else:
            outputs = io["outputs"]
            inputs = io["inputs"]

        # creates a replaceable transaction.
        tx = await self.call("createrawtransaction", [inputs, outputs])

        if tx["error"] is None:
            signed = await self.call("signrawtransactionwithkey", [tx["result"], [wif]])
            if signed["error"] is None:
                sent = await self.call("sendrawtransaction", [signed["result"]["hex"], 0])
                if sent["result"] is not None:
                    log(f"created tx {sent['result']}")
                return self.parse_response(sent)
            else:
                return self.parse_response(signed)
        else:
            return self.parse_response(tx)

    def parse_response(self, response):
        if response["error"] is not None:
            log(response["error"]["message"])
            return response["error"]
        else:
            return response

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
        log(f"invoking rpc call '{method}'")

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
