const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// =========================================================================
// 1. UPDATE scout.html
// =========================================================================
const scoutPath = path.join(ROOT, 'scout.html');
let scoutHtml = fs.readFileSync(scoutPath, 'utf8');

if (!scoutHtml.includes('static/js/auto_mailer.js')) {
  scoutHtml = scoutHtml.replace(
    '<script src="static/js/auth_engine.js"></script>',
    '<script src="static/js/auto_mailer.js"></script>\r\n  <script src="static/js/auth_engine.js"></script>'
  );
}

// Add Email Dossier Button next to Export Dossier / PDF button
if (!scoutHtml.includes('emailScoutDossier()')) {
  scoutHtml = scoutHtml.replace(
    '<span>Export Dossier / PDF</span>\r\n        </button>',
    `<span>Export Dossier / PDF</span>\r\n        </button>\r\n        <button type="button" onclick="emailScoutDossier()" class="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-400/50 font-mono text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer no-print" title="Dispatch Scout Dossier via DraftLineup Auto-Mailer">\r\n          <i class="fa-solid fa-paper-plane text-sky-400"></i>\r\n          <span>Email Dossier</span>\r\n        </button>`
  );
}

// Add emailScoutDossier function implementation
if (!scoutHtml.includes('function emailScoutDossier()')) {
  const insertBefore = '    window.addScoutNote = addScoutNote;';
  const newFunc = `    function emailScoutDossier() {
      if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendScoutDossierExport === 'function') {
        const athlete = activeAthlete || { name: "Michael Hage", team: "University of Michigan", pos: "C", league: "NCAA D1 / USHL" };
        const user = (window.BlueLineAuth && typeof window.BlueLineAuth.getCurrentUser === 'function') ? window.BlueLineAuth.getCurrentUser() : { name: "Dan Marr" };
        window.DraftLineupMailer.sendScoutDossierExport({
          playerName: athlete.name,
          team: athlete.team || "Independent Amateur",
          pos: athlete.pos || "F",
          league: athlete.league || "Tier 1 AAA / Junior",
          scoutName: user.name || "Dan Marr",
          scoutAgency: user.badge || "NHL Central Scouting Benchmark",
          grades: { skating: "65/80", iq: "70/80", shooting: "65/80", compete: "60/80" },
          notes: (scoutNotes && scoutNotes.length > 0) ? scoutNotes[0].text : "Scout evaluation dossier exported from Lead Scout Desk."
        });
        if (window.BlueLineUI) BlueLineUI.showToast("✓ Scout Intel Dossier dispatched to outbox!", "success");
      }
    }
    window.emailScoutDossier = emailScoutDossier;\r\n\r\n`;
  scoutHtml = scoutHtml.replace(insertBefore, newFunc + insertBefore);
}
fs.writeFileSync(scoutPath, scoutHtml, 'utf8');
console.log('✓ Wired scout.html auto-responder');

// =========================================================================
// 2. UPDATE combine.html
// =========================================================================
const combinePath = path.join(ROOT, 'combine.html');
let combineHtml = fs.readFileSync(combinePath, 'utf8');

if (!combineHtml.includes('static/js/auto_mailer.js')) {
  combineHtml = combineHtml.replace(
    '<script src="static/js/auth_engine.js"></script>',
    '<script src="static/js/auto_mailer.js"></script>\r\n  <script src="static/js/auth_engine.js"></script>'
  );
}

if (!combineHtml.includes('DraftLineupMailer.sendCombineEvaluationReport')) {
  combineHtml = combineHtml.replace(
    'showToast(`Saved ${currentAthlete.name} evaluation to Player Passport!`, "success");',
    `showToast(\`Saved \${currentAthlete.name} evaluation to Player Passport!\`, "success");
        if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendCombineEvaluationReport === 'function') {
          window.DraftLineupMailer.sendCombineEvaluationReport({
            playerName: currentAthlete.name,
            wingateWattage: metrics.wingatePeakWatts,
            sprint30m: metrics.sprint30m,
            verticalJump: metrics.verticalJumpInches,
            vo2Max: metrics.vo2Max,
            compositeAthleticism: metrics.compositeScore,
            recalibrationDelta: "+2.8 pts"
          });
        }`
  );
}
fs.writeFileSync(combinePath, combineHtml, 'utf8');
console.log('✓ Wired combine.html auto-responder');

