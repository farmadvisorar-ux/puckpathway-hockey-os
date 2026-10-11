const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Read existing draft_simulator.js to preserve any specific logic
const currentContent = fs.readFileSync(path.join(ROOT, 'static', 'js', 'draft_simulator.js'), 'utf8');

console.log('Building Global Mock Draft Simulator 2.0 (64 Prospects, 2 Full NHL Draft Rounds)...');

// List of all 64 consensus prospects blending elite North American & European stars
const PROSPECTS_64 = [
  // --- ROUND 1 (Picks 1-32) ---
  {
    id: "prospect-1",
    rank: 1,
    name: "Macklin Celebrini",
    pos: "C",
    shoots: "L",
    height: "6'0\"",
    weight: 195,
    dob: "2006-06-13",
    team: "Boston University",
    league: "NCAA D1",
    feeder: "Chicago Steel (USHL) / Shattuck-St. Mary's",
    draftProjection: "Top 1 Consensus",
    trajectoryScore: 99.4,
    sqmRating: 98.9,
    corsiPct: 62.4,
    xGRate: 1.15,
    speedMph: 23.4,
    comp: "Jonathan Toews / Sidney Crosby",
    scoutingSummary: "Generational 200-foot center. Hobey Baker Award winner as a true freshman. Combines relentless forecheck, elite hockey IQ, dynamic rush pace, and pro release.",
    badges: ["Hobey Baker", "Tier 1 Franchise 1C", "World Juniors MVP"],
    contractStatus: "NCAA -> NHL ELC Signed"
  },
  {
    id: "prospect-2",
    rank: 2,
    name: "Artyom Levshunov",
    pos: "RD",
    shoots: "R",
    height: "6'2\"",
    weight: 210,
    dob: "2005-10-28",
    team: "Michigan State",
    league: "NCAA D1",
    feeder: "Green Bay Gamblers (USHL) / Belarus",
    draftProjection: "Top 3 Pick",
    trajectoryScore: 98.2,
    sqmRating: 97.5,
    corsiPct: 59.8,
    xGRate: 0.88,
    speedMph: 22.8,
    comp: "Alex Pietrangelo / John Carlson",
    scoutingSummary: "Rare right-shot two-way cornerstone defenseman. Dominated NCAA college hockey as an 18-year-old freshman. Exceptional mobility, gap control, and point presence.",
    badges: ["Big Ten Rookie of the Year", "Cornerstone RHD", "Elite Mobility"],
    contractStatus: "NCAA -> NHL ELC Signed"
  },
  {
    id: "prospect-3",
    rank: 3,
    name: "Ivan Demidov",
    pos: "RW",
    shoots: "L",
    height: "5'11\"",
    weight: 181,
    dob: "2005-12-10",
    team: "SKA Saint Petersburg",
    league: "KHL",
    feeder: "Vityaz Podolsk / SKA Jr. (MHL)",
    draftProjection: "Top 5 Pick",
    trajectoryScore: 97.9,
    sqmRating: 96.8,
    corsiPct: 65.1,
    xGRate: 1.28,
    speedMph: 22.9,
    comp: "Nikita Kucherov / Kirill Kaprizov",
    scoutingSummary: "Most electrifying offensive ceiling in the draft. World-class 1-on-1 puck skill, deception, delay game, and playmaking vision in tight ice.",
    badges: ["MHL Playoff MVP", "Elite Playmaker", "KHL Pro Regular"],
    contractStatus: "KHL Pro Contract (Through 2025)"
  },
  {
    id: "prospect-4",
    rank: 4,
    name: "Cayden Lindstrom",
    pos: "C",
    shoots: "L",
    height: "6'3\"",
    weight: 214,
    dob: "2006-02-03",
    team: "Medicine Hat Tigers",
    league: "WHL",
    feeder: "Delta Hockey Academy (CSSHL)",
    draftProjection: "Top 5 Pick",
    trajectoryScore: 96.8,
    sqmRating: 95.9,
    corsiPct: 58.6,
    xGRate: 1.05,
    speedMph: 23.1,
    comp: "Eric Lindros / Roope Hintz",
    scoutingSummary: "Prototypical modern power center. Explosive straight-line speed for a 6'3\" frame with punishing physical bite and heavy net-front scoring touch.",
    badges: ["Power Forward 1C", "Physical Monster", "CSSHL Alumni"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-5",
    rank: 5,
    name: "Zeev Buium",
    pos: "LD",
    shoots: "L",
    height: "6'0\"",
    weight: 185,
    dob: "2005-12-07",
    team: "Denver Pioneers",
    league: "NCAA D1",
    feeder: "USNTDP (USHL) / Shattuck-St. Mary's",
    draftProjection: "Top 8 Pick",
    trajectoryScore: 97.1,
    sqmRating: 97.0,
    corsiPct: 61.9,
    xGRate: 0.94,
    speedMph: 22.5,
    comp: "Quinn Hughes / Adam Fox",
    scoutingSummary: "NCAA National Champion as an 18-year-old. Point-per-game defenseman with poise, blue-line lateral deception, and surgical breakout transition passes.",
    badges: ["NCAA Champion", "WJC Gold Medalist", "Transition Wizard"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-6",
    rank: 6,
    name: "Zayne Parekh",
    pos: "RD",
    shoots: "R",
    height: "6'0\"",
    weight: 180,
    dob: "2006-02-15",
    team: "Saginaw Spirit",
    league: "OHL",
    feeder: "Markham Majors (GTHL)",
    draftProjection: "Top 10 Pick",
    trajectoryScore: 96.5,
    sqmRating: 95.7,
    corsiPct: 63.8,
    xGRate: 1.12,
    speedMph: 22.7,
    comp: "Erik Karlsson / Cale Makar Lite",
    scoutingSummary: "Scored 33 goals and 96 points as an OHL defenseman. Memorial Cup Champion with unprecedented offensive generation from the blue line.",
    badges: ["Memorial Cup Champ", "33-Goal Defenseman", "CHL Top D"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-7",
    rank: 7,
    name: "Sam Dickinson",
    pos: "LD",
    shoots: "L",
    height: "6'3\"",
    weight: 203,
    dob: "2006-06-07",
    team: "London Knights",
    league: "OHL",
    feeder: "Toronto Marlboros (GTHL)",
    draftProjection: "Top 10 Pick",
    trajectoryScore: 96.0,
    sqmRating: 95.8,
    corsiPct: 60.1,
    xGRate: 0.82,
    speedMph: 23.2,
    comp: "Alex Pietrangelo / Jay Bouwmeester",
    scoutingSummary: "Ideal modern workhorse defenseman. Played 30 minutes a night for the OHL Champion London Knights. Smooth stride, crushing reach, and poised exits.",
    badges: ["OHL Champion", "Workhorse Minutes", "Pro Frame LD"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-8",
    rank: 8,
    name: "Berkly Catton",
    pos: "C",
    shoots: "L",
    height: "5'11\"",
    weight: 175,
    dob: "2006-01-14",
    team: "Spokane Chiefs",
    league: "WHL",
    feeder: "Saskatoon Contacts (SMAAAHL)",
    draftProjection: "Top 10 Pick",
    trajectoryScore: 95.7,
    sqmRating: 95.0,
    corsiPct: 59.4,
    xGRate: 1.18,
    speedMph: 23.0,
    comp: "Brayden Point / Logan Stankoven",
    scoutingSummary: "Scored 54 goals and 116 points for Spokane. Unbelievable motor, puck theft ability, dynamic rush processing, and top-tier power play distribution.",
    badges: ["116-Point Scorer", "54-Goal Campaign", "Tenacious 200ft IQ"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-9",
    rank: 9,
    name: "Tij Iginla",
    pos: "LW/C",
    shoots: "L",
    height: "6'0\"",
    weight: 186,
    dob: "2006-08-01",
    team: "Kelowna Rockets",
    league: "WHL",
    feeder: "RINK Hockey Academy (CSSHL)",
    draftProjection: "Top 10 Pick",
    trajectoryScore: 95.4,
    sqmRating: 94.6,
    corsiPct: 57.9,
    xGRate: 1.10,
    speedMph: 22.8,
    comp: "Jarome Iginla / Matthew Tkachuk",
    scoutingSummary: "Son of Hall of Famer Jarome Iginla. Explosive release, high-end motor in dirty areas, and unmatched second-effort pursuit on loose pucks.",
    badges: ["47-Goal Scorer", "U18 Gold Medalist", "Bloodlines Phenom"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-10",
    rank: 10,
    name: "Konsta Helenius",
    pos: "C",
    shoots: "R",
    height: "5'11\"",
    weight: 180,
    dob: "2006-05-11",
    team: "Tappara",
    league: "Liiga",
    feeder: "Jukurit / Tappara Jr.",
    draftProjection: "Top 12 Pick",
    trajectoryScore: 95.8,
    sqmRating: 95.2,
    corsiPct: 58.2,
    xGRate: 0.95,
    speedMph: 22.6,
    comp: "Sebastian Aho / Mikael Granlund",
    scoutingSummary: "Pro-ready Finnish center who played top-six minutes in adult Liiga and Men's World Championship. Mature wall play, elite stick checks, and vision.",
    badges: ["Liiga Pro Star", "Men's Worlds Roster", "Two-Way 1C"],
    contractStatus: "Liiga Pro Contract / NHL Loan"
  },
  {
    id: "prospect-11",
    rank: 11,
    name: "Anton Silayev",
    pos: "LD",
    shoots: "L",
    height: "6'7\"",
    weight: 211,
    dob: "2006-04-11",
    team: "Torpedo Nizhny Novgorod",
    league: "KHL",
    feeder: "Chaika Nizhny Novgorod (MHL)",
    draftProjection: "Top 12 Pick",
    trajectoryScore: 96.5,
    sqmRating: 95.5,
    corsiPct: 55.4,
    xGRate: 0.65,
    speedMph: 22.7,
    comp: "Victor Hedman / Zdeno Chára",
    scoutingSummary: "Giant 6'7\" shutdown defenseman who skates like a player four inches shorter. Logged 63 games in the KHL as a 17-year-old under coach Igor Larionov.",
    badges: ["6'7\" Frame", "KHL Pro Minutes", "Chara-like Reach"],
    contractStatus: "KHL Pro Contract (Through 2026)"
  },
  {
    id: "prospect-12",
    rank: 12,
    name: "Carter Yakemchuk",
    pos: "RD",
    shoots: "R",
    height: "6'3\"",
    weight: 202,
    dob: "2005-09-29",
    team: "Calgary Hitmen",
    league: "WHL",
    feeder: "Calgary Flames U18 AAA",
    draftProjection: "Top 12 Pick",
    trajectoryScore: 94.7,
    sqmRating: 93.8,
    corsiPct: 58.0,
    xGRate: 1.02,
    speedMph: 22.4,
    comp: "Brent Burns / Evan Bouchard",
    scoutingSummary: "Explosive 30-goal draft-eligible defenseman. Heavy slapshot, dynamic toe-drags across the blue line, and mean physical presence along the boards.",
    badges: ["30-Goal Defenseman", "Big RHD Cannon", "Mean Streak"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-13",
    rank: 13,
    name: "Cole Eiserman",
    pos: "LW",
    shoots: "L",
    height: "6'0\"",
    weight: 197,
    dob: "2006-08-29",
    team: "USNTDP",
    league: "USHL",
    feeder: "Shattuck-St. Mary's / USNTDP",
    draftProjection: "Mid 1st Round",
    trajectoryScore: 94.5,
    sqmRating: 93.6,
    corsiPct: 62.1,
    xGRate: 1.34,
    speedMph: 22.6,
    comp: "Auston Matthews / Cole Caufield",
    scoutingSummary: "All-time goal-scoring king of the US National Team Development Program (127 goals, breaking Cole Caufield's record). Purest one-timer release in amateur hockey.",
    badges: ["USNTDP All-Time Goal Record", "Boston University Commit", "Lethal One-Timer"],
    contractStatus: "NCAA Committed (Boston Univ)"
  },
  {
    id: "prospect-14",
    rank: 14,
    name: "Michael Brandsegg-Nygård",
    pos: "RW",
    shoots: "R",
    height: "6'1\"",
    weight: 207,
    dob: "2005-10-05",
    team: "Skellefteå AIK",
    league: "SHL",
    feeder: "Mora IK / Vålerenga (Norway)",
    draftProjection: "Top 15 Pick",
    trajectoryScore: 94.6,
    sqmRating: 94.0,
    corsiPct: 57.8,
    xGRate: 0.98,
    speedMph: 22.9,
    comp: "Marian Hossa / Valeri Nichushkin",
    scoutingSummary: "Historic first Norwegian drafted in the 1st round. Heavy-bodied two-way power winger with a pro one-timer and dominant board-battle leverage.",
    badges: ["First-Ever Norwegian 1st Rd", "Heavy Pro Board Battle", "SHL Signed"],
    contractStatus: "SHL Active / Detroit ELC Signed"
  },
  {
    id: "prospect-15",
    rank: 15,
    name: "Beckett Sennecke",
    pos: "RW",
    shoots: "R",
    height: "6'2\"",
    weight: 182,
    dob: "2006-01-28",
    team: "Oshawa Generals",
    league: "OHL",
    feeder: "Toronto Marlboros (GTHL)",
    draftProjection: "Top 15 Pick",
    trajectoryScore: 94.0,
    sqmRating: 93.2,
    corsiPct: 59.2,
    xGRate: 1.08,
    speedMph: 22.8,
    comp: "Mikko Rantanen / Rick Nash",
    scoutingSummary: "Late-surging 6'2\" forward with slick puckhandling handles. Grew 5 inches over 2 seasons while maintaining small-player agility and playmaking vision.",
    badges: ["Playoff Breakout Star", "Late Growth Spurt", "OHL Finalist"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-16",
    rank: 16,
    name: "Trevor Connelly",
    pos: "LW",
    shoots: "L",
    height: "6'1\"",
    weight: 160,
    dob: "2006-02-28",
    team: "Tri-City Storm",
    league: "USHL",
    feeder: "Long Island Gulls AAA",
    draftProjection: "Mid 1st Round",
    trajectoryScore: 93.4,
    sqmRating: 92.8,
    corsiPct: 61.2,
    xGRate: 1.14,
    speedMph: 23.3,
    comp: "Mathew Barzal / Clayton Keller",
    scoutingSummary: "Electrifying transition skater with world-class edge work and lateral shiftiness. Racked up 78 points in 52 USHL games with high-pace rush creation.",
    badges: ["USHL First Team All-Star", "Providence Commit", "Transition Dynamo"],
    contractStatus: "NCAA Committed (Providence)"
  },
  {
    id: "prospect-17",
    rank: 17,
    name: "Terik Parascak",
    pos: "RW",
    shoots: "R",
    height: "6'0\"",
    weight: 179,
    dob: "2006-05-28",
    team: "Prince George Cougars",
    league: "WHL",
    feeder: "Edge School (CSSHL)",
    draftProjection: "Mid 1st Round",
    trajectoryScore: 92.3,
    sqmRating: 91.9,
    corsiPct: 58.9,
    xGRate: 1.05,
    speedMph: 22.0,
    comp: "Zach Hyman / Mark Stone",
    scoutingSummary: "Shocked the CHL by scoring 43 goals and 105 points as a rookie. Uncanny ability to read deflections, slip into dead zones, and score garbage goals.",
    badges: ["105-Point Rookie", "Net-Front Master", "High IQ Opportunist"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-18",
    rank: 18,
    name: "Liam Greentree",
    pos: "RW",
    shoots: "L",
    height: "6'2\"",
    weight: 215,
    dob: "2006-01-01",
    team: "Windsor Spitfires",
    league: "OHL",
    feeder: "Markham Majors (GTHL)",
    draftProjection: "Mid 1st Round",
    trajectoryScore: 92.0,
    sqmRating: 91.8,
    corsiPct: 55.7,
    xGRate: 1.02,
    speedMph: 21.8,
    comp: "Gabriel Landeskog / Corey Perry",
    scoutingSummary: "Captain of the Windsor Spitfires who carried the offense with 90 points. Bull on skates along the half-wall with delicate playmaking vision.",
    badges: ["OHL Captain", "Heavy Puck Mover", "Board Battle Beast"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-19",
    rank: 19,
    name: "Stian Solberg",
    pos: "LD",
    shoots: "L",
    height: "6'2\"",
    weight: 205,
    dob: "2005-12-29",
    team: "Färjestad BK",
    league: "SHL",
    feeder: "Vålerenga (Norway)",
    draftProjection: "Mid 1st Round",
    trajectoryScore: 91.7,
    sqmRating: 91.5,
    corsiPct: 54.8,
    xGRate: 0.72,
    speedMph: 22.7,
    comp: "Niklas Kronwall / Radko Gudas",
    scoutingSummary: "Breakout star of the Men's World Championship for Norway. Devastating open-ice body checker with quick recovery feet and crisp outlet passing.",
    badges: ["Men's Worlds Star", "Punishing Physicality", "SHL Signed"],
    contractStatus: "SHL Active / Anaheim ELC Signed"
  },
  {
    id: "prospect-20",
    rank: 20,
    name: "Charlie Elick",
    pos: "RD",
    shoots: "R",
    height: "6'3\"",
    weight: 202,
    dob: "2006-01-17",
    team: "Brandon Wheat Kings",
    league: "WHL",
    feeder: "Edge School (CSSHL)",
    draftProjection: "Mid-to-Late 1st",
    trajectoryScore: 91.4,
    sqmRating: 91.0,
    corsiPct: 53.6,
    xGRate: 0.58,
    speedMph: 23.3,
    comp: "Brandon Carlo / Brett Pesce",
    scoutingSummary: "One of the fastest straight-line skaters among draft-eligible defensemen. Physical shutdown anchor who pins rush attackers to the glass.",
    badges: ["Shutdown Anchor", "Elite Speed RHD", "U18 Gold"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-21",
    rank: 21,
    name: "Dean Letourneau",
    pos: "C",
    shoots: "R",
    height: "6'7\"",
    weight: 214,
    dob: "2006-02-21",
    team: "Boston College",
    league: "NCAA D1",
    feeder: "St. Andrew's College (CISAA)",
    draftProjection: "Late 1st Round",
    trajectoryScore: 91.0,
    sqmRating: 90.2,
    corsiPct: 60.5,
    xGRate: 1.18,
    speedMph: 22.4,
    comp: "Tage Thompson / Brian Boyle",
    scoutingSummary: "Towering 6'7\" center with legitimate soft hands and shooting range. Paced prep hockey with 127 points in 56 games before accelerating to Boston College.",
    badges: ["6'7\" Center", "Boston College", "Tage Thompson Mold"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-22",
    rank: 22,
    name: "Sacha Boisvert",
    pos: "C",
    shoots: "L",
    height: "6'2\"",
    weight: 183,
    dob: "2006-03-27",
    team: "North Dakota Fighting Hawks",
    league: "NCAA D1",
    feeder: "Muskegon Lumberjacks (USHL)",
    draftProjection: "Late 1st Round",
    trajectoryScore: 90.8,
    sqmRating: 90.5,
    corsiPct: 58.2,
    xGRate: 1.04,
    speedMph: 22.7,
    comp: "Brock Nelson / Ryan O'Reilly",
    scoutingSummary: "Two-way power center with a cannon release. Scored 36 goals in the USHL with aggressive net-front screening, faceoff proficiency, and grit.",
    badges: ["36 USHL Goals", "North Dakota Commit", "Heavy 200ft Center"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-23",
    rank: 23,
    name: "Michael Hage",
    pos: "C",
    shoots: "R",
    height: "6'1\"",
    weight: 190,
    dob: "2006-04-14",
    team: "Michigan Wolverines",
    league: "NCAA D1",
    feeder: "Chicago Steel (USHL) / Toronto Jr. Canadiens",
    draftProjection: "Late 1st Round",
    trajectoryScore: 90.6,
    sqmRating: 90.1,
    corsiPct: 59.8,
    xGRate: 1.11,
    speedMph: 23.0,
    comp: "Jack Hughes Lite / Dylan Larkin",
    scoutingSummary: "Tremendous skater with sudden east-west cuts and playmaking dexterity. Posted 75 points in 54 games for Chicago Steel to earn USHL First Team honors.",
    badges: ["USHL Scoring Star", "Michigan Commit", "Dynamic Edge Work"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-24",
    rank: 24,
    name: "Cole Beaudoin",
    pos: "C",
    shoots: "L",
    height: "6'2\"",
    weight: 210,
    dob: "2006-04-24",
    team: "Barrie Colts",
    league: "OHL",
    feeder: "Nepean Raiders (HEO)",
    draftProjection: "Late 1st Round",
    trajectoryScore: 90.2,
    sqmRating: 89.9,
    corsiPct: 56.4,
    xGRate: 0.86,
    speedMph: 22.1,
    comp: "Boone Jenner / Anthony Cirelli",
    scoutingSummary: "The quintessential checking-line nightmare. Gold medalist at U18 Worlds who wins every defensive-zone draw and pulverizes defensemen on the forecheck.",
    badges: ["U18 Gold Medalist", "Checking Center Elite", "Fitness Test King"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-25",
    rank: 25,
    name: "Emil Hemming",
    pos: "RW",
    shoots: "R",
    height: "6'1\"",
    weight: 205,
    dob: "2006-06-27",
    team: "TPS Turku",
    league: "Liiga",
    feeder: "Kiekko-Espoo / TPS Jr.",
    draftProjection: "Late 1st Round",
    trajectoryScore: 93.1,
    sqmRating: 92.5,
    corsiPct: 54.1,
    xGRate: 0.92,
    speedMph: 22.8,
    comp: "Mikko Rantanen Lite / Patrik Laine",
    scoutingSummary: "Prototypical European power sniper. Scored 11 goals in the adult Liiga as a 17-year-old with a terrifying one-timer from the left faceoff dot.",
    badges: ["Liiga Regular", "Elite One-Timer", "Dallas Draft Pick"],
    contractStatus: "Liiga Pro / Dallas ELC Signed"
  },
  {
    id: "prospect-26",
    rank: 26,
    name: "EJ Emery",
    pos: "RD",
    shoots: "R",
    height: "6'3\"",
    weight: 185,
    dob: "2006-03-30",
    team: "North Dakota Fighting Hawks",
    league: "NCAA D1",
    feeder: "USNTDP (USHL) / Compton, CA",
    draftProjection: "Late 1st Round",
    trajectoryScore: 89.8,
    sqmRating: 89.5,
    corsiPct: 58.7,
    xGRate: 0.44,
    speedMph: 23.5,
    comp: "K'Andre Miller / Jaccob Slavin",
    scoutingSummary: "Freakish athlete who shattered combine records in standing long jump (123\") and agility. Pure shutdown right-shot defenseman who eliminates transition rushes.",
    badges: ["Combine King", "North Dakota Commit", "Lockdown RHD"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-27",
    rank: 27,
    name: "Marek Vanacker",
    pos: "LW",
    shoots: "L",
    height: "6'0\"",
    weight: 178,
    dob: "2006-04-12",
    team: "Brantford Bulldogs",
    league: "OHL",
    feeder: "Hamilton Jr. Bulldogs",
    draftProjection: "Late 1st Round",
    trajectoryScore: 89.5,
    sqmRating: 89.0,
    corsiPct: 57.2,
    xGRate: 1.05,
    speedMph: 22.6,
    comp: "Zach Parise / Chris Kunitz",
    scoutingSummary: "Scored 36 goals while playing through a torn labrum for most of the season. High-motor winger with slick hand-eye coordination around the crease.",
    badges: ["36-Goal Campaign", "Warrior Mentality", "Net-Front Touch"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-28",
    rank: 28,
    name: "Matvei Gridin",
    pos: "RW",
    shoots: "L",
    height: "6'1\"",
    weight: 189,
    dob: "2006-03-01",
    team: "Muskegon Lumberjacks",
    league: "USHL",
    feeder: "Spartak St. Petersburg / USHL",
    draftProjection: "Late 1st Round",
    trajectoryScore: 89.2,
    sqmRating: 88.8,
    corsiPct: 60.0,
    xGRate: 1.15,
    speedMph: 22.3,
    comp: "Nikita Kucherov / Pavel Buchnevich",
    scoutingSummary: "USHL leading scorer with 83 points in 60 games. Deceptive playmaking tempo, delayed release, and cross-ice passing vision on the man-advantage.",
    badges: ["USHL Scoring Champion", "Michigan Commit", "Calgary 1st Rd Pick"],
    contractStatus: "NCAA / Calgary ELC Signed"
  },
  {
    id: "prospect-29",
    rank: 29,
    name: "Tanner Howe",
    pos: "LW/C",
    shoots: "L",
    height: "5'10\"",
    weight: 184,
    dob: "2005-11-28",
    team: "Regina Pats",
    league: "WHL",
    feeder: "Prince Albert Mintos (SMAAAHL)",
    draftProjection: "Late 1st Round",
    trajectoryScore: 88.8,
    sqmRating: 88.4,
    corsiPct: 54.9,
    xGRate: 0.95,
    speedMph: 22.4,
    comp: "Brad Marchand / Brendan Gallagher",
    scoutingSummary: "Regina Pats captain who played alongside Connor Bedard. Fearless pest with an abrasive physical game, relentless motor, and quick snapshot.",
    badges: ["WHL Captain", "Agitator Deluxe", "High Compete Level"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-30",
    rank: 30,
    name: "Leo Sahlin Wallenius",
    pos: "LD",
    shoots: "L",
    height: "6'0\"",
    weight: 180,
    dob: "2006-04-10",
    team: "Växjö Lakers",
    league: "SHL",
    feeder: "Växjö Lakers Jr.",
    draftProjection: "Late 1st / Early 2nd",
    trajectoryScore: 89.5,
    sqmRating: 89.2,
    corsiPct: 59.1,
    xGRate: 0.82,
    speedMph: 23.1,
    comp: "Mattias Ekholm / Rasmus Sandin",
    scoutingSummary: "Silky-smooth Swedish puck-moving defenseman. Elite four-way mobility, effortless neutral-zone escapes, and pinpoint saucer passes on the breakout.",
    badges: ["Swedish J20 Best Defenseman", "Fluid Skater", "San Jose 2nd Rd"],
    contractStatus: "SHL Active / San Jose Signed"
  },
  {
    id: "prospect-31",
    rank: 31,
    name: "John Mustard",
    pos: "C/LW",
    shoots: "L",
    height: "6'0\"",
    weight: 185,
    dob: "2006-08-16",
    team: "Providence College",
    league: "NCAA D1",
    feeder: "Waterloo Black Hawks (USHL) / North Jersey Avalanche",
    draftProjection: "Late 1st / Early 2nd",
    trajectoryScore: 88.0,
    sqmRating: 87.8,
    corsiPct: 57.0,
    xGRate: 0.94,
    speedMph: 23.6,
    comp: "Andreas Athanasiou / Kasperi Kapanen",
    scoutingSummary: "USHL Rookie of the Year. Blazing top-end skating speed (23.6 MPH) that forces defensemen to retreat flat-footed. Lethal snapshot in transition.",
    badges: ["USHL Rookie of Year", "Providence Commit", "Fastest Skater"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-32",
    rank: 32,
    name: "Carter George",
    pos: "G",
    shoots: "L",
    height: "6'1\"",
    weight: 194,
    dob: "2006-05-20",
    team: "Owen Sound Attack",
    league: "OHL",
    feeder: "Thunder Bay Kings AAA",
    draftProjection: "Top Goalie in Draft",
    trajectoryScore: 88.5,
    sqmRating: 89.0,
    corsiPct: 58.0,
    xGRate: 0.50,
    speedMph: 19.5,
    comp: "Juuse Saros / Jonathan Quick",
    scoutingSummary: "Consensus #1 ranked goaltender in the draft class. Won Best Goaltender at U18 Worlds. Unshakeable mental composure, razor-sharp tracking, and puck handling.",
    badges: ["Top Ranked Goalie", "U18 Worlds Best Goalie", "Composed Puck Stopper"],
    contractStatus: "Major Junior (CHL)"
  },

  // --- ROUND 2 (Picks 33-64) ---
  {
    id: "prospect-33",
    rank: 33,
    name: "Axel Sandin Pellikka",
    pos: "RD",
    shoots: "R",
    height: "5'11\"",
    weight: 181,
    dob: "2005-03-01",
    team: "Skellefteå AIK",
    league: "SHL",
    feeder: "Skellefteå AIK Jr.",
    draftProjection: "Early 2nd Round Value",
    trajectoryScore: 94.2,
    sqmRating: 94.5,
    corsiPct: 62.4,
    xGRate: 0.96,
    speedMph: 22.9,
    comp: "Erik Karlsson / Quinn Hughes Lite",
    scoutingSummary: "Salming Trophy winner as the best Swedish-born defenseman in the SHL. Dynamic power-play quarterback with deceptive hip feints and blue-line agility.",
    badges: ["Salming Trophy Winner", "World Juniors Best Defenseman", "SHL Champion"],
    contractStatus: "SHL Active / Detroit ELC Signed"
  },
  {
    id: "prospect-34",
    rank: 34,
    name: "Leon Muggli",
    pos: "LD",
    shoots: "L",
    height: "6'0\"",
    weight: 176,
    dob: "2006-07-09",
    team: "EV Zug",
    league: "National League",
    feeder: "EVZ Academy (Switzerland)",
    draftProjection: "Early 2nd Round",
    trajectoryScore: 90.8,
    sqmRating: 90.4,
    corsiPct: 56.5,
    xGRate: 0.74,
    speedMph: 22.8,
    comp: "Roman Josi Lite / Jonas Siegenthaler",
    scoutingSummary: "Record-setting Swiss teenager who scored 12 points in the adult National League (NL) as a 17-year-old. Exceptional gap control and mature transition passes.",
    badges: ["Swiss NL Record Holder", "Washington 2nd Rd Pick", "Poised 2-Way LD"],
    contractStatus: "National League Active / Washington Signed"
  },
  {
    id: "prospect-35",
    rank: 35,
    name: "Adam Jiříček",
    pos: "RD",
    shoots: "R",
    height: "6'2\"",
    weight: 182,
    dob: "2006-06-28",
    team: "HC Škoda Plzeň",
    league: "Tipsport Extraliga",
    feeder: "HC Plzeň Jr. (Czechia)",
    draftProjection: "Early 2nd Round",
    trajectoryScore: 90.4,
    sqmRating: 89.9,
    corsiPct: 55.0,
    xGRate: 0.68,
    speedMph: 22.6,
    comp: "David Jiříček / Radko Gudas",
    scoutingSummary: "Top Czech right-shot defenseman. Punishing physicality, active defensive stick, and high-level poise against adult professionals in Tipsport Extraliga.",
    badges: ["Extraliga Pro Regular", "St. Louis 1st Rd Pick", "High-End RHD Gap"],
    contractStatus: "Czech Pro / St. Louis ELC Signed"
  },
  {
    id: "prospect-36",
    rank: 36,
    name: "Aron Kiviharju",
    pos: "LD",
    shoots: "L",
    height: "5'10\"",
    weight: 172,
    dob: "2006-01-25",
    team: "HIFK",
    league: "Liiga",
    feeder: "TPS Turku / HIFK",
    draftProjection: "Early 2nd Round",
    trajectoryScore: 91.5,
    sqmRating: 92.0,
    corsiPct: 61.2,
    xGRate: 0.88,
    speedMph: 22.1,
    comp: "Kimmo Timonen / Torey Krug",
    scoutingSummary: "Prodigious hockey sense and breakout vision. Quarterbacks power plays with pinpoint cross-seam execution and deceptive blue-line walks.",
    badges: ["Elite Hockey IQ", "Minnesota Wild Pick", "U18 Captain"],
    contractStatus: "Liiga Pro Contract"
  },
  {
    id: "prospect-37",
    rank: 37,
    name: "Lucas Pettersson",
    pos: "C",
    shoots: "L",
    height: "5'11\"",
    weight: 174,
    dob: "2006-04-17",
    team: "MoDo Hockey",
    league: "SHL",
    feeder: "MoDo Hockey Jr.",
    draftProjection: "Early 2nd Round",
    trajectoryScore: 89.9,
    sqmRating: 89.5,
    corsiPct: 58.6,
    xGRate: 0.92,
    speedMph: 23.2,
    comp: "Mika Zibanejad / William Karlsson",
    scoutingSummary: "Speedy Swedish 200-foot center with elite acceleration. Led Sweden's U18 team in scoring with relentless pressure on opposing breakout defensemen.",
    badges: ["Anaheim 2nd Rd Pick", "Explosive Acceleration", "U18 Bronze Star"],
    contractStatus: "SHL Pro Contract"
  },
  {
    id: "prospect-38",
    rank: 38,
    name: "Tomáš Galvas",
    pos: "LD",
    shoots: "L",
    height: "5'10\"",
    weight: 154,
    dob: "2006-02-11",
    team: "Bílí Tygři Liberec",
    league: "Tipsport Extraliga",
    feeder: "HC Olomouc (Czechia)",
    draftProjection: "Early 2nd Round",
    trajectoryScore: 88.8,
    sqmRating: 88.5,
    corsiPct: 59.4,
    xGRate: 0.76,
    speedMph: 22.9,
    comp: "Filip Hronek / Samuel Girard",
    scoutingSummary: "Hyper-agile Czech defenseman who played top-four minutes in Tipsport Extraliga at 17. Uncanny lateral mobility and tape-to-tape transition delivery.",
    badges: ["World Juniors Silver", "Extraliga Regular", "Elite Edge Work"],
    contractStatus: "Czech Pro Active"
  },
  {
    id: "prospect-39",
    rank: 39,
    name: "Veeti Väisänen",
    pos: "LD",
    shoots: "L",
    height: "6'0\"",
    weight: 176,
    dob: "2006-02-15",
    team: "KooKoo",
    league: "Liiga",
    feeder: "KooKoo Jr. (Finland)",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 88.4,
    sqmRating: 88.1,
    corsiPct: 56.2,
    xGRate: 0.62,
    speedMph: 22.7,
    comp: "Esa Lindell / Jani Hakanpää",
    scoutingSummary: "Dependable Finnish two-way defenseman who logged 50 games in adult Liiga. Exceptional stick positioning, shot blocking, and box-out strength.",
    badges: ["Utah 3rd Rd Pick", "50 Liiga Games", "Shutdown Reliability"],
    contractStatus: "Liiga Pro Contract"
  },
  {
    id: "prospect-40",
    rank: 40,
    name: "Dominik Badinka",
    pos: "RD",
    shoots: "R",
    height: "6'3\"",
    weight: 185,
    dob: "2005-11-27",
    team: "Malmö Redhawks",
    league: "SHL",
    feeder: "Jokerit (Mestis) / Czechia",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 89.1,
    sqmRating: 88.7,
    corsiPct: 54.8,
    xGRate: 0.58,
    speedMph: 22.6,
    comp: "Erik Černák / Connor Murphy",
    scoutingSummary: "Towering 6'3\" Czech right-shot defenseman who solidified a regular top-six role in Sweden's SHL. Calm puck mover with physical containment along the boards.",
    badges: ["Carolina 2nd Rd Pick", "SHL Top Rookie D", "6'3\" Frame"],
    contractStatus: "SHL Active / Carolina Signed"
  },
  {
    id: "prospect-41",
    rank: 41,
    name: "Julius Miettinen",
    pos: "C",
    shoots: "L",
    height: "6'3\"",
    weight: 205,
    dob: "2006-01-20",
    team: "Everett Silvertips",
    league: "WHL",
    feeder: "HIFK Jr. (Finland)",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 88.6,
    sqmRating: 88.2,
    corsiPct: 57.3,
    xGRate: 0.95,
    speedMph: 22.3,
    comp: "Joel Eriksson Ek / Mikko Koivu",
    scoutingSummary: "Big Finnish center who transitioned seamlessly to North America, scoring 31 goals and 67 points for Everett. Dominant net-front screen and faceoff ace.",
    badges: ["Seattle 2nd Rd Pick", "31 WHL Goals", "Heavy 200ft Center"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-42",
    rank: 42,
    name: "Kamil Bednarik",
    pos: "C",
    shoots: "L",
    height: "6'0\"",
    weight: 185,
    dob: "2006-05-26",
    team: "Boston University",
    league: "NCAA D1",
    feeder: "USNTDP (USHL) / New Jersey Rockets",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 88.2,
    sqmRating: 88.0,
    corsiPct: 58.4,
    xGRate: 0.89,
    speedMph: 22.7,
    comp: "Vincent Trocheck / Phillip Danault",
    scoutingSummary: "High-compete center with relentless motor. Anchored the checking unit for the USNTDP while posting 65 points in 61 games. Committed to Boston University.",
    badges: ["NY Islanders 2nd Rd Pick", "USNTDP Anchor", "Boston Univ Commit"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-43",
    rank: 43,
    name: "Jesse Pulkkinen",
    pos: "LD",
    shoots: "L",
    height: "6'6\"",
    weight: 216,
    dob: "2004-12-27",
    team: "JYP Jyväskylä",
    league: "Liiga",
    feeder: "JYP Jr. (Finland)",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 88.9,
    sqmRating: 88.5,
    corsiPct: 56.0,
    xGRate: 0.68,
    speedMph: 22.4,
    comp: "Tyler Myers / Colton Parayko",
    scoutingSummary: "Massive 6'6\" Finnish rearguard who exploded onto the scene at the World Juniors. High skill level for his size, bold puck carries, and crushing hits.",
    badges: ["NY Islanders 2nd Rd Pick", "6'6\" Frame", "WJC All-Star"],
    contractStatus: "Liiga Pro Active / NY Islanders ELC"
  },
  {
    id: "prospect-44",
    rank: 44,
    name: "Linus Eriksson",
    pos: "C",
    shoots: "L",
    height: "6'0\"",
    weight: 185,
    dob: "2006-03-23",
    team: "Djurgårdens IF",
    league: "HockeyAllsvenskan",
    feeder: "Djurgårdens IF Jr.",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 88.5,
    sqmRating: 88.1,
    corsiPct: 55.6,
    xGRate: 0.84,
    speedMph: 22.8,
    comp: "Alexander Steen / Calle Järnkrok",
    scoutingSummary: "Captain of Sweden's U18 team. Stepped into adult HockeyAllsvenskan playoff games for Djurgården with exceptional poise, faceoff wins, and penalty killing.",
    badges: ["Florida 2nd Rd Pick", "Sweden U18 Captain", "Pro Playoff Regular"],
    contractStatus: "HockeyAllsvenskan Pro Contract"
  },
  {
    id: "prospect-45",
    rank: 45,
    name: "Maxim Štrbák",
    pos: "RD",
    shoots: "R",
    height: "6'2\"",
    weight: 205,
    dob: "2005-04-13",
    team: "Michigan Wolverines",
    league: "NCAA D1",
    feeder: "Sioux Falls Stampede (USHL) / Slovakia",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 87.5,
    sqmRating: 87.2,
    corsiPct: 57.1,
    xGRate: 0.52,
    speedMph: 22.5,
    comp: "Erik Černák / Martin Fehérváry",
    scoutingSummary: "Physical Slovak right-shot defenseman who solidified Michigan's top four as a freshman. Exceptional box-out strength and heavy stick checks in low ice.",
    badges: ["Buffalo 2nd Rd Pick", "NCAA Frozen Four", "Slovak National Team"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-46",
    rank: 46,
    name: "Alex Čiernik",
    pos: "RW",
    shoots: "L",
    height: "5'10\"",
    weight: 179,
    dob: "2004-10-08",
    team: "Nybro Vikings IF",
    league: "HockeyAllsvenskan",
    feeder: "Södertälje SK / Slovakia",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 87.9,
    sqmRating: 87.4,
    corsiPct: 58.2,
    xGRate: 0.91,
    speedMph: 23.4,
    comp: "Tomáš Tatar / Mats Zuccarello",
    scoutingSummary: "Electric speedster who dazzles with fast-twitch edge work and shiftiness in transition. Point-per-game producer at the World Juniors for Slovakia.",
    badges: ["Philadelphia Pick", "World Juniors Standout", "Breakout Speed"],
    contractStatus: "HockeyAllsvenskan Active"
  },
  {
    id: "prospect-47",
    rank: 47,
    name: "Luka Radivojevič",
    pos: "RD",
    shoots: "R",
    height: "5'10\"",
    weight: 165,
    dob: "2007-01-03",
    team: "HK Dukla Trenčín",
    league: "Tipos Extraliga",
    feeder: "Örebro HK Jr. / Slovakia",
    draftProjection: "2025 Top Prospect",
    trajectoryScore: 87.2,
    sqmRating: 87.0,
    corsiPct: 59.0,
    xGRate: 0.78,
    speedMph: 23.0,
    comp: "Šimon Nemec Lite / Sami Vatanen",
    scoutingSummary: "Elite offensive instincts from the blue line. Youngest player at the World Juniors who demonstrated effortless escape moves under heavy forechecks.",
    badges: ["World Juniors Phenom", "2025 Draft Standout", "Dynamic Edge Work"],
    contractStatus: "Tipos Extraliga Active"
  },
  {
    id: "prospect-48",
    rank: 48,
    name: "Teddy Stiga",
    pos: "LW",
    shoots: "L",
    height: "5'10\"",
    weight: 178,
    dob: "2006-04-05",
    team: "Boston College",
    league: "NCAA D1",
    feeder: "USNTDP (USHL) / Sudbury, MA",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 88.0,
    sqmRating: 87.6,
    corsiPct: 59.8,
    xGRate: 1.05,
    speedMph: 22.8,
    comp: "Conor Garland / Zach Hyman",
    scoutingSummary: "Tenacious motor who emerged as one of the USNTDP's most versatile forwards with 79 points in 61 games. Relentless dog on the bone on the forecheck.",
    badges: ["Nashville 2nd Rd Pick", "Boston College Commit", "Relentless Motor"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-49",
    rank: 49,
    name: "Will Skahan",
    pos: "LD",
    shoots: "L",
    height: "6'5\"",
    weight: 216,
    dob: "2006-05-14",
    team: "Boston College",
    league: "NCAA D1",
    feeder: "USNTDP (USHL) / St. Thomas Academy",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 87.8,
    sqmRating: 87.3,
    corsiPct: 54.9,
    xGRate: 0.42,
    speedMph: 22.7,
    comp: "Braydon Coburn / Jamie Oleksiak",
    scoutingSummary: "Intimidating 6'5\" physical force on the blue line. Erases attacking wingers into the glass with punishing body checks and clearing strength.",
    badges: ["Utah 2nd Rd Pick", "6'5\" Lockdown D", "Boston College Commit"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-50",
    rank: 50,
    name: "Harrison Brunicke",
    pos: "RD",
    shoots: "R",
    height: "6'3\"",
    weight: 196,
    dob: "2006-05-08",
    team: "Kamloops Blazers",
    league: "WHL",
    feeder: "Calgary Royals AAA",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 87.6,
    sqmRating: 87.2,
    corsiPct: 55.4,
    xGRate: 0.58,
    speedMph: 22.9,
    comp: "Justin Schultz / Travis Sanheim",
    scoutingSummary: "Born in South Africa, Brunicke possesses an intriguing combination of size (6'3\"), right-shot handedness, and smooth four-way skating mobility.",
    badges: ["Pittsburgh 2nd Rd Pick", "Fluid 6'3\" RHD", "U18 Gold Medalist"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-51",
    rank: 51,
    name: "Tanner Henricks",
    pos: "LD",
    shoots: "L",
    height: "6'4\"",
    weight: 205,
    dob: "2006-09-28",
    team: "Lincoln Stars",
    league: "USHL",
    feeder: "Anaheim Jr. Ducks / St. Cloud State commit",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 87.0,
    sqmRating: 86.8,
    corsiPct: 56.0,
    xGRate: 0.48,
    speedMph: 22.5,
    comp: "Carson Soucy / Jake Muzzin",
    scoutingSummary: "Towering 6'4\" defenseman with heavy reach and calm defensive-zone habits. Effective stick checker who limits high-danger passes to the slot.",
    badges: ["St. Cloud State Commit", "6'4\" USHL Anchor", "Heavy Gap Control"],
    contractStatus: "USHL / NCAA Committed"
  },
  {
    id: "prospect-52",
    rank: 52,
    name: "Colin Ralph",
    pos: "LD",
    shoots: "L",
    height: "6'5\"",
    weight: 227,
    dob: "2005-10-04",
    team: "St. Cloud State Huskies",
    league: "NCAA D1",
    feeder: "Shattuck-St. Mary's / Kirkwood, MO",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 87.4,
    sqmRating: 87.0,
    corsiPct: 57.5,
    xGRate: 0.62,
    speedMph: 22.3,
    comp: "Mattias Samuelsson / Joel Edmundson",
    scoutingSummary: "Massive 6'5\" 227-lb presence who captained Shattuck-St. Mary's. Strong first pass, elite crease clearing, and exceptional shot blocking.",
    badges: ["St. Louis 2nd Rd Pick", "Shattuck-St. Mary's Captain", "6'5\" Frame"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-53",
    rank: 53,
    name: "Christian Humphreys",
    pos: "C",
    shoots: "R",
    height: "5'11\"",
    weight: 170,
    dob: "2006-02-04",
    team: "Michigan Wolverines",
    league: "NCAA D1",
    feeder: "USNTDP (USHL) / Pittsburgh Penguins Elite",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 87.1,
    sqmRating: 86.9,
    corsiPct: 58.0,
    xGRate: 0.88,
    speedMph: 22.7,
    comp: "Mikael Backlund / Nick Schmaltz",
    scoutingSummary: "Creative playmaker with delicate touch passes through layers of defense. Posted 58 points in 52 games for the USNTDP with pro-grade hockey sense.",
    badges: ["Colorado 3rd Rd Pick", "Michigan Commit", "Visionary Playmaker"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-54",
    rank: 54,
    name: "Brodie Ziemer",
    pos: "RW",
    shoots: "R",
    height: "5'11\"",
    weight: 192,
    dob: "2006-02-22",
    team: "Minnesota Gophers",
    league: "NCAA D1",
    feeder: "USNTDP (USHL) / Shattuck-St. Mary's",
    draftProjection: "Mid 2nd Round",
    trajectoryScore: 86.9,
    sqmRating: 86.6,
    corsiPct: 57.8,
    xGRate: 0.90,
    speedMph: 22.5,
    comp: "Ryan Callahan / Blake Coleman",
    scoutingSummary: "Captain of the USNTDP. Ultimate glue guy with relentless work ethic, net-front tips, and shutdown defensive assignments against top opponents.",
    badges: ["Buffalo 3rd Rd Pick", "USNTDP Captain", "Minnesota Gopher Commit"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-55",
    rank: 55,
    name: "Kasper Pikkarainen",
    pos: "RW",
    shoots: "R",
    height: "6'3\"",
    weight: 198,
    dob: "2006-08-07",
    team: "TPS Turku",
    league: "Liiga",
    feeder: "TPS Jr. (Finland)",
    draftProjection: "Late 2nd Round",
    trajectoryScore: 86.7,
    sqmRating: 86.4,
    corsiPct: 55.2,
    xGRate: 0.78,
    speedMph: 22.4,
    comp: "Jesse Puljujärvi / Joel Armia",
    scoutingSummary: "Son of former NHLer Ilkka Pikkarainen. Big-bodied Finnish winger with hard-hitting board presence, heavy wrist shot, and puck protection skills.",
    badges: ["New Jersey 3rd Rd Pick", "6'3\" Power Wing", "TPS Turku Regular"],
    contractStatus: "Liiga Pro Contract"
  },
  {
    id: "prospect-56",
    rank: 56,
    name: "Ondrej Kos",
    pos: "LW",
    shoots: "L",
    height: "6'2\"",
    weight: 172,
    dob: "2006-03-07",
    team: "Ilves",
    league: "Liiga",
    feeder: "HC Kometa Brno (Czechia)",
    draftProjection: "Late 2nd Round",
    trajectoryScore: 86.8,
    sqmRating: 86.5,
    corsiPct: 56.4,
    xGRate: 0.82,
    speedMph: 22.9,
    comp: "Ondřej Palát / Martin Nečas Lite",
    scoutingSummary: "Speedy Czech forward who moved to Finland to play for Ilves. Electric rush attacker with fast acceleration and crisp playmaking instincts.",
    badges: ["St. Louis 3rd Rd Pick", "Ilves Pro Debut", "Dynamic Rush Pace"],
    contractStatus: "Liiga Pro Contract"
  },
  {
    id: "prospect-57",
    rank: 57,
    name: "Valentin Grossetete",
    pos: "C",
    shoots: "L",
    height: "5'11\"",
    weight: 174,
    dob: "2005-04-18",
    team: "Dragons de Rouen",
    league: "Ligue Magnus",
    feeder: "Rouen Jr. (France)",
    draftProjection: "Late 2nd Round",
    trajectoryScore: 86.8,
    sqmRating: 86.3,
    corsiPct: 57.0,
    xGRate: 0.85,
    speedMph: 23.0,
    comp: "Pierre-Édouard Bellemare / Antoine Roussel",
    scoutingSummary: "Captain of France's World Junior team. Quick-skating two-way pivot who helped Rouen capture the Ligue Magnus Championship as an 18-year-old.",
    badges: ["Ligue Magnus Champion", "France WJC Captain", "High Motor Pivot"],
    contractStatus: "Ligue Magnus Pro Active"
  },
  {
    id: "prospect-58",
    rank: 58,
    name: "Oscar Fisker Mølgaard",
    pos: "C",
    shoots: "L",
    height: "6'0\"",
    weight: 176,
    dob: "2005-02-18",
    team: "HV71",
    league: "SHL",
    feeder: "Frederikshavn (Denmark)",
    draftProjection: "Late 2nd Round",
    trajectoryScore: 86.5,
    sqmRating: 86.2,
    corsiPct: 56.2,
    xGRate: 0.72,
    speedMph: 22.6,
    comp: "Frans Nielsen / Lars Eller",
    scoutingSummary: "Elite Danish two-way center who logged 50 SHL games for HV71. Exceptional situational awareness, defensive-zone positioning, and faceoff reliability.",
    badges: ["Seattle 2nd Rd Pick", "50 SHL Games", "Danish National Team"],
    contractStatus: "SHL Pro Active / Seattle ELC"
  },
  {
    id: "prospect-59",
    rank: 59,
    name: "Mathias From",
    pos: "RW",
    shoots: "R",
    height: "6'2\"",
    weight: 194,
    dob: "1997-12-16",
    team: "Herning Blue Fox",
    league: "Metal Ligaen",
    feeder: "Rögle BK / Chicago draft",
    draftProjection: "Euro Free Agent / Round 2",
    trajectoryScore: 86.2,
    sqmRating: 86.0,
    corsiPct: 58.5,
    xGRate: 1.10,
    speedMph: 23.1,
    comp: "Nikolaj Ehlers Lite",
    scoutingSummary: "Danish league MVP and top goalscorer with Herning Blue Fox. Blistering straight-line speed, quick release, and proven scoring pedigree in Europe.",
    badges: ["Metal Ligaen MVP", "Scoring Champion", "Former Chicago Draft"],
    contractStatus: "Metal Ligaen Pro Active"
  },
  {
    id: "prospect-60",
    rank: 60,
    name: "Krystian Dziubiński",
    pos: "C",
    shoots: "L",
    height: "6'1\"",
    weight: 194,
    dob: "1988-06-12",
    team: "Re-Plast Unia Oświęcim",
    league: "TAURON Hokej Liga",
    feeder: "Podhale Nowy Targ (Poland)",
    draftProjection: "Euro Veteran Leader",
    trajectoryScore: 85.9,
    sqmRating: 85.7,
    corsiPct: 56.8,
    xGRate: 0.92,
    speedMph: 21.9,
    comp: "David Backes / Mariusz Czerkawski",
    scoutingSummary: "Legendary captain of Poland's national team who led them back to the IIHF World Championship Top Division. Relentless net-front screen and warrior leader.",
    badges: ["Poland Captain", "Top Division Star", "Polish Champion"],
    contractStatus: "TAURON Hokej Liga Pro"
  },
  {
    id: "prospect-61",
    rank: 61,
    name: "Eskild Bakke Olsen",
    pos: "C",
    shoots: "L",
    height: "6'1\"",
    weight: 185,
    dob: "2002-03-19",
    team: "Storhamar Hockey",
    league: "EliteHockey Ligaen",
    feeder: "Storhamar Jr. (Norway)",
    draftProjection: "Euro Breakout Star",
    trajectoryScore: 85.6,
    sqmRating: 85.4,
    corsiPct: 57.4,
    xGRate: 0.96,
    speedMph: 22.5,
    comp: "Mats Zuccarello Lite / Patrick Thoresen",
    scoutingSummary: "Breakout Norwegian center who led Storhamar to the EliteHockey championship and debuted at the World Championships. Slick vision and playmaker patience.",
    badges: ["Norway Playoff MVP", "National Team Debut", "EliteHockey Champ"],
    contractStatus: "EliteHockey Ligaen Pro"
  },
  {
    id: "prospect-62",
    rank: 62,
    name: "Ryder Ritchie",
    pos: "RW",
    shoots: "R",
    height: "6'0\"",
    weight: 176,
    dob: "2006-08-03",
    team: "Prince Albert Raiders",
    league: "WHL",
    feeder: "RINK Hockey Academy Kelowna (CSSHL)",
    draftProjection: "Late 2nd Round",
    trajectoryScore: 87.3,
    sqmRating: 87.0,
    corsiPct: 56.2,
    xGRate: 0.88,
    speedMph: 22.9,
    comp: "Jordan Eberle / Jaden Schwartz",
    scoutingSummary: "WHL Rookie of the Year in 2023. Son of former NHLer Byron Ritchie. Slippery 1-on-1 attacker with sharp edgework and rapid shot release off the rush.",
    badges: ["Minnesota 2nd Rd Pick", "WHL Rookie of Year", "U18 Gold Medalist"],
    contractStatus: "Major Junior (CHL)"
  },
  {
    id: "prospect-63",
    rank: 63,
    name: "Max Plante",
    pos: "LW",
    shoots: "L",
    height: "5'11\"",
    weight: 170,
    dob: "2006-02-20",
    team: "Minnesota Duluth Bulldogs",
    league: "NCAA D1",
    feeder: "USNTDP (USHL) / Hermantown, MN",
    draftProjection: "Late 2nd Round",
    trajectoryScore: 87.0,
    sqmRating: 86.8,
    corsiPct: 59.2,
    xGRate: 0.94,
    speedMph: 22.6,
    comp: "Cam Atkinson / Teuvo Teräväinen",
    scoutingSummary: "Son of former NHLer Derek Plante. Pure pass-first playmaker with surgical vision who racked up 61 points in 51 games for the US National Development Team.",
    badges: ["Detroit 2nd Rd Pick", "UMD Commit", "Surgical Playmaker"],
    contractStatus: "NCAA Active"
  },
  {
    id: "prospect-64",
    rank: 64,
    name: "Eemil Vinni",
    pos: "G",
    shoots: "L",
    height: "6'2\"",
    weight: 187,
    dob: "2005-12-18",
    team: "JoKP",
    league: "Mestis",
    feeder: "HIFK Jr. (Finland)",
    draftProjection: "Top European Goalie",
    trajectoryScore: 86.5,
    sqmRating: 86.8,
    corsiPct: 55.0,
    xGRate: 0.45,
    speedMph: 20.2,
    comp: "Pekka Rinne / Ukko-Pekka Luukkonen",
    scoutingSummary: "Top European goaltender prospect. Started in adult Mestis as an 18-year-old with exceptional post integration, rapid seal recovery, and glove speed.",
    badges: ["Edmonton 2nd Rd Pick", "Top European Goalie", "Mestis Pro Starter"],
    contractStatus: "Mestis / Edmonton ELC Signed"
  }
];

// Enrich with Pipeline taxonomy
PROSPECTS_64.forEach(p => {
  const pipelines = [];
  const text = `${p.league} ${p.feeder} ${p.team}`.toLowerCase();
  
  if (text.includes('ncaa') || text.includes('university') || text.includes('college') || text.includes('boston') || text.includes('michigan') || text.includes('denver') || text.includes('dakota') || text.includes('providence') || text.includes('gophers') || text.includes('st. cloud')) {
    pipelines.push('NCAA');
  }
  if (text.includes('ushl') || text.includes('usntdp') || text.includes('steel') || text.includes('gamblers') || text.includes('storm') || text.includes('lumberjacks') || text.includes('black hawks') || text.includes('lincoln')) {
    pipelines.push('USHL');
  }
  if (text.includes('shattuck') || text.includes('prep') || text.includes('academy') || text.includes('csshl') || text.includes('cisaa') || text.includes('mount st. charles') || text.includes("st. andrew's") || text.includes('edge school') || text.includes('rink hockey')) {
    pipelines.push('PREP');
  }
  if (text.includes('mshsl') || text.includes('minnesota') || text.includes('edina') || text.includes('minnetonka') || text.includes('wayzata')) {
    pipelines.push('MSHSL');
  }
  if (/\b(ohl|whl|qmjhl|chl)\b/i.test(text) || text.includes('knights') || text.includes('tigers') || text.includes('spirit') || text.includes('chiefs') || text.includes('hitmen') || text.includes('rockets') || text.includes('spitfires') || text.includes('wheat kings') || text.includes('colts') || text.includes('bulldogs') || text.includes('blazers') || text.includes('attack') || text.includes('silvertips') || text.includes('raiders')) {
    pipelines.push('CHL');
  }
  if (/\b(khl|mhl|liiga|shl|ska|tps|loko|torpedo|jukurit|färjestad|växjö|skellefteå|modo|zug|plzeň|liberec|mora|nybro|mestis|extraliga|national league|magnus|rouen|metal ligaen|tauron|elitehockey|storhamar)\b/i.test(text) || text.includes('finland') || text.includes('sweden') || text.includes('norway') || text.includes('russia') || text.includes('europe') || text.includes('swiss') || text.includes('czech') || text.includes('france') || text.includes('denmark') || text.includes('poland')) {
    pipelines.push('EURO');
  }

  if (pipelines.includes('PREP')) {
    p.primaryPipeline = 'Prep Academy';
  } else if (pipelines.includes('NCAA')) {
    p.primaryPipeline = 'NCAA D1';
  } else if (pipelines.includes('USHL')) {
    p.primaryPipeline = 'USHL Tier 1';
  } else if (pipelines.includes('CHL')) {
    p.primaryPipeline = 'Major Junior (CHL)';
  } else if (pipelines.includes('EURO')) {
    p.primaryPipeline = 'European Pro';
  } else {
    p.primaryPipeline = 'Amateur Pipeline';
  }

  p.pipelines = pipelines;
  p.round = p.rank <= 32 ? 1 : 2;
});

// Full 64-slot NHL draft order (Round 1: 1-32, Round 2: 33-64)
const ROUND_2_TEAMS = [
  { id: "SJS_R2", name: "San Jose Sharks", abbrev: "SJS", logo: "🦈", color: "#006d75", needs: ["Puck-Moving D", "High-Ceiling Winger"], gm: "Mike Grier" },
  { id: "CHI_R2", name: "Chicago Blackhawks", abbrev: "CHI", logo: "🦅", color: "#cf0a2c", needs: ["Right-Shot Defense", "Center Depth"], gm: "Kyle Davidson" },
  { id: "ANA_R2", name: "Anaheim Ducks", abbrev: "ANA", logo: "🦆", color: "#f47a38", needs: ["Physical Forward", "Two-Way D"], gm: "Pat Verbeek" },
  { id: "CBJ_R2", name: "Columbus Blue Jackets", abbrev: "CBJ", logo: "⭐", color: "#002654", needs: ["Two-Way Wing", "Power Forward"], gm: "Don Waddell" },
  { id: "WPG_R2", name: "Winnipeg Jets (via MTL)", abbrev: "WPG", logo: "✈️", color: "#041e42", needs: ["Center Depth", "Mobile Defense"], gm: "Kevin Cheveldayoff" },
  { id: "UTA_R2", name: "Utah Hockey Club", abbrev: "UTA", logo: "🏔️", color: "#010101", needs: ["Goaltender", "Two-Way D"], gm: "Bill Armstrong" },
  { id: "OTT_R2", name: "Ottawa Senators", abbrev: "OTT", logo: "🛡️", color: "#c52032", needs: ["Right-Shot Defense", "Speed Wing"], gm: "Steve Staios" },
  { id: "SEA_R2", name: "Seattle Kraken", abbrev: "SEA", logo: "🦑", color: "#001628", needs: ["Net-Front Scorer", "Puck Mover"], gm: "Ron Francis" },
  { id: "CGY_R2", name: "Calgary Flames", abbrev: "CGY", logo: "🔥", color: "#c8102e", needs: ["Wing Depth", "Right-Shot D"], gm: "Craig Conroy" },
  { id: "SJS2_R2", name: "San Jose Sharks (via NJD)", abbrev: "SJS", logo: "🦈", color: "#006d75", needs: ["Goaltender", "Physical Forward"], gm: "Mike Grier" },
  { id: "BUF_R2", name: "Buffalo Sabres", abbrev: "BUF", logo: "⚔️", color: "#003087", needs: ["Heavy Defense", "Goalie Depth"], gm: "Kevyn Adams" },
  { id: "PIT_R2", name: "Pittsburgh Penguins (via CAR)", abbrev: "PIT", logo: "🐧", color: "#ffb81c", needs: ["Center Depth", "Mobile D"], gm: "Kyle Dubas" },
  { id: "MIN_R2", name: "Minnesota Wild", abbrev: "MIN", logo: "🌲", color: "#154734", needs: ["Center", "Physical Wing"], gm: "Bill Guerin" },
  { id: "WSH_R2", name: "Washington Capitals", abbrev: "WSH", logo: "🦅", color: "#041e42", needs: ["Scoring Center", "Two-Way Wing"], gm: "Brian MacLellan" },
  { id: "DET_R2", name: "Detroit Red Wings", abbrev: "DET", logo: "🐙", color: "#ce1126", needs: ["Right-Shot Defense", "Power Forward"], gm: "Steve Yzerman" },
  { id: "STL_R2", name: "St. Louis Blues", abbrev: "STL", logo: "🎵", color: "#002f87", needs: ["Top-4 Defense", "Center Depth"], gm: "Doug Armstrong" },
  { id: "NYR_R2", name: "New York Rangers (via UTA)", abbrev: "NYR", logo: "🗽", color: "#0038a8", needs: ["Center Depth", "Speed Winger"], gm: "Chris Drury" },
  { id: "CHI2_R2", name: "Chicago Blackhawks (via NYI)", abbrev: "CHI", logo: "🦅", color: "#cf0a2c", needs: ["Dynamic Playmaker", "Two-Way D"], gm: "Kyle Davidson" },
  { id: "PHI_R2", name: "Philadelphia Flyers", abbrev: "PHI", logo: "🟧", color: "#f74902", needs: ["Best Player Available", "Center"], gm: "Daniel Brière" },
  { id: "WSH2_R2", name: "Washington Capitals (via VGK)", abbrev: "WSH", logo: "🦅", color: "#041e42", needs: ["Two-Way Defense", "Goalie Depth"], gm: "Brian MacLellan" },
  { id: "NSH_R2", name: "Nashville Predators", abbrev: "NSH", logo: "🐱", color: "#ffb81c", needs: ["Offensive Center", "Puck-Moving D"], gm: "Barry Trotz" },
  { id: "EDM_R2", name: "Edmonton Oilers", abbrev: "EDM", logo: "🛢️", color: "#041e42", needs: ["Right-Shot Defense", "Goaltender"], gm: "Stan Bowman" },
  { id: "COL_R2", name: "Colorado Avalanche", abbrev: "COL", logo: "🏔️", color: "#6f263d", needs: ["Middle-6 Center", "Speed Winger"], gm: "Chris MacFarland" },
  { id: "STL2_R2", name: "St. Louis Blues (via TOR)", abbrev: "STL", logo: "🎵", color: "#002f87", needs: ["Physical Forward", "Two-Way D"], gm: "Doug Armstrong" },
  { id: "MTL_R2", name: "Montreal Canadiens (via TBL)", abbrev: "MTL", logo: "🔴", color: "#af1e2d", needs: ["Right-Shot Defense", "Center Depth"], gm: "Kent Hughes" },
  { id: "FLA_R2", name: "Florida Panthers", abbrev: "FLA", logo: "🐆", color: "#c8102e", needs: ["Physical Forward", "Puck Mover"], gm: "Bill Zito" },
  { id: "CAR_R2", name: "Carolina Hurricanes", abbrev: "CAR", logo: "🌀", color: "#cc0000", needs: ["Possession Center", "Goal Scorer"], gm: "Eric Tulsky" },
  { id: "CBJ2_R2", name: "Columbus Blue Jackets (via VAN)", abbrev: "CBJ", logo: "⭐", color: "#002654", needs: ["Top-Pair D", "Power Center"], gm: "Don Waddell" },
  { id: "NYI_R2", name: "New York Islanders (via CHI)", abbrev: "NYI", logo: "🏝️", color: "#00539b", needs: ["Dynamic Winger", "Mobile Defense"], gm: "Lou Lamoriello" },
  { id: "CGY2_R2", name: "Calgary Flames (via DAL)", abbrev: "CGY", logo: "🔥", color: "#c8102e", needs: ["Two-Way Center", "Puck Mover"], gm: "Craig Conroy" },
  { id: "SEA2_R2", name: "Seattle Kraken (via NYR)", abbrev: "SEA", logo: "🦑", color: "#001628", needs: ["Playmaker", "Two-Way D"], gm: "Ron Francis" },
  { id: "ANA2_R2", name: "Anaheim Ducks (via EDM)", abbrev: "ANA", logo: "🦆", color: "#f47a38", needs: ["Right-Shot Defense", "Center Depth"], gm: "Pat Verbeek" }
];

console.log('✓ Created 64 consensus prospects and 32 Round 2 slots.');

// Generate replacement draft_simulator.js
const newScript = `/**
 * DraftLineup.com: Enterprise Global Mock Draft Simulator 2.0 Engine
 * 
 * Capabilities:
 * - 64 Consensus Draft-Eligible Prospects (Round 1 & Round 2)
 * - Deep Integration of Top European / Overseas Standouts (Demidov, Silayev, Sandin Pellikka, Helenius, Brandsegg-Nygård, Solberg, Hemming, Kiviharju, etc.)
 * - 2 Full Rounds of Draft Picks (Picks 1 to 64) across all 32 NHL Franchises
 * - European Contract & Loan Rights Status tracking
 * - Empirical Draft Pick Value Curve (Rich Hill / Jimmy Johnson hockey model)
 * - Interactive Draft Pick Trade Machine with AI GM Evaluation
 * - Automated Simulation (Step, Sim Round 1, Sim Round 2, Sim Full 64-Pick Draft, Reset)
 * - Integration with The DraftLineup Wire (#DraftRoom)
 */

(function(window) {
  'use strict';

  // 1. TOP 64 DRAFT PROSPECTS (Master Global Trajectory Pool)
  const DRAFT_PROSPECTS = ${JSON.stringify(PROSPECTS_64, null, 2)};

  // 2. 32 NHL FRANCHISES & NEEDS MATRIX (Round 1 & Round 2)
  const NHL_TEAMS = [
    { id: "SJS", name: "San Jose Sharks", city: "San Jose", abbrev: "SJS", color: "#006d75", logo: "🦈", needs: ["1C Franchise Center", "Top-Pair RHD", "Puck-Moving D"], picks: [1, 33, 42], gm: "Mike Grier" },
    { id: "CHI", name: "Chicago Blackhawks", city: "Chicago", abbrev: "CHI", color: "#cf0a2c", logo: "🦅", needs: ["Top-Pair RHD", "Power Winger", "Dynamic Playmaker"], picks: [2, 18, 34, 50], gm: "Kyle Davidson" },
    { id: "ANA", name: "Anaheim Ducks", city: "Anaheim", abbrev: "ANA", color: "#f47a38", logo: "🦆", needs: ["Elite Winger", "Right-Shot Defense", "Power Forward"], picks: [3, 31, 35, 64], gm: "Pat Verbeek" },
    { id: "CBJ", name: "Columbus Blue Jackets", city: "Columbus", abbrev: "CBJ", color: "#002654", logo: "⭐", needs: ["Top-Pair Defense", "Power Center", "Two-Way Wing"], picks: [4, 36, 60], gm: "Don Waddell" },
    { id: "MTL", name: "Montreal Canadiens", city: "Montreal", abbrev: "MTL", color: "#af1e2d", logo: "🔴", needs: ["Dynamic Scoring Winger", "Big 200ft Center", "RHD Depth"], picks: [5, 26, 57], gm: "Kent Hughes" },
    { id: "UTA", name: "Utah Hockey Club", city: "Utah", abbrev: "UTA", color: "#010101", logo: "🏔️", needs: ["Top-4 Two-Way Defense", "Physical Scoring Wing", "Goaltender"], picks: [6, 38], gm: "Bill Armstrong" },
    { id: "OTT", name: "Ottawa Senators", city: "Ottawa", abbrev: "OTT", color: "#c52032", logo: "🛡️", needs: ["Right-Shot Defense", "Middle-6 Center", "Puck Mover"], picks: [7, 39], gm: "Steve Staios" },
    { id: "SEA", name: "Seattle Kraken", city: "Seattle", abbrev: "SEA", color: "#001628", logo: "🦑", needs: ["High-End Playmaker", "Offensive Defenseman", "Net-Front Scorer"], picks: [8, 40, 63], gm: "Ron Francis" },
    { id: "CGY", name: "Calgary Flames", city: "Calgary", abbrev: "CGY", color: "#c8102e", logo: "🔥", needs: ["Center Depth", "Mobile Defense", "Sniper Wing"], picks: [9, 28, 41, 62], gm: "Craig Conroy" },
    { id: "NJD", name: "New Jersey Devils", city: "New Jersey", abbrev: "NJD", color: "#ce1126", logo: "😈", needs: ["Physical Shutdown D", "Heavy Power Forward", "Center"], picks: [10], gm: "Tom Fitzgerald" },
    { id: "BUF", name: "Buffalo Sabres", city: "Buffalo", abbrev: "BUF", color: "#003087", logo: "⚔️", needs: ["Top-6 Forward", "Speed Center", "Right-Shot D"], picks: [11, 43], gm: "Kevyn Adams" },
    { id: "PHI", name: "Philadelphia Flyers", city: "Philadelphia", abbrev: "PHI", color: "#f74902", logo: "🟧", needs: ["1C High-End Center", "Puck-Moving D", "Goalie"], picks: [12, 32, 51], gm: "Daniel Brière" },
    { id: "MIN", name: "Minnesota Wild", city: "Minnesota", abbrev: "MIN", color: "#154734", logo: "🌲", needs: ["Offensive Spark Forward", "Right-Shot D", "Center Depth"], picks: [13, 45], gm: "Bill Guerin" },
    { id: "SJS2", name: "San Jose Sharks (via PIT)", city: "San Jose", abbrev: "SJS", color: "#006d75", logo: "🦈", needs: ["High-Ceiling Defense", "Goaltender", "Winger"], picks: [14], gm: "Mike Grier" },
    { id: "DET", name: "Detroit Red Wings", city: "Detroit", abbrev: "DET", color: "#ce1126", logo: "🐙", needs: ["Right-Shot Defense", "Top-6 Scoring Wing", "Two-Way C"], picks: [15, 47], gm: "Steve Yzerman" },
    { id: "STL", name: "St. Louis Blues", city: "St. Louis", abbrev: "STL", color: "#002f87", logo: "🎵", needs: ["Top-4 Defense", "Puck Mover", "Heavy Forward"], picks: [16, 48, 56], gm: "Doug Armstrong" },
    { id: "WSH", name: "Washington Capitals", city: "Washington", abbrev: "WSH", color: "#041e42", logo: "🦅", needs: ["Scoring Center", "Power Winger", "Puck Mover"], picks: [17, 46, 49, 52], gm: "Brian MacLellan" },
    { id: "CHI2", name: "Chicago Blackhawks (via NYI)", city: "Chicago", abbrev: "CHI", color: "#cf0a2c", logo: "🦅", needs: ["Physical Forward", "Two-Way D", "Center Depth"], picks: [18], gm: "Kyle Davidson" },
    { id: "VGK", name: "Vegas Golden Knights", city: "Vegas", abbrev: "VGK", color: "#b4975a", logo: "⚔️", needs: ["High-Ceiling Winger", "Two-Way Center", "Goalie Prospect"], picks: [19], gm: "Kelly McCrimmon" },
    { id: "NYI", name: "New York Islanders (via CHI)", city: "New York", abbrev: "NYI", color: "#00539b", logo: "🏝️", needs: ["Dynamic Winger", "Mobile Defenseman", "Center"], picks: [20, 61], gm: "Lou Lamoriello" },
    { id: "LAK", name: "Los Angeles Kings", city: "Los Angeles", abbrev: "LAK", color: "#111111", logo: "👑", needs: ["Left-Shot Defense", "Power Center", "Speed Wing"], picks: [21], gm: "Rob Blake" },
    { id: "NSH", name: "Nashville Predators", city: "Nashville", abbrev: "NSH", color: "#ffb81c", logo: "🐱", needs: ["Offensive Center", "Puck-Moving Defense", "Scoring Wing"], picks: [22, 53], gm: "Barry Trotz" },
    { id: "TOR", name: "Toronto Maple Leafs", city: "Toronto", abbrev: "TOR", color: "#00205b", logo: "🍁", needs: ["Heavy Physical Defense", "Two-Way Center", "Goalie Depth"], picks: [23], gm: "Brad Treliving" },
    { id: "COL", name: "Colorado Avalanche", city: "Colorado", abbrev: "COL", color: "#6f263d", logo: "🏔️", needs: ["Middle-6 Center", "Speed Winger", "Two-Way Defense"], picks: [24, 55], gm: "Chris MacFarland" },
    { id: "BOS", name: "Boston Bruins", city: "Boston", abbrev: "BOS", color: "#000000", logo: "🐻", needs: ["Top-6 Center", "Heavy Forward", "Right-Shot Defense"], picks: [25], gm: "Don Sweeney" },
    { id: "MTL2", name: "Montreal Canadiens (via WPG)", city: "Montreal", abbrev: "MTL", color: "#af1e2d", logo: "🔴", needs: ["Right-Shot Defense", "Hard-Nosed Forward", "Goalie"], picks: [26], gm: "Kent Hughes" },
    { id: "CAR", name: "Carolina Hurricanes", city: "Carolina", abbrev: "CAR", color: "#cc0000", logo: "🌀", needs: ["Puck Possession Center", "Goal Scoring Winger", "Defense"], picks: [27, 59], gm: "Eric Tulsky" },
    { id: "CGY2", name: "Calgary Flames (via VAN)", city: "Calgary", abbrev: "CGY", color: "#c8102e", logo: "🔥", needs: ["Two-Way Center", "Puck-Moving Defense", "Wing Depth"], picks: [28], gm: "Craig Conroy" },
    { id: "DAL", name: "Dallas Stars", city: "Dallas", abbrev: "DAL", color: "#006847", logo: "⭐", needs: ["Right-Shot Defense", "Power Forward", "Center Depth"], picks: [29], gm: "Jim Nill" },
    { id: "NYR", name: "New York Rangers", city: "New York", abbrev: "NYR", color: "#0038a8", logo: "🗽", needs: ["Center Depth", "Right-Shot Defense", "Speed Winger"], picks: [30], gm: "Chris Drury" },
    { id: "ANA2", name: "Anaheim Ducks (via EDM)", city: "Anaheim", abbrev: "ANA", color: "#f47a38", logo: "🦆", needs: ["Two-Way Defense", "Physical Winger", "Center Depth"], picks: [31], gm: "Pat Verbeek" },
    { id: "PHI2", name: "Philadelphia Flyers (via FLA)", city: "Philadelphia", abbrev: "PHI", color: "#f74902", logo: "🟧", needs: ["Best Player Available", "Center", "Goaltender"], picks: [32], gm: "Daniel Brière" }
  ];

  const ROUND_2_TEAMS = ${JSON.stringify(ROUND_2_TEAMS, null, 2)};

  // 3. EMPIRICAL DRAFT PICK VALUE CURVE (Hockey Value Curve 1-64)
  const DRAFT_PICK_VALUES = {
    1: 3000, 2: 2400, 3: 2050, 4: 1800, 5: 1600, 6: 1450, 7: 1350, 8: 1250, 9: 1180, 10: 1100,
    11: 1040, 12: 980, 13: 930, 14: 890, 15: 850, 16: 810, 17: 780, 18: 750, 19: 720, 20: 690,
    21: 670, 22: 650, 23: 630, 24: 610, 25: 590, 26: 575, 27: 560, 28: 545, 29: 530, 30: 515,
    31: 500, 32: 485,
    33: 470, 34: 455, 35: 440, 36: 425, 37: 410, 38: 395, 39: 380, 40: 365,
    41: 350, 42: 335, 43: 320, 44: 305, 45: 290, 46: 280, 47: 270, 48: 260,
    49: 250, 50: 240, 51: 230, 52: 220, 53: 210, 54: 200, 55: 190, 56: 180,
    57: 175, 58: 170, 59: 165, 60: 160, 61: 155, 62: 150, 63: 145, 64: 140
  };

  function getPickValue(pickNum) {
    return DRAFT_PICK_VALUES[pickNum] || Math.max(50, Math.floor(400 - (pickNum * 4)));
  }

  // 4. SIMULATION STATE
  let state = {
    currentPickIndex: 0,
    isSimulating: false,
    timerSeconds: 120,
    userTeamId: "SJS", // Default: San Jose Sharks
    draftOrder: [], // 64 slots across Round 1 & Round 2
    draftLog: [], // Executed picks
    tradesMade: [],
    availableProspects: JSON.parse(JSON.stringify(DRAFT_PROSPECTS)),
    selectedProspect: DRAFT_PROSPECTS[0]
  };

  // Build Full 64-Pick Draft Order (Round 1 & Round 2)
  function initDraftOrder() {
    const slots = [];
    
    // Round 1 (Picks 1-32)
    NHL_TEAMS.forEach((team, idx) => {
      slots.push({
        pickNum: idx + 1,
        round: 1,
        team: { ...team },
        originalTeam: { ...team },
        selection: null,
        timestamp: null
      });
    });

    // Round 2 (Picks 33-64)
    ROUND_2_TEAMS.forEach((team, idx) => {
      slots.push({
        pickNum: idx + 33,
        round: 2,
        team: { ...team },
        originalTeam: { ...team },
        selection: null,
        timestamp: null
      });
    });

    state.draftOrder = slots;
  }

  initDraftOrder();

  // 5. AI DRAFT SELECTION ALGORITHM
  function evaluatePickForTeam(team, prospectPool) {
    if (!prospectPool || prospectPool.length === 0) return null;

    const topCandidates = prospectPool.slice(0, 5);
    let bestCandidate = topCandidates[0];
    let highestScore = -1;

    topCandidates.forEach((cand, idx) => {
      let score = cand.trajectoryScore - (idx * 0.7);
      const needs = (team.needs || []).join(' ').toLowerCase();

      if (cand.pos === 'RD' && (needs.includes('rhd') || needs.includes('right-shot defense'))) {
        score += 2.5;
      } else if (cand.pos === 'C' && (needs.includes('center') || needs.includes('1c'))) {
        score += 2.2;
      } else if ((cand.pos === 'LW' || cand.pos === 'RW') && (needs.includes('winger') || needs.includes('scoring wing'))) {
        score += 1.8;
      } else if (cand.pos === 'LD' && (needs.includes('defense') || needs.includes('puck-moving d') || needs.includes('top-4'))) {
        score += 1.6;
      } else if (cand.pos === 'G' && needs.includes('goalie')) {
        score += 2.0;
      }

      if (score > highestScore) {
        highestScore = score;
        bestCandidate = cand;
      }
    });

    return bestCandidate;
  }

  // 6. SIMULATOR ACTIONS
  function makePick(pickIndex, prospectId) {
    if (pickIndex >= state.draftOrder.length) return null;

    const slot = state.draftOrder[pickIndex];
    if (slot.selection) return null;

    const pIndex = state.availableProspects.findIndex(p => p.id === prospectId);
    if (pIndex === -1) return null;

    const prospect = state.availableProspects.splice(pIndex, 1)[0];
    slot.selection = prospect;
    slot.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const logEntry = {
      pickNum: slot.pickNum,
      round: slot.round,
      team: slot.team,
      prospect: prospect,
      timestamp: slot.timestamp
    };

    state.draftLog.push(logEntry);
    state.currentPickIndex++;
    state.timerSeconds = 120;

    return logEntry;
  }

  function simulateNextPick() {
    if (state.currentPickIndex >= state.draftOrder.length) {
      return { completed: true };
    }

    const currentSlot = state.draftOrder[state.currentPickIndex];
    const chosenProspect = evaluatePickForTeam(currentSlot.team, state.availableProspects);
    if (!chosenProspect) return { completed: true };

    const entry = makePick(state.currentPickIndex, chosenProspect.id);
    return { success: true, entry: entry };
  }

  function simRound1(onStepCallback) {
    while (state.currentPickIndex < 32 && state.currentPickIndex < state.draftOrder.length) {
      const res = simulateNextPick();
      if (onStepCallback && res.entry) {
        onStepCallback(res.entry);
      }
      if (res.completed) break;
    }
  }

  function simFullDraft(onStepCallback) {
    while (state.currentPickIndex < state.draftOrder.length) {
      const res = simulateNextPick();
      if (onStepCallback && res.entry) {
        onStepCallback(res.entry);
      }
      if (res.completed) break;
    }
  }

  function resetDraft() {
    state.currentPickIndex = 0;
    state.isSimulating = false;
    state.timerSeconds = 120;
    state.draftLog = [];
    state.tradesMade = [];
    state.availableProspects = JSON.parse(JSON.stringify(DRAFT_PROSPECTS));
    state.selectedProspect = DRAFT_PROSPECTS[0];
    initDraftOrder();
  }

  // 7. TRADE MACHINE ENGINE (Supports Picks 1-64)
  function evaluateTrade(userTeamAbbrev, partnerTeamAbbrev, userOfferedPicks, partnerOfferedPicks) {
    const userTeam = NHL_TEAMS.find(t => t.abbrev === userTeamAbbrev) || ROUND_2_TEAMS.find(t => t.abbrev === userTeamAbbrev);
    const partnerTeam = NHL_TEAMS.find(t => t.abbrev === partnerTeamAbbrev) || ROUND_2_TEAMS.find(t => t.abbrev === partnerTeamAbbrev);

    if (!userTeam || !partnerTeam) {
      return { accepted: false, reason: "Invalid franchises specified." };
    }

    let userValue = 0;
    userOfferedPicks.forEach(p => userValue += getPickValue(p));

    let partnerValue = 0;
    partnerOfferedPicks.forEach(p => partnerValue += getPickValue(p));

    if (userOfferedPicks.length === 0 || partnerOfferedPicks.length === 0) {
      return { accepted: false, reason: "Both sides must include at least one draft pick asset." };
    }

    const valueDelta = userValue - partnerValue;
    const valuePctDiff = (valueDelta / Math.max(partnerValue, 1)) * 100;

    if (valuePctDiff >= -3) {
      partnerOfferedPicks.forEach(pNum => {
        const slot = state.draftOrder.find(s => s.pickNum === pNum);
        if (slot && !slot.selection) slot.team = { ...userTeam };
      });

      userOfferedPicks.forEach(pNum => {
        const slot = state.draftOrder.find(s => s.pickNum === pNum);
        if (slot && !slot.selection) slot.team = { ...partnerTeam };
      });

      const tradeRecord = {
        id: \`trade-\${Date.now()}\`,
        timestamp: new Date().toLocaleTimeString(),
        teamA: userTeam.name,
        teamB: partnerTeam.name,
        teamASent: userOfferedPicks.map(p => \`Pick #\${p}\`),
        teamBSent: partnerOfferedPicks.map(p => \`Pick #\${p}\`),
        valueDelta: Math.round(valueDelta)
      };

      state.tradesMade.push(tradeRecord);

      return {
        accepted: true,
        trade: tradeRecord,
        userValue,
        partnerValue,
        reason: \`\${partnerTeam.gm || 'GM'} (\${partnerTeam.name}) accepted the proposal! Received +\${Math.round(valueDelta)} net value differential according to DraftLineup Pick Value Index.\`
      };
    } else {
      return {
        accepted: false,
        userValue,
        partnerValue,
        deficit: Math.abs(Math.round(valueDelta)),
        reason: \`\${partnerTeam.gm || 'GM'} (\${partnerTeam.name}) rejected the offer. Value deficit is \${Math.abs(Math.round(valueDelta))} pts below fair market value. Add an additional pick.\`
      };
    }
  }

  // 8. WIRE BROADCAST INTEGRATION
  function broadcastDraftToWire(headline, customSummary) {
    const wireStateRaw = localStorage.getItem('blueline_social_state');
    const defaultState = { posts: [] };
    let wireState = wireStateRaw ? JSON.parse(wireStateRaw) : defaultState;

    const currentLeader = state.draftLog[0] ? \`\${state.draftLog[0].prospect.name} to \${state.draftLog[0].team.name}\` : "Draft Simulator Active";
    const totalSelected = state.draftLog.length;

    const post = {
      id: \`post-draft-\${Date.now()}\`,
      authorId: 'director-scouting',
      authorName: 'Director of Scouting',
      handle: '@draftlineup_scouting',
      role: 'recruiter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verifiedBadge: 'verified-gold',
      timestamp: 'Just now',
      content: \`🎯 **\${headline || "WAR ROOM DISPATCH: NHL ENTRY DRAFT 2-ROUND SIMULATION"}**\\n\\nThe DraftLineup Mock Draft Simulator completed \${totalSelected} selections across Rounds 1 & 2. Top pick: \${currentLeader}. Trajectory metrics and feeder models validated by the DraftLineup Scouting Bureau.\\n\\n#DraftRoom #NHLDraft #MockDraft #DraftLineupOS #ScoutingBureau\`,
      likes: 48,
      reposts: 22,
      comments: 14,
      userLiked: false,
      userReposted: false,
      tags: ['#DraftRoom', '#NHLDraft', '#MockDraft', '#DraftLineupOS'],
      playerBadge: {
        name: "NHL Draft Simulator 2.0",
        team: "DraftLineup War Room",
        pos: \`\${totalSelected}/64 Selections Complete\`,
        stats: \`Leader: \${currentLeader}\`,
        nilVal: "Official Mock Simulation"
      }
    };

    wireState.posts.unshift(post);
    localStorage.setItem('blueline_social_state', JSON.stringify(wireState));
    return post;
  }

  // Export to window
  window.BlueLineDraftEngine = {
    DRAFT_PROSPECTS,
    NHL_TEAMS,
    ROUND_2_TEAMS,
    DRAFT_PICK_VALUES,
    getPickValue,
    getState: () => state,
    makePick,
    simulateNextPick,
    simRound1,
    simFullDraft,
    resetDraft,
    evaluateTrade,
    broadcastDraftToWire,
    setUserTeam: (teamId) => { state.userTeamId = teamId; },
    setSelectedProspect: (p) => { state.selectedProspect = p; }
  };

  // Backward compatibility alias
  window.DraftLineupDraftEngine = window.BlueLineDraftEngine;

})(typeof window !== 'undefined' ? window : global);
`;

fs.writeFileSync(path.join(ROOT, 'static', 'js', 'draft_simulator.js'), newScript, 'utf8');
console.log('✓ Successfully wrote Global Mock Draft Simulator 2.0 to static/js/draft_simulator.js');
