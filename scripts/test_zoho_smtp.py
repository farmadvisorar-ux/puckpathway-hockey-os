#!/usr/bin/env python3
"""
DraftLineup.com - Zoho Mail SMTP Diagnostic & Verification Script
Tests connectivity and authentication to smtp.zoho.com on port 587 (STARTTLS).
"""

import os
import sys
import smtplib
from email.mime.text import MIMEText

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.zoho.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "hello@draftlineup.com")
SMTP_PASS = os.environ.get("SMTP_PASS", "")

def test_zoho_smtp():
    print("=" * 60)
    print("🏒 DraftLineup.com - Zoho Mail SMTP Verification")
    print("=" * 60)
    print(f"Target Host: {SMTP_HOST}:{SMTP_PORT}")
    print(f"Sender User: {SMTP_USER}")
    
    if not SMTP_PASS:
        print("\n⚠️  No SMTP_PASS environment variable provided.")
        print("To run a live test, execute:")
        print('  $env:SMTP_PASS="your_zoho_app_password"; python scripts/test_zoho_smtp.py')
        print("\nTesting TCP handshake and STARTTLS capability...")
        try:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
            server.ehlo()
            server.starttls()
            server.ehlo()
            print("✓ Successfully connected to smtp.zoho.com and negotiated TLS encryption!")
            server.quit()
            return True
        except Exception as e:
            print(f"✗ Connection error: {e}")
            return False

    try:
        print("\nConnecting to Zoho SMTP and authenticating...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USER, SMTP_PASS)
        print("✓ Authentication successful! Credentials valid.")

        # Send test ping
        recipient = SMTP_USER
        msg = MIMEText("DraftLineup.com Zoho SMTP live dispatch verification ping.")
        msg["Subject"] = "DraftLineup.com Zoho SMTP Verification"
        msg["From"] = f"DraftLineup <{SMTP_USER}>"
        msg["To"] = recipient

        server.sendmail(SMTP_USER, recipient, msg.as_string())
        server.quit()
        print(f"✓ Test verification message dispatched to {recipient}!")
        return True
    except smtplib.SMTPAuthenticationError as auth_err:
        print(f"✗ Authentication Failed: {auth_err}")
        print("Tip: If Two-Factor Authentication (2FA) is enabled on Zoho, generate an App Password:")
        print("  Zoho Mail -> Settings -> Security -> App Passwords -> Generate")
        return False
    except Exception as e:
        print(f"✗ Error during SMTP test: {e}")
        return False

if __name__ == "__main__":
    success = test_zoho_smtp()
    sys.exit(0 if success else 1)
