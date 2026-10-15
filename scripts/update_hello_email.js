const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 1. auto_mailer.js
const mailerPath = path.join(ROOT, 'static', 'js', 'auto_mailer.js');
let mailer = fs.readFileSync(mailerPath, 'utf8');

mailer = mailer.replace(
  'senderAddress: "DraftLineup Security <noreply@draftlineup.com>",',
  'helloEmail: "hello@draftlineup.com",\r\n    senderAddress: "DraftLineup <hello@draftlineup.com>",'
);

mailer = mailer.replace(
  'replyTo: "furrhjohn10@gmail.com",',
  'replyTo: "hello@draftlineup.com",'
);

mailer = mailer.replace(
  'Official Inquiries: <a href="mailto:${MAILER_CONFIG.supportEmail}" style="color: #38bdf8; text-decoration: none;">${MAILER_CONFIG.supportEmail}</a>',
  'Direct Inquiries: <a href="mailto:${MAILER_CONFIG.helloEmail}" style="color: #38bdf8; text-decoration: none;">${MAILER_CONFIG.helloEmail}</a>'
);

fs.writeFileSync(mailerPath, mailer, 'utf8');
console.log('✓ Updated auto_mailer.js with hello@draftlineup.com');

// 2. email_relay_server.py
const relayPath = path.join(ROOT, 'scripts', 'email_relay_server.py');
let relay = fs.readFileSync(relayPath, 'utf8');
relay = relay.replace(
  'SMTP_USER = os.environ.get("SMTP_USER", "support@draftlineup.com")',
  'SMTP_USER = os.environ.get("SMTP_USER", "hello@draftlineup.com")'
);
relay = relay.replace(
  'DEFAULT_SENDER = os.environ.get("DEFAULT_SENDER", "DraftLineup Security <support@draftlineup.com>")',
  'DEFAULT_SENDER = os.environ.get("DEFAULT_SENDER", "DraftLineup <hello@draftlineup.com>")'
);
fs.writeFileSync(relayPath, relay, 'utf8');
console.log('✓ Updated email_relay_server.py with hello@draftlineup.com');

// 3. login.html
const loginPath = path.join(ROOT, 'login.html');
let login = fs.readFileSync(loginPath, 'utf8');
login = login.replace(/support@bluelinedataworks\.com/g, 'hello@draftlineup.com');
fs.writeFileSync(loginPath, login, 'utf8');
console.log('✓ Updated login.html with hello@draftlineup.com');
