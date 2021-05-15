from getpass import getpass
from server import log as logger
from server import web

from server.mining import *
from server.btcrpc import *
from server.decode_block import *

"""
 Starts the event loop and retrieves the rpc user/pass to use for bitcoin json/rpc.
"""


async def mine(rpc):
    template = (await rpc.blocktemplate())["result"]
    result = await stripmine(template)

    decodeBlock(result["block"])

    if result["valid"]:
        print("this block is valid, wink-wink!")


loop = asyncio.get_event_loop()

if len(sys.argv) >= 3:
    username = sys.argv[1]
    password = sys.argv[2]
else:
    username = input("rpc-username: ")
    password = getpass()

mining = len(list(filter(lambda x: '--mine' in x, sys.argv))) > 0
rpc = BTCRPC(username, password)
try:
    server = web.Server(rpc)

    if mining:
        loop.run_until_complete(
            loop.create_task(mine(rpc))
        )
        loop.run_until_complete(rpc.close())
    else:
        loop.create_task(server.serve())
        loop.run_forever()
except KeyboardInterrupt:
    logger.log('server stopped by user.')
