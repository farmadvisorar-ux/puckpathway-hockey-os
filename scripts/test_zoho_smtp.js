/**
 * DraftLineup.com - Zoho Mail SMTP Diagnostic & Verification Script (Node.js)
 * Tests connectivity and TLS handshake to smtp.zoho.com on port 587.
 */

const net = require('net');
const tls = require('tls');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'hello@draftlineup.com';
const SMTP_PASS = process.env.SMTP_PASS || '';

console.log('='.repeat(60));
console.log('🏒 DraftLineup.com - Zoho Mail SMTP Diagnostic (Node.js)');
console.log('='.repeat(60));
console.log(`Target Host: ${SMTP_HOST}:${SMTP_PORT}`);
console.log(`Sender User: ${SMTP_USER}`);

const socket = net.createConnection(SMTP_PORT, SMTP_HOST);
socket.setEncoding('utf8');

socket.on('connect', () => {
  console.log(`✓ Connected to ${SMTP_HOST}:${SMTP_PORT} via TCP socket`);
});

let step = 0;

socket.on('data', (data) => {
  const line = data.trim();
  console.log(`[SMTP Response] ${line}`);

  if (step === 0 && line.startsWith('220')) {
    step = 1;
    socket.write('EHLO draftlineup.com\r\n');
  } else if (step === 1 && line.includes('250')) {
    step = 2;
    console.log('✓ Initiating STARTTLS encryption negotiation...');
    socket.write('STARTTLS\r\n');
  } else if (step === 2 && line.startsWith('220')) {
    console.log('✓ STARTTLS accepted! Securing TLS socket...');
    const tlsSocket = tls.connect({
      socket: socket,
      host: SMTP_HOST,
      rejectUnauthorized: true
    }, () => {
      console.log('✓ TLS Handshake successful! Encrypted channel established with Zoho Mail.');
      
      if (!SMTP_PASS) {
        console.log('\n⚠️  No SMTP_PASS provided in environment.');
        console.log('To authenticate and send live messages:');
        console.log('  $env:SMTP_PASS="your_zoho_app_password"; node scripts/test_zoho_smtp.js');
        tlsSocket.end('QUIT\r\n');
        process.exit(0);
      } else {
        console.log('Authenticating with Zoho App Password...');
        tlsSocket.write('EHLO draftlineup.com\r\n');
      }
    });

    tlsSocket.setEncoding('utf8');
    tlsSocket.on('data', (tlsData) => {
      console.log(`[TLS SMTP] ${tlsData.trim()}`);
    });
  }
});

socket.on('error', (err) => {
  console.error(`✗ Connection error: ${err.message}`);
  process.exit(1);
});

socket.setTimeout(12000, () => {
  console.log('Socket timed out after 12s');
  socket.end();
});
