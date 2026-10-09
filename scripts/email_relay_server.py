#!/usr/bin/env python3
"""
DraftLineup.com - Enterprise SMTP & API Email Relay Server
Listens for transactional email events and routes via SMTP (Zoho / SendGrid / Resend / Amazon SES / Gmail)
"""

import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import HTTPServer, BaseHTTPRequestHandler

# Configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.zoho.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "support@draftlineup.com")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
DEFAULT_SENDER = os.environ.get("DEFAULT_SENDER", "DraftLineup Security <support@draftlineup.com>")

class EmailRelayHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            payload = json.loads(post_data.decode('utf-8'))
            recipient = payload.get('to')
            subject = payload.get('subject', 'DraftLineup Notification')
            html_body = payload.get('html', '<p>No content</p>')
            sender = payload.get('from', DEFAULT_SENDER)

            if not recipient:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': 'Recipient email ("to") required'}).encode('utf-8'))
                return

            # Construct MIME message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = sender
            msg['To'] = recipient
            msg.attach(MIMEText(html_body, 'html'))

            # Send via SMTP if credentials available, else return logged output
            if SMTP_PASS:
                server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_USER, recipient, msg.as_string())
                server.quit()
                status_msg = "Dispatched via live SMTP server"
            else:
                status_msg = "Logged & queued (Set SMTP_PASS env variable to enable live delivery)"

            print(f"[Email Relay] {status_msg} -> To: {recipient} | Subject: {subject}")

            self._set_headers(200)
            self.wfile.write(json.dumps({
                'success': True,
                'message': status_msg,
                'recipient': recipient,
                'domain': 'draftlineup.com'
            }).encode('utf-8'))

        except Exception as e:
            print(f"[Email Relay Error] {str(e)}")
            self._set_headers(500)
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

def run_relay(port=8025):
    server_address = ('', port)
    httpd = HTTPServer(server_address, EmailRelayHandler)
    print(f"⚡ DraftLineup.com Email Relay Server listening on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run_relay()
