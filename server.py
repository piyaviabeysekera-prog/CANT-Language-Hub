import http.server
import socketserver
import webbrowser
import os
import threading
import time

PORT = 8888
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIRECTORY = os.path.join(BASE_DIR, "dist")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

def open_browser():
    time.sleep(1.2)
    url = f"http://127.0.0.1:{PORT}"
    print(f"[+] Opening browser to {url} ...")
    webbrowser.open(url)

def main():
    if not os.path.exists(DIRECTORY):
        print(f"[!] Error: Directory not found: {DIRECTORY}")
        print("[!] Please run 'npm run build' first to build the production bundle.")
        return

    socketserver.TCPServer.allow_reuse_address = True
    
    print("=" * 60)
    print("  * CANT // THE THIEVES' TONGUE (Thai Audio Lab) *")
    print("  Rebellion Engine 2.0 // Port 8888")
    print(f"  Target: {DIRECTORY}")
    print(f"  Serving on: http://127.0.0.1:{PORT}")
    print("  Keep this window open while practicing.")
    print("=" * 60)

    threading.Thread(target=open_browser, daemon=True).start()

    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[!] Server stopped.")

if __name__ == "__main__":
    main()
