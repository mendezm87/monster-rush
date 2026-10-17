# Local dev server for Monster Rush: like `python -m http.server 8137`, but it tells the
# browser never to cache, so a reload (and test.html) always gets the latest files.
# Run from this folder: python serve.py [port]
import http.server, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
print(f'Monster Rush on http://localhost:{port}/  (tests: http://localhost:{port}/test.html)')
http.server.ThreadingHTTPServer(('', port), NoCache).serve_forever()
