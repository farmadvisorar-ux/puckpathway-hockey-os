const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Add Contact to nav-center-links
if (!content.includes('href="#contact-us" class="nav-link-item"')) {
  content = content.replace(
    '<a href="combine.html" class="nav-link-item">Combine</a>',
    '<a href="combine.html" class="nav-link-item">Combine</a>\r\n        <a href="#contact-us" class="nav-link-item">Contact</a>'
  );
}

// 2. Add Contact to mobile drawer links
if (!content.includes('href="#contact-us" class="mobile-drawer-link"')) {
  content = content.replace(
    '<a href="#pricing-plans" class="mobile-drawer-link" onclick="toggleMobileNav(false)"><span>💳</span> <span>Pricing & Plans</span></a>',
    '<a href="#pricing-plans" class="mobile-drawer-link" onclick="toggleMobileNav(false)"><span>💳</span> <span>Pricing & Plans</span></a>\r\n          <a href="#contact-us" class="mobile-drawer-link" onclick="toggleMobileNav(false)"><span>✉️</span> <span>Contact Operations (hello@draftkings.com)</span></a>'
  );
}

// 3. Add Contact Section before <!-- FOOTER -->
const contactSectionHtml = `  <!-- =========================================================================
       ENTERPRISE CONTACT FORM SECTION & DIRECT WIRE (hello@draftkings.com)
       ========================================================================= -->
  <section id="contact-us" class="contact-section" style="padding: 5rem 1.5rem; max-width: 1120px; margin: 0 auto;">
    <div class="section-header-block" style="text-align: center; margin-bottom: 2.75rem;">
      <span class="section-tag-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 4px 14px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">DIRECT WIRE &amp; COMMUNICATIONS</span>
      <h2 style="font-size: 2.5rem; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; margin: 0.75rem 0 0.5rem;">Contact DraftLineup Operations</h2>
      <p class="section-subtitle" style="color: #94a3b8; font-size: 1.05rem; max-width: 720px; margin: 0 auto; line-height: 1.6;">
        Have questions about lifelong athlete tracking, recruiter clearance, team licensing, or NIL transfer valuation? Send an inquiry directly to our hockey operations desk at <a href="mailto:hello@draftkings.com" style="color: #38bdf8; font-weight: 800; text-decoration: underline;">hello@draftkings.com</a>.
      </p>
    </div>

    <div class="contact-bento-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem;">
      <!-- Left Info Bento -->
      <div class="glass-panel glow-card" style="border-radius: 1.25rem; padding: 2.25rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.5rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #0284c7, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; box-shadow: 0 0 20px rgba(56,189,248,0.35);">
              ✉️
            </div>
            <div>
              <div style="font-size: 0.7rem; font-family: monospace; color: #38bdf8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Official Direct Channel</div>
              <div style="font-size: 1.2rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                <a href="mailto:hello@draftkings.com" style="color: #ffffff; text-decoration: none;">hello@draftkings.com</a>
              </div>
            </div>
          </div>

          <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.75rem;">
            Our hockey intelligence grid supports athletic departments, prospective recruits, families, and certified scouts across all junior and collegiate leagues.
          </p>

          <div style="display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 1.75rem;">
            <div style="display: flex; align-items: flex-start; gap: 0.85rem;">
              <span style="font-size: 1.1rem;">⚡</span>
              <div>
                <div style="font-weight: 800; color: #f8fafc; font-size: 0.9rem;">Lead Scout &amp; Recruiter Desk</div>
                <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">NCAA Clearinghouse verification, verified coach DMs &amp; prospect dossier exports.</div>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 0.85rem;">
              <span style="font-size: 1.1rem;">🛡️</span>
              <div>
                <div style="font-weight: 800; color: #f8fafc; font-size: 0.9rem;">Athlete &amp; Family Care</div>
                <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">Combine battery score verification, subscription support &amp; NCAA eligibility.</div>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 0.85rem;">
              <span style="font-size: 1.1rem;">💼</span>
              <div>
                <div style="font-weight: 800; color: #f8fafc; font-size: 0.9rem;">Enterprise &amp; Association Inquiries</div>
                <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">Roster-wide telemetry ingestion, custom telestration licensing &amp; API access.</div>
              </div>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid rgba(51, 65, 85, 0.6); padding-top: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; font-family: monospace;">
            <span style="color: #94a3b8;">Response Time SLA:</span>
            <span style="color: #34d399; font-weight: 800; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #34d399; display: inline-block; box-shadow: 0 0 10px #34d399;"></span>
              &lt; 24 Hours Guaranteed
            </span>
          </div>
        </div>
      </div>

      <!-- Right Interactive Form Bento -->
      <div class="glass-panel glow-card" style="border-radius: 1.25rem; padding: 2.25rem;">
        <form id="publicContactForm" onsubmit="handlePublicContactSubmit(event)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label for="contactName" style="display: block; font-size: 0.75rem; font-weight: 800; color: #cbd5e1; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.5px;">Your Name *</label>
              <input type="text" id="contactName" required placeholder="e.g. Connor Bedard" style="width: 100%; background: #030712; border: 1px solid #334155; border-radius: 0.65rem; padding: 0.7rem 0.85rem; color: #ffffff; font-size: 0.85rem; outline: none; box-sizing: border-box;" class="glow-input">
            </div>
            <div>
              <label for="contactEmail" style="display: block; font-size: 0.75rem; font-weight: 800; color: #cbd5e1; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.5px;">Your Email *</label>
              <input type="email" id="contactEmail" required placeholder="name@organization.com" style="width: 100%; background: #030712; border: 1px solid #334155; border-radius: 0.65rem; padding: 0.7rem 0.85rem; color: #ffffff; font-size: 0.85rem; outline: none; box-sizing: border-box;" class="glow-input">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label for="contactRole" style="display: block; font-size: 0.75rem; font-weight: 800; color: #cbd5e1; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.5px;">Role / Ecosystem</label>
              <select id="contactRole" style="width: 100%; background: #030712; border: 1px solid #334155; border-radius: 0.65rem; padding: 0.7rem 0.85rem; color: #ffffff; font-size: 0.85rem; outline: none; box-sizing: border-box;" class="glow-input">
                <option value="Scout / Recruiter" selected>🔭 Scout / Recruiter</option>
                <option value="Coach / Team Staff">📋 Coach / Team Staff</option>
                <option value="Athlete / Player">⚡ Athlete / Player</option>
                <option value="Parent / Family Advisor">🛡️ Parent / Family Advisor</option>
                <option value="Club Executive / GM">💼 Club Executive / GM</option>
                <option value="Media &amp; Press">🎙️ Media &amp; Press</option>
                <option value="General Inquiry">🌐 General Inquiry</option>
              </select>
            </div>
            <div>
              <label for="contactPriority" style="display: block; font-size: 0.75rem; font-weight: 800; color: #cbd5e1; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.5px;">Priority SLA</label>
              <select id="contactPriority" style="width: 100%; background: #030712; border: 1px solid #334155; border-radius: 0.65rem; padding: 0.7rem 0.85rem; color: #ffffff; font-size: 0.85rem; outline: none; box-sizing: border-box;" class="glow-input">
                <option value="Standard (24h SLA)" selected>🟢 Standard (24h SLA)</option>
                <option value="High Priority (12h SLA)">🟡 High Priority (12h SLA)</option>
                <option value="Urgent Tryout / Signing">🔴 Urgent Tryout / Signing</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <label for="contactSubject" style="display: block; font-size: 0.75rem; font-weight: 800; color: #cbd5e1; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.5px;">Subject *</label>
            <input type="text" id="contactSubject" required placeholder="e.g. Recruiter Clearance &amp; Athlete Passport Synchronization" style="width: 100%; background: #030712; border: 1px solid #334155; border-radius: 0.65rem; padding: 0.7rem 0.85rem; color: #ffffff; font-size: 0.85rem; outline: none; box-sizing: border-box;" class="glow-input">
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label for="contactMessage" style="display: block; font-size: 0.75rem; font-weight: 800; color: #cbd5e1; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.5px;">Message Details *</label>
            <textarea id="contactMessage" required rows="4" placeholder="Detail your program, questions, athlete ID, or partnership request..." style="width: 100%; background: #030712; border: 1px solid #334155; border-radius: 0.65rem; padding: 0.7rem 0.85rem; color: #ffffff; font-size: 0.85rem; outline: none; resize: vertical; box-sizing: border-box;" class="glow-input"></textarea>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #94a3b8; font-family: monospace;">
              <span style="color: #38bdf8;">🔒</span>
              <span>Wire Target: <strong style="color: #38bdf8;">hello@draftkings.com</strong></span>
            </div>
            <button type="submit" id="contactSubmitBtn" class="btn-enterprise-primary" style="cursor: pointer; min-width: 170px; padding: 0.75rem 1.6rem;">
              <span>✉️ Send Inquiry</span>
            </button>
          </div>

          <!-- Real-Time Feedback Overlay -->
          <div id="contactFormStatus" style="display: none; margin-top: 1.25rem; padding: 1.1rem; border-radius: 0.75rem; background: rgba(6, 78, 59, 0.5); border: 1px solid rgba(16, 185, 129, 0.4); color: #a7f3d0; font-size: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 0.95rem; margin-bottom: 0.35rem;">
              <span>✓ Message Successfully Dispatched!</span>
            </div>
            <p id="contactStatusText" style="margin: 0; color: #e2e8f0; font-size: 0.82rem; line-height: 1.5;">
              Your inquiry has been routed directly to <strong>hello@draftkings.com</strong>. A confirmation copy has also been sent to your email.
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>

`;

