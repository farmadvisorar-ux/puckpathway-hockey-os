const fs = require('fs');
const path = require('path');

const mailerPath = path.join(__dirname, '..', 'static', 'js', 'auto_mailer.js');
let content = fs.readFileSync(mailerPath, 'utf8');

// 1. Add contactEmail to MAILER_CONFIG
if (!content.includes('contactEmail:')) {
  content = content.replace(
    'helloEmail: "hello@draftlineup.com",',
    'helloEmail: "hello@draftlineup.com",\r\n    contactEmail: "hello@draftkings.com",'
  );
}

// 2. Add createContactInquiryTemplate before section 5
if (!content.includes('function createContactInquiryTemplate')) {
  const insertBeforeMarker = '// =========================================================================\r\n  // 5. DISPATCH ENGINE';
  const insertBeforeMarkerLF = '// =========================================================================\n  // 5. DISPATCH ENGINE';

  const templateCode = `  // Template 12: Direct Contact Form Dispatch & Routing (hello@draftkings.com)
  function createContactInquiryTemplate(data) {
    const { name, senderEmail, role, subject, message, priority, targetEmail } = data;
    const body = \`
      \${renderEmailHtmlHeader("Direct Contact Inquiry", "CONTACT WIRE")}
      <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">
        New Contact Inquiry from \${name || 'Prospective Partner'}
      </h2>
      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        A direct inquiry has been submitted via the DraftLineup.com contact portal and routed to <strong>\${targetEmail || MAILER_CONFIG.contactEmail}</strong>.
      </p>

      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td width="35%" style="color: #64748b;">Full Name:</td>
            <td style="color: #ffffff; font-weight: 700;">\${name || 'Inquirer'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Email Address:</td>
            <td style="color: #38bdf8; font-weight: 700;"><a href="mailto:\${senderEmail}" style="color: #38bdf8; text-decoration: none;">\${senderEmail}</a></td>
          </tr>
          <tr>
            <td style="color: #64748b;">Role / Ecosystem:</td>
            <td style="color: #ffffff; font-weight: 700;">\${role || 'General Inquirer'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Subject:</td>
            <td style="color: #ffffff; font-weight: 700;">\${subject || 'General Inquiry'}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Routing Target:</td>
            <td style="color: #10b981; font-weight: 700;">\${targetEmail || MAILER_CONFIG.contactEmail}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Priority SLA:</td>
            <td style="color: #fbbf24; font-weight: 700;">\${priority || 'Standard (24h)'}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #030712; border: 1px solid #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Message Content:</div>
        <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">\${message || '(No message content provided)'}</div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="mailto:\${senderEmail}?subject=Re: \${encodeURIComponent(subject || 'DraftLineup Inquiry')}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          Reply Directly to \${name || 'Inquirer'} &rarr;
        </a>
      </div>
      \${renderEmailHtmlFooter(targetEmail || MAILER_CONFIG.contactEmail, "DraftLineup Autonomous Wire Gateway")}
    \`;

    return {
      subject: \`📬 Direct Contact Inquiry: [\${subject || 'Inquiry'}] from \${name} (\${role || 'User'})\`,
      html: body
    };
  }\r\n\r\n  `;

  if (content.includes(insertBeforeMarker)) {
    content = content.replace(insertBeforeMarker, templateCode + insertBeforeMarker);
  } else if (content.includes(insertBeforeMarkerLF)) {
    content = content.replace(insertBeforeMarkerLF, templateCode.replace(/\r\n/g, '\n') + insertBeforeMarkerLF);
  }
}

// 3. Add sendContactSubmission dispatcher before sendTestAutoresponder
if (!content.includes('function sendContactSubmission')) {
  const dispatcherMarker = '  // Master Test Dispatcher for All 11 Types';
  const dispatcherCode = `  // 12. Contact Form Dispatcher (Linked to hello@draftkings.com)
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
      subject: \`Receipt: We received your inquiry regarding "\${subject}"\`,
      html: \`
        \${renderEmailHtmlHeader("Message Received", "AUTO-RECEIPT")}
        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 800;">Hello \${name},</h2>
        <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Thank you for reaching out to DraftLineup. Your inquiry has been routed to our direct desk at <strong>\${targetEmail}</strong>.
        </p>
        <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; margin: 18px 0; font-size: 13px; color: #cbd5e1;">
          <p style="margin: 0 0 6px 0;"><strong>Inquiry Subject:</strong> \${subject}</p>
          <p style="margin: 0 0 6px 0;"><strong>Destination:</strong> \${targetEmail}</p>
          <p style="margin: 0;"><strong>Estimated Response Time:</strong> Within 24 hours</p>
        </div>
        <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
          For urgent scouting or tryout inquiries, you can also connect with coaches directly on The Wire.
        </p>
        \${renderEmailHtmlFooter(senderEmail, "DraftLineup Customer Support")}
      \`
    };

    const loggedReceipt = logDispatchedEmail({
      to: senderEmail,
      subject: autoReceipt.subject,
      html: autoReceipt.html,
      type: "CONTACT_RECEIPT",
      category: "CONTACT"
    });

    console.log(\`[DraftLineup Mailer] Dispatched Contact Form Inquiry to \${targetEmail} from \${senderEmail}\`);
    return { success: true, targetEmail, mailId: logged.id, receiptId: loggedReceipt.id };
  }\r\n\r\n`;

  content = content.replace(dispatcherMarker, dispatcherCode + dispatcherMarker);
}

// 4. Add sendContactSubmission to exports
if (!content.includes('sendContactSubmission,')) {
  content = content.replace(
    'sendTryoutInvitation,',
    'sendTryoutInvitation,\r\n    sendContactSubmission,'
  );
}

fs.writeFileSync(mailerPath, content, 'utf8');
console.log('✓ Successfully updated auto_mailer.js with sendContactSubmission and hello@draftkings.com link');
