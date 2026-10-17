/**
 * Automated Test Suite for DraftLineup Auto-Mailer & Password Reset Flow
 */

const fs = require('fs');
const path = require('path');

// Setup mock window & localStorage
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

global.window = global;
global.document = {
  getElementById: () => null,
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }),
  body: { appendChild: () => {} },
  head: { appendChild: () => {} },
  querySelector: () => null,
  querySelectorAll: () => []
};
global.CustomEvent = class CustomEvent { constructor(name, detail) { this.name = name; this.detail = detail; } };
global.dispatchEvent = () => true;

// Load auto_mailer.js
require(path.resolve(__dirname, '..', 'static', 'js', 'auto_mailer.js'));

console.log("=== DraftLineup Auto-Mailer Test Suite ===");
const mailer = global.DraftLineupMailer;

if (!mailer) {
  console.error("✗ DraftLineupMailer failed to attach to global window!");
  process.exit(1);
}
console.log("✓ DraftLineupMailer successfully loaded");

let passed = 0;
let total = 0;

function assert(condition, name) {
  total++;
  if (condition) {
    console.log(`  ✓ Test ${total}: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ Test ${total} FAILED: ${name}`);
    process.exit(1);
  }
}

// 1. Sign-Up Confirmation
const signupRes = mailer.sendSignupConfirmation({
  name: "Connor Bedard",
  email: "cbedard@nhl.com",
  role: "athlete"
});
assert(signupRes && signupRes.code && signupRes.code.length === 6, "sendSignupConfirmation generates 6-digit OTP");
assert(signupRes.token && signupRes.token.startsWith("tk_"), "sendSignupConfirmation generates cryptographic token");

// Verify valid signup code
const verifySignupRes = mailer.verifySignupCode("cbedard@nhl.com", signupRes.code);
assert(verifySignupRes.success === true, "verifySignupCode succeeds with correct code");

// Verify code cannot be reused
const verifySignupReuse = mailer.verifySignupCode("cbedard@nhl.com", signupRes.code);
assert(verifySignupReuse.success === false, "verifySignupCode blocks code re-use");

// 2. Password Reset Flow
const resetRes = mailer.sendPasswordReset("scout.marr@nhlcentralscouting.com");
assert(resetRes && resetRes.code && resetRes.code.length === 6, "sendPasswordReset generates 6-digit OTP");

// Verify invalid code fails
const verifyResetBad = mailer.verifyResetCode("scout.marr@nhlcentralscouting.com", "999999");
assert(verifyResetBad.success === false, "verifyResetCode rejects incorrect OTP");

// Verify correct reset code
const verifyResetGood = mailer.verifyResetCode("scout.marr@nhlcentralscouting.com", resetRes.code);
assert(verifyResetGood.success === true, "verifyResetCode validates correct OTP");

// 3. Athlete Passport Stamped Notice
const passportRes = mailer.sendAthletePassportNotice({
  name: "Michael Hage",
  team: "University of Michigan",
  league: "NCAA D1",
  num: 19,
  composite_score: 92.4,
  ledger_hash: "0x7f4e92a1d3c5"
}, "furrhjohn10@gmail.com");
assert(passportRes && passportRes.success === true, "sendAthletePassportNotice generates passport notice");

// 4. Scout Dossier Export
const dossierRes = mailer.sendScoutDossierExport({
  playerName: "Cole Eiserman",
  team: "Boston University",
  pos: "LW",
  league: "NCAA D1",
  dossierId: "DOS-2026-BOS-084"
}, "furrhjohn10@gmail.com");
assert(dossierRes && dossierRes.success === true, "sendScoutDossierExport dispatches confidential intel dossier");

// 5. NCAA Transfer Portal Alert
const portalRes = mailer.sendTransferPortalAlert({
  playerName: "Cutter Gauthier",
  prevTeam: "Boston College",
  newTeam: "Anaheim Ducks",
  window: "Spring Window"
}, "furrhjohn10@gmail.com");
assert(portalRes && portalRes.success === true, "sendTransferPortalAlert dispatches portal status change notice");

// 6. Recruiter Direct Inquiry Alert
const wireRes = mailer.sendRecruiterInquiryNotice({
  scoutName: "Al Murray",
  scoutOrg: "Tampa Bay Lightning",
  athleteName: "Isaac Howard"
}, "furrhjohn10@gmail.com");
assert(wireRes && wireRes.success === true, "sendRecruiterInquiryNotice dispatches direct wire message alert");