// =========================================================================
// 3. UPDATE market.html
// =========================================================================
const marketPath = path.join(ROOT, 'market.html');
let marketHtml = fs.readFileSync(marketPath, 'utf8');

if (!marketHtml.includes('static/js/auto_mailer.js')) {
  marketHtml = marketHtml.replace(
    '<script src="static/js/auth_engine.js"></script>',
    '<script src="static/js/auto_mailer.js"></script>\r\n  <script src="static/js/auth_engine.js"></script>'
  );
}

if (!marketHtml.includes('DraftLineupMailer.sendTradeEvaluationNotice')) {
  marketHtml = marketHtml.replace(
    'window.MarketEngine.broadcastTradeProposal(result);\r\n        showToast("💼 Published Blockbuster Trade Proposal to The DraftLineup Wire!");',
    `window.MarketEngine.broadcastTradeProposal(result);
        if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendTradeEvaluationNotice === 'function') {
          window.DraftLineupMailer.sendTradeEvaluationNotice({
            teamA: result.teamA.name,
            teamB: result.teamB.name,
            assetsA: result.teamA.assetsOut.map(a => a.name).join(", ") || "Draft Capital",
            assetsB: result.teamB.assetsOut.map(a => a.name).join(", ") || "Roster Player",
            capDelta: result.teamA.netCapChangeFormatted,
            cbaCompliance: result.compliant ? "Approved & CBA 2026 Compliant" : "Review Required",
            draftSurplus: "+45.2 Pick Valuation Index"
          });
        }
        showToast("💼 Published Blockbuster Trade Proposal & Dispatched Auto-Alert!");`
  );
}
fs.writeFileSync(marketPath, marketHtml, 'utf8');
console.log('✓ Wired market.html auto-responder');

// =========================================================================
// 4. UPDATE portal.html
// =========================================================================
const portalPath = path.join(ROOT, 'portal.html');
let portalHtml = fs.readFileSync(portalPath, 'utf8');

if (!portalHtml.includes('static/js/auto_mailer.js')) {
  portalHtml = portalHtml.replace(
    '<script src="static/js/auth_engine.js"></script>',
    '<script src="static/js/auto_mailer.js"></script>\r\n  <script src="static/js/auth_engine.js"></script>'
  );
}

// Wire portal declaration
if (!portalHtml.includes('DraftLineupMailer.sendTransferPortalAlert') && portalHtml.includes('renderAthletes();')) {
  portalHtml = portalHtml.replace(
    'closeDeclareModal();\r\n      renderKPIs();\r\n      renderAthletes();',
    `closeDeclareModal();
      renderKPIs();
      renderAthletes();
      if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendTransferPortalAlert === 'function') {
        window.DraftLineupMailer.sendTransferPortalAlert({
          playerName: athlete.name,
          fromTeam: athlete.originSchool,
          toTeam: "Transfer Portal (Active)",
          status: athlete.status || "ENTERED PORTAL",
          nilValue: "$55,000 / yr",
          eligibility: athlete.eligibilityYears + " Year(s)"
        });
      }`
  );
}

// Wire direct message
if (!portalHtml.includes('DraftLineupMailer.sendRecruiterInquiryNotice')) {
  portalHtml = portalHtml.replace(
    "const raw = localStorage.getItem('blueline_portal_inquiries') || '[]';",
    `if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendRecruiterInquiryNotice === 'function' && typeof activeRecipient !== 'undefined' && activeRecipient) {
        window.DraftLineupMailer.sendRecruiterInquiryNotice({
          recruiterName: (window.BlueLineAuth && typeof window.BlueLineAuth.getCurrentUser === 'function') ? window.BlueLineAuth.getCurrentUser().name : "Lead Recruiter",
          recruiterOrg: "NCAA Division I Benchmark Program",
          targetPlayer: activeRecipient.name,
          message: text,
          wireChannel: "portal-direct"
        });
      }
      const raw = localStorage.getItem('blueline_portal_inquiries') || '[]';`
  );
}

fs.writeFileSync(portalPath, portalHtml, 'utf8');
console.log('✓ Wired portal.html auto-responder');
