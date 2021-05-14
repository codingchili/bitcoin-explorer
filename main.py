import asyncio
import sys

from getpass import getpass
from server import log as logger
from server import web

from server.mining import *
from server.btcrpc import *
from server.decode_block import *

"""
 Starts the event loop and retrieves the rpc user/pass to use for bitcoin json/rpc.
"""

import io

async def mine(rpc):
    template = (await rpc.blocktemplate())["result"]
    result = await stripmine(template)

    block = result["block"]
    raw = io.BytesIO(block)
    #print(bytes_to_string(x2_sha256(raw.read(80))[::-1]))
    #print(bytes_to_string(x2_sha256(get_transaction(template))[::-1]))

    print("block: " + hexlify(result["block"]).decode())
    print("hashx: " + result["hash"])
    print("target:" + template["target"])
    if result["valid"]:
        print("this block is valid, wink-wink!")
    decodeBlock(result["block"])


try:
    if len(sys.argv) == 3:
        username = sys.argv[1]
        password = sys.argv[2]
    else:
        username = input("rpc-username: ")
        password = getpass()

    rpc = BTCRPC(username, password)

    server = web.Server(rpc)
    loop = asyncio.get_event_loop()
    #loop.create_task(mine(rpc))
    loop.create_task(server.serve())
    loop.run_forever()
except KeyboardInterrupt:
    logger.log('server stopped by user.')