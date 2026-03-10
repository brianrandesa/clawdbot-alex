#!/usr/bin/env python3
"""
Simple file server for downloading the ESA Real Event Discovery System
"""

import http.server
import socketserver
import os
import urllib.parse

class FileHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/download':
            self.path = '/ESA_Real_Event_Discovery_System.zip'
        elif self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = """
            <html>
            <head><title>ESA Real Event Discovery System Download</title></head>
            <body>
                <h1>🎯 ESA Real Event Discovery System</h1>
                <p>Complete real prospect discovery system with Eventbrite API integration</p>
                <p><strong>File Size:</strong> 76 KB</p>
                <p><strong>Includes:</strong></p>
                <ul>
                    <li>Real prospect discovery engines</li>
                    <li>Eventbrite API integration (token included)</li>
                    <li>94 qualified prospects ready for outreach</li>
                    <li>75-point qualification system</li>
                    <li>Complete documentation</li>
                </ul>
                <p><a href="/download" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">📥 DOWNLOAD ZIP FILE</a></p>
                <p><em>Built for Brian Rand / Event Sales Agency</em></p>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
            return
        return super().do_GET()

if __name__ == "__main__":
    PORT = 8080
    os.chdir('/Users/henry/.openclaw/workspace')
    
    with socketserver.TCPServer(("", PORT), FileHandler) as httpd:
        print(f"🌐 Server running at http://170.250.211.209:{PORT}")
        print(f"📥 Download link: http://170.250.211.209:{PORT}/download")
        httpd.serve_forever()