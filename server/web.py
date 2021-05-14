from aiohttp import web
from binascii import *

from server.btcrpc import *
from server.log import log
from server.mining import stripmine


class Server:
    """
    Serves static web resources and the REST API for the json/rpc bitcoin node integration.
    """

    def __init__(self, rpc):
        self.rpc = rpc

    async def info(self, request):
        return web.json_response(await self.rpc.info())

    async def blockhash(self, request):
        index = (await request.json())["index"]
        return web.json_response(await self.rpc.blockhash(index))

    async def mine(self, request):
        template = (await self.rpc.blocktemplate())["result"]
        result = await stripmine(template)
        return web.json_response({
            "block": hexlify(result["block"]).decode(),
            "valid": result["valid"]
        })

    async def block(self, request):
        index = (await request.json())["hash"]
        return web.json_response(await self.rpc.block(index))

    async def txinfo(self, request):
        txid = (await request.json())["txid"]
        return web.json_response(await self.rpc.transaction(txid))

    async def outputs(self, request):
        address = (await request.json())["address"]
        return web.json_response(await self.rpc.outputs(address))

    async def index(self, request):
        return web.FileResponse('./web/index.html')

    async def address(self, request):
        return web.json_response(Address.generate().__dict__)

    async def transact(self, request):
        request = (await request.json())
        return web.json_response(await self.rpc.send_transaction(
            request["wif_from"],
            request["compressed_from"],
            request["compressed_to"],
            request["amount"],
            request["transaction"],
            request["output"]
        ))

    def serve(self):
        log("serving contents of /web.")
        app = web.Application()
        app.add_routes([
            web.get('/', self.index),
            web.post('/api/info', self.info),
            web.post('/api/blockhash', self.blockhash),
            web.post('/api/block', self.block),
            web.post('/api/minecraft', self.mine),
            web.post('/api/txinfo', self.txinfo),
            web.post('/api/outputs', self.outputs),
            web.get('/api/address', self.address),
            web.post('/api/transact', self.transact)
        ])
        app.router.add_static('/', './web')
        web.run_app(app)
