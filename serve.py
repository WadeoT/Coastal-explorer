#!/usr/bin/env python3
"""Open the bundled game locally. Uses only Python's standard library."""

import argparse
import functools
import http.server
from pathlib import Path
import threading
import webbrowser


def main():
    parser = argparse.ArgumentParser(description="Play Coastal Explorer in your browser")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    directory = Path(__file__).resolve().parent
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(directory))
    server = None
    for port in range(args.port, min(args.port + 20, 65536)):
        try:
            server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
            break
        except OSError:
            continue
    if server is None:
        raise SystemExit("No free local port found. Try: python3 serve.py --port 9000")
    address = f"http://127.0.0.1:{server.server_port}/"
    print(f"\nCoastal Explorer: {address}", flush=True)
    print("Keep this window open while playing. Press Ctrl+C to stop.\n", flush=True)
    if not args.no_browser:
        opener = threading.Timer(0.5, webbrowser.open, args=(address,))
        opener.daemon = True
        opener.start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
