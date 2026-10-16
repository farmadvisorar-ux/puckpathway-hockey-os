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
  scoutName: "Dan Marr",
  scoutAgency: "NHL Central Scouting Benchmark"
}, "furrhjohn10@gmail.com");
assert(dossierRes && dossierRes.success === true, "sendScoutDossierExport dispatches confidential intel dossier");

// 5. Transfer Portal Alert
const portalRes = mailer.sendTransferPortalAlert({
  playerName: "Logan Stein",
  fromTeam: "Ferris State",
  toTeam: "Michigan",
  status: "COMMITMENT FINALIZED",
  nilValue: "$65,000 / yr"
}, "furrhjohn10@gmail.com");
assert(portalRes && portalRes.success === true, "sendTransferPortalAlert dispatches portal status change notice");

// 6. Recruiter Wire Message
const wireRes = mailer.sendRecruiterInquiryNotice({
  recruiterName: "Adam Nightingale",
  recruiterOrg: "Michigan State University (NCAA D1)",
  targetPlayer: "Michael Hage",
  message: "Impressive neutral zone pace. Let's schedule a call."
}, "furrhjohn10@gmail.com");
assert(wireRes && wireRes.success === true, "sendRecruiterInquiryNotice dispatches direct wire message alert");

// 7. Combine Evaluation Report
const combineRes = mailer.sendCombineEvaluationReport({
  playerName: "Macklin Celebrini",
  wingateWattage: "1,240",
  sprint30m: "3.72",
  verticalJump: "33.5",
  compositeAthleticism: "95.6"
}, "furrhjohn10@gmail.com");
assert(combineRes && combineRes.success === true, "sendCombineEvaluationReport dispatches biometric recalibration report");

// 8. Trade Machine Notice
const tradeRes = mailer.sendTradeEvaluationNotice({
  teamA: "Montreal Canadiens",
  teamB: "Calgary Flames",
  assetsA: "1st Round Pick (2026)",
  assetsB: "Top RHD (50% Retained)",
  capDelta: "+$2,250,000"
}, "furrhjohn10@gmail.com");
assert(tradeRes && tradeRes.success === true, "sendTradeEvaluationNotice dispatches CBA trade evaluation");

// 9. Practice Plan Dispatch
const planRes = mailer.sendPracticePlanNotice({
  coachName: "Adam Nightingale",
  teamName: "Michigan State Spartans",
  focusArea: "1-2-2 Forecheck Pressure"
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

// 13. Check Outbox Storage
const outbox = mailer.getOutbox();
assert(outbox.length >= 13, `Outbox successfully recorded ${outbox.length} dispatched autoresponder emails`);

// Verify outbox entries have correct metadata & domain
const firstMail = outbox[0];
assert(firstMail.route.includes("furrhjohn10@gmail.com"), "Outbox route points to operations desk furrhjohn10@gmail.com");
assert(firstMail.html.includes("draftlineup.com"), "HTML body includes official domain draftlineup.com");
assert(firstMail.html.includes("DraftLineup.com is the only hockey analytics platform"), "HTML body includes official mission statement");

console.log(`\n🎉 SUCCESS: All ${passed}/${total} auto-mailer tests passed with 100% accuracy!`);

