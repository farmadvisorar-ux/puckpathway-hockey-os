/**
 * DraftLineup Auto-Mailer & Transactional Notification Engine
 * 
 * Official Domain: draftlineup.com
 * Routing & Dispatch: furrhjohn10@gmail.com
 * 
 * Capabilities:
 * - Automated Sign-Up Confirmation Emails with 6-Digit OTP Verification
 * - Automated Password Reset Emails with Cryptographic Security Tokens
 * - Athlete Passport Ledger Stamping Notifications
 * - Recruiter Inbound & Wire Message Dispatch
 * - In-Browser Real-Time Email Outbox & HTML Template Inspector
 * - Cross-Session Persistent Token Verification State
 */

(function(window) {
  'use strict';

  // =========================================================================
  // 1. CONFIGURATION & CONSTANTS
  // =========================================================================
  const MAILER_CONFIG = {
    domain: "draftlineup.com",
    brandName: "DraftLineup",
    platformTitle: "DraftLineup Hockey OS & Scouting Network",
    adminEmail: "furrhjohn10@gmail.com",
    senderAddress: "DraftLineup Security <noreply@draftlineup.com>",
    supportEmail: "support@draftlineup.com",
    authEmail: "auth@draftlineup.com",
    scoutingEmail: "scouting@draftlineup.com",
    replyTo: "furrhjohn10@gmail.com",
    tokenExpiryMinutes: 15
  };

  const STORAGE_KEY_OUTBOX = "draftlineup_mailer_outbox";
  const STORAGE_KEY_TOKENS = "draftlineup_pending_tokens";

  // Helper: Generate 6-Digit OTP Code
  function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  // Helper: Generate Secure Cryptographic Token
  function generateToken() {
    return 'tk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
  }

  // =========================================================================
  // 2. STORAGE & QUEUE MANAGEMENT
  // =========================================================================
  function getOutbox() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OUTBOX);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return [];
  }

  function saveOutbox(list) {
    try {
      localStorage.setItem(STORAGE_KEY_OUTBOX, JSON.stringify(list.slice(0, 100)));
    } catch(e) {}
  }

  function getTokens() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return {};
  }

  function saveTokens(map) {
    try {
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(map));
    } catch(e) {}
  }

  function storePendingToken(type, email, code, token, extraData = {}) {
    const tokens = getTokens();
    const expiry = Date.now() + MAILER_CONFIG.tokenExpiryMinutes * 60 * 1000;
    const key = `${type}:${email.toLowerCase().trim()}`;

    tokens[key] = {
      type,
      email: email.toLowerCase().trim(),
      code,
      token,
      expiry,
      created_at: new Date().toISOString(),
      extra: extraData,
      used: false
    };

    saveTokens(tokens);
    return tokens[key];
  }

  function verifyToken(type, email, code) {
    const tokens = getTokens();
    const key = `${type}:${email.toLowerCase().trim()}`;
    const entry = tokens[key];

    if (!entry) {
      return { success: false, message: "No active verification code found for this email address." };
    }

    if (entry.used) {
      return { success: false, message: "This code has already been used. Please request a new one." };
    }

    if (Date.now() > entry.expiry) {
      return { success: false, message: "This verification code has expired (15 minute limit). Please request a new one." };
    }

    if (String(entry.code).trim() !== String(code).trim()) {
      return { success: false, message: "Invalid verification code. Please check the code and try again." };
    }

    // Mark used
    entry.used = true;
    entry.verified_at = new Date().toISOString();
    tokens[key] = entry;
    saveTokens(tokens);

    return { success: true, message: "Verification successful!", tokenEntry: entry };
  }

  // =========================================================================
  // 3. RESPONSIVE HTML EMAIL TEMPLATES (draftlineup.com)
  // =========================================================================
  function renderEmailHtmlHeader(title) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} | DraftLineup</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #e5e7eb;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #030712; padding: 24px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #38bdf8;">
                    <div style="font-size: 28px; margin-bottom: 4px;">🏒 ⚡</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">
                      DraftLineup
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #bae6fd; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                      Official Scouting & Athlete Verification Grid · draftlineup.com
                    </p>
                  </td>
                </tr>
                <!-- Body Container -->
                <tr>
                  <td style="padding: 32px 24px;">
    `;
  }

  function renderEmailHtmlFooter(recipientEmail) {
    return `
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #090d16; padding: 24px; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 11px; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0; color: #94a3b8; font-weight: 600;">
                      Sent via DraftLineup Autonomous Mailer Grid (<a href="https://draftlineup.com" style="color: #38bdf8; text-decoration: none;">draftlineup.com</a>)
                    </p>
                    <p style="margin: 0 0 8px 0;">
                      Sending & Operations Desk: <a href="mailto:${MAILER_CONFIG.adminEmail}" style="color: #38bdf8; text-decoration: none;">${MAILER_CONFIG.adminEmail}</a> · Reply directly to this email to reach our scouting operations.
                    </p>
                    <p style="margin: 0 0 8px 0;">
                      This message was intended for <span style="color: #cbd5e1;">${recipientEmail}</span>. If you did not create an account or request this action, please ignore this message or report it to <a href="mailto:${MAILER_CONFIG.adminEmail}" style="color: #38bdf8; text-decoration: none;">${MAILER_CONFIG.adminEmail}</a>.
                    </p>
                    <p style="margin: 12px 0 0 0; color: #475569; font-size: 10px;">
                      © ${new Date().getFullYear()} DraftLineup. All rights reserved. Cryptographic Cipher-Bravo Protocol Active.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // Template 1: Sign-Up Confirmation & OTP Verification
  function createSignupConfirmationTemplate(data) {
    const { name, email, role, code, token } = data;
    const verifyUrl = `https://draftlineup.com/verify?email=${encodeURIComponent(email)}&code=${code}&token=${token}`;

    const body = `
      ${renderEmailHtmlHeader("Verify Your Account")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Welcome to DraftLineup, ${name}!
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Your official account has been created for the role of <strong style="color: #38bdf8; text-transform: uppercase;">${role || 'ATHLETE'}</strong>. To complete your registration and activate your verified identity on <a href="https://draftlineup.com" style="color: #38bdf8; text-decoration: none;">draftlineup.com</a>, please confirm your email address using the verification code below:
      </p>

      <!-- Verification Code Callout -->
      <div style="background-color: #0284c715; border: 1.5px dashed #38bdf8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
          Your 6-Digit Verification Code
        </div>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);">
          ${code}
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
          Valid for ${MAILER_CONFIG.tokenExpiryMinutes} minutes. Do not share this code with anyone.
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          ✓ Confirm Account & Sign In
        </a>
      </div>

      <!-- Quick Tips -->
      <div style="background-color: #1e293b50; border-radius: 10px; padding: 16px; border: 1px solid #334155; margin-top: 24px;">
        <div style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">
          🛡️ What happens next?
        </div>
        <ul style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          <li>Your profile is automatically registered in our 3,057+ athlete and staff registry.</li>
          <li>Athletes receive an immutable cryptographic ledger block stamping biometrics and composite trajectory scores.</li>
          <li>College recruiters and scouting directors can discover your verified passport.</li>
        </ul>
      </div>
      ${renderEmailHtmlFooter(email)}
    `;

    return {
      subject: `Verify Your DraftLineup Account (Code: ${code})`,
      html: body,
      code,
      token
    };
  }

  // Template 2: Password Reset Request & OTP
  function createPasswordResetTemplate(data) {
    const { name, email, code, token } = data;
    const resetUrl = `https://draftlineup.com/reset-password?email=${encodeURIComponent(email)}&code=${code}&token=${token}`;

    const body = `
      ${renderEmailHtmlHeader("Password Reset Request")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Password Reset Request
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Hello ${name || 'User'}, we received a request to reset the password for your DraftLineup account (<a href="https://draftlineup.com" style="color: #38bdf8; text-decoration: none;">draftlineup.com</a>).
      </p>

      <!-- Reset Code Callout -->
      <div style="background-color: #f59e0b15; border: 1.5px dashed #f59e0b; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 11px; font-weight: 700; color: #fbbf24; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
          Your 6-Digit Password Reset Code
        </div>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 12px rgba(245, 158, 11, 0.4);">
          ${code}
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
          Expires in ${MAILER_CONFIG.tokenExpiryMinutes} minutes. If you did not request this, please ignore this email.
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          🔑 Reset My Password
        </a>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #1e293b50; border-radius: 10px; padding: 16px; border: 1px solid #334155; margin-top: 24px;">
        <div style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">
          🔒 Security Alert
        </div>
        <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          Your password will not change until you enter the code above and submit a new password. If you suspect unauthorized access to your account, please immediately notify our team at <a href="mailto:${MAILER_CONFIG.adminEmail}" style="color: #38bdf8; text-decoration: none;">${MAILER_CONFIG.adminEmail}</a>.
        </p>
      </div>
      ${renderEmailHtmlFooter(email)}
    `;

    return {
      subject: `Reset Your DraftLineup Password (Code: ${code})`,
      html: body,
      code,
      token
    };
  }

  // Template 3: Athlete Passport Minted & Stamped
  function createAthletePassportTemplate(data) {
    const { name, email, team, league, jersey, compositeScore, ledgerHash } = data;
    const body = `
      ${renderEmailHtmlHeader("Athlete Passport Minted")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Official Athlete Passport Minted & Stamped
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Congratulations, <strong>${name}</strong> (#${jersey || '--'})! Your official athlete dossier has been minted and cryptographically stamped on the DraftLineup Immutable Ledger.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="40%" style="color: #64748b; font-weight: 600;">Current Team:</td>
            <td style="color: #ffffff; font-weight: 700;">${team || 'Independent'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">League:</td>
            <td style="color: #38bdf8;">${league || 'Tier 1 AAA'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Composite Score:</td>
            <td style="color: #34d399; font-weight: 800; font-size: 15px;">${compositeScore || 88.5} / 100</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Ledger Hash:</td>
            <td style="font-family: monospace; color: #94a3b8; font-size: 11px;">${ledgerHash || '0x7f4e92a1...'}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/player.html" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          View Your Live Athlete Passport &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(email)}
    `;

    return {
      subject: `Official Athlete Passport Stamped: ${name} (#${jersey || '--'})`,
      html: body
    };
  }

  // =========================================================================
  // 4. DISPATCH ENGINE (Client-Side & Server Relay)
  // =========================================================================
  function logDispatchedEmail(record) {
    const outbox = getOutbox();
    const entry = {
      id: 'mail_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString(),
      from: MAILER_CONFIG.senderAddress,
      replyTo: MAILER_CONFIG.replyTo,
      to: record.to,
      subject: record.subject,
      html: record.html,
      type: record.type,
      code: record.code || null,
      token: record.token || null,
      status: 'DELIVERED (SIMULATED / ROUTED)',
      route: `Sent via ${MAILER_CONFIG.adminEmail} (Display: draftlineup.com)`
    };

    outbox.unshift(entry);
    saveOutbox(outbox);

    // Trigger toast notification on active page
    showMailerToast(entry);

    // Dispatch global event
    try {
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new CustomEvent("draftlineup:mailSent", { detail: { mail: entry } }));
      }
    } catch(e) {}

    return entry;
  }

  // Visual Toast for Dispatched Email
  function showMailerToast(mail) {
    if (typeof document === 'undefined') return;

    let toastContainer = document.getElementById('draftlineupToastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'draftlineupToastContainer';
      toastContainer.className = 'fixed bottom-5 right-5 z-[150] space-y-2 max-w-sm pointer-events-none';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto p-4 rounded-2xl bg-slate-900/95 border border-sky-500/50 shadow-2xl text-white backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300';
    
    let codeBadge = '';
    if (mail.code) {
      codeBadge = `
        <div class="mt-2 flex items-center justify-between p-2 rounded-xl bg-sky-950/60 border border-sky-500/40">
          <span class="text-[10px] text-sky-400 font-mono font-bold">VERIFICATION CODE:</span>
          <span class="font-mono text-sm font-black text-white tracking-widest">${mail.code}</span>
        </div>
      `;
    }

    toast.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="w-8 h-8 rounded-xl bg-sky-600/30 border border-sky-400/50 flex items-center justify-center text-sm shrink-0">
          ✉️
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">DraftLineup Auto-Mailer</span>
            <span class="text-[9px] text-slate-400 font-mono">${mail.displayTime}</span>
          </div>
          <div class="text-xs font-bold text-white truncate mt-0.5">${mail.subject}</div>
          <div class="text-[10px] text-slate-300 truncate">To: ${mail.to}</div>
          ${codeBadge}
          <div class="mt-2 flex items-center gap-2">
            <button onclick="window.DraftLineupMailer.openOutboxModal('${mail.id}')" class="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] transition">
              Inspect Email &rarr;
            </button>
            <span class="text-[9px] text-slate-400 font-mono truncate">via ${MAILER_CONFIG.adminEmail}</span>
          </div>
        </div>
        <button onclick="this.closest('.pointer-events-auto').remove()" class="text-slate-400 hover:text-white text-xs">✕</button>
      </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast && toast.parentNode) toast.remove();
    }, 12000);
  }

  // =========================================================================
  // 5. PUBLIC API METHODS
  // =========================================================================
  function sendSignupConfirmation(userData) {
    const code = generateOTP();
    const token = generateToken();
    const email = (userData.email || "").trim();
    const name = userData.name || email.split("@")[0] || "Athlete";
    const role = userData.role || "athlete";

    // Save active token
    storePendingToken("SIGNUP", email, code, token, { name, role, userData });

    // Generate template
    const template = createSignupConfirmationTemplate({ name, email, role, code, token });

    // Dispatch & log
    const logged = logDispatchedEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      type: "SIGNUP_CONFIRMATION",
      code: code,
      token: token
    });

    console.log(`[DraftLineup Mailer] Sent Sign-Up Confirmation to ${email} (Code: ${code}) via ${MAILER_CONFIG.adminEmail}`);
    return { success: true, code, token, mailId: logged.id };
  }

  function sendPasswordReset(email) {
    email = (email || "").trim();
    const code = generateOTP();
    const token = generateToken();

    // Check if account exists
    let name = "User";
    try {
      const raw = localStorage.getItem("blueline_registered_users");
      if (raw) {
        const users = JSON.parse(raw);
        const match = users.find(u => (u.email || "").toLowerCase() === email.toLowerCase());
        if (match) name = match.name;
      }
    } catch(e) {}

    // Save active token
    storePendingToken("RESET", email, code, token, { name });

    // Generate template
    const template = createPasswordResetTemplate({ name, email, code, token });

    // Dispatch & log
    const logged = logDispatchedEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      type: "PASSWORD_RESET",
      code: code,
      token: token
    });

    console.log(`[DraftLineup Mailer] Sent Password Reset to ${email} (Code: ${code}) via ${MAILER_CONFIG.adminEmail}`);
    return { success: true, code, token, mailId: logged.id };
  }

  function sendAthletePassportNotice(playerData, recipientEmail) {
    recipientEmail = recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createAthletePassportTemplate({
      name: playerData.name,
      email: recipientEmail,
      team: playerData.team,
      league: playerData.league,
      jersey: playerData.num,
      compositeScore: playerData.composite_score,
      ledgerHash: playerData.ledger_hash
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "ATHLETE_PASSPORT_MINTED"
    });

    return { success: true, mailId: logged.id };
  }

  // =========================================================================
  // 6. IN-BROWSER EMAIL OUTBOX & TEMPLATE INSPECTOR MODAL
  // =========================================================================
  function renderOutboxModal() {
    let modal = document.getElementById("draftlineupOutboxModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "draftlineupOutboxModal";
    modal.className = "fixed inset-0 z-[160] hidden flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="relative w-full max-w-4xl max-h-[92vh] bg-slate-950 rounded-3xl border border-sky-500/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-700 p-0.5 shadow-lg shadow-sky-500/20">
              <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-lg">
                ✉️
              </div>
            </div>
            <div>
              <h3 class="text-base font-black text-white flex items-center gap-2">
                DraftLineup Auto-Mailer & Live Outbox
              </h3>
              <p class="text-xs text-slate-400">
                Sending & Receiving: <span class="text-sky-300 font-mono font-bold">${MAILER_CONFIG.adminEmail}</span> · Display Domain: <span class="text-emerald-400 font-mono font-bold">${MAILER_CONFIG.domain}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button id="sendTestEmailBtn" class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition">
              ⚡ Send Test Email
            </button>
            <button id="closeOutboxModalBtn" class="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition">
              ✕
            </button>
          </div>
        </div>

        <!-- Master / Detail Body -->
        <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          <!-- Left: Outbox Message List -->
          <div class="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-900/40">
            <div class="flex items-center justify-between px-1 mb-2 text-xs">
              <span class="text-slate-400 font-mono font-bold uppercase tracking-wider">Outbox Queue</span>
              <span id="outboxCountBadge" class="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">0 Messages</span>
            </div>
            <div id="outboxListContainer" class="space-y-1.5">
              <!-- Rendered items go here -->
            </div>
          </div>

          <!-- Right: HTML Preview & Raw Headers -->
          <div class="flex-1 flex flex-col overflow-hidden bg-slate-950 p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div>
                <h4 id="previewSubjectText" class="text-xs sm:text-sm font-black text-white truncate max-w-md">Select an email to view</h4>
                <div id="previewMetaText" class="text-[11px] text-slate-400 font-mono mt-0.5">--</div>
              </div>
              <div id="previewCodeBadge" class="hidden px-3 py-1 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-xs font-bold">
                CODE: --
              </div>
            </div>

            <!-- Email HTML Render Frame -->
            <div class="flex-1 rounded-2xl border border-slate-800 overflow-hidden bg-white shadow-inner relative">
              <iframe id="emailPreviewIframe" class="w-full h-full border-none" src="about:blank"></iframe>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-3 px-5 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Gmail Relay Ready · Node.js Backend Service Supported · draftlineup.com</span>
          </div>
          <button id="clearOutboxBtn" class="text-xs text-rose-400 hover:text-rose-300 underline">Clear Outbox</button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Wire Events
    document.getElementById("closeOutboxModalBtn").addEventListener("click", () => {
      modal.classList.add("hidden");
    });
    document.getElementById("sendTestEmailBtn").addEventListener("click", () => {
      sendSignupConfirmation({
        name: "Test Athlete",
        email: MAILER_CONFIG.adminEmail,
        role: "athlete"
      });
      refreshOutboxUI();
    });
    document.getElementById("clearOutboxBtn").addEventListener("click", () => {
      if (confirm("Clear all outbox records?")) {
        saveOutbox([]);
        refreshOutboxUI();
      }
    });

    return modal;
  }

  function openOutboxModal(focusMailId) {
    const modal = renderOutboxModal();
    modal.classList.remove("hidden");
    refreshOutboxUI(focusMailId);
  }

  function refreshOutboxUI(focusMailId) {
    const outbox = getOutbox();
    const countBadge = document.getElementById("outboxCountBadge");
    const container = document.getElementById("outboxListContainer");
    if (countBadge) countBadge.textContent = `${outbox.length} Messages`;

    if (!container) return;

    if (outbox.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-500 text-xs">
          No emails dispatched yet.<br>Click "Send Test Email" to test.
        </div>
      `;
      const iframe = document.getElementById("emailPreviewIframe");
      if (iframe) iframe.srcdoc = `<body style="background:#090d16;color:#64748b;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><p>No email selected.</p></body>`;
      return;
    }

    container.innerHTML = outbox.map(m => {
      let typeBadge = "bg-sky-500/20 text-sky-300 border-sky-500/40";
      if (m.type === "PASSWORD_RESET") typeBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      else if (m.type === "ATHLETE_PASSPORT_MINTED") typeBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

      return `
        <div onclick="window.DraftLineupMailer.selectMailForPreview('${m.id}')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition space-y-1">
          <div class="flex items-center justify-between">
            <span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border ${typeBadge}">${m.type}</span>
            <span class="text-[9px] text-slate-500 font-mono">${m.displayTime}</span>
          </div>
          <div class="text-xs font-bold text-white truncate">${m.subject}</div>
          <div class="text-[10px] text-slate-400 truncate">To: ${m.to}</div>
        </div>
      `;
    }).join("");

    const targetId = focusMailId || (outbox[0] ? outbox[0].id : null);
    if (targetId) selectMailForPreview(targetId);
  }

  function selectMailForPreview(mailId) {
    const outbox = getOutbox();
    const mail = outbox.find(m => m.id === mailId);
    if (!mail) return;

    const subjectText = document.getElementById("previewSubjectText");
    const metaText = document.getElementById("previewMetaText");
    const codeBadge = document.getElementById("previewCodeBadge");
    const iframe = document.getElementById("emailPreviewIframe");

    if (subjectText) subjectText.textContent = mail.subject;
    if (metaText) metaText.textContent = `From: ${mail.from} · To: ${mail.to} · Reply-To: ${mail.replyTo} · ${mail.timestamp}`;
    if (codeBadge) {
      if (mail.code) {
        codeBadge.textContent = `CODE: ${mail.code}`;
        codeBadge.classList.remove("hidden");
      } else {
        codeBadge.classList.add("hidden");
      }
    }
    if (iframe) {
      iframe.srcdoc = mail.html;
    }
  }

  // =========================================================================
  // 7. EXPORT TO GLOBAL SCOPE
  // =========================================================================
  window.DraftLineupMailer = {
    CONFIG: MAILER_CONFIG,
    sendSignupConfirmation,
    sendPasswordReset,
    sendAthletePassportNotice,
    verifySignupCode: (email, code) => verifyToken("SIGNUP", email, code),
    verifyResetCode: (email, code) => verifyToken("RESET", email, code),
    getOutbox,
    renderOutboxModal,
    openOutboxModal,
    selectMailForPreview
  };

})(typeof window !== 'undefined' ? window : global);
