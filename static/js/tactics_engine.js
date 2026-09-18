/**
 * BlueLine DataWorks: AI Lineup Optimizer, Chemistry Matrix & Tactical Systems Studio Engine
 * 
 * Capabilities:
 * - 5v5 Line Combination Optimization (4 Forward Lines, 3 Defensive Pairings, 2 Goalies)
 * - Special Teams Architect (PP1, PP2, PK1, PK2) with 1-3-1, Umbrella, Box+1, Diamond
 * - Unit Chemistry Algorithm (0-100 synergy score based on archetype balance, handedness, pace, and defensive floor)
 * - Projected On-Ice Analytics (xGF%, xGA/60, High-Danger Chance Differential, Faceoff %)
 * - Tactical Systems Models (1-2-2 Neutral Zone Trap, 2-1-2 Forecheck, Low Zone Collapse)
 * - Head-to-Head Line Matchup Simulator (Shift Battle Expectancy)
 * - Pre-loaded Championship Lineups (Boston College, Denver Pioneers, Fargo Force, Team USA U20, Team Canada U20)
 * - The BlueLine Wire Broadcast Engine (#LineupAlert, #TacticsLab, #SpecialTeams)
 */

(function(window) {
  "use strict";

  // ==========================================
  // 1. PLAYER ARCHETYPES & ATTRIBUTES
  // ==========================================
  const ARCHETYPES = {
    // Forwards
    SNIPER: { name: "Pure Sniper", role: "Finisher", icon: "🎯", chemistryBonusWith: ["PLAYMAKER", "POWER_FORWARD"] },
    PLAYMAKER: { name: "Elite Playmaker", role: "Distributor", icon: "🪄", chemistryBonusWith: ["SNIPER", "TWO_WAY"] },
    POWER_FORWARD: { name: "Power Forward", role: "Puck Retriever & Net-Front", icon: "💥", chemistryBonusWith: ["SNIPER", "PLAYMAKER"] },
    TWO_WAY: { name: "Two-Way Forward", role: "200-Foot Anchor", icon: "🛡️", chemistryBonusWith: ["PLAYMAKER", "SNIPER", "ENERGY"] },
    ENERGY: { name: "Energy Grinder", role: "Forecheck Disruptor", icon: "⚡", chemistryBonusWith: ["TWO_WAY", "POWER_FORWARD"] },

    // Defensemen
    OFFENSIVE_D: { name: "Offensive Dynamo", role: "Puck Mover & Point QB", icon: "🚀", chemistryBonusWith: ["SHUTDOWN_D", "TWO_WAY_D"] },
    SHUTDOWN_D: { name: "Shutdown Anchor", role: "Slot Denier & Net-Front Clearer", icon: "🧱", chemistryBonusWith: ["OFFENSIVE_D", "TWO_WAY_D"] },
    TWO_WAY_D: { name: "Two-Way Mobile D", role: "Transition Facilitator", icon: "🧭", chemistryBonusWith: ["OFFENSIVE_D", "SHUTDOWN_D"] },

    // Goalies
    BUTTERFLY: { name: "Butterfly Specialist", role: "Low Shot Stopper", icon: "🧤", chemistryBonusWith: ["SHUTDOWN_D"] },
    HYBRID: { name: "Hybrid Reflex", role: "Athletic Scrambler", icon: "🕸️", chemistryBonusWith: ["TWO_WAY_D"] },
    POSITIONAL: { name: "Positional Wall", role: "Rebound Controller", icon: "🛡️", chemistryBonusWith: ["OFFENSIVE_D"] }
  };

  // Tactical Systems Directory
  const TACTICAL_SYSTEMS = {
    forecheck: {
      "1-2-2": {
        name: "1-2-2 Neutral Zone Trap / Conservative Forecheck",
        description: "F1 angles puck carrier to boards; F2 and F3 lock down neutral zone lanes; D gaps tight.",
        tempo: "Controlled",
        xGFAwareness: "+4.2% Defensive Suppression",
        turnoverRate: "High Neutral Zone",
        recommendedFor: "Protecting leads, playing against high-speed rush teams."
      },
      "2-1-2": {
        name: "2-1-2 Aggressive Press Forecheck",
        description: "F1 and F2 hard rim and corner press to force D-to-D panic turnovers; F3 high slot safety.",
        tempo: "High-Octane",
        xGFAwareness: "+8.5% High-Danger Forecheck Chances",
        turnoverRate: "High Offensive Zone",
        recommendedFor: "Trailing in games, relentless cycle teams with heavy wings."
      },
      "1-3-1": {
        name: "1-3-1 Neutral Zone Wall",
        description: "Clogs center ice with 3 across the red line, forcing dump-ins for retrieval defense.",
        tempo: "Stifling",
        xGFAwareness: "+6.1% Transition Disruption",
        turnoverRate: "Maximum Middle Lane Denials",
        recommendedFor: "Disciplined European-style puck containment."
      },
      "2-3-lock": {
        name: "2-3 Left Wing Lock (MSHSL / Prep Trap)",
        description: "F1 and F2 pressure strong side puck carrier while F3 (LW) drops back into defensive line creating a 3-man blue line wall.",
        tempo: "Stifling Transition Trap",
        xGFAwareness: "+7.2% Middle Lane Denial",
        turnoverRate: "Elite Neutral Zone Interceptions",
        recommendedFor: "Protecting leads, countering high-flying rush attacks."
      }
    },
    defensiveZone: {
      "low-collapse": {
        name: "Low Zone House Collapse",
        description: "Wings collapse into slot house; defensemen pin corners; protect highest danger area.",
        dRating: "+7.5% Slot Protection",
        reboundSafety: "Elite",
        vuln: "Exposes point shots."
      },
      "box-plus-1": {
        name: "Box-Plus-One Hybrid Coverage",
        description: "4-man zone box protects slot while designated strong-side pursuer chases puck.",
        dRating: "+5.8% Balance Across Zones",
        reboundSafety: "Very Strong",
        vuln: "Demands high communication."
      },
      "man-to-man": {
        name: "Aggressive Tight Man-to-Man",
        description: "Direct shadow on assigned player; no soft ice given; requires elite skating defensemen.",
        dRating: "+8.0% Rush Denial",
        reboundSafety: "Moderate",
        vuln: "Vulnerable to cycle picks."
      },
      "sagging-zone": {
        name: "Sagging Zone Net-Front Containment",
        description: "Strong-side wing challenges half-wall while weak-side wing sags down to net-front to deny slot tip-ins and back-door passes.",
        dRating: "+6.9% Low Slot Denial",
        reboundSafety: "Elite",
        vuln: "Exposes weak-side point."
      }
    },
    powerPlay: {
      "1-3-1": {
        name: "Modern 1-3-1 Umbrella Special",
        description: "Point Quarterback, two Flanks, High Slot Bumper, and Net-Front Screen.",
        goalExpectancy: "26.4%",
        strength: "Quick east-west seam passes and bumper deflections."
      },
      "overload": {
        name: "Strong-Side Overload",
        description: "Three players work one half-wall board to create numerical superiority and quick 2v1s.",
        goalExpectancy: "23.1%",
        strength: "Puck recovery and cycle grinding."
      },
      "five-out": {
        name: "Five-Out Perimeter Spread Motion",
        description: "All five skaters operate outside the faceoff dots with continuous high-low interchange and quick weak-side dive bombs.",
        goalExpectancy: "24.8%",
        strength: "Disorganizes penalty kill diamond and creates cross-ice seam openings."
      }
    }
  };

  // ==========================================
  // 2. PRE-LOADED ELITE TEAM ROSTERS & PRESETS
  // ==========================================
  const TEAM_PRESETS = {
    bc: {
      id: "bc",
      name: "Boston College Eagles",
      league: "NCAA Hockey East",
      logo: "🦅",
      primaryColor: "#991b1b",
      coach: "Greg Brown",
      systems: { forecheck: "2-1-2", defensiveZone: "box-plus-1", powerPlay: "1-3-1" },
      lines: {
        f1: [
          { name: "Gabe Perreault", pos: "LW", hand: "L", arch: "PLAYMAKER", overall: 94, speed: 91, shot: 90, iq: 97, def: 84 },
          { name: "Will Smith", pos: "C", hand: "R", arch: "PLAYMAKER", overall: 96, speed: 93, shot: 94, iq: 98, def: 86 },
          { name: "Ryan Leonard", pos: "RW", hand: "R", arch: "POWER_FORWARD", overall: 95, speed: 94, shot: 96, iq: 93, def: 90 }
        ],
        f2: [
          { name: "Cutter Gauthier", pos: "LW", hand: "L", arch: "SNIPER", overall: 95, speed: 94, shot: 98, iq: 92, def: 88 },
          { name: "Oskar Jellvik", pos: "C", hand: "L", arch: "TWO_WAY", overall: 87, speed: 89, shot: 85, iq: 89, def: 88 },
          { name: "Andre Gasseau", pos: "RW", hand: "L", arch: "POWER_FORWARD", overall: 86, speed: 86, shot: 88, iq: 86, def: 85 }
        ],
        f3: [
          { name: "Colby Ambrosio", pos: "LW", hand: "R", arch: "ENERGY", overall: 83, speed: 88, shot: 81, iq: 84, def: 85 },
          { name: "James Hagens", pos: "C", hand: "L", arch: "PLAYMAKER", overall: 93, speed: 95, shot: 91, iq: 96, def: 82 },
          { name: "Jamie Armstrong", pos: "RW", hand: "L", arch: "ENERGY", overall: 81, speed: 85, shot: 80, iq: 82, def: 86 }
        ],
        f4: [
          { name: "Connor Joyce", pos: "LW", hand: "L", arch: "ENERGY", overall: 79, speed: 83, shot: 78, iq: 82, def: 84 },
          { name: "Mike Posma", pos: "C", hand: "L", arch: "TWO_WAY", overall: 81, speed: 84, shot: 79, iq: 83, def: 87 },
          { name: "Gentry Shamburger", pos: "RW", hand: "R", arch: "POWER_FORWARD", overall: 78, speed: 82, shot: 77, iq: 80, def: 83 }
        ],
        d1: [
          { name: "Eamon Powell", pos: "LD", hand: "R", arch: "TWO_WAY_D", overall: 88, speed: 89, shot: 84, iq: 90, def: 89 },
          { name: "Drew Fortescue", pos: "RD", hand: "L", arch: "SHUTDOWN_D", overall: 86, speed: 86, shot: 80, iq: 88, def: 92 }
        ],
        d2: [
          { name: "Aidan Hreschuk", pos: "LD", hand: "L", arch: "TWO_WAY_D", overall: 85, speed: 87, shot: 81, iq: 86, def: 88 },
          { name: "Jacob Bengtsson", pos: "RD", hand: "L", arch: "SHUTDOWN_D", overall: 83, speed: 83, shot: 78, iq: 85, def: 88 }
        ],
        d3: [
          { name: "Lukas Gustafsson", pos: "LD", hand: "L", arch: "OFFENSIVE_D", overall: 82, speed: 86, shot: 83, iq: 85, def: 79 },
          { name: "Charlie Leddy", pos: "RD", hand: "R", arch: "SHUTDOWN_D", overall: 81, speed: 84, shot: 76, iq: 84, def: 86 }
        ],
        goalies: [
          { name: "Jacob Fowler", pos: "G", hand: "L", arch: "POSITIONAL", overall: 94, svPct: ".926", gaa: "2.14", record: "32-6-1" },
          { name: "Jan Korec", pos: "G", hand: "L", arch: "HYBRID", overall: 80, svPct: ".908", gaa: "2.80", record: "2-0-0" }
        ]
      }
    },

    denver: {
      id: "denver",
      name: "Denver Pioneers",
      league: "NCAA Champions (NCHC)",
      logo: "🏔️",
      primaryColor: "#881337",
      coach: "David Carle",
      systems: { forecheck: "2-1-2", defensiveZone: "man-to-man", powerPlay: "1-3-1" },
      lines: {
        f1: [
          { name: "Tristan Broz", pos: "LW", hand: "L", arch: "SNIPER", overall: 90, speed: 90, shot: 92, iq: 90, def: 85 },
          { name: "Jack Devine", pos: "C", hand: "R", arch: "PLAYMAKER", overall: 94, speed: 92, shot: 93, iq: 95, def: 88 },
          { name: "Aidan Thompson", pos: "RW", hand: "L", arch: "TWO_WAY", overall: 88, speed: 89, shot: 86, iq: 90, def: 89 }
        ],
        f2: [
          { name: "Miko Matikka", pos: "LW", hand: "R", arch: "SNIPER", overall: 89, speed: 89, shot: 94, iq: 87, def: 83 },
          { name: "Carter King", pos: "C", hand: "L", arch: "TWO_WAY", overall: 87, speed: 88, shot: 84, iq: 91, def: 92 },
          { name: "McKade Webster", pos: "RW", hand: "L", arch: "POWER_FORWARD", overall: 86, speed: 86, shot: 85, iq: 88, def: 89 }
        ],
        f3: [
          { name: "Sam Harris", pos: "LW", hand: "L", arch: "POWER_FORWARD", overall: 84, speed: 86, shot: 87, iq: 84, def: 84 },
          { name: "Massimo Rizzo", pos: "C", hand: "L", arch: "PLAYMAKER", overall: 92, speed: 91, shot: 88, iq: 96, def: 84 },
          { name: "Jared Wright", pos: "RW", hand: "R", arch: "ENERGY", overall: 84, speed: 94, shot: 82, iq: 84, def: 87 }
        ],
        f4: [
          { name: "Rieger Lorenz", pos: "LW", hand: "L", arch: "TWO_WAY", overall: 85, speed: 88, shot: 86, iq: 87, def: 88 },
          { name: "Kieran Cebrian", pos: "C", hand: "L", arch: "ENERGY", overall: 80, speed: 85, shot: 78, iq: 82, def: 86 },
          { name: "Lucas Olvestad", pos: "RW", hand: "L", arch: "ENERGY", overall: 78, speed: 82, shot: 76, iq: 80, def: 83 }
        ],
        d1: [
          { name: "Zeev Buium", pos: "LD", hand: "L", arch: "OFFENSIVE_D", overall: 96, speed: 94, shot: 90, iq: 98, def: 89 },
          { name: "Boston Buckberger", pos: "RD", hand: "L", arch: "TWO_WAY_D", overall: 86, speed: 87, shot: 82, iq: 88, def: 88 }
        ],
        d2: [
          { name: "Shai Buium", pos: "LD", hand: "L", arch: "TWO_WAY_D", overall: 89, speed: 88, shot: 85, iq: 90, def: 91 },
          { name: "Sean Behrens", pos: "RD", hand: "L", arch: "SHUTDOWN_D", overall: 89, speed: 89, shot: 83, iq: 92, def: 93 }
        ],
        d3: [
          { name: "Lucas Olvestad", pos: "LD", hand: "L", arch: "SHUTDOWN_D", overall: 80, speed: 82, shot: 75, iq: 81, def: 85 },
          { name: "Freddie Clark", pos: "RD", hand: "R", arch: "SHUTDOWN_D", overall: 79, speed: 81, shot: 74, iq: 80, def: 84 }
        ],
        goalies: [
          { name: "Matt Davis", pos: "G", hand: "L", arch: "HYBRID", overall: 93, svPct: ".920", gaa: "2.28", record: "25-5-3" },
          { name: "Freddie Halyk", pos: "G", hand: "L", arch: "POSITIONAL", overall: 81, svPct: ".902", gaa: "2.88", record: "7-4-0" }
        ]
      }
    },

    fargo: {
      id: "fargo",
      name: "Fargo Force",
      league: "USHL Clark Cup & Anderson Cup Champions",
      logo: "⚡",
      primaryColor: "#0284c7",
      coach: "Brett Skinner",
      systems: { forecheck: "1-2-2", defensiveZone: "low-collapse", powerPlay: "1-3-1" },
      lines: {
        f1: [
          { name: "Zam Plante", pos: "LW", hand: "L", arch: "PLAYMAKER", overall: 91, speed: 91, shot: 89, iq: 93, def: 86 },
          { name: "Mac Swanson", pos: "C", hand: "L", arch: "PLAYMAKER", overall: 94, speed: 92, shot: 91, iq: 97, def: 88 },
          { name: "Lee Parks", pos: "RW", hand: "R", arch: "SNIPER", overall: 88, speed: 89, shot: 93, iq: 86, def: 82 }
        ],
        f2: [
          { name: "Michael Brandsegg", pos: "LW", hand: "R", arch: "POWER_FORWARD", overall: 89, speed: 90, shot: 91, iq: 89, def: 87 },
          { name: "Jake Fisher", pos: "C", hand: "L", arch: "TWO_WAY", overall: 86, speed: 87, shot: 85, iq: 88, def: 90 },
          { name: "Brandon Morin", pos: "RW", hand: "L", arch: "ENERGY", overall: 82, speed: 87, shot: 80, iq: 83, def: 85 }
        ],
        f3: [
          { name: "Gavin Morrissey", pos: "LW", hand: "L", arch: "TWO_WAY", overall: 83, speed: 85, shot: 81, iq: 85, def: 86 },
          { name: "Merril Steenari", pos: "C", hand: "R", arch: "ENERGY", overall: 82, speed: 85, shot: 80, iq: 83, def: 85 },
          { name: "Reid da Silva", pos: "RW", hand: "R", arch: "ENERGY", overall: 80, speed: 84, shot: 78, iq: 81, def: 83 }
        ],
        f4: [
          { name: "Tate Pritchard", pos: "LW", hand: "L", arch: "ENERGY", overall: 78, speed: 82, shot: 76, iq: 80, def: 83 },
          { name: "Tom Leppa", pos: "C", hand: "L", arch: "TWO_WAY", overall: 79, speed: 83, shot: 77, iq: 81, def: 85 },
          { name: "Cole Spicer", pos: "RW", hand: "R", arch: "ENERGY", overall: 77, speed: 81, shot: 75, iq: 79, def: 82 }
        ],
        d1: [
          { name: "Leo Gruba", pos: "LD", hand: "R", arch: "TWO_WAY_D", overall: 91, speed: 90, shot: 88, iq: 93, def: 92 },
          { name: "Brasen Boser", pos: "RD", hand: "R", arch: "SHUTDOWN_D", overall: 86, speed: 86, shot: 79, iq: 87, def: 91 }
        ],
        d2: [
          { name: "Sam Laurila", pos: "LD", hand: "L", arch: "SHUTDOWN_D", overall: 83, speed: 84, shot: 76, iq: 85, def: 89 },
          { name: "Finn McLaughlin", pos: "RD", hand: "L", arch: "OFFENSIVE_D", overall: 84, speed: 87, shot: 84, iq: 86, def: 80 }
        ],
        d3: [
          { name: "Anton Castro", pos: "LD", hand: "L", arch: "SHUTDOWN_D", overall: 80, speed: 81, shot: 73, iq: 81, def: 85 },
          { name: "Jack Sparkes", pos: "RD", hand: "R", arch: "SHUTDOWN_D", overall: 81, speed: 79, shot: 75, iq: 81, def: 87 }
        ],
        goalies: [
          { name: "Hampton Slukynsky", pos: "G", hand: "L", arch: "POSITIONAL", overall: 94, svPct: ".923", gaa: "1.86", record: "28-3-0" },
          { name: "Anton Castro", pos: "G", hand: "L", arch: "HYBRID", overall: 84, svPct: ".910", gaa: "2.35", record: "13-4-1" }
        ]
      }
    },

    usa_u20: {
      id: "usa_u20",
      name: "Team USA (World Juniors)",
      league: "IIHF World Junior Gold Medalists",
      logo: "🇺🇸",
      primaryColor: "#1e3a8a",
      coach: "David Carle",
      systems: { forecheck: "2-1-2", defensiveZone: "box-plus-1", powerPlay: "1-3-1" },
      lines: {
        f1: [
          { name: "Gabe Perreault", pos: "LW", hand: "L", arch: "PLAYMAKER", overall: 95, speed: 92, shot: 91, iq: 97, def: 86 },
          { name: "Will Smith", pos: "C", hand: "R", arch: "PLAYMAKER", overall: 97, speed: 94, shot: 95, iq: 98, def: 88 },
          { name: "Ryan Leonard", pos: "RW", hand: "R", arch: "POWER_FORWARD", overall: 96, speed: 95, shot: 97, iq: 94, def: 91 }
        ],
        f2: [
          { name: "Cutter Gauthier", pos: "LW", hand: "L", arch: "SNIPER", overall: 96, speed: 95, shot: 99, iq: 94, def: 89 },
          { name: "Rutger McGroarty", pos: "C", hand: "L", arch: "POWER_FORWARD", overall: 93, speed: 89, shot: 93, iq: 95, def: 92 },
          { name: "Jimmy Snuggerud", pos: "RW", hand: "R", arch: "SNIPER", overall: 92, speed: 92, shot: 96, iq: 91, def: 85 }
        ],
        f3: [
          { name: "Isaac Howard", pos: "LW", hand: "L", arch: "SNIPER", overall: 90, speed: 92, shot: 93, iq: 89, def: 83 },
          { name: "Frank Nazar", pos: "C", hand: "R", arch: "PLAYMAKER", overall: 92, speed: 96, shot: 88, iq: 94, def: 87 },
          { name: "Gavin Brindley", pos: "RW", hand: "R", arch: "ENERGY", overall: 91, speed: 95, shot: 89, iq: 93, def: 92 }
        ],
        f4: [
          { name: "Quinn Finley", pos: "LW", hand: "L", arch: "ENERGY", overall: 85, speed: 91, shot: 83, iq: 86, def: 87 },
          { name: "Oliver Moore", pos: "C", hand: "L", arch: "TWO_WAY", overall: 89, speed: 99, shot: 84, iq: 90, def: 91 },
          { name: "Danny Nelson", pos: "RW", hand: "L", arch: "TWO_WAY", overall: 86, speed: 88, shot: 84, iq: 88, def: 92 }
        ],
        d1: [
          { name: "Zeev Buium", pos: "LD", hand: "L", arch: "OFFENSIVE_D", overall: 96, speed: 94, shot: 90, iq: 98, def: 90 },
          { name: "Lane Hutson", pos: "RD", hand: "L", arch: "OFFENSIVE_D", overall: 97, speed: 96, shot: 92, iq: 99, def: 84 }
        ],
        d2: [
          { name: "Ryan Chesley", pos: "LD", hand: "R", arch: "SHUTDOWN_D", overall: 89, speed: 89, shot: 82, iq: 91, def: 95 },
          { name: "Seamus Casey", pos: "RD", hand: "R", arch: "OFFENSIVE_D", overall: 91, speed: 93, shot: 89, iq: 95, def: 83 }
        ],
        d3: [
          { name: "Drew Fortescue", pos: "LD", hand: "L", arch: "SHUTDOWN_D", overall: 87, speed: 87, shot: 80, iq: 89, def: 93 },
          { name: "Sam Rinzel", pos: "RD", hand: "R", arch: "TWO_WAY_D", overall: 88, speed: 92, shot: 85, iq: 89, def: 89 }
        ],
        goalies: [
          { name: "Trey Augustine", pos: "G", hand: "L", arch: "HYBRID", overall: 96, svPct: ".936", gaa: "1.75", record: "7-0-0" },
          { name: "Jacob Fowler", pos: "G", hand: "L", arch: "POSITIONAL", overall: 94, svPct: ".926", gaa: "2.14", record: "3-0-0" }
        ]
      }
    },

    minnetonka: {
      id: "minnetonka",
      name: "Minnetonka Skippers",
      league: "MSHSL Class AA State Champions",
      logo: "⚓",
      primaryColor: "#0284c7",
      coach: "Sean Goldsworthy",
      systems: { forecheck: "2-3-lock", defensiveZone: "sagging-zone", powerPlay: "1-3-1" },
      lines: {
        f1: [
          { name: "Javon Moore", pos: "LW", hand: "L", arch: "POWER_FORWARD", overall: 91, speed: 91, shot: 90, iq: 91, def: 86 },
          { name: "Ashton Schultz", pos: "C", hand: "L", arch: "PLAYMAKER", overall: 89, speed: 90, shot: 87, iq: 93, def: 87 },
          { name: "Hagen Burrows", pos: "RW", hand: "R", arch: "SNIPER", overall: 94, speed: 92, shot: 95, iq: 96, def: 88 }
        ],
        f2: [
          { name: "Sam Scheetz", pos: "LW", hand: "L", arch: "SNIPER", overall: 86, speed: 88, shot: 88, iq: 86, def: 82 },
          { name: "Alex Lunski", pos: "C", hand: "R", arch: "TWO_WAY", overall: 85, speed: 87, shot: 84, iq: 88, def: 89 },
          { name: "Gavin Garry", pos: "RW", hand: "R", arch: "ENERGY", overall: 84, speed: 89, shot: 82, iq: 84, def: 85 }
        ],
        f3: [
          { name: "Luke Garry", pos: "LW", hand: "L", arch: "ENERGY", overall: 82, speed: 86, shot: 80, iq: 83, def: 85 },
          { name: "Mason Minor", pos: "C", hand: "L", arch: "TWO_WAY", overall: 81, speed: 85, shot: 79, iq: 84, def: 86 },
          { name: "Caden Zamboni", pos: "RW", hand: "R", arch: "POWER_FORWARD", overall: 80, speed: 84, shot: 81, iq: 81, def: 83 }
        ],
        f4: [
          { name: "Wyatt Geller", pos: "LW", hand: "L", arch: "ENERGY", overall: 78, speed: 83, shot: 76, iq: 80, def: 84 },
          { name: "Carson Steinhoff", pos: "C", hand: "R", arch: "ENERGY", overall: 77, speed: 84, shot: 75, iq: 80, def: 83 },
          { name: "Ty Osterhaug", pos: "RW", hand: "L", arch: "ENERGY", overall: 76, speed: 82, shot: 74, iq: 79, def: 82 }
        ],
        d1: [
          { name: "John Stout", pos: "LD", hand: "L", arch: "SHUTDOWN_D", overall: 91, speed: 89, shot: 84, iq: 93, def: 94 },
          { name: "Hunter Bauer", pos: "RD", hand: "R", arch: "TWO_WAY_D", overall: 87, speed: 88, shot: 83, iq: 89, def: 89 }
        ],
        d2: [
          { name: "Liam Hupila", pos: "LD", hand: "L", arch: "OFFENSIVE_D", overall: 84, speed: 87, shot: 85, iq: 86, def: 81 },
          { name: "Danny Browning", pos: "RD", hand: "R", arch: "SHUTDOWN_D", overall: 83, speed: 84, shot: 78, iq: 85, def: 88 }
        ],
        d3: [
          { name: "Max Aronson", pos: "LD", hand: "L", arch: "SHUTDOWN_D", overall: 80, speed: 82, shot: 75, iq: 82, def: 85 },
          { name: "Cole Hanson", pos: "RD", hand: "R", arch: "TWO_WAY_D", overall: 79, speed: 83, shot: 76, iq: 81, def: 84 }
        ],
        goalies: [
          { name: "Kaiser Nelson", pos: "G", hand: "L", arch: "POSITIONAL", overall: 90, svPct: ".928", gaa: "1.65", record: "23-2-2" },
          { name: "Jackson Coatta", pos: "G", hand: "L", arch: "HYBRID", overall: 81, svPct: ".910", gaa: "2.10", record: "6-1-0" }
        ]
      }
    },

    avon: {
      id: "avon",
      name: "Avon Old Farms Winged Beavers",
      league: "NEPSAC Founders League (Elite 8 Champions)",
      logo: "🦫",
      primaryColor: "#7c2d12",
      coach: "John Gardner",
      systems: { forecheck: "2-1-2", defensiveZone: "box-plus-1", powerPlay: "five-out" },
      lines: {
        f1: [
          { name: "Joe Connor", pos: "LW", hand: "L", arch: "ENERGY", overall: 93, speed: 94, shot: 91, iq: 95, def: 90 },
          { name: "Alex Bales", pos: "C", hand: "L", arch: "PLAYMAKER", overall: 89, speed: 90, shot: 88, iq: 93, def: 86 },
          { name: "Charlie Gollob", pos: "RW", hand: "R", arch: "POWER_FORWARD", overall: 88, speed: 89, shot: 90, iq: 87, def: 85 }
        ],
        f2: [
          { name: "Brennan Cail", pos: "LW", hand: "L", arch: "SNIPER", overall: 86, speed: 88, shot: 89, iq: 85, def: 82 },
          { name: "Gabe Watson", pos: "C", hand: "R", arch: "TWO_WAY", overall: 85, speed: 87, shot: 84, iq: 88, def: 88 },
          { name: "Cory Alissi", pos: "RW", hand: "R", arch: "ENERGY", overall: 84, speed: 89, shot: 82, iq: 83, def: 84 }
        ],
        f3: [
          { name: "Cooper Snee", pos: "LW", hand: "L", arch: "TWO_WAY", overall: 82, speed: 85, shot: 81, iq: 84, def: 86 },
          { name: "Nick Capasso", pos: "C", hand: "L", arch: "PLAYMAKER", overall: 83, speed: 86, shot: 80, iq: 87, def: 81 },
          { name: "Sam LeDrew", pos: "RW", hand: "L", arch: "SNIPER", overall: 84, speed: 87, shot: 88, iq: 84, def: 80 }
        ],
        f4: [
          { name: "Michael Munroe", pos: "LW", hand: "L", arch: "ENERGY", overall: 79, speed: 83, shot: 77, iq: 81, def: 84 },
          { name: "Jack Sadowski", pos: "C", hand: "R", arch: "TWO_WAY", overall: 81, speed: 85, shot: 80, iq: 83, def: 85 },
          { name: "Owen Leahy", pos: "RW", hand: "R", arch: "ENERGY", overall: 78, speed: 82, shot: 76, iq: 80, def: 82 }
        ],
        d1: [
          { name: "Matt Wright", pos: "LD", hand: "L", arch: "TWO_WAY_D", overall: 90, speed: 90, shot: 86, iq: 92, def: 91 },
          { name: "Hudson Miller", pos: "RD", hand: "R", arch: "SHUTDOWN_D", overall: 87, speed: 87, shot: 80, iq: 88, def: 92 }
        ],
        d2: [
          { name: "Magnus Osterhus", pos: "LD", hand: "L", arch: "OFFENSIVE_D", overall: 85, speed: 88, shot: 85, iq: 87, def: 82 },
          { name: "Chase Pirtle", pos: "RD", hand: "R", arch: "TWO_WAY_D", overall: 84, speed: 86, shot: 82, iq: 86, def: 87 }
        ],
        d3: [
          { name: "Luke Dow", pos: "LD", hand: "L", arch: "SHUTDOWN_D", overall: 81, speed: 83, shot: 76, iq: 82, def: 86 },
          { name: "Connor Gately", pos: "RD", hand: "R", arch: "SHUTDOWN_D", overall: 80, speed: 82, shot: 75, iq: 81, def: 85 }
        ],
        goalies: [
          { name: "Stephen Peck", pos: "G", hand: "L", arch: "POSITIONAL", overall: 91, svPct: ".924", gaa: "1.85", record: "21-3-1" },
          { name: "Kyle Ozgun", pos: "G", hand: "L", arch: "HYBRID", overall: 83, svPct: ".912", gaa: "2.25", record: "5-1-0" }
        ]
      }
    }
  };

  // ==========================================
  // 3. CHEMISTRY & ANALYTICS CALCULATION ENGINE
  // ==========================================
  
  /**
   * Calculates Line Chemistry Rating (0 - 100)
   * Factors:
   * 1. Archetype Balance (Sniper + Playmaker + Power Forward / Two-Way)
   * 2. Handedness Optimization (LW Left/Right, C, RW Right/Left)
   * 3. Pace Variance (Lines with close speed ratings skate in rhythm)
   * 4. Average Line IQ & Skill floor
   */
  function calculateLineChemistry(players) {
    if (!players || players.length < 2) return { score: 60, grade: "C", factors: [] };

    let baseScore = 70;
    const factors = [];

    // 1. Role Diversity
    const archs = players.map(p => p.arch);
    const hasFinisher = archs.includes("SNIPER") || archs.includes("POWER_FORWARD");
    const hasDistributor = archs.includes("PLAYMAKER");
    const hasDefense = archs.includes("TWO_WAY") || archs.includes("SHUTDOWN_D") || archs.includes("TWO_WAY_D");

    if (players.length === 3) { // Forward Line
      if (hasFinisher && hasDistributor && hasDefense) {
        baseScore += 16;
        factors.push("✨ Perfect Tri-Role Balance (Finisher + Creator + 200ft Anchor)");
      } else if (hasFinisher && hasDistributor) {
        baseScore += 10;
        factors.push("⚡ High Offensive Synergy (Sniper + Playmaker Tandem)");
      } else if (archs.filter(a => a === "SNIPER").length >= 2) {
        baseScore -= 6;
        factors.push("⚠️ Multiple Finisher Puck Contention (-6)");
      }
    } else if (players.length === 2) { // Defense Pair
      const hasPuckMover = archs.includes("OFFENSIVE_D") || archs.includes("TWO_WAY_D");
      const hasAnchor = archs.includes("SHUTDOWN_D") || archs.includes("TWO_WAY_D");
      if (hasPuckMover && hasAnchor) {
        baseScore += 15;
        factors.push("🛡️ Elite D-Pair Pairing (Transition Dynamo + Net-Front Stopper)");
      } else if (archs.every(a => a === "OFFENSIVE_D")) {
        baseScore -= 8;
        factors.push("⚠️ High Defensive Vulnerability (Dual Offensive Defensemen)");
      }
    }

    // 2. Handedness Optimization
    if (players.length === 3) {
      const lw = players[0];
      const rw = players[2];
      if (lw && rw) {
        if (lw.hand === "L" && rw.hand === "R") {
          baseScore += 6;
          factors.push("🏒 Natural Wing Stick Handedness (+6)");
        } else if (lw.hand === "R" && rw.hand === "L") {
          baseScore += 4;
          factors.push("🎯 Inverted Off-Wing One-Timer Geometry (+4)");
        }
      }
    } else if (players.length === 2) {
      if (players[0].hand !== players[1].hand) {
        baseScore += 8;
        factors.push("📐 Left-Right Defensive Passing Angles (+8)");
      } else {
        factors.push("ℹ️ Same-Handed D-Pair (Reverse Board Retrievals)");
      }
    }

    // 3. Pace & Transition Tempo Variance
    const speeds = players.map(p => p.speed || 85);
    const maxSpeed = Math.max(...speeds);
    const minSpeed = Math.min(...speeds);
    const speedDelta = maxSpeed - minSpeed;

    if (speedDelta <= 3) {
      baseScore += 6;
      factors.push("🚀 Unified Skating Rhythm (Tempo Delta ≤ 3)");
    } else if (speedDelta >= 9) {
      baseScore -= 6;
      factors.push("⚠️ Skating Pace Mismatch (-6)");
    }

    // 4. Hockey IQ Bonus
    const avgIQ = players.reduce((sum, p) => sum + (p.iq || 85), 0) / players.length;
    if (avgIQ >= 93) {
      baseScore += 5;
      factors.push("🧠 High-IQ Reading & Anticipation");
    }

    const finalScore = Math.max(50, Math.min(99, Math.round(baseScore)));
    const grade = finalScore >= 94 ? "A+" :
                  finalScore >= 89 ? "A" :
                  finalScore >= 84 ? "B+" :
                  finalScore >= 78 ? "B" :
                  finalScore >= 70 ? "C+" : "C";

    return {
      score: finalScore,
      grade: grade,
      factors: factors
    };
  }

  /**
   * Calculates Expected Goals & Analytics for a 5v5 unit
   */
  function calculateUnitMetrics(forwards, defense, system) {
    const allSkating = [...forwards, ...defense];
    const avgOffense = allSkating.reduce((s, p) => s + (p.shot + p.iq) / 2, 0) / allSkating.length;
    const avgDefense = allSkating.reduce((s, p) => s + (p.def + p.iq) / 2, 0) / allSkating.length;
    const avgSpeed = allSkating.reduce((s, p) => s + p.speed, 0) / allSkating.length;

    // xGF% based on ratings and system
    let xGF = 50 + (avgOffense - avgDefense) * 0.8;
    if (system && system.forecheck === "2-1-2") xGF += 2.5;
    if (system && system.forecheck === "1-2-2") xGF += 0.8;

    xGF = Math.max(38.0, Math.min(68.5, xGF)).toFixed(1);

    // xGA per 60 minutes
    let xGA = 2.85 - (avgDefense - 80) * 0.045;
    xGA = Math.max(1.45, Math.min(3.60, xGA)).toFixed(2);

    // High Danger Differential
    const hdDiff = (avgOffense > avgDefense ? "+" : "") + ((avgOffense - avgDefense) * 0.25).toFixed(1);

    return {
      xGFPct: `${xGF}%`,
      xGA60: xGA,
      hdDiff: hdDiff,
      paceIndex: Math.round(avgSpeed),
      offenseGrade: Math.round(avgOffense),
      defenseGrade: Math.round(avgDefense)
    };
  }

  // ==========================================
  // 4. SHIFT BATTLE SIMULATOR (HEAD-TO-HEAD)
  // ==========================================
  function simulateShiftBattle(userLine, oppLine, userSystem, oppSystem) {
    const userChem = calculateLineChemistry(userLine);
    const oppChem = calculateLineChemistry(oppLine);

    const userOff = userLine.reduce((s, p) => s + p.overall, 0) / userLine.length + userChem.score * 0.1;
    const oppOff = oppLine.reduce((s, p) => s + p.overall, 0) / oppLine.length + oppChem.score * 0.1;

    const probUserWinsShift = userOff / (userOff + oppOff);
    const rand = Math.random();

    const isUserSuccess = rand < probUserWinsShift;
    const shotTotalUser = Math.floor(Math.random() * 3) + (isUserSuccess ? 1 : 0);
    const shotTotalOpp = Math.floor(Math.random() * 2) + (!isUserSuccess ? 1 : 0);
    const goalScored = Math.random() < 0.22;

    let narrative = "";
    if (isUserSuccess) {
      narrative = goalScored ? 
        `🚨 **GOAL!** Relentless cycle pressure opened seam; ${userLine[0].name} finishes high-glove!` :
        `🎯 **Sustained Pressure:** ${userLine[1].name} forced a turnover and generated 2 high-danger scoring chances.`;
    } else {
      narrative = `🛡️ **Defensive Stand:** Opponent checking unit forced dump-in and cleared the zone cleanly.`;
    }

    return {
      userWinProb: (probUserWinsShift * 100).toFixed(1),
      winner: isUserSuccess ? "User Line" : "Opponent Line",
      userShots: shotTotalUser,
      oppShots: shotTotalOpp,
      goalScored: goalScored,
      narrative: narrative
    };
  }

  // ==========================================
  // 5. SOCIAL WIRE BROADCAST
  // ==========================================
  function broadcastLineupToWire(lineupData) {
    const post = {
      id: `post-tactics-${Date.now()}`,
      authorId: "usr_blueline_tactics",
      timestamp: "Just now",
      content: `📋 **LINEUP & TACTICAL REPORT: ${lineupData.teamName.toUpperCase()}**\n\nTop Line: ${lineupData.line1Names}\nChemistry Synergy Grade: **${lineupData.line1Grade}** (${lineupData.line1Score}/100)\nSystem Blueprint: **${lineupData.systemName}** | Projected xGF: **${lineupData.xGF}**\n\n#LineupAlert #TacticsLab #SpecialTeams #BlueLineDataWorks`,
      likes: 42,
      reposts: 17,
      replies: 8,
      likedByMe: false,
      pinned: false,
      tags: ["#LineupAlert", "#TacticsLab", "#SpecialTeams", "#BlueLineDataWorks"],
      media: {
        type: "banner",
        title: `${lineupData.teamName.toUpperCase()} LINE COMBINATIONS`,
        subtitle: `Chemistry: ${lineupData.line1Grade} • xGF%: ${lineupData.xGF}`
      }
    };

    try {
      const wireRaw = localStorage.getItem("blueline_social_state");
      let wireState = wireRaw ? JSON.parse(wireRaw) : { posts: [] };
      if (!Array.isArray(wireState.posts)) wireState.posts = [];
      wireState.posts.unshift(post);
      localStorage.setItem("blueline_social_state", JSON.stringify(wireState));
    } catch (e) {
      console.warn("Could not save lineup post to Wire:", e);
    }

    return post;
  }

  // ==========================================
  // 6. EXPORT TO GLOBAL
  // ==========================================
  window.BlueLineTacticsEngine = {
    ARCHETYPES,
    TACTICAL_SYSTEMS,
    TEAM_PRESETS,
    calculateLineChemistry,
    calculateUnitMetrics,
    simulateShiftBattle,
    broadcastLineupToWire
  };

})(window);
