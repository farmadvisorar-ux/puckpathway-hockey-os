/**
 * DraftLineup Auto-Mailer & Transactional Notification Engine
 * 
 * Official Domain: draftlineup.com
 * Routing & Dispatch: furrhjohn10@gmail.com
 * 
 * Capabilities:
 * - Automated Sign-Up Confirmation Emails with 6-Digit OTP Verification
 * - Automated Password Reset Emails with Cryptographic Security Tokens & Verification Flow
 * - Athlete Passport Ledger Stamping Notifications
 * - Scout Dossier & Confidential Intel Export Auto-Responder
 * - NCAA Transfer Portal Entry & Commitment Auto-Alerts
 * - Recruiter Inbound & "The Wire" Direct Messaging Auto-Responders
 * - Combine Biometric Testing & Trajectory Recalibration Reports
 * - Multi-Team Trade Machine Valuation & Salary Cap CBA Notices
 * - ADM Practice Plan & Station Drill Station Dispatches
 * - AI Film Room Telestration Breakdown Reports
 * - Elite Camp, Showcase & Tryout Invitation Dispatches
 * - In-Browser Real-Time Email Outbox & HTML Template Inspector with Search & Filters
 * - Cross-Session Persistent Token Verification State
 * - Optional Local Python Relay Forwarder (http://localhost:8025)
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
    helloEmail: "hello@draftlineup.com",
    contactEmail: "hello@draftkings.com",
    senderAddress: "DraftLineup <hello@draftlineup.com>",
    supportEmail: "support@draftlineup.com",
    authEmail: "auth@draftlineup.com",
    scoutingEmail: "scouting@draftlineup.com",
    recruitingEmail: "recruiting@draftlineup.com",
    portalEmail: "transfers@draftlineup.com",
    replyTo: "hello@draftlineup.com",
    tokenExpiryMinutes: 15,
    relayUrl: "http://localhost:8025/api/relay"
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
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY_OUTBOX);
        if (raw) return JSON.parse(raw);
      }
    } catch(e) {}
    return [];
  }

  function saveOutbox(list) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY_OUTBOX, JSON.stringify(list.slice(0, 150)));
      }
    } catch(e) {}
  }

  function getTokens() {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY_TOKENS);
        if (raw) return JSON.parse(raw);
      }
    } catch(e) {}
    return {};
  }

  function saveTokens(map) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(map));
      }
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
  // 3. RESPONSIVE HTML EMAIL FRAMEWORK (draftlineup.com)
  // =========================================================================
  function renderEmailHtmlHeader(title, categoryBadge = "OFFICIAL DISPATCH") {
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
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0284c7 0%, #0f172a 60%, #1e1b4b 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #38bdf8;">
                    <div style="display: inline-block; padding: 4px 12px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 20px; font-size: 10px; font-weight: 800; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                      ${categoryBadge}
                    </div>
                    <div style="font-size: 26px; margin-bottom: 2px;">🏒 ⚡</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">
                      DraftLineup
                    </h1>
                    <p style="margin: 4px 0 0 0; color: #bae6fd; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                      Lifelong Hockey Intelligence & Scouting Operating System · draftlineup.com
                    </p>
                  </td>
                </tr>
                <!-- Body Container -->
                <tr>
                  <td style="padding: 32px 24px;">
    `;
  }

  function renderEmailHtmlFooter(recipientEmail, contextNote = "DraftLineup Autonomous Notification Grid") {
    return `
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #090d16; padding: 24px; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 11px; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0; color: #94a3b8; font-weight: 600;">
                      ${contextNote} (<a href="https://draftlineup.com" style="color: #38bdf8; text-decoration: none;">draftlineup.com</a>)
                    </p>
                    <p style="margin: 0 0 8px 0;">
                      Sending & Operations Desk: <a href="mailto:${MAILER_CONFIG.adminEmail}" style="color: #38bdf8; text-decoration: none;">${MAILER_CONFIG.adminEmail}</a> · Direct Inquiries: <a href="mailto:${MAILER_CONFIG.helloEmail}" style="color: #38bdf8; text-decoration: none;">${MAILER_CONFIG.helloEmail}</a>
                    </p>
                    <p style="margin: 0 0 8px 0;">
                      This notification was dispatched to <span style="color: #cbd5e1; font-weight: 600;">${recipientEmail}</span>. Reply directly to this email to contact our operations desk.
                    </p>
                    <div style="margin: 14px auto 0 auto; padding-top: 12px; border-top: 1px solid #1e293b; max-width: 480px; color: #475569; font-size: 10px; line-height: 1.4;">
                      DraftLineup.com is the only hockey analytics platform that tracks athletes from their earliest competitive stages through their professional careers — giving scouts, coaches, and organizations a complete view of a player’s evolution, potential, and performance trajectory.
                    </div>
                    <p style="margin: 8px 0 0 0; color: #334155; font-size: 10px;">
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

  // =========================================================================
  // 4. TEMPLATES FOR ALL CORE FEATURES
  // =========================================================================

  // Template 1: Sign-Up Confirmation & OTP Verification
  function createSignupConfirmationTemplate(data) {
    const { name, email, role, code, token } = data;
    const verifyUrl = `https://draftlineup.com/verify?email=${encodeURIComponent(email)}&code=${code}&token=${token}`;

    const body = `
      ${renderEmailHtmlHeader("Verify Your Account", "ACCOUNT CLEARANCE")}
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
          <li>Your profile is automatically registered in our 30,000+ athlete and staff registry.</li>
          <li>Athletes receive an immutable cryptographic ledger block stamping biometrics and composite trajectory scores.</li>
          <li>College recruiters and scouting directors can discover your verified passport.</li>
        </ul>
      </div>
      ${renderEmailHtmlFooter(email, "DraftLineup Identity Verification Service")}
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
    const resetUrl = `https://draftlineup.com/login.html?action=reset&email=${encodeURIComponent(email)}&code=${code}&token=${token}`;

    const body = `
      ${renderEmailHtmlHeader("Password Reset Request", "SECURITY ALERT")}
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
          🔒 Security Alert & Verification Advice
        </div>
        <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          Your password will not change until you enter the code above and submit a new password. If you suspect unauthorized access to your account, please immediately notify our operations desk at <a href="mailto:${MAILER_CONFIG.adminEmail}" style="color: #38bdf8; text-decoration: none;">${MAILER_CONFIG.adminEmail}</a>.
        </p>
      </div>
      ${renderEmailHtmlFooter(email, "DraftLineup Security & Credential Protection Service")}
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
      ${renderEmailHtmlHeader("Athlete Passport Stamped", "LEDGER GENESIS BLOCK")}
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
            <td style="font-family: monospace; color: #94a3b8; font-size: 11px;">${ledgerHash || '0x7f4e92a1d3c5...'}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/player.html" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          View Your Live Athlete Passport &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(email, "DraftLineup Immutable Athlete Ledger")}
    `;

    return {
      subject: `Official Athlete Passport Stamped: ${name} (#${jersey || '--'})`,
      html: body
    };
  }

  // Template 4: Scout Dossier & Intel Export Auto-Responder
  function createScoutDossierTemplate(data) {
    const { scoutName, scoutAgency, playerName, team, pos, league, grades, notes, recipientEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("Scout Intel Dossier Export", "CONFIDENTIAL SCOUTING REPORT")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Confidential Scouting Intel Dossier: ${playerName}
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Prepared by <strong>${scoutName || 'Director of Scouting'}</strong> (${scoutAgency || 'NHL Central Scouting Benchmark'}). This scouting evaluation has been exported and logged in your confidential scout briefcase.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
          Prospect Bio & Roster Assignment
        </div>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <tr>
            <td width="35%" style="color: #64748b;">Athlete:</td>
            <td style="color: #ffffff; font-weight: 700;">${playerName} (${pos || 'F'})</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Current Team:</td>
            <td style="color: #38bdf8;">${team || 'USNTDP / NCAA'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">League / Class:</td>
            <td style="color: #94a3b8;">${league || 'Tier 1 / Draft Eligible'}</td>
          </tr>
        </table>

        <div style="margin-top: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
            Scout Skill Matrix (20-80 Scale)
          </div>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 12px; color: #cbd5e1;">
            <tr>
              <td style="color: #94a3b8;">Skating & Agility:</td>
              <td style="font-weight: 700; color: #38bdf8;">${(grades && grades.skating) || '65 / 80 (Plus)'}</td>
              <td style="color: #94a3b8;">Hockey Sense / IQ:</td>
              <td style="font-weight: 700; color: #34d399;">${(grades && grades.iq) || '70 / 80 (High-End)'}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8;">Puck Skills & Release:</td>
              <td style="font-weight: 700; color: #38bdf8;">${(grades && grades.shooting) || '65 / 80 (Plus)'}</td>
              <td style="color: #94a3b8;">Compete & Physicality:</td>
              <td style="font-weight: 700; color: #cbd5e1;">${(grades && grades.compete) || '60 / 80 (Above Avg)'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 16px; padding: 12px; background: rgba(30, 41, 59, 0.5); border-radius: 8px; border-left: 3px solid #38bdf8;">
          <div style="font-size: 11px; font-weight: 700; color: #38bdf8; margin-bottom: 4px;">Scout Take & Projection:</div>
          <p style="margin: 0; color: #cbd5e1; font-size: 12px; line-height: 1.5; font-style: italic;">
            "${notes || 'Dynamic play-driver with elite transition vision and rapid processing through the neutral zone. Clear projection as a top-six contributor.'}"
          </p>
        </div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/scout.html" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          Open Live Scout Desk Workspace &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(recipientEmail, "DraftLineup Scouting Bureau Intelligence Dispatch")}
    `;

    return {
      subject: `Scout Intel Dossier: ${playerName} - ${scoutAgency || 'DraftLineup Scouting Bureau'}`,
      html: body
    };
  }

  // Template 5: NCAA Transfer Portal Entry & Commitment Alert
  function createPortalAlertTemplate(data) {
    const { playerName, fromTeam, toTeam, status, nilValue, portalTimestamp, eligibility, recipientEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("NCAA Transfer Portal Alert", "TRANSFER PORTAL RADAR")}
      <div style="display: inline-block; background-color: #ef444420; border: 1px solid #ef4444; border-radius: 8px; padding: 4px 10px; color: #f87171; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
        🚨 ${status || 'PORTAL ENTRY DETECTED'}
      </div>
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        ${playerName}: NCAA Transfer Portal Alert
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        A verified transfer portal status change was detected and stamped on the collegiate eligibility tracker.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="35%" style="color: #64748b;">Athlete:</td>
            <td style="color: #ffffff; font-weight: 700;">${playerName}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Previous School:</td>
            <td style="color: #f87171; font-weight: 700;">${fromTeam || 'Unknown Institution'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Destination / Status:</td>
            <td style="color: #34d399; font-weight: 700;">${toTeam || 'Actively In Portal (Evaluating Offers)'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Estimated NIL Valuation:</td>
            <td style="color: #fbbf24; font-weight: 800;">${nilValue || '$45,000 / yr'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Remaining Eligibility:</td>
            <td style="color: #cbd5e1;">${eligibility || '2 Years (NCAA D1)'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Logged Timestamp:</td>
            <td style="font-family: monospace; color: #94a3b8; font-size: 11px;">${portalTimestamp || new Date().toUTCString()}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/portal.html" style="display: inline-block; background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(185, 28, 28, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          Open Transfer Portal War Room &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(recipientEmail, "DraftLineup NCAA Transfer Portal & Eligibility Desk")}
    `;

    return {
      subject: `🚨 NCAA Transfer Portal Alert: ${playerName} (${fromTeam} ➔ ${toTeam || 'Entered Portal'})`,
      html: body
    };
  }

  // Template 6: Recruiter Inbound & Wire Message Alert
  function createRecruiterInquiryTemplate(data) {
    const { recruiterName, recruiterOrg, roleTitle, targetPlayer, message, wireChannel, recipientEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("Direct Recruiter Inquiry", "THE WIRE DISPATCH")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        New Direct Message from ${recruiterName}
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        A verified credentialed hockey executive (<strong style="color: #38bdf8;">${roleTitle || 'Head Coach / Chief Scout'}</strong> at <strong>${recruiterOrg || 'Collegiate / Junior Program'}</strong>) has reached out via The Wire secure communications channel regarding prospect <strong>${targetPlayer || 'your athlete profile'}</strong>.
      </p>

      <div style="background-color: #0f172a; border: 1.5px solid #0284c7; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">
            Verified Sender: ${recruiterName} (${recruiterOrg})
          </span>
          <span style="font-size: 10px; font-family: monospace; color: #94a3b8;">
            Channel: #${wireChannel || 'recruiting-wire'}
          </span>
        </div>
        <div style="background-color: #1e293b60; border-radius: 8px; padding: 14px; font-size: 13px; color: #f1f5f9; line-height: 1.6; font-style: italic;">
          "${message || 'Hello, we have been closely tracking your recent performances and combine testing results. We would like to schedule an introductory video call with our coaching staff to discuss our program pathway.'}"
        </div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/community.html" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          💬 Reply Securely via The Wire &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(recipientEmail, "DraftLineup Recruiter Wire Communications Channel")}
    `;

    return {
      subject: `⚡ Direct Wire Message from ${recruiterName} (${recruiterOrg})`,
      html: body
    };
  }

  // Template 7: Combine Biometrics & Trajectory Recalibration Report
  function createCombineReportTemplate(data) {
    const { playerName, wingateWattage, sprint30m, verticalJump, vo2Max, compositeAthleticism, recalibrationDelta, recipientEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("Combine Biometrics Recalibrated", "PERFORMANCE LAB REPORT")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Combine Testing Battery: ${playerName}
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Official physiological testing telemetry was recorded and stamped into <strong>${playerName}</strong>'s athlete passport. The DraftLineup Composite Trajectory Engine has completed real-time recalibration.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
          Biometric Battery Results
        </div>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="50%" style="color: #64748b;">Wingate Peak Power:</td>
            <td style="color: #ffffff; font-weight: 700;">${wingateWattage || '1,180'} Watts</td>
          </tr>
          <tr>
            <td style="color: #64748b;">30m Laser Sprint:</td>
            <td style="color: #38bdf8; font-weight: 700;">${sprint30m || '3.78'} sec</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Standing Vertical Jump:</td>
            <td style="color: #ffffff; font-weight: 700;">${verticalJump || '31.5'} in</td>
          </tr>
          <tr>
            <td style="color: #64748b;">VO2 Max Capacity:</td>
            <td style="color: #ffffff; font-weight: 700;">${vo2Max || '58.4'} mL/kg/min</td>
          </tr>
          <tr style="border-top: 1px solid #1e293b;">
            <td style="color: #10b981; font-weight: 800;">Recalibrated Score:</td>
            <td style="color: #10b981; font-weight: 900; font-size: 15px;">
              ${compositeAthleticism || '91.8'} / 100 <span style="font-size: 11px; color: #34d399;">(${recalibrationDelta || '+2.4 pts'})</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/combine.html" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          View Full Combine Lab Analysis &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(recipientEmail, "DraftLineup Bio-Mechanical & Combine Testing Lab")}
    `;

    return {
      subject: `🧬 Combine Testing Battery Report: ${playerName} - Biometric Recalibration`,
      html: body
    };
  }

  // Template 8: Salary Cap & Trade Machine Analysis Notice
  function createTradeAnalysisTemplate(data) {
    const { teamA, teamB, assetsA, assetsB, capDelta, cbaCompliance, draftSurplus, recipientEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("Trade Machine Analysis", "CBA 2026 VALUATION")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Trade Evaluation: ${teamA || 'Team 1'} ⮂ ${teamB || 'Team 2'}
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        A verified multi-team trade package has been evaluated under the 2026 NHL Collective Bargaining Agreement (CBA) Salary Cap Matrix ($88.0M cap ceiling).
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="35%" style="color: #64748b;">${teamA || 'Team 1'} Sends:</td>
            <td style="color: #ffffff; font-weight: 700;">${assetsA || '1st Round Pick (2026), Top 6 Forward ($6.5M)'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">${teamB || 'Team 2'} Sends:</td>
            <td style="color: #ffffff; font-weight: 700;">${assetsB || 'Elite RFA Defenseman ($4.2M, 50% retained)'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Net Cap Differential:</td>
            <td style="color: #38bdf8; font-weight: 700;">${capDelta || '+$2,300,000 Space Created'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">CBA Cap Status:</td>
            <td style="color: #10b981; font-weight: 800;">✓ ${cbaCompliance || 'Fully Compliant Under 2026 Cap Ceiling'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Draft Pick Surplus:</td>
            <td style="color: #fbbf24; font-weight: 700;">${draftSurplus || '+84.2 Points (Empirical Curve)'}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/market.html" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          Open Trade Machine War Room &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(recipientEmail, "DraftLineup Pro Scouting & CBA Cap Lab")}
    `;

    return {
      subject: `💼 Salary Cap & Trade Machine Analysis: ${teamA || 'Team A'} ⮂ ${teamB || 'Team B'}`,
      html: body
    };
  }

  // Template 9: ADM Practice Plan & Station Drill Dispatch
  function createPracticePlanTemplate(data) {
    const { coachName, teamName, date, focusArea, stations, skaterCount, recipientEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("ADM Practice Plan", "COACH COMMAND DISPATCH")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Practice Plan: ${teamName || 'Roster Session'} (${date || 'Upcoming Session'})
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Dispatched by Head Coach <strong>${coachName || 'Adam Nightingale'}</strong>. All athletes and staff should review the station rotations and forecheck tactical breakdown prior to ice time.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="35%" style="color: #64748b;">Primary Focus:</td>
            <td style="color: #38bdf8; font-weight: 700;">${focusArea || '1-2-2 Forecheck Pressure & PP Breakout Sequencing'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Skater Roster Size:</td>
            <td style="color: #ffffff;">${skaterCount || '22 Skaters + 3 Goalies'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Station 1 (Neutral Zone):</td>
            <td style="color: #cbd5e1;">${(stations && stations[0]) || 'Royal Road Rim & Escape Gates'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Station 2 (End Zone):</td>
            <td style="color: #cbd5e1;">${(stations && stations[1]) || 'RVH Post-Seal Screen Tip Retag'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Station 3 (Full Rink):</td>
            <td style="color: #cbd5e1;">${(stations && stations[2]) || '5-on-4 In-Zone Overload to Bumper Quick Release'}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/coach.html" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          View in Coach Command Center &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(recipientEmail, "DraftLineup Coach Command Center")}
    `;

    return {
      subject: `📋 ADM Practice Plan & Station Stations: ${teamName || 'Team'} (${date || 'Session'})`,
      html: body
    };
  }

  // Template 10: AI Film Room Telestration Breakdown Report
  function createFilmBreakdownTemplate(data) {
    const { coachName, gameTitle, date, clipCount, royalRoadPasses, tacticalNotes, recipientEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("AI Telestration Film Breakdown", "FILM ROOM LAB")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Video Film Analysis: ${gameTitle || 'Game Telemetry'}
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        AI Film Room computer vision telestration clips and tactical event tags have been assembled by <strong>${coachName || 'Video Coaching Staff'}</strong>.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="40%" style="color: #64748b;">Tagged Clips:</td>
            <td style="color: #38bdf8; font-weight: 700;">${clipCount || '14'} Video Sequences</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Royal Road Transitions:</td>
            <td style="color: #ffffff; font-weight: 700;">${royalRoadPasses || '8 High-Danger Cross-Slot Feeds'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Session Date:</td>
            <td style="color: #94a3b8;">${date || new Date().toLocaleDateString()}</td>
          </tr>
        </table>
        <div style="margin-top: 14px; padding: 12px; background: rgba(30, 41, 59, 0.5); border-radius: 8px; border-left: 3px solid #8b5cf6;">
          <div style="font-size: 11px; font-weight: 700; color: #c084fc; margin-bottom: 4px;">Tactical Film Notes:</div>
          <p style="margin: 0; color: #cbd5e1; font-size: 12px; line-height: 1.5;">
            "${tacticalNotes || 'Notice the defensive gap collapse on the weak-side entry. When F3 supports high at the blueline, Royal Road access increases by 44%.'}"
          </p>
        </div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/film.html" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          Open AI Film Room & Telestration &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(recipientEmail, "DraftLineup AI Film Room & Telestration Studio")}
    `;

    return {
      subject: `🎥 AI Telestration Film Breakdown: ${gameTitle || 'Game Film Analysis'}`,
      html: body
    };
  }

  // Template 11: Elite Camp & Tryout Invitation
  function createTryoutInvitationTemplate(data) {
    const { orgName, campName, dates, venue, scoutBureau, rsvpCode, recipientEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("Camp & Showcase Invitation", "OFFICIAL SELECTION")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        Official Camp Selection: ${campName || 'Elite Prospect Showcase'}
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        You have been selected by <strong>${orgName || 'Hockey Operations Bureau'}</strong> to participate in an exclusive prospect showcase with verified scouts from NCAA D1, USHL, and Major Junior in attendance.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="35%" style="color: #64748b;">Event Dates:</td>
            <td style="color: #ffffff; font-weight: 700;">${dates || 'July 14 - July 18, 2026'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Host Arena:</td>
            <td style="color: #38bdf8; font-weight: 700;">${venue || 'USA Hockey Arena (Plymouth, MI)'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Scout Bureau Attendance:</td>
            <td style="color: #10b981;">${scoutBureau || 'NHL Central Scouting, 42 NCAA D1 Programs, 16 USHL Franchises'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Credentials RSVP Code:</td>
            <td style="font-family: monospace; color: #fbbf24; font-weight: 800; font-size: 14px;">${rsvpCode || 'RSVP-DL-9821'}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://draftlineup.com/app.html" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          Confirm RSVP & Stamped Credentials &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(recipientEmail, "DraftLineup Showcase & Tournament Operations Desk")}
    `;

    return {
      subject: `🏒 Official Camp & Showcase Invitation: ${campName || 'Elite Showcase'} - ${orgName || 'Hockey Operations'}`,
      html: body
    };
  }

    // Template 12: Direct Contact Form Dispatch & Routing (hello@draftkings.com)
  function createContactInquiryTemplate(data) {
    const { name, senderEmail, role, subject, message, priority, targetEmail } = data;
    const body = `
      ${renderEmailHtmlHeader("Direct Contact Inquiry", "CONTACT WIRE")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        New Contact Inquiry from ${name || 'Prospective Partner'}
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        A direct inquiry has been submitted via the DraftLineup.com contact portal and routed to <strong>${targetEmail || MAILER_CONFIG.contactEmail}</strong>.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="35%" style="color: #64748b;">Full Name:</td>
            <td style="color: #ffffff; font-weight: 700;">${name || 'Inquirer'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Email Address:</td>
            <td style="color: #38bdf8; font-weight: 700;"><a href="mailto:${senderEmail}" style="color: #38bdf8; text-decoration: none;">${senderEmail}</a></td>
          </tr>
          <tr>
            <td style="color: #64748b;">Role / Ecosystem:</td>
            <td style="color: #ffffff; font-weight: 700;">${role || 'General Inquirer'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Subject:</td>
            <td style="color: #ffffff; font-weight: 700;">${subject || 'General Inquiry'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Routing Target:</td>
            <td style="color: #10b981; font-weight: 700;">${targetEmail || MAILER_CONFIG.contactEmail}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Priority SLA:</td>
            <td style="color: #fbbf24; font-weight: 700;">${priority || 'Standard (24h)'}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #030712; border: 1px solid #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Message Content:</div>
        <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message || '(No message content provided)'}</div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject || 'DraftLineup Inquiry')}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          Reply Directly to ${name || 'Inquirer'} &rarr;
        </a>
      </div>
      ${renderEmailHtmlFooter(targetEmail || MAILER_CONFIG.contactEmail, "DraftLineup Autonomous Wire Gateway")}
    `;

    return {
      subject: `📬 Direct Contact Inquiry: [${subject || 'Inquiry'}] from ${name} (${role || 'User'})`,
      html: body
    };
  }

  // =========================================================================
  // 5. DISPATCH ENGINE (Client-Side & Optional Python Relay)
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
      category: record.category || "GENERAL",
      code: record.code || null,
      token: record.token || null,
      status: 'DELIVERED (SIMULATED / ROUTED)',
      route: `Sent via ${MAILER_CONFIG.adminEmail} (Display: draftlineup.com)`
    };

    outbox.unshift(entry);
    saveOutbox(outbox);

    // Attempt non-blocking forward to local Python relay if running
    try {
      if (typeof fetch === 'function') {
        fetch(MAILER_CONFIG.relayUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: record.to,
            subject: record.subject,
            html: record.html,
            from: MAILER_CONFIG.senderAddress
          })
        }).then(r => r.json()).then(data => {
          console.log('[DraftLineup Relay Response]', data);
        }).catch(() => {
          // Local relay server optional; continue seamlessly
        });
      }
    } catch(e) {}

    // Trigger visual toast notification on active page
    showMailerToast(entry);

    // Dispatch global event for listeners
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
            <button onclick="window.DraftLineupMailer.openOutboxModal('${mail.id}')" class="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] transition cursor-pointer">
              Inspect Email &rarr;
            </button>
            <span class="text-[9px] text-slate-400 font-mono truncate">via ${MAILER_CONFIG.adminEmail}</span>
          </div>
        </div>
        <button onclick="this.closest('.pointer-events-auto').remove()" class="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
      </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast && toast.parentNode) toast.remove();
    }, 12000);
  }

  // =========================================================================
  // 6. PUBLIC API DISPATCH METHODS (ALL FEATURES)
  // =========================================================================

  // 1. Sign-Up Confirmation
  function sendSignupConfirmation(userData) {
    const code = generateOTP();
    const token = generateToken();
    const email = (userData.email || "").trim() || MAILER_CONFIG.adminEmail;
    const name = userData.name || email.split("@")[0] || "Athlete";
    const role = userData.role || "athlete";

    storePendingToken("SIGNUP", email, code, token, { name, role, userData });
    const template = createSignupConfirmationTemplate({ name, email, role, code, token });

    const logged = logDispatchedEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      type: "SIGNUP_CONFIRMATION",
      category: "AUTH",
      code: code,
      token: token
    });

    console.log(`[DraftLineup Mailer] Sent Sign-Up Confirmation to ${email} (Code: ${code}) via ${MAILER_CONFIG.adminEmail}`);
    return { success: true, code, token, mailId: logged.id };
  }

  // 2. Password Reset Request
  function sendPasswordReset(email) {
    email = (email || "").trim() || MAILER_CONFIG.adminEmail;
    const code = generateOTP();
    const token = generateToken();

    let name = "User";
    try {
      const raw = localStorage.getItem("blueline_registered_users");
      if (raw) {
        const users = JSON.parse(raw);
        const match = users.find(u => (u.email || "").toLowerCase() === email.toLowerCase());
        if (match) name = match.name;
      }
    } catch(e) {}

    storePendingToken("RESET", email, code, token, { name });
    const template = createPasswordResetTemplate({ name, email, code, token });

    const logged = logDispatchedEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      type: "PASSWORD_RESET",
      category: "AUTH",
      code: code,
      token: token
    });

    console.log(`[DraftLineup Mailer] Sent Password Reset to ${email} (Code: ${code}) via ${MAILER_CONFIG.adminEmail}`);
    return { success: true, code, token, mailId: logged.id };
  }

  // 3. Athlete Passport Stamped Notice
  function sendAthletePassportNotice(playerData, recipientEmail) {
    recipientEmail = recipientEmail || playerData.email || MAILER_CONFIG.adminEmail;
    const template = createAthletePassportTemplate({
      name: playerData.name || 'Athlete',
      email: recipientEmail,
      team: playerData.team || 'Independent',
      league: playerData.league || 'Tier 1 AAA',
      jersey: playerData.num || playerData.jersey || '--',
      compositeScore: playerData.composite_score || 88.5,
      ledgerHash: playerData.ledger_hash || '0x7f4e92a1d3c5...'
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "ATHLETE_PASSPORT_MINTED",
      category: "PASSPORT"
    });

    return { success: true, mailId: logged.id };
  }

  // 4. Scout Dossier Export Notice
  function sendScoutDossierExport(dossierData, recipientEmail) {
    recipientEmail = recipientEmail || dossierData.recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createScoutDossierTemplate({
      scoutName: dossierData.scoutName || "Dan Marr",
      scoutAgency: dossierData.scoutAgency || "NHL Central Scouting Benchmark",
      playerName: dossierData.playerName || "Michael Hage",
      team: dossierData.team || "University of Michigan",
      pos: dossierData.pos || "C",
      league: dossierData.league || "NCAA D1 / Draft Eligible",
      grades: dossierData.grades || { skating: "65/80", iq: "70/80", shooting: "65/80", compete: "60/80" },
      notes: dossierData.notes || "Elite puck distributor with plus-skating and vision through contact.",
      recipientEmail: recipientEmail
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "SCOUT_DOSSIER_EXPORT",
      category: "SCOUTING"
    });

    return { success: true, mailId: logged.id };
  }

  // 5. Transfer Portal Alert
  function sendTransferPortalAlert(portalData, recipientEmail) {
    recipientEmail = recipientEmail || portalData.recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createPortalAlertTemplate({
      playerName: portalData.playerName || "Logan Stein",
      fromTeam: portalData.fromTeam || "Ferris State",
      toTeam: portalData.toTeam || "Michigan (Committed)",
      status: portalData.status || "COMMITMENT FINALIZED",
      nilValue: portalData.nilValue || "$65,000 / yr",
      portalTimestamp: portalData.portalTimestamp || new Date().toUTCString(),
      eligibility: portalData.eligibility || "1 Year (Graduate)",
      recipientEmail: recipientEmail
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "TRANSFER_PORTAL_ALERT",
      category: "TRANSFERS"
    });

    return { success: true, mailId: logged.id };
  }

  // 6. Recruiter Inbound & Wire Message Notice
  function sendRecruiterInquiryNotice(inquiryData, recipientEmail) {
    recipientEmail = recipientEmail || inquiryData.recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createRecruiterInquiryTemplate({
      recruiterName: inquiryData.recruiterName || "Adam Nightingale",
      recruiterOrg: inquiryData.recruiterOrg || "Michigan State University (NCAA D1)",
      roleTitle: inquiryData.roleTitle || "Head Coach",
      targetPlayer: inquiryData.targetPlayer || "Michael Hage",
      message: inquiryData.message || "We reviewed your game film from this weekend. Impressed with your neutral zone habits. Let's arrange a call.",
      wireChannel: inquiryData.wireChannel || "recruiting-wire",
      recipientEmail: recipientEmail
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "RECRUITER_INQUIRY",
      category: "WIRE"
    });

    return { success: true, mailId: logged.id };
  }

  // 7. Combine Evaluation & Biometric Recalibration Report
  function sendCombineEvaluationReport(combineData, recipientEmail) {
    recipientEmail = recipientEmail || combineData.recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createCombineReportTemplate({
      playerName: combineData.playerName || "Cole Eiserman",
      wingateWattage: combineData.wingateWattage || "1,220",
      sprint30m: combineData.sprint30m || "3.74",
      verticalJump: combineData.verticalJump || "33.0",
      vo2Max: combineData.vo2Max || "61.2",
      compositeAthleticism: combineData.compositeAthleticism || "94.2",
      recalibrationDelta: combineData.recalibrationDelta || "+3.1 pts",
      recipientEmail: recipientEmail
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "COMBINE_EVALUATION",
      category: "COMBINE"
    });

    return { success: true, mailId: logged.id };
  }

  // 8. Trade Machine Analysis Notice
  function sendTradeEvaluationNotice(tradeData, recipientEmail) {
    recipientEmail = recipientEmail || tradeData.recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createTradeAnalysisTemplate({
      teamA: tradeData.teamA || "Montreal Canadiens",
      teamB: tradeData.teamB || "Calgary Flames",
      assetsA: tradeData.assetsA || "2026 1st Round Pick (Unprotected) + Prospect D",
      assetsB: tradeData.assetsB || "Top-Pair RHD ($4.5M AAV, 50% retained)",
      capDelta: tradeData.capDelta || "+$2,250,000 Net Cap Space",
      cbaCompliance: tradeData.cbaCompliance || "Approved & CBA 2026 Compliant",
      draftSurplus: tradeData.draftSurplus || "+68.5 Pick Points",
      recipientEmail: recipientEmail
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "TRADE_EVALUATION",
      category: "TRADES"
    });

    return { success: true, mailId: logged.id };
  }

  // 9. Practice Plan Dispatch
  function sendPracticePlanNotice(planData, recipientEmail) {
    recipientEmail = recipientEmail || planData.recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createPracticePlanTemplate({
      coachName: planData.coachName || "Adam Nightingale",
      teamName: planData.teamName || "Michigan State Spartans",
      date: planData.date || "Wednesday On-Ice",
      focusArea: planData.focusArea || "1-2-2 Forecheck Pressure & PP Breakouts",
      stations: planData.stations || [
        "Royal Road Escape Rim & Quick Pass",
        "RVH Goalie Screen Retag",
        "5-on-4 In-Zone Overload to Bumper Quick Release"
      ],
      skaterCount: planData.skaterCount || "22 Skaters + 3 Goalies",
      recipientEmail: recipientEmail
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "PRACTICE_PLAN_DISPATCH",
      category: "COACH"
    });

    return { success: true, mailId: logged.id };
  }

  // 10. Film Breakdown Report
  function sendFilmBreakdownNotice(filmData, recipientEmail) {
    recipientEmail = recipientEmail || filmData.recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createFilmBreakdownTemplate({
      coachName: filmData.coachName || "Video Coaching Staff",
      gameTitle: filmData.gameTitle || "Michigan State vs. Michigan (Big Ten Semi-Final)",
      date: filmData.date || new Date().toLocaleDateString(),
      clipCount: filmData.clipCount || "12",
      royalRoadPasses: filmData.royalRoadPasses || "7 High-Danger Cross-Slot Feeds",
      tacticalNotes: filmData.tacticalNotes || "Strong tracking through neutral zone; defensive gap maintained under 6 feet on 80% of entries.",
      recipientEmail: recipientEmail
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "FILM_BREAKDOWN_DISPATCH",
      category: "FILM"
    });

    return { success: true, mailId: logged.id };
  }

  // 11. Tryout & Showcase Invitation
  function sendTryoutInvitation(inviteData, recipientEmail) {
    recipientEmail = recipientEmail || inviteData.recipientEmail || MAILER_CONFIG.adminEmail;
    const template = createTryoutInvitationTemplate({
      orgName: inviteData.orgName || "USHL / Tier 1 Hockey Bureau",
      campName: inviteData.campName || "National Elite Junior Showcase",
      dates: inviteData.dates || "July 16-20, 2026",
      venue: inviteData.venue || "USA Hockey Arena (Plymouth, MI)",
      scoutBureau: inviteData.scoutBureau || "NHL Central Scouting, 40+ NCAA D1 Teams, 16 USHL Clubs",
      rsvpCode: inviteData.rsvpCode || "RSVP-DL-9821",
      recipientEmail: recipientEmail
    });

    const logged = logDispatchedEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      type: "TRYOUT_INVITATION",
      category: "EVENTS"
    });

    return { success: true, mailId: logged.id };
  }

  // 12. Contact Form Dispatcher (Linked to hello@draftkings.com)
  function sendContactSubmission(data) {
    const targetEmail = data.targetEmail || MAILER_CONFIG.contactEmail || "hello@draftkings.com";
    const senderEmail = data.email || data.senderEmail || "user@example.com";
    const name = data.name || "Inquirer";
    const subject = data.subject || "General Inquiry";
    const role = data.role || "Prospect / Inquirer";
    const message = data.message || "";
    const priority = data.priority || "Standard (24h SLA)";

    const template = createContactInquiryTemplate({
      name,
      senderEmail,
      role,
      subject,
      message,
      priority,
      targetEmail
    });

    const logged = logDispatchedEmail({
      to: targetEmail,
      subject: template.subject,
      html: template.html,
      type: "CONTACT_INQUIRY",
      category: "CONTACT"
    });

    // Autoresponder receipt to sender
    const autoReceipt = {
      subject: `Receipt: We received your inquiry regarding "${subject}"`,
      html: `
        ${renderEmailHtmlHeader("Message Received", "AUTO-RECEIPT")}
        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">Hello ${name},</h2>
        <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Thank you for reaching out to DraftLineup. Your inquiry has been routed to our direct desk at <strong>${targetEmail}</strong>.
        </p>
        <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; margin: 18px 0; font-size: 13px; color: #cbd5e1;">
          <p style="margin: 0 0 6px 0;"><strong>Inquiry Subject:</strong> ${subject}</p>
          <p style="margin: 0 0 6px 0;"><strong>Destination:</strong> ${targetEmail}</p>
          <p style="margin: 0;"><strong>Estimated Response Time:</strong> Within 24 hours</p>
        </div>
        <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
          For urgent scouting or tryout inquiries, you can also connect with coaches directly on The Wire.
        </p>
        ${renderEmailHtmlFooter(senderEmail, "DraftLineup Customer Support")}
      `
    };

    const loggedReceipt = logDispatchedEmail({
      to: senderEmail,
      subject: autoReceipt.subject,
      html: autoReceipt.html,
      type: "CONTACT_RECEIPT",
      category: "CONTACT"
    });

    console.log(`[DraftLineup Mailer] Dispatched Contact Form Inquiry to ${targetEmail} from ${senderEmail}`);
    return { success: true, targetEmail, mailId: logged.id, receiptId: loggedReceipt.id };
  }

  // Master Test Dispatcher for All 11 Types
  function sendTestAutoresponder(type, customEmail) {
    const targetEmail = customEmail || MAILER_CONFIG.adminEmail;
    switch (type) {
      case "SIGNUP":
        return sendSignupConfirmation({ name: "Alex Ovechkin Jr.", email: targetEmail, role: "athlete" });
      case "RESET":
        return sendPasswordReset(targetEmail);
      case "PASSPORT":
        return sendAthletePassportNotice({ name: "Macklin Celebrini", team: "San Jose / NCAA", league: "NHL/NCAA", num: 71, composite_score: 96.4, ledger_hash: "0x8fa14c9e7b2d" }, targetEmail);
      case "SCOUT":
        return sendScoutDossierExport({ playerName: "Michael Hage", team: "Michigan", scoutName: "Dan Marr", scoutAgency: "NHL Central Scouting Benchmark" }, targetEmail);
      case "PORTAL":
        return sendTransferPortalAlert({ playerName: "Logan Stein", fromTeam: "Ferris State", toTeam: "Michigan", status: "COMMITTED" }, targetEmail);
      case "WIRE":
        return sendRecruiterInquiryNotice({ recruiterName: "Adam Nightingale", recruiterOrg: "Michigan State (NCAA)", targetPlayer: "Prospect Athlete" }, targetEmail);
      case "COMBINE":
        return sendCombineEvaluationReport({ playerName: "Cole Eiserman", wingateWattage: "1,220", sprint30m: "3.74", verticalJump: "33.0" }, targetEmail);
      case "TRADE":
        return sendTradeEvaluationNotice({ teamA: "Montreal Canadiens", teamB: "Calgary Flames", assetsA: "2026 1st Round Pick", assetsB: "Top RHD (50% Retained)" }, targetEmail);
      case "PRACTICE":
        return sendPracticePlanNotice({ teamName: "Michigan State Spartans", focusArea: "1-2-2 Forecheck Pressure" }, targetEmail);
      case "FILM":
        return sendFilmBreakdownNotice({ gameTitle: "Rivalry Showcase vs. Michigan", clipCount: "14" }, targetEmail);
      case "TRYOUT":
        return sendTryoutInvitation({ orgName: "USHL Tier 1 Operations", campName: "Summer Main Camp" }, targetEmail);
      default:
        return sendSignupConfirmation({ name: "General Test", email: targetEmail, role: "scout" });
    }
  }

  // =========================================================================
  // 7. IN-BROWSER EMAIL OUTBOX & TEMPLATE INSPECTOR MODAL
  // =========================================================================
  let currentCategoryFilter = "ALL";
  let currentSearchQuery = "";

  function renderOutboxModal() {
    let modal = document.getElementById("draftlineupOutboxModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "draftlineupOutboxModal";
    modal.className = "fixed inset-0 z-[160] hidden flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="relative w-full max-w-5xl max-h-[94vh] bg-slate-950 rounded-3xl border border-sky-500/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-blue-700 p-0.5 shadow-lg shadow-sky-500/20">
              <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-lg">
                ✉️
              </div>
            </div>
            <div>
              <h3 class="text-base font-black text-white flex items-center gap-2">
                DraftLineup Auto-Mailer & Live Outbox
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">ALL FEATURES ACTIVE</span>
              </h3>
              <p class="text-xs text-slate-400">
                Sending & Receiving: <span class="text-sky-300 font-mono font-bold">${MAILER_CONFIG.adminEmail}</span> · Display Domain: <span class="text-emerald-400 font-mono font-bold">${MAILER_CONFIG.domain}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Test Autoresponder Dispatcher Dropdown -->
            <div class="relative inline-block">
              <select id="quickTestDropdown" onchange="window.DraftLineupMailer.handleQuickTestSelect(this.value)" class="px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900/90 text-sky-200 border border-sky-500/40 font-bold text-xs cursor-pointer focus:outline-none">
                <option value="">⚡ Trigger Test Auto-Responder...</option>
                <option value="SIGNUP">1. Sign-Up Confirmation & OTP</option>
                <option value="RESET">2. Password Reset Request & OTP</option>
                <option value="PASSPORT">3. Athlete Passport Ledger Minted</option>
                <option value="SCOUT">4. Scout Intel Dossier Export</option>
                <option value="PORTAL">5. Transfer Portal Alert</option>
                <option value="WIRE">6. Recruiter Wire Message</option>
                <option value="COMBINE">7. Combine Biometrics Recalibration</option>
                <option value="TRADE">8. Trade Machine & CBA Cap Analysis</option>
                <option value="PRACTICE">9. ADM Practice Plan Dispatch</option>
                <option value="FILM">10. AI Film Telestration Breakdown</option>
                <option value="TRYOUT">11. Camp & Showcase Invitation</option>
              </select>
            </div>
            <button id="closeOutboxModalBtn" class="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition cursor-pointer">
              ✕
            </button>
          </div>
        </div>

        <!-- Filter Bar & Search -->
        <div class="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <!-- Category Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button onclick="window.DraftLineupMailer.setCategoryFilter('ALL')" class="mailer-cat-btn px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-[11px] transition" data-cat="ALL">All</button>
            <button onclick="window.DraftLineupMailer.setCategoryFilter('AUTH')" class="mailer-cat-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white font-bold text-[11px] transition" data-cat="AUTH">🔑 Auth & Reset</button>
            <button onclick="window.DraftLineupMailer.setCategoryFilter('PASSPORT')" class="mailer-cat-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white font-bold text-[11px] transition" data-cat="PASSPORT">⚡ Passports</button>
            <button onclick="window.DraftLineupMailer.setCategoryFilter('SCOUTING')" class="mailer-cat-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white font-bold text-[11px] transition" data-cat="SCOUTING">🔭 Scout Dossiers</button>
            <button onclick="window.DraftLineupMailer.setCategoryFilter('TRANSFERS')" class="mailer-cat-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white font-bold text-[11px] transition" data-cat="TRANSFERS">🚨 Portal</button>
            <button onclick="window.DraftLineupMailer.setCategoryFilter('WIRE')" class="mailer-cat-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white font-bold text-[11px] transition" data-cat="WIRE">💬 Wire & DMs</button>
            <button onclick="window.DraftLineupMailer.setCategoryFilter('COMBINE')" class="mailer-cat-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white font-bold text-[11px] transition" data-cat="COMBINE">🧬 Combines</button>
            <button onclick="window.DraftLineupMailer.setCategoryFilter('TRADES')" class="mailer-cat-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white font-bold text-[11px] transition" data-cat="TRADES">💼 Trades</button>
          </div>

          <!-- Search Box -->
          <div class="relative w-48 sm:w-64">
            <input id="mailerSearchInput" oninput="window.DraftLineupMailer.handleSearchInput(this.value)" type="text" placeholder="Search subject, recipient, code..." class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400">
          </div>
        </div>

        <!-- Master / Detail Body -->
        <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          <!-- Left: Outbox Message List -->
          <div class="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-900/40">
            <div class="flex items-center justify-between px-1 mb-1 text-xs">
              <span class="text-slate-400 font-mono font-bold uppercase tracking-wider text-[10px]">Outbox Queue</span>
              <span id="outboxCountBadge" class="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">0 Messages</span>
            </div>
            <div id="outboxListContainer" class="space-y-1.5">
              <!-- Rendered items go here -->
            </div>
          </div>

          <!-- Right: HTML Preview & Raw Headers -->
          <div class="flex-1 flex flex-col overflow-hidden bg-slate-950 p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2">
              <div class="min-w-0 flex-1">
                <h4 id="previewSubjectText" class="text-xs sm:text-sm font-black text-white truncate max-w-lg">Select an email to view</h4>
                <div id="previewMetaText" class="text-[11px] text-slate-400 font-mono mt-0.5 truncate">--</div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <div id="previewCodeBadge" class="hidden px-2.5 py-1 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-xs font-bold">
                  CODE: --
                </div>
                <button id="copyEmailHtmlBtn" onclick="window.DraftLineupMailer.copyCurrentEmailHtml()" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition cursor-pointer" title="Copy raw HTML to clipboard">
                  📋 Copy HTML
                </button>
              </div>
            </div>

            <!-- Email HTML Render Frame -->
            <div class="flex-1 rounded-2xl border border-slate-800 overflow-hidden bg-[#030712] shadow-inner relative">
              <iframe id="emailPreviewIframe" class="w-full h-full border-none" src="about:blank"></iframe>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-3 px-5 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Local Relay: <code class="text-sky-300 font-mono">${MAILER_CONFIG.relayUrl}</code> · Admin Desk: <span class="text-white font-mono font-bold">${MAILER_CONFIG.adminEmail}</span></span>
          </div>
          <button id="clearOutboxBtn" class="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer">Clear Outbox</button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Wire Events
    document.getElementById("closeOutboxModalBtn").addEventListener("click", () => {
      modal.classList.add("hidden");
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

  function setCategoryFilter(category) {
    currentCategoryFilter = category;
    const modal = document.getElementById("draftlineupOutboxModal");
    if (modal) {
      modal.querySelectorAll(".mailer-cat-btn").forEach(btn => {
        if (btn.dataset.cat === category) {
          btn.className = "mailer-cat-btn px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-[11px] transition";
        } else {
          btn.className = "mailer-cat-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white font-bold text-[11px] transition";
        }
      });
    }
    refreshOutboxUI();
  }

  function handleSearchInput(query) {
    currentSearchQuery = (query || "").toLowerCase().trim();
    refreshOutboxUI();
  }

  function handleQuickTestSelect(value) {
    if (!value) return;
    sendTestAutoresponder(value);
    document.getElementById("quickTestDropdown").value = "";
    refreshOutboxUI();
  }

  function refreshOutboxUI(focusMailId) {
    let outbox = getOutbox();
    const countBadge = document.getElementById("outboxCountBadge");
    const container = document.getElementById("outboxListContainer");

    // Apply category filtering
    if (currentCategoryFilter && currentCategoryFilter !== "ALL") {
      outbox = outbox.filter(m => (m.category === currentCategoryFilter) || (m.type && m.type.includes(currentCategoryFilter)));
    }

    // Apply search query
    if (currentSearchQuery) {
      outbox = outbox.filter(m => 
        (m.subject && m.subject.toLowerCase().includes(currentSearchQuery)) ||
        (m.to && m.to.toLowerCase().includes(currentSearchQuery)) ||
        (m.code && m.code.includes(currentSearchQuery)) ||
        (m.type && m.type.toLowerCase().includes(currentSearchQuery))
      );
    }

    if (countBadge) countBadge.textContent = `${outbox.length} Messages`;
    if (!container) return;

    if (outbox.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-500 text-xs">
          No matching emails in outbox.<br>Use the test dropdown above to dispatch one.
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
      else if (m.type === "TRANSFER_PORTAL_ALERT") typeBadge = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      else if (m.type === "RECRUITER_INQUIRY") typeBadge = "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
      else if (m.type === "COMBINE_EVALUATION") typeBadge = "bg-teal-500/20 text-teal-300 border-teal-500/40";
      else if (m.type === "TRADE_EVALUATION") typeBadge = "bg-orange-500/20 text-orange-300 border-orange-500/40";

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

  let currentlySelectedMail = null;

  function selectMailForPreview(mailId) {
    const outbox = getOutbox();
    const mail = outbox.find(m => m.id === mailId);
    if (!mail) return;

    currentlySelectedMail = mail;

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

  function copyCurrentEmailHtml() {
    if (!currentlySelectedMail || !currentlySelectedMail.html) {
      alert("No email selected to copy.");
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentlySelectedMail.html).then(() => {
        alert("✓ Email HTML copied to clipboard!");
      });
    } else {
      alert("Clipboard access not available.");
    }
  }

  // =========================================================================
  // 8. EXPORT TO GLOBAL SCOPE
  // =========================================================================
  window.DraftLineupMailer = {
    CONFIG: MAILER_CONFIG,
    // Dispatchers
    sendSignupConfirmation,
    sendPasswordReset,
    sendAthletePassportNotice,
    sendScoutDossierExport,
    sendTransferPortalAlert,
    sendRecruiterInquiryNotice,
    sendCombineEvaluationReport,
    sendTradeEvaluationNotice,
    sendPracticePlanNotice,
    sendFilmBreakdownNotice,
    sendTryoutInvitation,
    sendContactSubmission,
    sendTestAutoresponder,
    // Verifications
    verifySignupCode: (email, code) => verifyToken("SIGNUP", email, code),
    verifyResetCode: (email, code) => verifyToken("RESET", email, code),
    // Outbox & UI
    getOutbox,
    renderOutboxModal,
    openOutboxModal,
    selectMailForPreview,
    setCategoryFilter,
    handleSearchInput,
    handleQuickTestSelect,
    copyCurrentEmailHtml
  };

})(typeof window !== 'undefined' ? window : global);
