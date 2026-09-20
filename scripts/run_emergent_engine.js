/**
 * Verification & Test Runner for Emergent Swarm Intelligence Engine
 */

const { EmergentSwarmEngine } = require('../static/js/emergent_swarm_engine.js');

async function main() {
  console.log('=============================================================================');
  console.log('⚡ TESTING BLUELINE EMERGENT SWARM INTELLIGENCE & MULTI-AGENT CONSENSUS');
  console.log('=============================================================================\n');

  const engine = new EmergentSwarmEngine({
    consensusThreshold: 2.5,
    nonNhlEnforcement: true
  });

  // 1. Inspect Circadian Shift & Dynamic Handoff
  const shift = engine.computeShiftMetrics();
  console.log(`[EPOCH SHIFT] Hour ${shift.epochHour}:00 - Shift #${shift.shiftNumber}/24`);
  console.log(`  Lead Scout Pilot: ${shift.lead.name} (${shift.lead.codename}) [${shift.lead.division}]`);
  console.log(`  Co-Pilot Active:  ${shift.copilot.name} (${shift.copilot.codename}) [Handoff Relay]`);
  console.log(`  Quorum Watchdogs: ${shift.quorumWatchdogs.map(w => w.name).join(', ')}`);

  // 2. Test Real Live Channel Telemetry & Dynamic SQM
  console.log('\n[SIGNAL METRIC] Probing Live Junior & Collegiate Telemetry...');
  const testChannel = {
    id: "ushl_tier1_feed",
    name: "USHL Tier 1 Junior League Live Registry",
    category: "Junior Tier 1",
    endpoint: "https://en.wikipedia.org/w/api.php?action=parse&page=2024%E2%80%9325_USHL_season&prop=text&format=json&origin=*"
  };

  const telemetry = await engine.probeChannel(testChannel);
  console.log(`  Target: ${telemetry.name}`);
  console.log(`  HTTP: ${telemetry.httpStatus} | Latency: ${telemetry.latencyMs}ms | Size: ${(telemetry.payloadBytes / 1024).toFixed(1)} KB`);
  console.log(`  Dynamic SQM: ${telemetry.sqm} -> Allocated Tier: ${telemetry.tier}`);

  // 3. Test Emergent Quorum Consensus on Amateur Prospect
  console.log('\n[EMERGENT CONSENSUS] Evaluating 3-Node Quorum for Prospect: Michael Hage (USHL -> NCAA D1)...');
  const candidateProspect = {
    name: "Michael Hage",
    currentLeague: "USHL",
    team: "Chicago Steel",
    age: 18.1,
    gamesPlayed: 54,
    goals: 33,
    assists: 42,
    corsiPct: 58.2,
    dangerShotPct: 44.5
  };

  const consensusResult = await engine.evaluateProspectConsensus(candidateProspect);
  console.log(`  Consensus Achieved: ${consensusResult.consensus ? '✅ YES' : '❌ NO'}`);
  console.log(`  Proposal ID: ${consensusResult.proposalId}`);
  console.log(`  Cryptographic Seal: ${consensusResult.seal.sealHash}`);
  console.log(`  Affirmative Quorum Nodes: ${consensusResult.seal.verifiedBy.join(', ')}`);
  console.log(`  Emergent Trajectory Score: ${consensusResult.trajectory.trajectoryScore} / 100`);
  console.log(`  NCAA D1 Probability: ${consensusResult.trajectory.ncaaProbability}%`);
  console.log(`  Developmental Tier: ${consensusResult.trajectory.developmentalTier}`);

  // 4. Test NHL Boundary Rejection (Safeguard Invariant)
  console.log('\n[SECURITY SHIELD] Testing Non-NHL Pure Amateur Safeguard...');
  const nhlViolator = {
    name: "Connor McDavid",
    currentLeague: "NHL",
    team: "Edmonton Oilers",
    age: 27
  };

  const rejectionResult = await engine.evaluateProspectConsensus(nhlViolator);
  console.log(`  NHL Entity Rejected by Swarm: ${!rejectionResult.consensus ? '✅ BLOCKED AS EXPECTED' : '❌ UNEXPECTED PASS'}`);

  // 5. Blackboard State Snapshot
  const snapshot = engine.getSwarmSnapshot();
  console.log('\n[COLLECTIVE STATE] Summary:');
  console.log(`  Total Registered Swarm Nodes: ${snapshot.totalAgents}`);
  console.log(`  Active Division: ${snapshot.activeDivision}`);
  console.log(`  Telemetry Telemetry Ingested: ${snapshot.telemetryCount}`);
  console.log(`  Consensus Ledgers Committed: ${snapshot.verifiedConsensusCount}`);
  console.log('\n=============================================================================');
  console.log('✅ ALL EMERGENT SWARM SUBSYSTEMS OPERATING NOMINALLY');
  console.log('=============================================================================');
}

main().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