// 7. Combine Biometric Recalibration Notice
const combineRes = mailer.sendCombineEvaluationReport({
  playerName: "James Hagens",
  speed30m: "3.52s",
  broadJump: "118 in",
  gripStrength: "168 lbs",
  newComposite: "96.8"
}, "furrhjohn10@gmail.com");
assert(combineRes && combineRes.success === true, "sendCombineEvaluationReport dispatches biometric recalibration report");

// 8. Multi-Team Trade Machine Evaluation Notice
const tradeRes = mailer.sendTradeEvaluationNotice({
  tradeId: "TRD-2026-EDM-TOR",
  teamsInvolved: "Edmonton Oilers & Toronto Maple Leafs",
  capImpact: "$1,450,000",
  verdict: "CBA Compliant - Grade A"
}, "furrhjohn10@gmail.com");
assert(tradeRes && tradeRes.success === true, "sendTradeEvaluationNotice dispatches CBA trade evaluation");

// 9. ADM Practice Plan Station Notice
const planRes = mailer.sendPracticePlanNotice({
  planTitle: "Small Area Transition & Inner Slot Escapes",
  ageGroup: "U16 / Bantam AAA",
  durationMin: "60"
}, "furrhjohn10@gmail.com");
assert(planRes && planRes.success === true, "sendPracticePlanNotice dispatches ADM station plan");

// 10. Film Breakdown Dispatch
const filmRes = mailer.sendFilmBreakdownNotice({
  gameTitle: "Michigan State vs. Michigan (Semi-Final)",
  clipCount: "14"
}, "furrhjohn10@gmail.com");
assert(filmRes && filmRes.success === true, "sendFilmBreakdownNotice dispatches AI telestration clips");

// 11. Tryout & Camp Invitation
const inviteRes = mailer.sendTryoutInvitation({
  orgName: "USA Hockey Junior Bureau",
  campName: "Summer Showcase",
  venue: "USA Hockey Arena"
}, "furrhjohn10@gmail.com");
assert(inviteRes && inviteRes.success === true, "sendTryoutInvitation dispatches camp selection notice");

// 12. Contact Form Dispatch Linked to hello@draftkings.com
const contactRes = mailer.sendContactSubmission({
  name: "Gordie Howe",
  email: "mr.hockey@draftlineup.com",
  role: "Hall of Fame Scout",
  subject: "NCAA D1 & Junior Showcase Inquiries",
  message: "Testing direct link routing to hello@draftkings.com.",
  priority: "High Priority (12h SLA)"
});
assert(contactRes && contactRes.success === true, "sendContactSubmission dispatches inquiry to operations");
assert(contactRes.targetEmail === "hello@draftkings.com", "Contact form target is linked to hello@draftkings.com");

// 13. Minor Athlete Under-18 Takedown & Parental Rights Form
const takedownRes = mailer.sendMinorTakedownRequest({
  parentName: "Sarah Lindgren",
  parentEmail: "sarah.lindgren@example.com",
  parentPhone: "+1 (512) 555-0199",
  parentRelationship: "Mother (Biological Parent)",
  athleteName: "Oskar Lindgren",
  athleteDob: "2010-06-14",
  athleteTeam: "Austin Ice Bats Youth AAA",
  athleteId: "exp_00029",
  requestTypes: [
    "Complete Public & Subscriber Profile Erasure",
    "Biometric & Combine Telemetry Purge",
    "Recruiter Direct Contact Block"
  ],
  signature: "Sarah Lindgren",
  notes: "Requesting full erasure under COPPA and state youth consumer privacy laws."
});
assert(takedownRes && takedownRes.success === true, "sendMinorTakedownRequest dispatches legal takedown notice");
assert(takedownRes.ticketId && takedownRes.ticketId.startsWith("DL-OPT-"), "sendMinorTakedownRequest generates legal case ticket ID");
assert(takedownRes.targetEmail === "hello@draftkings.com", "Takedown notice routes to legal desk hello@draftkings.com");

// 14. Check Outbox Storage
const outbox = mailer.getOutbox();
assert(outbox.length >= 15, `Outbox successfully recorded ${outbox.length} dispatched autoresponder emails`);

// Verify outbox entries have correct metadata & domain
const firstMail = outbox[0];
assert(firstMail.route.includes("furrhjohn10@gmail.com"), "Outbox route points to operations desk furrhjohn10@gmail.com");
assert(firstMail.html.includes("draftlineup.com"), "HTML body includes official domain draftlineup.com");
assert(firstMail.html.includes("DraftLineup.com is the only hockey analytics platform"), "HTML body includes official mission statement");

console.log(`\n🎉 SUCCESS: All ${passed}/${total} auto-mailer tests passed with 100% accuracy!`);
