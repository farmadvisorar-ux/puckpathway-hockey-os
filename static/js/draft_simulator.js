/**
 * BlueLine DataWorks: Enterprise Draft Board & Mock Draft Simulator Engine
 * 
 * Features:
 * - 32 NHL Franchise Rosters & Needs Matrix
 * - Top 32 Draft-Eligible Prospects with Lifelong Feeder Trajectory Ratings
 * - Empirical Draft Pick Value Curve (Rich Hill / Jimmy Johnson hockey model)
 * - Interactive Draft Pick Trade Machine with AI GM Evaluation
 * - Automated Simulation (Step, Sim to User Pick, Sim Round 1, Reset)
 * - Integration with The BlueLine Wire (#DraftRoom)
 */

(function(window) {
  'use strict';

  // 1. TOP DRAFT PROSPECTS (Master Trajectory Pool)
  const DRAFT_PROSPECTS = [
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
      badges: ["Hobey Baker", "Tier 1 Franchise 1C", "World Juniors MVP"]
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
      badges: ["Big Ten Rookie of the Year", "Cornerstone RHD", "Elite Mobility"]
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
      team: "SKA St. Petersburg",
      league: "KHL / MHL",
      feeder: "Vityaz Podolsk / SKA Jr.",
      draftProjection: "Top 5 Pick",
      trajectoryScore: 97.9,
      sqmRating: 96.8,
      corsiPct: 65.1,
      xGRate: 1.28,
      speedMph: 22.9,
      comp: "Nikita Kucherov / Kirill Kaprizov",
      scoutingSummary: "Most electrifying offensive ceiling in the draft. World-class 1-on-1 puck skill, deception, delay game, and playmaking vision in tight ice.",
      badges: ["MHL Playoff MVP", "Elite Playmaker", "Game Breaker"]
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
      badges: ["Power Forward 1C", "Physical Monster", "CSSHL Alumni"]
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
      badges: ["NCAA Champion", "WJC Gold Medalist", "Transition Wizard"]
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
      trajectoryScore: 96.4,
      sqmRating: 95.2,
      corsiPct: 63.8,
      xGRate: 1.12,
      speedMph: 22.4,
      comp: "Erik Karlsson / Cale Makar Lite",
      scoutingSummary: "Historic 33-goal season in the OHL. Phenomenal walking the offensive blue line, changing shot angles, and quarterbacking power plays.",
      badges: ["Memorial Cup Champ", "CHL Defenceman of the Year", "Power Play QB"]
    },
    {
      id: "prospect-7",
      rank: 7,
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
      trajectoryScore: 95.8,
      sqmRating: 95.0,
      corsiPct: 59.2,
      xGRate: 1.20,
      speedMph: 22.8,
      comp: "Nick Suzuki / Brayden Point",
      scoutingSummary: "Scored 54 goals and 116 points on a rebuilding club. Off-the-charts hockey IQ, slip passes through seams, and clinical finishing off transition.",
      badges: ["54-Goal Scorer", "Elite Spatial IQ", "Top 6 Catalyst"]
    },
    {
      id: "prospect-8",
      rank: 8,
      name: "Anton Silayev",
      pos: "LD",
      shoots: "L",
      height: "6'7\"",
      weight: 211,
      dob: "2006-04-11",
      team: "Torpedo Nizhny Novgorod",
      league: "KHL",
      feeder: "Torpedo Jr. (MHL)",
      draftProjection: "Top 10 Pick",
      trajectoryScore: 95.2,
      sqmRating: 94.4,
      corsiPct: 54.1,
      xGRate: 0.65,
      speedMph: 22.6,
      comp: "Victor Hedman / Zdeno Chara",
      scoutingSummary: "A 6-foot-7 giant with shocking four-way skating fluidity. Played regular top-4 minutes in the KHL at age 17. Dominant stick radius and reach.",
      badges: ["6'7\" Reach", "Pro Shutdown Lock", "KHL Starter"]
    },
    {
      id: "prospect-9",
      rank: 9,
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
      trajectoryScore: 95.0,
      sqmRating: 94.8,
      corsiPct: 58.7,
      xGRate: 0.85,
      speedMph: 23.2,
      comp: "Alex Pietrangelo / Jaccob Slavin",
      scoutingSummary: "Safest, most polished complete 200-foot defenseman in the draft class. Eats 26 minutes a night in all situations for the OHL Champion London Knights.",
      badges: ["OHL Champion", "Workhorse Minutes", "Pro Frame"]
    },
    {
      id: "prospect-10",
      rank: 10,
      name: "Michael Hage",
      pos: "C",
      shoots: "R",
      height: "6'1\"",
      weight: 190,
      dob: "2006-04-14",
      team: "University of Michigan",
      league: "NCAA D1 / USHL",
      feeder: "Chicago Steel (USHL) / Toronto Jr. Canadiens",
      draftProjection: "Top 15 Pick",
      trajectoryScore: 94.8,
      sqmRating: 94.5,
      corsiPct: 61.2,
      xGRate: 1.08,
      speedMph: 22.8,
      comp: "Jack Eichel / Dylan Larkin",
      scoutingSummary: "Elite linear rush attacker. Torched the USHL with 75 points in 54 games for the Chicago Steel. Tremendous hand speed and puck protection at top gear.",
      badges: ["USHL 1st Team All-Star", "Michigan Wolverine", "Explosive Burst"]
    },
    {
      id: "prospect-11",
      rank: 11,
      name: "Tij Iginla",
      pos: "C/LW",
      shoots: "L",
      height: "6'0\"",
      weight: 186,
      dob: "2006-08-01",
      team: "Kelowna Rockets",
      league: "WHL",
      feeder: "RINK Hockey Academy (CSSHL)",
      draftProjection: "Top 12 Pick",
      trajectoryScore: 94.5,
      sqmRating: 94.1,
      corsiPct: 59.4,
      xGRate: 1.14,
      speedMph: 22.5,
      comp: "Jarome Iginla / Matthew Tkachuk",
      scoutingSummary: "Son of Hall of Famer Jarome Iginla. Relentless dog on a bone in the hard areas with an explosive one-timer and heavy wrist shot from distance.",
      badges: ["47-Goal Scorer", "U18 World Champion", "High Motor"]
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
      feeder: "Calgary Flames AAA",
      draftProjection: "Top 12 Pick",
      trajectoryScore: 94.1,
      sqmRating: 93.8,
      corsiPct: 56.4,
      xGRate: 0.92,
      speedMph: 22.1,
      comp: "Brent Burns / Tyler Myers",
      scoutingSummary: "Scored 30 goals from the blue line in the WHL. Nasty physical streak (120 PIM) coupled with high-end offensive hands and drag moves through traffic.",
      badges: ["30-Goal Defenseman", "Mean Streak", "Right-Shot Cannon"]
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
      team: "Boston University",
      league: "NCAA D1 / USNTDP",
      feeder: "USNTDP (USHL) / Shattuck-St. Mary's",
      draftProjection: "Top 15 Pick",
      trajectoryScore: 93.9,
      sqmRating: 93.2,
      corsiPct: 57.5,
      xGRate: 1.25,
      speedMph: 22.3,
      comp: "Auston Matthews (Shot) / Cole Caufield",
      scoutingSummary: "All-time goal scoring king of the USNTDP (127 career goals, passing Cole Caufield). Possesses an automatic, lethal one-touch release from any angle.",
      badges: ["USNTDP All-Time Goal King", "Generational Release", "Power Play Sniper"]
    },
    {
      id: "prospect-14",
      rank: 14,
      name: "Konsta Helenius",
      pos: "C",
      shoots: "R",
      height: "5'11\"",
      weight: 180,
      dob: "2006-05-11",
      team: "Jukurit",
      league: "Liiga (Finland)",
      feeder: "Tappara Jr.",
      draftProjection: "Top 15 Pick",
      trajectoryScore: 93.6,
      sqmRating: 93.5,
      corsiPct: 56.8,
      xGRate: 0.85,
      speedMph: 22.4,
      comp: "Sebastian Aho / Mikael Backlund",
      scoutingSummary: "One of the highest scoring U18 seasons in Finnish pro history. Tenacious 200-foot work ethic, high defensive IQ, and exceptional vision under pro pressure.",
      badges: ["Liiga Pro Veteran", "Men's Worlds Participant", "High Floor 2C"]
    },
    {
      id: "prospect-15",
      rank: 15,
      name: "Trevor Connelly",
      pos: "LW",
      shoots: "L",
      height: "6'1\"",
      weight: 160,
      dob: "2006-02-28",
      team: "Providence College",
      league: "NCAA D1 / USHL",
      feeder: "Tri-City Storm (USHL) / San Diego Saints",
      draftProjection: "Top 20 Pick",
      trajectoryScore: 93.2,
      sqmRating: 92.4,
      corsiPct: 62.0,
      xGRate: 1.10,
      speedMph: 23.5,
      comp: "Johnny Gaudreau / Mitch Marner",
      scoutingSummary: "Top-3 pure dynamic skill and open-ice transition speed in the draft. Can beat entire teams coast-to-coast with edges and lateral shiftiness.",
      badges: ["USHL Scoring Star", "Providence Commit", "Electric Skating"]
    },
    {
      id: "prospect-16",
      rank: 16,
      name: "Sacha Boisvert",
      pos: "C",
      shoots: "L",
      height: "6'2\"",
      weight: 183,
      dob: "2006-03-27",
      team: "North Dakota",
      league: "NCAA D1 / USHL",
      feeder: "Muskegon Lumberjacks (USHL) / Mount St. Charles",
      draftProjection: "Top 20 Pick",
      trajectoryScore: 92.8,
      sqmRating: 92.6,
      corsiPct: 58.1,
      xGRate: 0.98,
      speedMph: 22.6,
      comp: "Sean Couturier / Brock Nelson",
      scoutingSummary: "Rangy, physical, high-scoring center who potted 36 goals in the USHL. Excellent puck protection down low and heavy, deceptive snap shot.",
      badges: ["North Dakota Commit", "36 USHL Goals", "Heavy Two-Way Center"]
    },
    {
      id: "prospect-17",
      rank: 17,
      name: "Terik Parascak",
      pos: "RW",
      shoots: "R",
      height: "6'0\"",
      weight: 180,
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
      badges: ["105-Point Rookie", "Net-Front Master", "High IQ Opportunist"]
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
      badges: ["OHL Captain", "Heavy Puck Mover", "Board Battle Beast"]
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
      league: "SHL / Norway",
      feeder: "Vålerenga (Norway)",
      draftProjection: "Mid 1st Round",
      trajectoryScore: 91.7,
      sqmRating: 91.5,
      corsiPct: 54.8,
      xGRate: 0.72,
      speedMph: 22.7,
      comp: "Niklas Kronwall / Radko Gudas",
      scoutingSummary: "Breakout star of the Men's World Championship for Norway. Devastating open-ice body checker with quick recovery feet and crisp outlet passing.",
      badges: ["Men's Worlds Star", "Punishing Physicality", "SHL Signed"]
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
      badges: ["Shutdown Anchor", "Elite Speed RHD", "U18 Gold"]
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
      league: "NCAA D1 / Prep",
      feeder: "St. Andrew's College (CISAA)",
      draftProjection: "Late 1st Round",
      trajectoryScore: 91.0,
      sqmRating: 90.2,
      corsiPct: 60.5,
      xGRate: 1.18,
      speedMph: 22.4,
      comp: "Tage Thompson / Brian Boyle",
      scoutingSummary: "Towering 6'7\" center with legitimate soft hands and shooting range. Paced prep hockey with 127 points in 56 games before accelerating to Boston College.",
      badges: ["6'7\" Center", "Boston College", "Tage Thompson Mold"]
    },
    {
      id: "prospect-22",
      rank: 22,
      name: "EJ Emery",
      pos: "RD",
      shoots: "R",
      height: "6'3\"",
      weight: 185,
      dob: "2006-03-30",
      team: "North Dakota",
      league: "NCAA D1 / USNTDP",
      feeder: "USNTDP (USHL) / Compton / Yale Jr.",
      draftProjection: "Late 1st Round",
      trajectoryScore: 90.7,
      sqmRating: 90.5,
      corsiPct: 57.2,
      xGRate: 0.62,
      speedMph: 23.1,
      comp: "K'Andre Miller / Mattias Samuelsson",
      scoutingSummary: "Freakish athletic combine testing. Flawless backward skating transitions, stick checks, and defensive gap control for the USNTDP.",
      badges: ["Combine Top Performer", "North Dakota Commit", "Lockdown Eraser"]
    },
    {
      id: "prospect-23",
      rank: 23,
      name: "Cole Beaudoin",
      pos: "C",
      shoots: "L",
      height: "6'2\"",
      weight: 209,
      dob: "2006-04-24",
      team: "Barrie Colts",
      league: "OHL",
      feeder: "Nepean Raiders AAA",
      draftProjection: "Late 1st Round",
      trajectoryScore: 90.3,
      sqmRating: 90.0,
      corsiPct: 56.4,
      xGRate: 0.88,
      speedMph: 21.9,
      comp: "Boone Jenner / Yanni Gourde",
      scoutingSummary: "Heart-and-soul competitive motor. Top fitness score at the NHL combine. Exceptional at winning 50/50 wall pucks, screening goalies, and penalty killing.",
      badges: ["Combine Warrior", "Matchup Center", "Penalty Kill Ace"]
    },
    {
      id: "prospect-24",
      rank: 24,
      name: "Andrew Basha",
      pos: "LW",
      shoots: "L",
      height: "6'0\"",
      weight: 187,
      dob: "2005-11-08",
      team: "Medicine Hat Tigers",
      league: "WHL",
      feeder: "Calgary Royals AAA",
      draftProjection: "Late 1st / Early 2nd",
      trajectoryScore: 90.0,
      sqmRating: 89.8,
      corsiPct: 58.3,
      xGRate: 1.01,
      speedMph: 22.9,
      comp: "Artturi Lehkonen / Michael Bunting",
      scoutingSummary: "High-pace sparkplug winger with sharp offensive instincts. Generated 85 points in 63 games playing alongside Lindstrom and McKenna.",
      badges: ["High Pace Winger", "Dynamic Transition", "Playoff Producer"]
    },
    {
      id: "prospect-25",
      rank: 25,
      name: "Leo Sahlin Wallenius",
      pos: "LD",
      shoots: "L",
      height: "6'0\"",
      weight: 180,
      dob: "2006-04-10",
      team: "Växjö Lakers",
      league: "J20 Nationell",
      feeder: "Växjö Jr. (Sweden)",
      draftProjection: "Late 1st / Early 2nd",
      trajectoryScore: 89.8,
      sqmRating: 89.4,
      corsiPct: 59.0,
      xGRate: 0.76,
      speedMph: 22.7,
      comp: "Rasmus Sandin / Mattias Norlinder",
      scoutingSummary: "Smooth-skating Swedish puck-mover. Orchestrates clean breakouts, avoids forechecking pressure with quick hip opens, and delivers tape-to-tape feeds.",
      badges: ["Swedish Puck Mover", "Clean Breakout", "U18 World Silver"]
    },
    {
      id: "prospect-26",
      rank: 26,
      name: "Emil Hemming",
      pos: "RW",
      shoots: "R",
      height: "6'2\"",
      weight: 201,
      dob: "2006-06-27",
      team: "TPS / Barrie Colts",
      league: "Liiga / OHL",
      feeder: "Kiekko-Espoo Jr.",
      draftProjection: "Late 1st Round",
      trajectoryScore: 89.5,
      sqmRating: 89.1,
      corsiPct: 54.2,
      xGRate: 0.90,
      speedMph: 22.2,
      comp: "Patrik Laine (Lite) / Joel Armia",
      scoutingSummary: "Big Finnish power winger with a cannon of a shot. Can overpower junior defenders with strength on the cycle and beat goalies clean from outside the dots.",
      badges: ["Finnish Power Forward", "Heavy Snipe", "Liiga Experience"]
    },
    {
      id: "prospect-27",
      rank: 27,
      name: "Nikita Artamonov",
      pos: "LW",
      shoots: "L",
      height: "5'11\"",
      weight: 187,
      dob: "2005-11-17",
      team: "Torpedo Nizhny Novgorod",
      league: "KHL",
      feeder: "Neftekhimik Jr.",
      draftProjection: "Late 1st Round",
      trajectoryScore: 89.2,
      sqmRating: 88.9,
      corsiPct: 55.4,
      xGRate: 0.82,
      speedMph: 22.4,
      comp: "Artemi Panarin (Playstyle) / Yegor Chinakhov",
      scoutingSummary: "Earned full-time trust from Igor Larionov in the KHL at 18 years old. Relentless forecheck engine, puck hound, and smart transition connector.",
      badges: ["KHL Regular", "Larionov Discipline", "Relentless Motor"]
    },
    {
      id: "prospect-28",
      rank: 28,
      name: "Marek Vanacker",
      pos: "LW",
      shoots: "L",
      height: "6'1\"",
      weight: 178,
      dob: "2006-04-12",
      team: "Brantford Bulldogs",
      league: "OHL",
      feeder: "Brantford 99ers AAA",
      draftProjection: "Late 1st / Early 2nd",
      trajectoryScore: 88.9,
      sqmRating: 88.5,
      corsiPct: 56.1,
      xGRate: 0.95,
      speedMph: 22.8,
      comp: "Alex Tuch / Anthony Cirelli",
      scoutingSummary: "Played through a torn labrum and still scored 36 goals and 82 points. Explosive north-south motor, fearless around the blue paint, and high character.",
      badges: ["36 OHL Goals", "Warrior Mindset", "North-South Motor"]
    },
    {
      id: "prospect-29",
      rank: 29,
      name: "Harrison Brunicke",
      pos: "RD",
      shoots: "R",
      height: "6'3\"",
      weight: 196,
      dob: "2006-05-08",
      team: "Kamloops Blazers",
      league: "WHL",
      feeder: "Calgary Royals AAA / South Africa born",
      draftProjection: "Early 2nd Round",
      trajectoryScore: 88.6,
      sqmRating: 88.2,
      corsiPct: 55.0,
      xGRate: 0.65,
      speedMph: 22.7,
      comp: "Justin Schultz / John Marino",
      scoutingSummary: "Born in Johannesburg, South Africa. Tall, right-handed defenseman with exceptional four-way mobility, poised poise with the puck, and high developmental upside.",
      badges: ["Mobile 6'3\" RHD", "High Ceiling", "U18 Gold"]
    },
    {
      id: "prospect-30",
      rank: 30,
      name: "Egor Surin",
      pos: "C/LW",
      shoots: "L",
      height: "6'1\"",
      weight: 192,
      dob: "2006-08-01",
      team: "Loko Yaroslavl",
      league: "MHL",
      feeder: "Lokomotiv Jr.",
      draftProjection: "Late 1st Round",
      trajectoryScore: 88.3,
      sqmRating: 88.0,
      corsiPct: 57.9,
      xGRate: 1.00,
      speedMph: 22.3,
      comp: "Tom Wilson / Nazem Kadri",
      scoutingSummary: "Aggressive, mean power center who gets under opponent's skin while racking up points. Paced Loko in playoff scoring with 23 points in 19 games.",
      badges: ["MHL Playoff Star", "Heavy Physicality", "Clutch Scorer"]
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
      league: "NCAA D1 / USHL",
      feeder: "Waterloo Black Hawks (USHL) / North Jersey Avalanche",
      draftProjection: "Early 2nd Round",
      trajectoryScore: 88.0,
      sqmRating: 87.8,
      corsiPct: 57.0,
      xGRate: 0.94,
      speedMph: 23.6,
      comp: "Andreas Athanasiou / Kasperi Kapanen",
      scoutingSummary: "USHL Rookie of the Year. Blazing top-end skating speed (23.6 MPH) that forces defensemen to retreat flat-footed. Lethal snapshot in transition.",
      badges: ["USHL Rookie of Year", "Providence Commit", "Fastest Skater"]
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
      badges: ["Top Ranked Goalie", "U18 Worlds Best Goalie", "Composed Puck Stopper"]
    }
  ];

  // 2. 32 NHL FRANCHISES & NEEDS MATRIX
  const NHL_TEAMS = [
    {
      id: "SJS",
      name: "San Jose Sharks",
      city: "San Jose",
      abbrev: "SJS",
      color: "#006d75",
      logo: "🦈",
      needs: ["1C Franchise Center", "Top-Pair RHD", "Puck-Moving D"],
      picks: [1, 33, 42],
      gm: "Mike Grier"
    },
    {
      id: "CHI",
      name: "Chicago Blackhawks",
      city: "Chicago",
      abbrev: "CHI",
      color: "#cf0a2c",
      logo: "🦅",
      needs: ["Top-Pair RHD", "Power Winger", "Dynamic Playmaker"],
      picks: [2, 18, 34],
      gm: "Kyle Davidson"
    },
    {
      id: "ANA",
      name: "Anaheim Ducks",
      city: "Anaheim",
      abbrev: "ANA",
      color: "#f47a38",
      logo: "🦆",
      needs: ["Elite Winger", "Right-Shot Defense", "Power Forward"],
      picks: [3, 35],
      gm: "Pat Verbeek"
    },
    {
      id: "CBJ",
      name: "Columbus Blue Jackets",
      city: "Columbus",
      abbrev: "CBJ",
      color: "#002654",
      logo: "⭐",
      needs: ["Top-Pair Defense", "Power Center", "Two-Way Wing"],
      picks: [4, 36],
      gm: "Don Waddell"
    },
    {
      id: "MTL",
      name: "Montreal Canadiens",
      city: "Montreal",
      abbrev: "MTL",
      color: "#af1e2d",
      logo: "🔴",
      needs: ["Dynamic Scoring Winger", "Big 200ft Center", "RHD Depth"],
      picks: [5, 26, 57],
      gm: "Kent Hughes"
    },
    {
      id: "UTA",
      name: "Utah Hockey Club",
      city: "Utah",
      abbrev: "UTA",
      color: "#010101",
      logo: "🏔️",
      needs: ["Top-4 Two-Way Defense", "Physical Scoring Wing", "Goaltender"],
      picks: [6, 38],
      gm: "Bill Armstrong"
    },
    {
      id: "OTT",
      name: "Ottawa Senators",
      city: "Ottawa",
      abbrev: "OTT",
      color: "#c52032",
      logo: "🛡️",
      needs: ["Right-Shot Defense", "Middle-6 Center", "Puck Mover"],
      picks: [7, 39],
      gm: "Steve Staios"
    },
    {
      id: "SEA",
      name: "Seattle Kraken",
      city: "Seattle",
      abbrev: "SEA",
      color: "#001628",
      logo: "🦑",
      needs: ["High-End Playmaker", "Offensive Defenseman", "Net-Front Scorer"],
      picks: [8, 40],
      gm: "Ron Francis"
    },
    {
      id: "CGY",
      name: "Calgary Flames",
      city: "Calgary",
      abbrev: "CGY",
      color: "#c8102e",
      logo: "🔥",
      needs: ["Franchise 1C", "Right-Shot Defense", "High-Skill Wing"],
      picks: [9, 28, 41],
      gm: "Craig Conroy"
    },
    {
      id: "NJD",
      name: "New Jersey Devils",
      city: "New Jersey",
      abbrev: "NJD",
      color: "#ce1126",
      logo: "😈",
      needs: ["Puck-Moving Defenseman", "Gritty Power Winger", "Goaltender Depth"],
      picks: [10, 44],
      gm: "Tom Fitzgerald"
    },
    {
      id: "BUF",
      name: "Buffalo Sabres",
      city: "Buffalo",
      abbrev: "BUF",
      color: "#002654",
      logo: "⚔️",
      needs: ["Two-Way Physical Center", "Top-4 Shutdown D", "Goalie"],
      picks: [11, 43],
      gm: "Kevyn Adams"
    },
    {
      id: "PHI",
      name: "Philadelphia Flyers",
      city: "Philadelphia",
      abbrev: "PHI",
      color: "#f74902",
      logo: "🟧",
      needs: ["1C Playmaker", "Top-Pair Defense", "Right-Shot Sniper"],
      picks: [12, 32, 37],
      gm: "Daniel Brière"
    },
    {
      id: "MIN",
      name: "Minnesota Wild",
      city: "Minnesota",
      abbrev: "MIN",
      color: "#154734",
      logo: "🌲",
      needs: ["Pure Goal Scoring Wing", "Two-Way Center", "Defense Depth"],
      picks: [13, 45],
      gm: "Bill Guerin"
    },
    {
      id: "SJS2",
      name: "San Jose Sharks (via PIT)",
      city: "San Jose",
      abbrev: "SJS",
      color: "#006d75",
      logo: "🦈",
      needs: ["Right-Shot Defense", "Speed Winger", "Defense Depth"],
      picks: [14],
      gm: "Mike Grier"
    },
    {
      id: "DET",
      name: "Detroit Red Wings",
      city: "Detroit",
      abbrev: "DET",
      color: "#ce1126",
      logo: "🐙",
      needs: ["Dynamic Scoring Winger", "Right-Shot Defense", "Net-Front Center"],
      picks: [15, 47],
      gm: "Steve Yzerman"
    },
    {
      id: "STL",
      name: "St. Louis Blues",
      city: "St. Louis",
      abbrev: "STL",
      color: "#002f87",
      logo: "🎷",
      needs: ["Top-Pair Defense", "Middle-6 Center", "Heavy Wing"],
      picks: [16, 48],
      gm: "Doug Armstrong"
    },
    {
      id: "WSH",
      name: "Washington Capitals",
      city: "Washington",
      abbrev: "WSH",
      color: "#041e42",
      logo: "🦅",
      needs: ["Scoring Center", "Power Winger", "Puck Mover"],
      picks: [17, 49],
      gm: "Brian MacLellan"
    },
    {
      id: "CHI2",
      name: "Chicago Blackhawks (via NYI)",
      city: "Chicago",
      abbrev: "CHI",
      color: "#cf0a2c",
      logo: "🦅",
      needs: ["Physical Forward", "Two-Way D", "Center Depth"],
      picks: [18],
      gm: "Kyle Davidson"
    },
    {
      id: "VGK",
      name: "Vegas Golden Knights",
      city: "Vegas",
      abbrev: "VGK",
      color: "#b4975a",
      logo: "⚔️",
      needs: ["High-Ceiling Winger", "Two-Way Center", "Goalie Prospect"],
      picks: [19, 51],
      gm: "Kelly McCrimmon"
    },
    {
      id: "NYI",
      name: "New York Islanders (via CHI)",
      city: "New York",
      abbrev: "NYI",
      color: "#00539b",
      logo: "🏝️",
      needs: ["Dynamic Winger", "Mobile Defenseman", "Center"],
      picks: [20, 50],
      gm: "Lou Lamoriello"
    },
    {
      id: "LAK",
      name: "Los Angeles Kings",
      city: "Los Angeles",
      abbrev: "LAK",
      color: "#111111",
      logo: "👑",
      needs: ["Left-Shot Defense", "Power Center", "Speed Wing"],
      picks: [21, 52],
      gm: "Rob Blake"
    },
    {
      id: "NSH",
      name: "Nashville Predators",
      city: "Nashville",
      abbrev: "NSH",
      color: "#ffb81c",
      logo: "🐱",
      needs: ["Offensive Center", "Puck-Moving Defense", "Scoring Wing"],
      picks: [22, 53],
      gm: "Barry Trotz"
    },
    {
      id: "TOR",
      name: "Toronto Maple Leafs",
      city: "Toronto",
      abbrev: "TOR",
      color: "#00205b",
      logo: "🍁",
      needs: ["Heavy Physical Defense", "Two-Way Center", "Goalie Depth"],
      picks: [23, 54],
      gm: "Brad Treliving"
    },
    {
      id: "COL",
      name: "Colorado Avalanche",
      city: "Colorado",
      abbrev: "COL",
      color: "#6f263d",
      logo: "🏔️",
      needs: ["Middle-6 Center", "Speed Winger", "Two-Way Defense"],
      picks: [24, 55],
      gm: "Chris MacFarland"
    },
    {
      id: "BOS",
      name: "Boston Bruins",
      city: "Boston",
      abbrev: "BOS",
      color: "#000000",
      logo: "🐻",
      needs: ["Top-6 Center", "Heavy Forward", "Right-Shot Defense"],
      picks: [25, 56],
      gm: "Don Sweeney"
    },
    {
      id: "MTL2",
      name: "Montreal Canadiens (via WPG)",
      city: "Montreal",
      abbrev: "MTL",
      color: "#af1e2d",
      logo: "🔴",
      needs: ["Right-Shot Defense", "Hard-Nosed Forward", "Goalie"],
      picks: [26],
      gm: "Kent Hughes"
    },
    {
      id: "CAR",
      name: "Carolina Hurricanes",
      city: "Carolina",
      abbrev: "CAR",
      color: "#cc0000",
      logo: "🌀",
      needs: ["Puck Possession Center", "Goal Scoring Winger", "Defense"],
      picks: [27, 59],
      gm: "Eric Tulsky"
    },
    {
      id: "CGY2",
      name: "Calgary Flames (via VAN)",
      city: "Calgary",
      abbrev: "CGY",
      color: "#c8102e",
      logo: "🔥",
      needs: ["Two-Way Center", "Puck-Moving Defense", "Wing Depth"],
      picks: [28],
      gm: "Craig Conroy"
    },
    {
      id: "DAL",
      name: "Dallas Stars",
      city: "Dallas",
      abbrev: "DAL",
      color: "#006847",
      logo: "⭐",
      needs: ["Right-Shot Defense", "Power Forward", "Center Depth"],
      picks: [29, 61],
      gm: "Jim Nill"
    },
    {
      id: "NYR",
      name: "New York Rangers",
      city: "New York",
      abbrev: "NYR",
      color: "#0038a8",
      logo: "🗽",
      needs: ["Center Depth", "Right-Shot Defense", "Speed Winger"],
      picks: [30, 62],
      gm: "Chris Drury"
    },
    {
      id: "ANA2",
      name: "Anaheim Ducks (via EDM)",
      city: "Anaheim",
      abbrev: "ANA",
      color: "#f47a38",
      logo: "🦆",
      needs: ["Two-Way Defense", "Physical Winger", "Center Depth"],
      picks: [31],
      gm: "Pat Verbeek"
    },
    {
      id: "PHI2",
      name: "Philadelphia Flyers (via FLA)",
      city: "Philadelphia",
      abbrev: "PHI",
      color: "#f74902",
      logo: "🟧",
      needs: ["Best Player Available", "Center", "Goaltender"],
      picks: [32],
      gm: "Daniel Brière"
    }
  ];

  // 3. EMPIRICAL DRAFT PICK VALUE CURVE (Hockey Value Curve)
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
    userTeamId: "SJS", // Default: San Jose Sharks (holds Pick #1)
    draftOrder: [], // 32 Round 1 slots
    draftLog: [], // Executed picks
    tradesMade: [],
    availableProspects: JSON.parse(JSON.stringify(DRAFT_PROSPECTS)),
    selectedProspect: DRAFT_PROSPECTS[0]
  };

  // Initialize Round 1 slots
  function initDraftOrder() {
    state.draftOrder = NHL_TEAMS.map((team, idx) => ({
      pickNum: idx + 1,
      round: 1,
      team: { ...team },
      originalTeam: { ...team },
      selection: null,
      timestamp: null
    }));
  }

  initDraftOrder();

  // 5. AI DRAFT SELECTION ALGORITHM
  function evaluatePickForTeam(team, prospectPool) {
    if (!prospectPool || prospectPool.length === 0) return null;

    const topCandidates = prospectPool.slice(0, 4);
    let bestCandidate = topCandidates[0];
    let highestScore = -1;

    topCandidates.forEach((cand, idx) => {
      let score = cand.trajectoryScore - (idx * 0.8);
      const needs = team.needs.join(' ').toLowerCase();

      if (cand.pos === 'RD' && (needs.includes('rhd') || needs.includes('right-shot defense'))) {
        score += 2.5;
      } else if (cand.pos === 'C' && (needs.includes('center') || needs.includes('1c'))) {
        score += 2.2;
      } else if ((cand.pos === 'LW' || cand.pos === 'RW') && (needs.includes('winger') || needs.includes('scoring wing'))) {
        score += 1.8;
      } else if (cand.pos === 'LD' && (needs.includes('defense') || needs.includes('puck-moving d'))) {
        score += 1.5;
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

  // 7. TRADE MACHINE ENGINE
  function evaluateTrade(userTeamAbbrev, partnerTeamAbbrev, userOfferedPicks, partnerOfferedPicks) {
    const userTeam = NHL_TEAMS.find(t => t.abbrev === userTeamAbbrev);
    const partnerTeam = NHL_TEAMS.find(t => t.abbrev === partnerTeamAbbrev);

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
        if (pNum <= 32) {
          const slot = state.draftOrder.find(s => s.pickNum === pNum);
          if (slot && !slot.selection) slot.team = { ...userTeam };
        }
      });

      userOfferedPicks.forEach(pNum => {
        if (pNum <= 32) {
          const slot = state.draftOrder.find(s => s.pickNum === pNum);
          if (slot && !slot.selection) slot.team = { ...partnerTeam };
        }
      });

      const tradeRecord = {
        id: `trade-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        teamA: userTeam.name,
        teamB: partnerTeam.name,
        teamASent: userOfferedPicks.map(p => `Pick #${p}`),
        teamBSent: partnerOfferedPicks.map(p => `Pick #${p}`),
        valueDelta: Math.round(valueDelta)
      };

      state.tradesMade.push(tradeRecord);

      return {
        accepted: true,
        trade: tradeRecord,
        userValue,
        partnerValue,
        reason: `${partnerTeam.gm} (${partnerTeam.name}) accepted the proposal! Received +${Math.round(valueDelta)} net value differential according to BlueLine Draft Pick Value Index.`
      };
    } else {
      return {
        accepted: false,
        userValue,
        partnerValue,
        deficit: Math.abs(Math.round(valueDelta)),
        reason: `${partnerTeam.gm} (${partnerTeam.name}) rejected the offer. Value deficit is ${Math.abs(Math.round(valueDelta))} pts below fair market value. Add an additional pick.`
      };
    }
  }

  // 8. WIRE BROADCAST INTEGRATION
  function broadcastDraftToWire(headline, customSummary) {
    const wireStateRaw = localStorage.getItem('blueline_social_state');
    const defaultState = { posts: [] };
    let wireState = wireStateRaw ? JSON.parse(wireStateRaw) : defaultState;

    const currentLeader = state.draftLog[0] ? `${state.draftLog[0].prospect.name} to ${state.draftLog[0].team.name}` : "Draft Simulator Active";
    const totalSelected = state.draftLog.length;

    const post = {
      id: `post-draft-${Date.now()}`,
      authorId: 'director-scouting',
      authorName: 'Director of Scouting',
      handle: '@blueline_scouting',
      role: 'recruiter',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verifiedBadge: 'verified-gold',
      timestamp: 'Just now',
      content: `🎯 **${headline || "WAR ROOM DISPATCH: NHL ENTRY DRAFT ROUND 1 SIMULATION"}**\n\n${customSummary || `The BlueLine Mock Draft Simulator completed ${totalSelected} selections. Top pick: ${currentLeader}. Trajectory metrics and feeder models validated by the BlueLine Scouting Bureau.`}\n\n#DraftRoom #NHLDraft #MockDraft #BlueLineDataWorks #ScoutingBureau`,
      likes: 42,
      reposts: 19,
      comments: 11,
      userLiked: false,
      userReposted: false,
      tags: ['#DraftRoom', '#NHLDraft', '#MockDraft', '#ScoutingBureau'],
      playerBadge: {
        name: "NHL Draft Simulator",
        team: "BlueLine War Room",
        pos: `Round 1 (${totalSelected}/32 Complete)`,
        stats: `Leader: ${currentLeader}`,
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
    DRAFT_PICK_VALUES,
    getPickValue,
    getState: () => state,
    makePick,
    simulateNextPick,
    simRound1,
    resetDraft,
    evaluateTrade,
    broadcastDraftToWire,
    setUserTeam: (teamId) => { state.userTeamId = teamId; },
    setSelectedProspect: (p) => { state.selectedProspect = p; }
  };

})(window);
