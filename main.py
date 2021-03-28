import asyncio
import sys

from getpass import getpass
from server import log as logger
from server import web

try:
    if len(sys.argv) == 3:
        username = sys.argv[1]
        password = sys.argv[2]
    else:
        username = input("rpc-username: ")
        password = getpass()

    server = web.Server(username, password)
    loop = asyncio.get_event_loop()
    loop.create_task(server.serve())
    loop.run_forever()
except KeyboardInterrupt:
    logger.log('server stopped by user.')
