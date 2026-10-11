const fs = require('fs');

const html = fs.readFileSync('agents.html', 'utf8');

const requiredIds = [
  'activeShiftBadge',
  'leadAgentLabel',
  'copilotAgentLabel',
  'shiftCountdown',
  'compileCountdown',
  'agentCardsContainer',
  'channelSearchInput',
  'channelsTableBody',
  'trialConsoleOutput',
  'statTotalTrials',
  'statTotalBytes',
  'triggerShiftTrialBtn',
  'crawlBtnIcon',
  'crawlBtnText',
  'triggerAllBatchCrawlBtn',
  'trigger12hCompileBtn',
  'exportLedgerJsonBtn',
  'geminiCountdownTimer',
  'geminiAuditedCount',
  'geminiDupesCount',
  'geminiLedgerCount',
  'geminiTeamsCount',
  'triggerGeminiScrapeBtn',
  'geminiScrapeBtnIcon',
  'geminiScrapeBtnText',
  'geminiIngestionLog',
  'schoolsTableBody',
  'schoolSearchInput',
  'clearSchoolSearchBtn'
];

let missing = 0;
requiredIds.forEach(id => {
  const hasId = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
  if (!hasId) {
    console.error(`❌ Missing DOM ID in agents.html: "${id}"`);
    missing++;
  } else {
    console.log(`✓ Verified DOM ID: "${id}"`);
  }
});

if (missing === 0) {
  console.log('\nSUCCESS: All 29 critical Agent Mesh & Swarm DOM bindings verified in agents.html!');
} else {
  console.error(`\nFAILED: ${missing} DOM IDs are missing!`);
  process.exit(1);
}
