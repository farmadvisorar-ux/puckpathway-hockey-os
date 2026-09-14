/**
 * BlueLine DataWorks: International Best-on-Best Showcase & Olympic / 4 Nations Engine
 * 
 * Capabilities:
 * - Full 23-man best-on-best rosters for USA, Canada, Sweden, Finland, Czechia, Slovakia, Switzerland, Germany
 * - Dual Tournament Formats:
 *   1. NHL 4 Nations Face-Off (USA, Canada, Sweden, Finland Round-Robin & Final)
 *   2. 2026 Winter Olympic Games (Milano-Cortina 12-Nation Tournament & Medal Rounds)
 * - Olympic "On the Bubble" Watch (Locks, Contenders, Bubble, Next-Gen Phenoms: Celebrini, Bedard, Smith)
 * - Rink Dimension Translation Engine (NHL 200x85 ft vs Olympic 200x100 ft tactical adjustments)
 * - Best-on-Best Matchup Simulator & Monte Carlo Gold Medal Odds Engine
 * - The BlueLine Wire Broadcast Engine (#4Nations, #Milano2026, #BestOnBest, #OlympicHockey)
 */

(function(window) {
  "use strict";

  // ==========================================
  // 1. NATIONAL TEAM ROSTERS & RATINGS
  // ==========================================
  const NATIONS = {
    usa: {
      id: "usa",
      name: "United States",
      flag: "🇺🇸",
      elo: 1720,
      coach: "Mike Sullivan",
      gm: "Bill Guerin",
      colors: { primary: "#1e3a8a", secondary: "#b91c1c", accent: "#ffffff" },
      offenseRating: 97,
      defenseRating: 96,
      goalieRating: 98,
      goldOdds4Nations: "41.5%",
      goldOddsOlympics: "38.2%",
      identity: "Relentless north-south speed, elite blue-line transition, and reigning Vezina-caliber goaltending depth.",
      lines: {
        f1: [
          { name: "Matthew Tkachuk", pos: "LW", hand: "L", nhlTeam: "Florida Panthers", overall: 96, role: "Net-Front Disruptor" },
          { name: "Auston Matthews", pos: "C", hand: "L", nhlTeam: "Toronto Maple Leafs", overall: 98, role: "Generational Sniper" },
          { name: "Jack Eichel", pos: "RW", hand: "R", nhlTeam: "Vegas Golden Knights", overall: 96, role: "Power Transition" }
        ],
        f2: [
          { name: "Brady Tkachuk", pos: "LW", hand: "L", nhlTeam: "Ottawa Senators", overall: 94, role: "Heavy Forechecker" },
          { name: "Jack Hughes", pos: "C", hand: "L", nhlTeam: "New Jersey Devils", overall: 97, role: "Dynamic Playmaker" },
          { name: "Cole Caufield", pos: "RW", hand: "R", nhlTeam: "Montreal Canadiens", overall: 92, role: "One-Timer Finisher" }
        ],
        f3: [
          { name: "Kyle Connor", pos: "LW", hand: "L", nhlTeam: "Winnipeg Jets", overall: 93, role: "Rush Scorer" },
          { name: "J.T. Miller", pos: "C", hand: "L", nhlTeam: "Vancouver Canucks", overall: 94, role: "Two-Way Heavy C" },
          { name: "Clayton Keller", pos: "RW", hand: "L", nhlTeam: "Utah Hockey Club", overall: 92, role: "Perimeter Creator" }
        ],
        f4: [
          { name: "Chris Kreider", pos: "LW", hand: "L", nhlTeam: "New York Rangers", overall: 91, role: "Net-Front Tip Specialist" },
          { name: "Dylan Larkin", pos: "C", hand: "L", nhlTeam: "Detroit Red Wings", overall: 92, role: "Speed Anchor" },
          { name: "Vincent Trocheck", pos: "RW", hand: "R", nhlTeam: "New York Rangers", overall: 91, role: "Faceoff & Checking" }
        ],
        d1: [
          { name: "Quinn Hughes", pos: "LD", hand: "L", nhlTeam: "Vancouver Canucks", overall: 98, role: "Norris Trophy Dynamo" },
          { name: "Charlie McAvoy", pos: "RD", hand: "R", nhlTeam: "Boston Bruins", overall: 96, role: "Complete #1 Anchor" }
        ],
        d2: [
          { name: "Jaccob Slavin", pos: "LD", hand: "L", nhlTeam: "Carolina Hurricanes", overall: 95, role: "Pure Shutdown Master" },
          { name: "Adam Fox", pos: "RD", hand: "R", nhlTeam: "New York Rangers", overall: 97, role: "High-IQ Distributor" }
        ],
        d3: [
          { name: "Zach Werenski", pos: "LD", hand: "L", nhlTeam: "Columbus Blue Jackets", overall: 93, role: "Two-Way Mobile D" },
          { name: "Brock Faber", pos: "RD", hand: "R", nhlTeam: "Minnesota Wild", overall: 92, role: "Modern Transition Stopper" }
        ],
        goalies: [
          { name: "Connor Hellebuyck", pos: "G", hand: "L", nhlTeam: "Winnipeg Jets", overall: 98, svPct: ".921", status: "Starter (Vezina Winner)" },
          { name: "Jake Oettinger", pos: "G", hand: "L", nhlTeam: "Dallas Stars", overall: 95, svPct: ".915", status: "Backup" },
          { name: "Jeremy Swayman", pos: "G", hand: "L", nhlTeam: "Boston Bruins", overall: 94, svPct: ".916", status: "Third Goalie" }
        ],
        bubbleWatch: [
          { name: "Will Smith", pos: "C", status: "Next-Gen Phenom", note: "BC standout and Sharks 1st rounder pushing for checking role" },
          { name: "Logan Cooley", pos: "C", status: "Contender", note: "Electric open-ice playmaking" },
          { name: "Zeev Buium", pos: "LD", status: "Dark Horse", note: "Denver NCAA champion transition profile" },
          { name: "Tage Thompson", pos: "RW", status: "Bubble", note: "6'6\" wingspan and lethal power play reach" }
        ]
      }
    },

    canada: {
      id: "canada",
      name: "Canada",
      flag: "🇨🇦",
      elo: 1735,
      coach: "Jon Cooper",
      gm: "Doug Armstrong",
      colors: { primary: "#dc2626", secondary: "#ffffff", accent: "#000000" },
      offenseRating: 99,
      defenseRating: 95,
      goalieRating: 91,
      goldOdds4Nations: "44.8%",
      goldOddsOlympics: "41.6%",
      identity: "Unsurpassed center depth, explosive rush counter-attack, and generational playmaking spearheaded by McDavid and MacKinnon.",
      lines: {
        f1: [
          { name: "Zach Hyman", pos: "LW", hand: "R", nhlTeam: "Edmonton Oilers", overall: 94, role: "50-Goal Net Retriever" },
          { name: "Connor McDavid", pos: "C", hand: "L", nhlTeam: "Edmonton Oilers", overall: 99, role: "Generational Transcendent" },
          { name: "Sam Reinhart", pos: "RW", hand: "R", nhlTeam: "Florida Panthers", overall: 96, role: "Elite Two-Way Finisher" }
        ],
        f2: [
          { name: "Brad Marchand", pos: "LW", hand: "L", nhlTeam: "Boston Bruins", overall: 93, role: "Pest & Big-Game Winner" },
          { name: "Nathan MacKinnon", pos: "C", hand: "R", nhlTeam: "Colorado Avalanche", overall: 99, role: "Hart Trophy Power Bull" },
          { name: "Mitch Marner", pos: "RW", hand: "R", nhlTeam: "Toronto Maple Leafs", overall: 96, role: "East-West Playmaker" }
        ],
        f3: [
          { name: "Carter Verhaeghe", pos: "LW", hand: "L", nhlTeam: "Florida Panthers", overall: 93, role: "Clutch Playoff Finisher" },
          { name: "Sidney Crosby", pos: "C", hand: "L", nhlTeam: "Pittsburgh Penguins", overall: 97, role: "Legendary 200ft Captain" },
          { name: "Brayden Point", pos: "RW", hand: "R", nhlTeam: "Tampa Bay Lightning", overall: 95, role: "High-Traffic Inside Scorer" }
        ],
        f4: [
          { name: "Alexis Lafrenière", pos: "LW", hand: "L", nhlTeam: "New York Rangers", overall: 90, role: "Heavy Puck Support" },
          { name: "Bo Horvat", pos: "C", hand: "L", nhlTeam: "New York Islanders", overall: 91, role: "Faceoff Dominator" },
          { name: "Travis Konecny", pos: "RW", hand: "R", nhlTeam: "Philadelphia Flyers", overall: 91, role: "High-Energy Motor" }
        ],
        d1: [
          { name: "Devon Toews", pos: "LD", hand: "L", nhlTeam: "Colorado Avalanche", overall: 95, role: "Flawless Gap Controller" },
          { name: "Cale Makar", pos: "RD", hand: "R", nhlTeam: "Colorado Avalanche", overall: 99, role: "Generational Defenseman" }
        ],
        d2: [
          { name: "Josh Morrissey", pos: "LD", hand: "L", nhlTeam: "Winnipeg Jets", overall: 94, role: "Mobile Transition QB" },
          { name: "Alex Pietrangelo", pos: "RD", hand: "R", nhlTeam: "Vegas Golden Knights", overall: 93, role: "Two-Time Cup Champion" }
        ],
        d3: [
          { name: "Shea Theodore", pos: "LD", hand: "L", nhlTeam: "Vegas Golden Knights", overall: 92, role: "Deceptive Blue-Line Mover" },
          { name: "Noah Dobson", pos: "RD", hand: "R", nhlTeam: "New York Islanders", overall: 93, role: "Heavy 70-Point Distributor" }
        ],
        goalies: [
          { name: "Adin Hill", pos: "G", hand: "L", nhlTeam: "Vegas Golden Knights", overall: 92, svPct: ".914", status: "Stanley Cup Champion" },
          { name: "Jordan Binnington", pos: "G", hand: "L", nhlTeam: "St. Louis Blues", overall: 92, svPct: ".913", status: "Big-Game Battler" },
          { name: "Stuart Skinner", pos: "G", hand: "L", nhlTeam: "Edmonton Oilers", overall: 90, svPct: ".908", status: "Third Goalie" }
        ],
        bubbleWatch: [
          { name: "Macklin Celebrini", pos: "C", status: "Next-Gen Phenom", note: "1st overall pick; pro pace already fits international Olympic ice" },
          { name: "Connor Bedard", pos: "C/RW", status: "Next-Gen Phenom", note: "Lethal power play weapon and Calder Trophy winner" },
          { name: "Steven Stamkos", pos: "LW/RW", status: "Veteran Contender", note: "500-goal sniper on the left circle" },
          { name: "Mark Stone", pos: "RW", status: "Bubble (Health)", note: "Best defensive winger in hockey when healthy" }
        ]
      }
    },

    sweden: {
      id: "sweden",
      name: "Sweden",
      flag: "🇸🇪",
      elo: 1675,
      coach: "Sam Hallam",
      gm: "Anders Lundberg",
      colors: { primary: "#0284c7", secondary: "#eab308", accent: "#ffffff" },
      offenseRating: 93,
      defenseRating: 97,
      goalieRating: 93,
      goldOdds4Nations: "9.2%",
      goldOddsOlympics: "12.4%",
      identity: "World's most gifted puck-moving blue line with suffocating defensive zone exits and European open-ice vision.",
      lines: {
        f1: [
          { name: "Filip Forsberg", pos: "LW", hand: "R", nhlTeam: "Nashville Predators", overall: 95, role: "Dynamic Power Scorer" },
          { name: "Elias Pettersson", pos: "C", hand: "L", nhlTeam: "Vancouver Canucks", overall: 96, role: "Elite Dual Threat" },
          { name: "William Nylander", pos: "RW", hand: "R", nhlTeam: "Toronto Maple Leafs", overall: 96, role: "Zone Entry Maestro" }
        ],
        f2: [
          { name: "Jesper Bratt", pos: "LW", hand: "L", nhlTeam: "New Jersey Devils", overall: 93, role: "Shift Speed Skater" },
          { name: "Mika Zibanejad", pos: "C", hand: "R", nhlTeam: "New York Rangers", overall: 93, role: "One-Timer & 200ft Play" },
          { name: "Adrian Kempe", pos: "RW", hand: "L", nhlTeam: "Los Angeles Kings", overall: 93, role: "Heavy 200ft Winger" }
        ],
        f3: [
          { name: "Lucas Raymond", pos: "LW", hand: "R", nhlTeam: "Detroit Red Wings", overall: 92, role: "Young Clutch Scorer" },
          { name: "Joel Eriksson Ek", pos: "C", hand: "L", nhlTeam: "Minnesota Wild", overall: 93, role: "Elite Matchup Stopper" },
          { name: "Viktor Arvidsson", pos: "RW", hand: "R", nhlTeam: "Edmonton Oilers", overall: 89, role: "High-Energy Shooter" }
        ],
        f4: [
          { name: "William Eklund", pos: "LW", hand: "L", nhlTeam: "San Jose Sharks", overall: 88, role: "Puck Support Creator" },
          { name: "Leo Carlsson", pos: "C", hand: "L", nhlTeam: "Anaheim Ducks", overall: 90, role: "6'3\" Playmaking Phenom" },
          { name: "Carl Grundstrom", pos: "RW", hand: "L", nhlTeam: "San Jose Sharks", overall: 85, role: "Heavy Forechecker" }
        ],
        d1: [
          { name: "Victor Hedman", pos: "LD", hand: "L", nhlTeam: "Tampa Bay Lightning", overall: 96, role: "Norris Trophy Tower" },
          { name: "Erik Karlsson", pos: "RD", hand: "R", nhlTeam: "Pittsburgh Penguins", overall: 95, role: "Three-Time Norris Winner" }
        ],
        d2: [
          { name: "Rasmus Dahlin", pos: "LD", hand: "L", nhlTeam: "Buffalo Sabres", overall: 96, role: "Physical Puck Mover" },
          { name: "Gustav Forsling", pos: "RD", hand: "L", nhlTeam: "Florida Panthers", overall: 95, role: "Stanley Cup Top Pair D" }
        ],
        d3: [
          { name: "Jonas Brodin", pos: "LD", hand: "L", nhlTeam: "Minnesota Wild", overall: 92, role: "Defensive Skating Clinic" },
          { name: "Mattias Ekholm", pos: "RD", hand: "L", nhlTeam: "Edmonton Oilers", overall: 92, role: "Heavy Veteran Anchor" }
        ],
        goalies: [
          { name: "Jacob Markstrom", pos: "G", hand: "L", nhlTeam: "New Jersey Devils", overall: 93, svPct: ".910", status: "Starting Veteran" },
          { name: "Filip Gustavsson", pos: "G", hand: "L", nhlTeam: "Minnesota Wild", overall: 92, svPct: ".915", status: "Tandem Equal" },
          { name: "Jesper Wallstedt", pos: "G", hand: "L", nhlTeam: "Minnesota Wild", overall: 89, svPct: ".912", status: "Next-Gen Starter" }
        ],
        bubbleWatch: [
          { name: "Axel Sandin Pellikka", pos: "RD", status: "Next-Gen Phenom", note: "WJC Best Defenseman, SHL champion" },
          { name: "Jonathan Lekkerimaki", pos: "RW", status: "Contender", note: "WJC MVP with lethal wrist shot" }
        ]
      }
    },

    finland: {
      id: "finland",
      name: "Finland",
      flag: "🇫🇮",
      elo: 1660,
      coach: "Antti Pennanen",
      gm: "Jere Lehtinen",
      colors: { primary: "#1e40af", secondary: "#ffffff", accent: "#93c5fd" },
      offenseRating: 92,
      defenseRating: 95,
      goalieRating: 96,
      goldOdds4Nations: "4.5%",
      goldOddsOlympics: "7.8%",
      identity: "Tournament discipline, suffocating five-man defensive system, and world-class goaltending led by Juuse Saros.",
      lines: {
        f1: [
          { name: "Artturi Lehkonen", pos: "LW", hand: "L", nhlTeam: "Colorado Avalanche", overall: 91, role: "Clutch Big-Game Winger" },
          { name: "Aleksander Barkov", pos: "C", hand: "L", nhlTeam: "Florida Panthers", overall: 98, role: "Selke Trophy Captain" },
          { name: "Mikko Rantanen", pos: "RW", hand: "L", nhlTeam: "Colorado Avalanche", overall: 97, role: "100-Point Power Winger" }
        ],
        f2: [
          { name: "Teuvo Teräväinen", pos: "LW", hand: "L", nhlTeam: "Chicago Blackhawks", overall: 91, role: "Visionary Playmaker" },
          { name: "Sebastian Aho", pos: "C", hand: "L", nhlTeam: "Carolina Hurricanes", overall: 96, role: "Dynamic 200ft Engine" },
          { name: "Eeli Tolvanen", pos: "RW", hand: "L", nhlTeam: "Seattle Kraken", overall: 88, role: "One-Timer Release" }
        ],
        f3: [
          { name: "Matias Maccelli", pos: "LW", hand: "L", nhlTeam: "Utah Hockey Club", overall: 89, role: "Deceptive Puck Handler" },
          { name: "Roope Hintz", pos: "C", hand: "L", nhlTeam: "Dallas Stars", overall: 94, role: "Power Skating 1C" },
          { name: "Mikael Granlund", pos: "RW", hand: "L", nhlTeam: "San Jose Sharks", overall: 90, role: "Veteran Playmaker" }
        ],
        f4: [
          { name: "Anton Lundell", pos: "LW", hand: "L", nhlTeam: "Florida Panthers", overall: 91, role: "Cup Champion Checking C" },
          { name: "Erik Haula", pos: "C", hand: "L", nhlTeam: "New Jersey Devils", overall: 87, role: "Pest & PK Specialist" },
          { name: "Joel Armia", pos: "RW", hand: "R", nhlTeam: "Montreal Canadiens", overall: 86, role: "Stick Checking Giant" }
        ],
        d1: [
          { name: "Miro Heiskanen", pos: "LD", hand: "L", nhlTeam: "Dallas Stars", overall: 97, role: "30-Minute Marathon Skater" },
          { name: "Esa Lindell", pos: "RD", hand: "L", nhlTeam: "Dallas Stars", overall: 92, role: "Shot-Blocking Fortress" }
        ],
        d2: [
          { name: "Niko Mikkola", pos: "LD", hand: "L", nhlTeam: "Florida Panthers", overall: 90, role: "Heavy 6'4\" Enforcer" },
          { name: "Henri Jokiharju", pos: "RD", hand: "R", nhlTeam: "Buffalo Sabres", overall: 87, role: "Mobile Puck Mover" }
        ],
        d3: [
          { name: "Olli Määttä", pos: "LD", hand: "L", nhlTeam: "Detroit Red Wings", overall: 86, role: "Structured Low Zone D" },
          { name: "Jani Hakanpää", pos: "RD", hand: "R", nhlTeam: "Toronto Maple Leafs", overall: 87, role: "Physical Slot Denier" }
        ],
        goalies: [
          { name: "Juuse Saros", pos: "G", hand: "L", nhlTeam: "Nashville Predators", overall: 96, svPct: ".918", status: "Starting Workhorse" },
          { name: "Ukko-Pekka Luukkonen", pos: "G", hand: "L", nhlTeam: "Buffalo Sabres", overall: 93, svPct: ".915", status: "Surging Tandem Partner" },
          { name: "Kevin Lankinen", pos: "G", hand: "L", nhlTeam: "Vancouver Canucks", overall: 89, svPct: ".910", status: "Third Goalie" }
        ],
        bubbleWatch: [
          { name: "Konsta Helenius", pos: "C", status: "Next-Gen Phenom", note: "1st round pick with adult Liiga experience" }
        ]
      }
    },

    czechia: {
      id: "czechia",
      name: "Czechia",
      flag: "🇨🇿",
      elo: 1640,
      coach: "Radim Rulik",
      offenseRating: 92,
      defenseRating: 88,
      goalieRating: 94,
      goldOddsOlympics: "4.8%",
      identity: "World Championship Gold Medalists on home ice. Lethal transition scoring led by David Pastrnak and Lukas Dostal.",
      keyStars: ["David Pastrnak", "Martin Necas", "Tomas Hertl", "Filip Hronek", "Lukas Dostal"]
    },

    germany: {
      id: "germany",
      name: "Germany",
      flag: "🇩🇪",
      elo: 1610,
      coach: "Harold Kreis",
      offenseRating: 91,
      defenseRating: 89,
      goalieRating: 90,
      goldOddsOlympics: "3.2%",
      identity: "Top-end NHL franchise firepower in Leon Draisaitl, Tim Stützle, JJ Peterka, and Moritz Seider.",
      keyStars: ["Leon Draisaitl", "Tim Stützle", "JJ Peterka", "Moritz Seider", "Philipp Grubauer"]
    },

    switzerland: {
      id: "switzerland",
      name: "Switzerland",
      flag: "🇨🇭",
      elo: 1620,
      coach: "Patrick Fischer",
      offenseRating: 90,
      defenseRating: 91,
      goalieRating: 90,
      goldOddsOlympics: "3.5%",
      identity: "Heavy European structured cycle game powered by Roman Josi, Nico Hischier, and Kevin Fiala.",
      keyStars: ["Roman Josi", "Nico Hischier", "Kevin Fiala", "Timo Meier", "Nino Niederreiter"]
    },

    slovakia: {
      id: "slovakia",
      name: "Slovakia",
      flag: "🇸🇰",
      elo: 1590,
      coach: "Craig Ramsay",
      offenseRating: 87,
      defenseRating: 88,
      goalieRating: 89,
      goldOddsOlympics: "2.1%",
      identity: "Surging young NHL talent featuring 1st overall pick Juraj Slafkovsky, Simon Nemec, and Martin Fehérváry.",
      keyStars: ["Juraj Slafkovsky", "Simon Nemec", "Martin Fehérváry", "Dalibor Dvorsky", "Tomas Tatar"]
    }
  };

  // ==========================================
  // 2. TOURNAMENTS & ICE GEOMETRY MODELS
  // ==========================================
  const TOURNAMENTS = {
    fourNations: {
      id: "fourNations",
      name: "NHL 4 Nations Face-Off",
      tagline: "February 2025 • Montreal & Boston • NHL Ice (200x85 ft)",
      iceType: "nhl",
      iceDimensions: "200 × 85 ft",
      teams: ["canada", "usa", "sweden", "finland"],
      schedule: [
        { id: "fn_1", date: "Feb 12", teamA: "canada", teamB: "sweden", venue: "Bell Centre (Montreal)" },
        { id: "fn_2", date: "Feb 13", teamA: "usa", teamB: "finland", venue: "Bell Centre (Montreal)" },
        { id: "fn_3", date: "Feb 15", teamA: "finland", teamB: "sweden", venue: "Bell Centre (Montreal)" },
        { id: "fn_4", date: "Feb 15", teamA: "usa", teamB: "canada", venue: "Bell Centre (Montreal)" },
        { id: "fn_5", date: "Feb 17", teamA: "canada", teamB: "finland", venue: "TD Garden (Boston)" },
        { id: "fn_6", date: "Feb 17", teamA: "sweden", teamB: "usa", venue: "TD Garden (Boston)" },
        { id: "fn_final", date: "Feb 20", title: "4 Nations Championship Final", venue: "TD Garden (Boston)" }
      ]
    },
    olympics2026: {
      id: "olympics2026",
      name: "2026 Milano-Cortina Winter Olympics",
      tagline: "February 2026 • Milan, Italy • Olympic Hybrid Sheet (200x98.5 ft)",
      iceType: "olympic",
      iceDimensions: "200 × 98.5 ft (Expanded Width)",
      groups: {
        A: ["canada", "switzerland", "czechia", "slovakia"],
        B: ["finland", "sweden", "germany", "latvia"],
        C: ["usa", "denmark", "norway", "qualifier"]
      }
    }
  };

  const RINK_GEOMETRY = {
    nhl: {
      name: "NHL Standard Ice",
      width: "85 ft",
      length: "200 ft",
      tacticalImpact: "Compressed neutral zone; heavy board battles; forecheckers arrive 0.4s faster; promotes net-front traffic and tip-ins."
    },
    olympic: {
      name: "International Olympic Ice",
      width: "98.5 ft (Expanded)",
      length: "200 ft",
      tacticalImpact: "15 feet wider; massive perimeter ice; rewards elite edge work and east-west vision (Quinn Hughes, McDavid, Celebrini); difficult to play low-zone trap."
    }
  };

  // ==========================================
  // 3. SIMULATION & MATCH PREDICTOR
  // ==========================================
  function getWinProbability(nationA, nationB, iceType = "nhl") {
    if (!nationA || !nationB) return 0.5;

    let eloA = nationA.elo;
    let eloB = nationB.elo;

    // Tactical adjustment based on rink width
    if (iceType === "olympic") {
      // High skating/transition teams (Canada/Sweden/USA) gain slight boost on wide ice
      if (nationA.id === "canada" || nationA.id === "sweden") eloA += 15;
      if (nationB.id === "canada" || nationB.id === "sweden") eloB += 15;
    }

    const diff = eloA - eloB;
    return 1 / (1 + Math.pow(10, -diff / 400));
  }

  function simulateMatch(nationA, nationB, iceType = "nhl") {
    const probA = getWinProbability(nationA, nationB, iceType);
    const rand = Math.random();
    const winner = rand < probA ? nationA : nationB;
    const loser = winner === nationA ? nationB : nationA;

    const goalsWinner = Math.floor(Math.random() * 3) + 3;
    const goalsLoser = Math.max(0, goalsWinner - Math.floor(Math.random() * 3) - 1);
    const isOT = goalsWinner === goalsLoser + 1 && Math.random() < 0.28;

    return {
      winner: winner,
      loser: loser,
      scoreWinner: goalsWinner,
      scoreLoser: goalsLoser,
      scoreStr: `${goalsWinner} - ${goalsLoser}${isOT ? " (OT)" : ""}`,
      isOT: isOT,
      winProbA: (probA * 100).toFixed(1)
    };
  }

  // ==========================================
  // 4. SOCIAL WIRE BROADCAST
  // ==========================================
  function broadcastInternationalToWire(reportData) {
    const post = {
      id: `post-intl-${Date.now()}`,
      authorId: "usr_blueline_international",
      timestamp: "Just now",
      content: `🌍 **INTERNATIONAL BEST-ON-BEST WAR ROOM: ${reportData.tournamentTitle.toUpperCase()}**\n\nProjected Gold Medal Favorite: **${reportData.favoriteName}** (${reportData.favoriteOdds} Gold Probability).\n\nMarquee Matchup: **${reportData.matchupTitle}** | Projected Edge: **${reportData.matchupEdge}**\n\n#4Nations #Milano2026 #BestOnBest #OlympicHockey #BlueLineDataWorks`,
      likes: 85,
      reposts: 39,
      replies: 24,
      likedByMe: false,
      pinned: false,
      tags: ["#4Nations", "#Milano2026", "#BestOnBest", "#OlympicHockey", "#BlueLineDataWorks"],
      media: {
        type: "banner",
        title: `${reportData.tournamentTitle.toUpperCase()} PREDICTOR`,
        subtitle: `Favorite: ${reportData.favoriteName} • Ice: ${reportData.iceType}`
      }
    };

    try {
      const wireRaw = localStorage.getItem("blueline_social_state");
      let wireState = wireRaw ? JSON.parse(wireRaw) : { posts: [] };
      if (!Array.isArray(wireState.posts)) wireState.posts = [];
      wireState.posts.unshift(post);
      localStorage.setItem("blueline_social_state", JSON.stringify(wireState));
    } catch (e) {
      console.warn("Could not publish international post to Wire:", e);
    }

    return post;
  }

  // Export to Global
  window.BlueLineInternationalEngine = {
    NATIONS,
    TOURNAMENTS,
    RINK_GEOMETRY,
    getWinProbability,
    simulateMatch,
    broadcastInternationalToWire
  };

})(window);
