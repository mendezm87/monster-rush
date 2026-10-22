# Receives pictures from review pages and saves them as PNGs in the repo root (ignored by git), so Claude can look at them.
# Run: python tools/recv.py   (listens on 127.0.0.1:8139). A page POSTs a canvas's toDataURL() to http://127.0.0.1:8139/?name=x.png
import base64, os, urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class H(BaseHTTPRequestHandler):
    def do_POST(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        name = os.path.basename(q.get('name', ['shot.png'])[0])
        if not name.endswith('.png'): name += '.png'
        data = self.rfile.read(int(self.headers['Content-Length'])).decode()
        open(os.path.join(ROOT, name), 'wb').write(base64.b64decode(data.split(',', 1)[1]))
        self.send_response(200); self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers(); self.wfile.write(b'ok')
    def log_message(self, *a): pass
HTTPServer(('127.0.0.1', 8139), H).serve_forever()