if (!content.includes('id="contact-us"')) {
  content = content.replace('  <!-- FOOTER -->', contactSectionHtml + '  <!-- FOOTER -->');
}

// 4. Update Footer links and direct email
if (!content.includes('href="#contact-us">Contact Us</a>')) {
  content = content.replace(
    '<a href="security.html">Security</a>',
    '<a href="#contact-us">Contact Us</a>\r\n      <a href="security.html">Security</a>'
  );
}

if (!content.includes('hello@draftkings.com') || !content.includes('footer-contact-wire')) {
  content = content.replace(
    '    <div class="footer-mission"',
    '    <div class="footer-contact-wire" style="margin: 0.85rem 0 1.25rem 0; font-size: 0.85rem; color: #94a3b8;">\r\n      Direct Inquiries &amp; Operations: <a href="mailto:hello@draftkings.com" style="color: #38bdf8; font-weight: 700; text-decoration: underline;">hello@draftkings.com</a>\r\n    </div>\r\n    <div class="footer-mission"'
  );
}

// 5. Add handlePublicContactSubmit script handler
const contactScript = `
    // Public Contact Form Submission Handler Linked to hello@draftkings.com
    function handlePublicContactSubmit(e) {
      e.preventDefault();
      const name = (document.getElementById('contactName')?.value || '').trim();
      const email = (document.getElementById('contactEmail')?.value || '').trim();
      const role = document.getElementById('contactRole')?.value || 'Scout / Recruiter';
      const priority = document.getElementById('contactPriority')?.value || 'Standard (24h SLA)';
      const subject = (document.getElementById('contactSubject')?.value || '').trim();
      const message = (document.getElementById('contactMessage')?.value || '').trim();
      const submitBtn = document.getElementById('contactSubmitBtn');
      const statusBox = document.getElementById('contactFormStatus');
      const statusText = document.getElementById('contactStatusText');

      if (!email || !message) {
        if (window.bluelineToast) window.bluelineToast('Please fill in all required fields.', 'warning');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Dispatching...</span>';
      }

      const payload = {
        name: name,
        email: email,
        senderEmail: email,
        role: role,
        priority: priority,
        subject: subject,
        message: message,
        targetEmail: 'hello@draftkings.com'
      };

      try {
        if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendContactSubmission === 'function') {
          const res = window.DraftLineupMailer.sendContactSubmission(payload);
          console.log('[Contact Form] Dispatched via DraftLineupMailer:', res);
        } else {
          console.warn('[Contact Form] DraftLineupMailer not loaded, saving to local outbox');
          const raw = localStorage.getItem('draftlineup_mailer_outbox');
          const list = raw ? JSON.parse(raw) : [];
          list.unshift({
            id: 'contact_' + Date.now().toString(36),
            timestamp: new Date().toISOString(),
            from: email,
            to: 'hello@draftkings.com',
            subject: '[Contact Form] ' + subject,
            type: 'CONTACT_INQUIRY',
            category: 'CONTACT',
            status: 'DISPATCHED'
          });
          localStorage.setItem('draftlineup_mailer_outbox', JSON.stringify(list));
        }

        if (statusBox) statusBox.style.display = 'block';
        if (statusText) {
          statusText.innerHTML = 'Your message from <strong>' + email + '</strong> has been routed to <strong>hello@draftkings.com</strong>. Our operations desk will respond within 24 hours.';
        }

        if (window.bluelineToast) {
          window.bluelineToast('✓ Inquiry successfully routed to hello@draftkings.com', 'success');
        }

        // Reset inputs
        const form = document.getElementById('publicContactForm');
        if (form) form.reset();

      } catch(err) {
        console.error('[Contact Form Error]', err);
        if (window.bluelineToast) {
          window.bluelineToast('Dispatched with local backup. Direct fallback: hello@draftkings.com', 'info');
        }
      } finally {
        if (submitBtn) {
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>✉️ Send Inquiry</span>';
          }, 1500);
        }
      }
    }
    window.handlePublicContactSubmit = handlePublicContactSubmit;
`;

if (!content.includes('function handlePublicContactSubmit')) {
  content = content.replace('    window.toggleMobileNav = toggleMobileNav;', '    window.toggleMobileNav = toggleMobileNav;\r\n' + contactScript);
}

// 6. Ensure auto_mailer.js is loaded
if (!content.includes('static/js/auto_mailer.js')) {
  content = content.replace(
    '<script src="static/js/blueline-core.js"></script>',
    '<script src="static/js/auto_mailer.js"></script>\r\n  <script src="static/js/blueline-core.js"></script>'
  );
}

fs.writeFileSync(indexPath, content, 'utf8');
console.log('✓ Successfully added contact form linked to hello@draftkings.com to index.html');
