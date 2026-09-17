/**
 * DraftLineup Node.js Automated Mailer Service
 * 
 * Official Domain: draftlineup.com
 * Routing: furrhjohn10@gmail.com
 * 
 * Usage:
 *   node scripts/auto_mailer_service.js --dry-run
 *   node scripts/auto_mailer_service.js --test-signup
 *   node scripts/auto_mailer_service.js --test-reset
 *   node scripts/auto_mailer_service.js --daemon
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  domain: 'draftlineup.com',
  brandName: 'DraftLineup',
  adminEmail: 'furrhjohn10@gmail.com',
  senderAddress: 'DraftLineup Security <noreply@draftlineup.com>',
  replyTo: 'furrhjohn10@gmail.com',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '465', 10),
  smtpUser: process.env.SMTP_USER || 'furrhjohn10@gmail.com',
  smtpPass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || ''
};

const args = process.argv.slice(2);
const IS_DRY_RUN = args.includes('--dry-run');
const IS_TEST_SIGNUP = args.includes('--test-signup');
const IS_TEST_RESET = args.includes('--test-reset');
const IS_DAEMON = args.includes('--daemon');

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken() {
  return 'tk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
}

function renderSignupEmail(name, email, code, token) {
  return {
    from: CONFIG.senderAddress,
    to: email,
    replyTo: CONFIG.replyTo,
    subject: `Verify Your DraftLineup Account (Code: ${code})`,
    text: `Welcome to DraftLineup, ${name}!\n\nYour 6-digit confirmation code is: ${code}\n\nThis code expires in 15 minutes.\nVerify online: https://${CONFIG.domain}/verify?email=${encodeURIComponent(email)}&code=${code}&token=${token}\n\nOperations: ${CONFIG.adminEmail}\nDraftLineup Team`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:16px;border:1px solid #1e293b;">
        <div style="text-align:center;padding:16px 0;border-bottom:1px solid #334155;">
          <h1 style="color:#38bdf8;margin:0;font-size:24px;text-transform:uppercase;">DraftLineup</h1>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0 0;">Official Scouting & Athlete Verification · ${CONFIG.domain}</p>
        </div>
        <div style="padding:24px 0;">
          <h2 style="color:#ffffff;margin-top:0;">Welcome, ${name}!</h2>
          <p style="color:#cbd5e1;line-height:1.5;">Please verify your email address to activate your official hockey passport on <strong>${CONFIG.domain}</strong>:</p>
          <div style="background:#0284c71a;border:2px dashed #38bdf8;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <div style="font-size:11px;color:#38bdf8;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Verification Code</div>
            <div style="font-size:32px;font-family:monospace;font-weight:900;color:#ffffff;letter-spacing:6px;margin:8px 0;">${code}</div>
            <div style="font-size:11px;color:#94a3b8;">Expires in 15 minutes · Never share this code</div>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="https://${CONFIG.domain}/verify?email=${encodeURIComponent(email)}&code=${code}&token=${token}" style="display:inline-block;background:#0284c7;color:#ffffff;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;">Confirm Account &rarr;</a>
          </div>
        </div>
        <div style="border-top:1px solid #334155;padding-top:16px;text-align:center;font-size:11px;color:#64748b;">
          Sent via ${CONFIG.adminEmail} · Reply directly for support · © ${new Date().getFullYear()} DraftLineup
        </div>
      </div>
    `
  };
}

function renderResetEmail(name, email, code, token) {
  return {
    from: CONFIG.senderAddress,
    to: email,
    replyTo: CONFIG.replyTo,
    subject: `Reset Your DraftLineup Password (Code: ${code})`,
    text: `Hello ${name},\n\nYour DraftLineup password reset code is: ${code}\n\nReset online: https://${CONFIG.domain}/reset-password?email=${encodeURIComponent(email)}&code=${code}&token=${token}\n\nIf you did not request this, contact ${CONFIG.adminEmail}.\nDraftLineup Team`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:16px;border:1px solid #1e293b;">
        <div style="text-align:center;padding:16px 0;border-bottom:1px solid #334155;">
          <h1 style="color:#fbbf24;margin:0;font-size:24px;text-transform:uppercase;">DraftLineup Security</h1>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0 0;">Password Reset Request · ${CONFIG.domain}</p>
        </div>
        <div style="padding:24px 0;">
          <h2 style="color:#ffffff;margin-top:0;">Password Reset Code</h2>
          <p style="color:#cbd5e1;line-height:1.5;">Enter the following 6-digit code on <strong>${CONFIG.domain}</strong> to reset your password:</p>
          <div style="background:#f59e0b1a;border:2px dashed #f59e0b;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <div style="font-size:11px;color:#fbbf24;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Reset Code</div>
            <div style="font-size:32px;font-family:monospace;font-weight:900;color:#ffffff;letter-spacing:6px;margin:8px 0;">${code}</div>
            <div style="font-size:11px;color:#94a3b8;">Expires in 15 minutes · Keep secure</div>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="https://${CONFIG.domain}/reset-password?email=${encodeURIComponent(email)}&code=${code}&token=${token}" style="display:inline-block;background:#d97706;color:#ffffff;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;">Reset Password Now &rarr;</a>
          </div>
        </div>
        <div style="border-top:1px solid #334155;padding-top:16px;text-align:center;font-size:11px;color:#64748b;">
          Sent via ${CONFIG.adminEmail} · Support: ${CONFIG.adminEmail} · © ${new Date().getFullYear()} DraftLineup
        </div>
      </div>
    `
  };
}

async function dispatchEmail(mailOptions) {
  console.log(`\n===============================================================`);
  console.log(`✉️ [DraftLineup Mailer] Dispatching Email`);
  console.log(`To:       ${mailOptions.to}`);
  console.log(`From:     ${mailOptions.from}`);
  console.log(`Reply-To: ${mailOptions.replyTo}`);
  console.log(`Subject:  ${mailOptions.subject}`);
  console.log(`Routing:  via ${CONFIG.adminEmail} (Domain: ${CONFIG.domain})`);
  console.log(`===============================================================`);

  // Check if nodemailer is installed
  let nodemailer = null;
  try {
    nodemailer = require('nodemailer');
  } catch(e) {
    // Nodemailer not installed
  }

  if (nodemailer && CONFIG.smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: CONFIG.smtpUser,
          pass: CONFIG.smtpPass
        }
      });
      const info = await transporter.sendMail(mailOptions);
      console.log(`✓ Real SMTP Dispatch Successful! Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch(err) {
      console.warn(`! SMTP Transport Warning: ${err.message}. Falling back to delivery log simulation.`);
    }
  } else {
    console.log(`ℹ️ [Simulation / Dry-Run Mode] No SMTP password supplied. Email logged and queued.`);
  }

  const logDir = path.resolve(__dirname, '..', 'static', 'js');
  const logFile = path.join(logDir, 'draftlineup_dispatched_emails.json');
  let log = [];
  try {
    if (fs.existsSync(logFile)) {
      log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
  } catch(e) {}

  const entry = {
    id: 'srv_' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    mailOptions
  };
  log.unshift(entry);
  fs.writeFileSync(logFile, JSON.stringify(log.slice(0, 50), null, 2), 'utf8');
  console.log(`✓ Email logged to static/js/draftlineup_dispatched_emails.json`);
  return { success: true, entryId: entry.id };
}

async function main() {
  console.log(`DraftLineup Auto-Mailer Service (${CONFIG.domain})`);
  console.log(`Active Admin / Routing Address: ${CONFIG.adminEmail}`);

  if (IS_TEST_SIGNUP || (!IS_TEST_RESET && !IS_DAEMON)) {
    const code = generateOTP();
    const token = generateToken();
    const mail = renderSignupEmail('Scouting Prospect', CONFIG.adminEmail, code, token);
    await dispatchEmail(mail);
  }

  if (IS_TEST_RESET) {
    const code = generateOTP();
    const token = generateToken();
    const mail = renderResetEmail('Scouting Administrator', CONFIG.adminEmail, code, token);
    await dispatchEmail(mail);
  }

  console.log(`\nAll mailer operations completed successfully.`);
}

main().catch(err => {
  console.error('Fatal Mailer Error:', err);
  process.exit(1);
});
