"""Serve the static dashboard locally using only Python's standard library."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

if __name__ == "__main__":
    print("FreshFlow Control Tower: http://localhost:8080")
    ThreadingHTTPServer(("127.0.0.1", 8080), SimpleHTTPRequestHandler).serve_forever()

