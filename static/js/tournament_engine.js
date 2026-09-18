/**
 * BlueLine DataWorks: AI Tournament Bracketology & Championship War Room Engine
 * 
 * Tournaments Supported:
 * 1. NCAA Men's Ice Hockey Frozen Four (16-Team National Bracket)
 * 2. USHL Clark Cup Playoffs (12-Team Tier 1 Junior Championship Tree)
 * 3. IIHF World Junior Championship (10-Nation U20 Showcase)
 * 4. CHL Memorial Cup (4-Team Major Junior Championship)
 * 
 * Enterprise Capabilities:
 * - Monte Carlo Simulation Engine (1,000 Rapid Tournament Simulations per Tournament)
 * - Elo & Goal-Expectancy Matchup Predictor
 * - Interactive Pick-by-Pick Bracket Trees for all 4 Tournaments
 * - Head-to-Head Prospect Showcase (linked to 2,974 Master Player Directory)
 * - The BlueLine Wire Broadcast Engine with #ClarkCup, #FrozenFour, #WorldJuniors, #MemorialCup
 */

(function(window) {
  "use strict";

  // ==========================================
  // 1. NCAA FROZEN FOUR (16 TEAMS)
  // ==========================================
  const NCAA_TEAMS = [
    {
      id: "bc",
      name: "Boston College",
      seed: 1,
      overallSeed: 1,
      region: "Northeast",
      logo: "🦅",
      conference: "Hockey East",
      record: "34-6-1",
      elo: 1680,
      offenseRating: 96,
      defenseRating: 92,
      goalieSvPct: ".926",
      goalieName: "Jacob Fowler",
      keyProspects: ["Will Smith", "Ryan Leonard", "Gabe Perreault", "Cutter Gauthier"],
      scoutingNote: "Historically dominant freshman scoring line. Relentless offensive puck possession with elite finishing."
    },
    {
      id: "bu",
      name: "Boston University",
      seed: 1,
      overallSeed: 2,
      region: "West",
      logo: "🐾",
      conference: "Hockey East",
      record: "28-10-2",
      elo: 1650,
      offenseRating: 95,
      defenseRating: 89,
      goalieSvPct: ".918",
      goalieName: "Mathieu Caron",
      keyProspects: ["Macklin Celebrini", "Cole Eiserman", "Tom Willander", "Lane Hutson"],
      scoutingNote: "Dynamic rush offense led by Hobey Baker winner Celebrini and elite transition blue-liner Lane Hutson."
    },
    {
      id: "denver",
      name: "Denver Pioneers",
      seed: 1,
      overallSeed: 3,
      region: "Midwest",
      logo: "🏔️",
      conference: "NCHC",
      record: "32-9-3",
      elo: 1660,
      offenseRating: 97,
      defenseRating: 88,
      goalieSvPct: ".920",
      goalieName: "Matt Davis",
      keyProspects: ["Zeev Buium", "Jack Devine", "Tristan Broz", "Massimo Rizzo"],
      scoutingNote: "Nation's #1 scoring offense. High-tempo puck support with dynamic playmaking from Zeev Buium."
    },
    {
      id: "msu",
      name: "Michigan State",
      seed: 1,
      overallSeed: 4,
      region: "East",
      logo: "⚔️",
      conference: "Big Ten",
      record: "25-10-3",
      elo: 1620,
      offenseRating: 90,
      defenseRating: 91,
      goalieSvPct: ".924",
      goalieName: "Trey Augustine",
      keyProspects: ["Artyom Levshunov", "Isaac Howard", "Red Savage"],
      scoutingNote: "Heavy, disciplined Big Ten champions anchored by franchise defenseman Levshunov and world junior gold medalist Augustine."
    },
    {
      id: "michigan",
      name: "Michigan Wolverines",
      seed: 3,
      overallSeed: 10,
      region: "Midwest",
      logo: "〽️",
      conference: "Big Ten",
      record: "23-15-3",
      elo: 1590,
      offenseRating: 93,
      defenseRating: 84,
      goalieSvPct: ".912",
      goalieName: "Jake Barczewski",
      keyProspects: ["Michael Hage", "Rutger McGroarty", "Gavin Brindley", "Frank Nazar"],
      scoutingNote: "Dangerous bracket buster with high-end NHL first-round talent that thrives in open-ice transition games."
    },
    {
      id: "und",
      name: "North Dakota",
      seed: 2,
      overallSeed: 5,
      region: "Midwest",
      logo: "🦅",
      conference: "NCHC",
      record: "26-12-2",
      elo: 1605,
      offenseRating: 89,
      defenseRating: 88,
      goalieSvPct: ".916",
      goalieName: "Ludvig Persson",
      keyProspects: ["Jackson Blake", "Cameron Berg", "Garrett Pyke"],
      scoutingNote: "Physical forecheck and heavy cycle game that wears down opponent defensive pairs."
    },
    {
      id: "minnesota",
      name: "Minnesota Golden Gophers",
      seed: 2,
      overallSeed: 6,
      region: "West",
      logo: "〽️",
      conference: "Big Ten",
      record: "23-11-5",
      elo: 1610,
      offenseRating: 91,
      defenseRating: 89,
      goalieSvPct: ".919",
      goalieName: "Justen Close",
      keyProspects: ["Jimmy Snuggerud", "Oliver Moore", "Sam Rinzel"],
      scoutingNote: "Elite pure speed on the wings led by Snuggerud and Blackhawks 1st-rounder Oliver Moore."
    },
    {
      id: "quinnipiac",
      name: "Quinnipiac Bobcats",
      seed: 2,
      overallSeed: 8,
      region: "East",
      logo: "😼",
      conference: "ECAC",
      record: "27-10-2",
      elo: 1600,
      offenseRating: 88,
      defenseRating: 93,
      goalieSvPct: ".921",
      goalieName: "Vinny Duplessis",
      keyProspects: ["Collin Graf", "Jacob Quillan", "Jayden Lee"],
      scoutingNote: "Defending 2023 National Champions. Unmatched defensive structure and neutral zone turnover generation."
    },
    {
      id: "wisconsin",
      name: "Wisconsin Badgers",
      seed: 2,
      overallSeed: 7,
      region: "East",
      logo: "🦡",
      conference: "Big Ten",
      record: "26-12-2",
      elo: 1595,
      offenseRating: 88,
      defenseRating: 91,
      goalieSvPct: ".928",
      goalieName: "Kyle McClellan",
      keyProspects: ["Cruz Lucius", "David Silye", "Charlie Stramel"],
      scoutingNote: "Mike Hastings coached revitalization. Mike Richter Award-winning goaltending from Kyle McClellan."
    },
    {
      id: "maine",
      name: "Maine Black Bears",
      seed: 2,
      overallSeed: 9,
      region: "Midwest",
      logo: "🐻",
      conference: "Hockey East",
      record: "23-12-2",
      elo: 1585,
      offenseRating: 90,
      defenseRating: 87,
      goalieSvPct: ".914",
      goalieName: "Albin Boija",
      keyProspects: ["Bradly Nadeau", "Josh Nadeau", "Donavan Villeneuve-Houle"],
      scoutingNote: "High-flying brother tandem Bradly and Josh Nadeau make Maine a nightmare matchup on the power play."
    },
    {
      id: "cornell",
      name: "Cornell Big Red",
      seed: 3,
      overallSeed: 12,
      region: "Midwest",
      logo: "🔴",
      conference: "ECAC",
      record: "22-7-6",
      elo: 1575,
      offenseRating: 83,
      defenseRating: 94,
      goalieSvPct: ".930",
      goalieName: "Ian Shane",
      keyProspects: ["Gabriel Seger", "Jonathan Castagna"],
      scoutingNote: "Hardest team in the nation to score against. Goalie Ian Shane allows under 1.70 goals per game."
    },
    {
      id: "wmu",
      name: "Western Michigan",
      seed: 3,
      overallSeed: 11,
      region: "Midwest",
      logo: "🐴",
      conference: "NCHC",
      record: "21-16-1",
      elo: 1560,
      offenseRating: 87,
      defenseRating: 85,
      goalieSvPct: ".910",
      goalieName: "Cameron Rowe",
      keyProspects: ["Luke Grainger", "Sam Colangelo"],
      scoutingNote: "Big, heavy, relentless physical team that creates net-front havoc."
    },
    {
      id: "umass",
      name: "Massachusetts Minutemen",
      seed: 4,
      overallSeed: 14,
      region: "Northeast",
      logo: "🚩",
      conference: "Hockey East",
      record: "20-14-3",
      elo: 1545,
      offenseRating: 84,
      defenseRating: 88,
      goalieSvPct: ".921",
      goalieName: "Michael Hrabal",
      keyProspects: ["Michael Hrabal", "Scott Morrow", "Kenny Connors"],
      scoutingNote: "6'7\" NHL prospect goalie Michael Hrabal can steal any single-elimination game."
    },
    {
      id: "omaha",
      name: "Omaha Mavericks",
      seed: 4,
      overallSeed: 13,
      region: "West",
      logo: "🐂",
      conference: "NCHC",
      record: "23-13-4",
      elo: 1550,
      offenseRating: 84,
      defenseRating: 87,
      goalieSvPct: ".920",
      goalieName: "Simon Latkoczy",
      keyProspects: ["Ty Mueller", "Jo Lemay"],
      scoutingNote: "Surging late in the season with disciplined defense and strong penalty kill."
    },
    {
      id: "rit",
      name: "RIT Tigers",
      seed: 4,
      overallSeed: 15,
      region: "West",
      logo: "🐯",
      conference: "Atlantic Hockey",
      record: "27-11-2",
      elo: 1510,
      offenseRating: 82,
      defenseRating: 85,
      goalieSvPct: ".925",
      goalieName: "Tommy Scarfone",
      keyProspects: ["Carter Wilkie", "Cody Monds", "Gianfranco Cassaro"],
      scoutingNote: "Atlantic Hockey champions. Veteran scoring punch with standout goaltender Tommy Scarfone."
    },
    {
      id: "mtu",
      name: "Michigan Tech",
      seed: 4,
      overallSeed: 16,
      region: "East",
      logo: "🐺",
      conference: "CCHA",
      record: "19-15-6",
      elo: 1495,
      offenseRating: 80,
      defenseRating: 86,
      goalieSvPct: ".923",
      goalieName: "Blake Pietila",
      keyProspects: ["Isaac Gordon", "Ryland Mosley"],
      scoutingNote: "CCHA tournament champions. Veteran goalie Blake Pietila has played 140+ collegiate games."
    }
  ];

  const NCAA_REGIONALS = [
    {
      region: "Northeast (Springfield, MA)",
      game1: { id: "ncaa_g1", round: "r16", teamA: "bc", teamB: "mtu" },
      game2: { id: "ncaa_g2", round: "r16", teamA: "und", teamB: "michigan" }
    },
    {
      region: "West (Sioux Falls, SD)",
      game1: { id: "ncaa_g3", round: "r16", teamA: "bu", teamB: "rit" },
      game2: { id: "ncaa_g4", round: "r16", teamA: "minnesota", teamB: "omaha" }
    },
    {
      region: "Midwest (Maryland Heights, MO)",
      game1: { id: "ncaa_g5", round: "r16", teamA: "denver", teamB: "umass" },
      game2: { id: "ncaa_g6", round: "r16", teamA: "maine", teamB: "cornell" }
    },
    {
      region: "East (Providence, RI)",
      game1: { id: "ncaa_g7", round: "r16", teamA: "msu", teamB: "wmu" },
      game2: { id: "ncaa_g8", round: "r16", teamA: "quinnipiac", teamB: "wisconsin" }
    }
  ];

  // ==========================================
  // 2. USHL CLARK CUP (12 TEAMS - TIER 1 JUNIOR)
  // ==========================================
  const USHL_TEAMS = [
    {
      id: "fargo",
      name: "Fargo Force",
      seed: 1,
      conference: "Western",
      logo: "⚡",
      record: "50-10-2",
      elo: 1690,
      offenseRating: 97,
      defenseRating: 95,
      goalieSvPct: ".923",
      goalieName: "Hampton Slukynsky",
      keyProspects: ["Mac Swanson", "Leo Gruba", "Zam Plante"],
      scoutingNote: "Historic 50-win Anderson Cup champions. Top USHL defense and USHL Player of the Year Mac Swanson."
    },
    {
      id: "dubuque",
      name: "Dubuque Fighting Saints",
      seed: 1,
      conference: "Eastern",
      logo: "⚜️",
      record: "41-13-8",
      elo: 1660,
      offenseRating: 95,
      defenseRating: 91,
      goalieSvPct: ".918",
      goalieName: "Kevin Reidler",
      keyProspects: ["Noah Powell", "Erik Pahlsson", "Juraj Pekarcik"],
      scoutingNote: "Eastern Conference champions. USHL leading goal scorer Noah Powell (39 goals) powers the power play."
    },
    {
      id: "muskegon",
      name: "Muskegon Lumberjacks",
      seed: 2,
      conference: "Eastern",
      logo: "🪓",
      record: "38-22-2",
      elo: 1630,
      offenseRating: 93,
      defenseRating: 88,
      goalieSvPct: ".914",
      goalieName: "Shikhabutdin Gadzhiev",
      keyProspects: ["Sacha Boisvert", "Matvei Gridin"],
      scoutingNote: "Dynamic twin offensive threats Sacha Boisvert and USHL scoring leader Matvei Gridin."
    },
    {
      id: "siouxcity",
      name: "Sioux City Musketeers",
      seed: 2,
      conference: "Western",
      logo: "⚔️",
      record: "34-22-6",
      elo: 1620,
      offenseRating: 90,
      defenseRating: 89,
      goalieSvPct: ".915",
      goalieName: "Samuel Urban",
      keyProspects: ["Kaden Shahan", "Brian Nicholas"],
      scoutingNote: "Well-balanced Tier 1 squad with strong home-ice advantage at the Tyson Events Center."
    },
    {
      id: "greenbay",
      name: "Green Bay Gamblers",
      seed: 3,
      conference: "Eastern",
      logo: "🎲",
      record: "34-18-10",
      elo: 1610,
      offenseRating: 91,
      defenseRating: 88,
      goalieSvPct: ".916",
      goalieName: "Adam Gajan",
      keyProspects: ["Julian Lutz", "Levshunov Alumnus"],
      scoutingNote: "World Junior best goalie Adam Gajan anchors a fast-skating counter-attacking group."
    },
    {
      id: "waterloo",
      name: "Waterloo Black Hawks",
      seed: 3,
      conference: "Western",
      logo: "🦅",
      record: "35-25-2",
      elo: 1600,
      offenseRating: 89,
      defenseRating: 88,
      goalieSvPct: ".912",
      goalieName: "Jack Spicer",
      keyProspects: ["John Mustard", "Gavyn Thoreson"],
      scoutingNote: "Rookie of the Year John Mustard's blistering north-south speed causes matchup problems."
    },
    {
      id: "youngstown",
      name: "Youngstown Phantoms",
      seed: 4,
      conference: "Eastern",
      logo: "👻",
      record: "33-19-10",
      elo: 1590,
      offenseRating: 87,
      defenseRating: 92,
      goalieSvPct: ".920",
      goalieName: "Colin Winn",
      keyProspects: ["Andrew Strathmann", "Kuzma Voronin"],
      scoutingNote: "Defending Clark Cup champions. Heavy defensive posture and outstanding penalty kill."
    },
    {
      id: "tricity",
      name: "Tri-City Storm",
      seed: 4,
      conference: "Western",
      logo: "🌪️",
      record: "28-23-11",
      elo: 1580,
      offenseRating: 88,
      defenseRating: 87,
      goalieSvPct: ".910",
      goalieName: "Cameron Korpi",
      keyProspects: ["Trevor Connelly", "Artemi Nizameyev"],
      scoutingNote: "Led by top NHL first-round prospect Trevor Connelly's elite dynamic puck skills."
    },
    {
      id: "madison",
      name: "Madison Capitols",
      seed: 5,
      conference: "Eastern",
      logo: "🏛️",
      record: "33-23-6",
      elo: 1570,
      offenseRating: 88,
      defenseRating: 86,
      goalieSvPct: ".910",
      goalieName: "Patriks Berzins",
      keyProspects: ["Austin Burnevik", "James Hong"],
      scoutingNote: "High-scoring winger Austin Burnevik (40 goals) leads a potent power play."
    },
    {
      id: "siouxfalls",
      name: "Sioux Falls Stampede",
      seed: 5,
      conference: "Western",
      logo: "🦬",
      record: "28-28-6",
      elo: 1550,
      offenseRating: 85,
      defenseRating: 86,
      goalieSvPct: ".908",
      goalieName: "Christian Manz",
      keyProspects: ["Chris Pelosi", "Jaksen Panzer"],
      scoutingNote: "Disciplined checking group that plays physical in the corners and slot."
    },
    {
      id: "chicagosteel",
      name: "Chicago Steel",
      seed: 6,
      conference: "Eastern",
      logo: "⚙️",
      record: "27-28-7",
      elo: 1560,
      offenseRating: 89,
      defenseRating: 83,
      goalieSvPct: ".905",
      goalieName: "Christian Sbaraglia",
      keyProspects: ["Michael Hage Alumnus", "Charlie Pardue"],
      scoutingNote: "Premier developmental powerhouse. High-possession model with relentless offensive innovation."
    },
    {
      id: "lincoln",
      name: "Lincoln Stars",
      seed: 6,
      conference: "Western",
      logo: "⭐",
      record: "27-30-5",
      elo: 1540,
      offenseRating: 84,
      defenseRating: 85,
      goalieSvPct: ".906",
      goalieName: "Yan Shostak",
      keyProspects: ["Tanner Henricks", "Blake Montgomery"],
      scoutingNote: "Hard-nosed, tough-to-play-against underdog with nothing to lose."
    }
  ];

  const USHL_PLAYOFFS = {
    eastern: {
      name: "Eastern Conference",
      round1: [
        { id: "ushl_e_r1_1", match: "East First Round", teamA: "greenbay", teamB: "chicagosteel", note: "#3 Green Bay vs #6 Chicago Steel (Best of 3)" },
        { id: "ushl_e_r1_2", match: "East First Round", teamA: "youngstown", teamB: "madison", note: "#4 Youngstown vs #5 Madison (Best of 3)" }
      ],
      semis: [
        { id: "ushl_e_semi_1", match: "East Semifinal 1", teamA: "dubuque", teamB: "madison", note: "#1 Dubuque vs lowest remaining seed" },
        { id: "ushl_e_semi_2", match: "East Semifinal 2", teamA: "muskegon", teamB: "greenbay", note: "#2 Muskegon vs highest remaining seed" }
      ],
      final: { id: "ushl_e_final", match: "Eastern Conference Final", teamA: "dubuque", teamB: "muskegon", note: "Winner advances to Clark Cup Final" }
    },
    western: {
      name: "Western Conference",
      round1: [
        { id: "ushl_w_r1_1", match: "West First Round", teamA: "waterloo", teamB: "lincoln", note: "#3 Waterloo vs #6 Lincoln (Best of 3)" },
        { id: "ushl_w_r1_2", match: "West First Round", teamA: "tricity", teamB: "siouxfalls", note: "#4 Tri-City vs #5 Sioux Falls (Best of 3)" }
      ],
      semis: [
        { id: "ushl_w_semi_1", match: "West Semifinal 1", teamA: "fargo", teamB: "siouxfalls", note: "#1 Fargo Force vs lowest remaining seed" },
        { id: "ushl_w_semi_2", match: "West Semifinal 2", teamA: "siouxcity", teamB: "waterloo", note: "#2 Sioux City vs highest remaining seed" }
      ],
      final: { id: "ushl_w_final", match: "Western Conference Final", teamA: "fargo", teamB: "siouxcity", note: "Winner advances to Clark Cup Final" }
    },
    championship: {
      id: "ushl_clark_cup_final",
      title: "USHL Clark Cup Championship Final",
      teamA: "fargo",
      teamB: "dubuque",
      note: "Best-of-5 Series • Anderson Cup Champion vs Eastern Powerhouse"
    }
  };

  // ==========================================
  // 3. IIHF WORLD JUNIOR CHAMPIONSHIP (10 NATIONS)
  // ==========================================
  const WJC_TEAMS = [
    {
      id: "usa",
      name: "United States",
      seed: 1,
      conference: "Group A",
      logo: "🇺🇸",
      record: "7-0-0",
      elo: 1710,
      offenseRating: 98,
      defenseRating: 94,
      goalieSvPct: ".936",
      goalieName: "Trey Augustine",
      keyProspects: ["Will Smith", "Cutter Gauthier", "Gabe Perreault", "Ryan Leonard"],
      scoutingNote: "Gold medal champions. Nation-leading forward depth with tournament-leading special teams."
    },
    {
      id: "canada",
      name: "Canada",
      seed: 1,
      conference: "Group B",
      logo: "🇨🇦",
      record: "5-2-0",
      elo: 1695,
      offenseRating: 96,
      defenseRating: 91,
      goalieSvPct: ".920",
      goalieName: "Mathis Rousseau",
      keyProspects: ["Macklin Celebrini", "Denton Mateychuk", "Matthew Poitras"],
      scoutingNote: "Celebrini led tournament scoring as a 17-year-old draft-eligible phenom."
    },
    {
      id: "sweden",
      name: "Sweden",
      seed: 2,
      conference: "Group B",
      logo: "🇸🇪",
      record: "5-2-0",
      elo: 1675,
      offenseRating: 93,
      defenseRating: 95,
      goalieSvPct: ".930",
      goalieName: "Hugo Havelid",
      keyProspects: ["Jonathan Lekkerimaki", "Axel Sandin Pellikka", "Noah Ostlund"],
      scoutingNote: "Silver medalists on home ice. Elite blue line led by Sandin Pellikka and tournament MVP Lekkerimaki."
    },
    {
      id: "czechia",
      name: "Czechia",
      seed: 2,
      conference: "Group A",
      logo: "🇨🇿",
      record: "4-3-0",
      elo: 1640,
      offenseRating: 91,
      defenseRating: 89,
      goalieSvPct: ".924",
      goalieName: "Michael Hrabal",
      keyProspects: ["Jiri Kulich", "Eduard Sale", "Ondrej Becher"],
      scoutingNote: "Bronze medalists with legendary comeback over Finland. Kulich's one-timer is lethal from the right dot."
    },
    {
      id: "finland",
      name: "Finland",
      seed: 3,
      conference: "Group A",
      logo: "🇫🇮",
      record: "3-4-0",
      elo: 1630,
      offenseRating: 88,
      defenseRating: 90,
      goalieSvPct: ".918",
      goalieName: "Niklas Kokko",
      keyProspects: ["Konsta Helenius", "Jani Nyman", "Kasper Halttunen"],
      scoutingNote: "Disciplined European trapping system with dangerous top-six scoring talent."
    },
    {
      id: "slovakia",
      name: "Slovakia",
      seed: 3,
      conference: "Group B",
      logo: "🇸🇰",
      record: "3-3-0",
      elo: 1610,
      offenseRating: 90,
      defenseRating: 86,
      goalieSvPct: ".920",
      goalieName: "Adam Gajan",
      keyProspects: ["Dalibor Dvorsky", "Filip Mesar", "Servac Petrovsky"],
      scoutingNote: "High-octane forward group led by St. Louis Blues 1st rounder Dalibor Dvorsky."
    },
    {
      id: "switzerland",
      name: "Switzerland",
      seed: 4,
      conference: "Group A",
      logo: "🇨🇭",
      record: "1-4-0",
      elo: 1540,
      offenseRating: 83,
      defenseRating: 86,
      goalieSvPct: ".910",
      goalieName: "Alessio Beglieri",
      keyProspects: ["Rodwin Dionicio", "Daniil Ustinkov"],
      scoutingNote: "Physical, structured game designed to disrupt high-tempo offenses."
    },
    {
      id: "germany",
      name: "Germany",
      seed: 4,
      conference: "Group B",
      logo: "🇩🇪",
      record: "1-4-0",
      elo: 1530,
      offenseRating: 82,
      defenseRating: 85,
      goalieSvPct: ".908",
      goalieName: "Philipp Dietl",
      keyProspects: ["Julian Lutz", "Kevin Bicker"],
      scoutingNote: "Earned historic upset over Finland in preliminary round with gritty goaltending."
    },
    {
      id: "latvia",
      name: "Latvia",
      seed: 5,
      conference: "Group A",
      logo: "🇱🇻",
      record: "1-4-0",
      elo: 1510,
      offenseRating: 80,
      defenseRating: 86,
      goalieSvPct: ".915",
      goalieName: "Deivs Rolovs",
      keyProspects: ["Dans Locmelis", "Eriks Mateiko"],
      scoutingNote: "High-intensity checking game that pushes powerhouses to the brink."
    },
    {
      id: "norway",
      name: "Norway",
      seed: 5,
      conference: "Group B",
      logo: "🇳🇴",
      record: "0-5-0",
      elo: 1480,
      offenseRating: 78,
      defenseRating: 84,
      goalieSvPct: ".902",
      goalieName: "Markus Stensrud",
      keyProspects: ["Michael Brandsegg-Nygard", "Stian Solberg"],
      scoutingNote: "Two 2024 first-round NHL draft picks Brandsegg-Nygard and Solberg made Norway tough to break down."
    }
  ];

  const WJC_PLAYOFFS = {
    quarterfinals: [
      { id: "wjc_qf1", match: "Quarterfinal 1", teamA: "usa", teamB: "germany", note: "1A vs 4B • Gothenburg, Sweden" },
      { id: "wjc_qf2", match: "Quarterfinal 2", teamA: "sweden", teamB: "finland", note: "2B vs 3A • Nordic Rivalry" },
      { id: "wjc_qf3", match: "Quarterfinal 3", teamA: "canada", teamB: "switzerland", note: "1B vs 4A • Scandinavium" },
      { id: "wjc_qf4", match: "Quarterfinal 4", teamA: "czechia", teamB: "slovakia", note: "2A vs 3B • Central European Clash" }
    ],
    semifinals: [
      { id: "wjc_sf1", match: "World Junior Semifinal 1", teamA: "usa", teamB: "czechia", note: "Scandinavium Arena" },
      { id: "wjc_sf2", match: "World Junior Semifinal 2", teamA: "sweden", teamB: "canada", note: "Scandinavium Arena" }
    ],
    goldMedal: {
      id: "wjc_gold",
      title: "IIHF World Junior Gold Medal Game",
      teamA: "usa",
      teamB: "sweden",
      note: "Host Nation Sweden vs Undefeated Team USA"
    }
  };

  // ==========================================
  // 4. CHL MEMORIAL CUP (4 TEAMS)
  // ==========================================
  const MEMORIAL_TEAMS = [
    {
      id: "saginaw",
      name: "Saginaw Spirit",
      seed: 1,
      conference: "OHL Host",
      logo: "🦅",
      record: "50-16-2",
      elo: 1680,
      offenseRating: 96,
      defenseRating: 92,
      goalieSvPct: ".918",
      goalieName: "Andrew Oke",
      keyProspects: ["Zayne Parekh", "Michael Misa", "Owen Beck"],
      scoutingNote: "Memorial Cup champions on home ice. Led by 96-point defenseman Zayne Parekh and MVP Owen Beck."
    },
    {
      id: "london",
      name: "London Knights",
      seed: 2,
      conference: "OHL Champions",
      logo: "⚔️",
      record: "50-14-4",
      elo: 1675,
      offenseRating: 95,
      defenseRating: 94,
      goalieSvPct: ".920",
      goalieName: "Michael Simpson",
      keyProspects: ["Easton Cowan", "Denver Barkey", "Sam Dickinson"],
      scoutingNote: "Dale Hunter coached powerhouse. 36-game point streak by Easton Cowan was CHL history."
    },
    {
      id: "moosejaw",
      name: "Moose Jaw Warriors",
      seed: 3,
      conference: "WHL Champions",
      logo: "🪓",
      record: "44-21-3",
      elo: 1660,
      offenseRating: 94,
      defenseRating: 90,
      goalieSvPct: ".915",
      goalieName: "Jackson Unger",
      keyProspects: ["Denton Mateychuk", "Jagger Firkus", "Brayden Yager"],
      scoutingNote: "CHL scoring champion Jagger Firkus and WHL playoff MVP Denton Mateychuk."
    },
    {
      id: "drummondville",
      name: "Drummondville Voltigeurs",
      seed: 4,
      conference: "QMJHL Champions",
      logo: "🔴",
      record: "48-14-6",
      elo: 1630,
      offenseRating: 91,
      defenseRating: 90,
      goalieSvPct: ".917",
      goalieName: "Riley Mercer",
      keyProspects: ["Ethan Gauthier", "Peter Repcik", "Mikael Diotte"],
      scoutingNote: "Dominant QMJHL postseason sweep with relentless physical forecheck."
    }
  ];

  const MEMORIAL_PLAYOFFS = {
    semifinal: {
      id: "mem_semi",
      title: "CHL Memorial Cup Semifinal (#2 vs #3)",
      teamA: "saginaw",
      teamB: "moosejaw",
      note: "Winner advances to face London Knights in Final"
    },
    championship: {
      id: "mem_final",
      title: "CHL Memorial Cup National Championship",
      teamA: "saginaw",
      teamB: "london",
      note: "Dow Event Center • Saginaw, Michigan"
    }
  };

  // ==========================================
  // 5. MSHSL BOYS STATE TOURNAMENT (CLASS AA - 8 TEAMS)
  // "The Tourney" - St. Paul, MN (Xcel Energy Center)
  // ==========================================
  const MSHSL_TEAMS = [
    {
      id: "edina",
      name: "Edina Hornets",
      seed: 1,
      conference: "Lake Conference / Section 6AA",
      logo: "🐝",
      record: "26-4-1",
      elo: 1640,
      offenseRating: 95,
      defenseRating: 92,
      goalieSvPct: ".928",
      goalieName: "Joe Bertram",
      keyProspects: ["Jackson Nevers", "Bobby Cowan", "Barrett Dexheimer"],
      scoutingNote: "Defending Class AA State Champions. Relentless 3-line puck pursuit and lockdown defensive zone exits."
    },
    {
      id: "minnetonka",
      name: "Minnetonka Skippers",
      seed: 2,
      conference: "Lake Conference / Section 2AA",
      logo: "⚓",
      record: "25-3-2",
      elo: 1630,
      offenseRating: 94,
      defenseRating: 93,
      goalieSvPct: ".931",
      goalieName: "Hunter Bauer",
      keyProspects: ["Hagen Burrows", "Javon Moore", "John Stout"],
      scoutingNote: "Mr. Hockey winner Hagen Burrows leads an explosive, heavy offensive core with unmatched neutral zone speed."
    },
    {
      id: "wayzata",
      name: "Wayzata Trojans",
      seed: 3,
      conference: "Lake Conference / Section 6AA",
      logo: "🛡️",
      record: "23-6-2",
      elo: 1610,
      offenseRating: 91,
      defenseRating: 90,
      goalieSvPct: ".922",
      goalieName: "Evan Turek",
      keyProspects: ["Rhys Wallin", "Cade De St. Phalle", "Hawke Huff"],
      scoutingNote: "Stifling team structure under Pat O'Leary. Masterful at counter-attacking off opponent turnovers."
    },
    {
      id: "hermantown",
      name: "Hermantown Hawks",
      seed: 4,
      conference: "Lake Superior / Section 7AA",
      logo: "🦅",
      record: "21-8-2",
      elo: 1600,
      offenseRating: 90,
      defenseRating: 89,
      goalieSvPct: ".924",
      goalieName: "Dane Callaway",
      keyProspects: ["River Freeman", "AJ Francisco", "Henry Peterson"],
      scoutingNote: "Legendary northern Minnesota pride. Physical board battles and relentless forecheck that wears out suburban powers."
    },
    {
      id: "moorhead",
      name: "Moorhead Spuds",
      seed: 5,
      conference: "Mariucci / Section 8AA",
      logo: "🥔",
      record: "20-9-1",
      elo: 1590,
      offenseRating: 89,
      defenseRating: 88,
      goalieSvPct: ".918",
      goalieName: "Kai Weigel",
      keyProspects: ["Mason Kraft", "Tyden Bergeson", "Brooks Cullen"],
      scoutingNote: "Heavy Section 8 champions. Deep defense corps with heavy point shots and high-percentage cycle play."
    },
    {
      id: "hillmurray",
      name: "Hill-Murray Pioneers",
      seed: 6,
      conference: "Metro East / Section 4AA",
      logo: "🟢",
      record: "19-10-2",
      elo: 1585,
      offenseRating: 88,
      defenseRating: 89,
      goalieSvPct: ".925",
      goalieName: "Grace Sneddon",
      keyProspects: ["Boden Sampair", "Simon Seidl", "Landon Cottingham"],
      scoutingNote: "Bill Lechner coached tradition of playoff excellence. Disciplined backchecking and clutch special teams."
    },
    {
      id: "edenprairie",
      name: "Eden Prairie Eagles",
      seed: 7,
      conference: "Lake Conference / Section 2AA",
      logo: "🦅",
      record: "18-10-3",
      elo: 1575,
      offenseRating: 87,
      defenseRating: 87,
      goalieSvPct: ".915",
      goalieName: "Isaiah Paulnock",
      keyProspects: ["Mason Moe", "Cole Saterdalen", "Nick Wiest"],
      scoutingNote: "Speed-driven transition team capable of knocking off any #1 seed in an open-ice shootout."
    },
    {
      id: "stthomas",
      name: "St. Thomas Academy",
      seed: 8,
      conference: "Independent / Section 3AA",
      logo: "⚔️",
      record: "17-11-2",
      elo: 1570,
      offenseRating: 86,
      defenseRating: 88,
      goalieSvPct: ".920",
      goalieName: "Cody Niesen",
      keyProspects: ["Sam Crane", "Brody Dietz", "Lucas Mann"],
      scoutingNote: "Cadet discipline and defensive tenacity. Exceptional penalty kill and shot-blocking willingness."
    }
  ];

  const MSHSL_PLAYOFFS = {
    quarterfinals: [
      { id: "mshsl_qf1", match: "Class AA Quarterfinal 1", teamA: "edina", teamB: "stthomas", session: "Day Session", note: "#1 Edina vs #8 St. Thomas Academy • Xcel Energy Center" },
      { id: "mshsl_qf2", match: "Class AA Quarterfinal 2", teamA: "hermantown", teamB: "moorhead", session: "Day Session", note: "#4 Hermantown vs #5 Moorhead • Northern Clash" },
      { id: "mshsl_qf3", match: "Class AA Quarterfinal 3", teamA: "minnetonka", teamB: "edenprairie", session: "Night Session", note: "#2 Minnetonka vs #7 Eden Prairie • Lake Conf Rivalry" },
      { id: "mshsl_qf4", match: "Class AA Quarterfinal 4", teamA: "wayzata", teamB: "hillmurray", session: "Night Session", note: "#3 Wayzata vs #6 Hill-Murray • Section 6AA vs 4AA" }
    ],
    semifinals: [
      { id: "mshsl_sf1", match: "Class AA Semifinal 1", teamA: "edina", teamB: "hermantown", note: "Semifinal Friday • 18,000+ Fans at The X" },
      { id: "mshsl_sf2", match: "Class AA Semifinal 2", teamA: "minnetonka", teamB: "wayzata", note: "Semifinal Friday • Lake Conference Showdown" }
    ],
    championship: {
      id: "mshsl_final",
      title: "MSHSL Class AA State Championship",
      teamA: "edina",
      teamB: "minnetonka",
      note: "Championship Saturday • Xcel Energy Center, Saint Paul, MN"
    }
  };

  // ==========================================
  // 6. NEPSAC MARTIN / EARL ELITE 8 (8 TEAMS)
  // New England Prep School Championship
  // ==========================================
  const NEPSAC_TEAMS = [
    {
      id: "avon",
      name: "Avon Old Farms",
      seed: 1,
      conference: "Founder's League",
      logo: "🦫",
      record: "24-2-2",
      elo: 1650,
      offenseRating: 96,
      defenseRating: 93,
      goalieSvPct: ".934",
      goalieName: "Kyle Ozgun",
      keyProspects: ["Joe Connor", "Alex Bales", "Charlie Gollob"],
      scoutingNote: "John Gardner's Winged Beavers. The undisputed benchmark of New England prep hockey with deep junior commitments."
    },
    {
      id: "salisbury",
      name: "Salisbury Crimson Knights",
      seed: 2,
      conference: "Western NE Prep",
      logo: "⚔️",
      record: "22-4-3",
      elo: 1640,
      offenseRating: 94,
      defenseRating: 94,
      goalieSvPct: ".930",
      goalieName: "Matt Wright",
      keyProspects: ["Ty Higgins", "Jared Mangan", "Nolan McElhaney"],
      scoutingNote: "Physical, structured, relentless 200-foot team. Suffocates opposing top lines in the neutral zone."
    },
    {
      id: "shattuck",
      name: "Shattuck-St. Mary's",
      seed: 3,
      conference: "National Prep Showcase",
      logo: "🦅",
      record: "38-6-4",
      elo: 1660,
      offenseRating: 97,
      defenseRating: 91,
      goalieSvPct: ".926",
      goalieName: "Harrison Boettiger",
      keyProspects: ["Ryker Lee", "Will Zellers", "Aidan Park"],
      scoutingNote: "Elite national prep academy. Has produced more 1st round NHL draft talent than any scholastic institution in North America."
    },
    {
      id: "kua",
      name: "Kimball Union Wildcats",
      seed: 4,
      conference: "Lakes Region",
      logo: "🐱",
      record: "23-6-1",
      elo: 1625,
      offenseRating: 93,
      defenseRating: 89,
      goalieSvPct: ".923",
      goalieName: "Blake McMeniman",
      keyProspects: ["Sam LeDrew", "Corwith Simmers", "Jack Sadowski"],
      scoutingNote: "High-octane scoring powerhouse in New Hampshire with dynamic transition skill and power play efficiency."
    },
    {
      id: "belmont",
      name: "Belmont Hill Sextants",
      seed: 5,
      conference: "Independent School League",
      logo: "⚓",
      record: "20-7-3",
      elo: 1615,
      offenseRating: 90,
      defenseRating: 91,
      goalieSvPct: ".928",
      goalieName: "Keagin Wilson",
      keyProspects: ["Brock Cummings", "Jake McManus", "Dane Carter"],
      scoutingNote: "ISL champions with relentless work ethic, disciplined defensive backchecking, and tactical poise."
    },
    {
      id: "cushing",
      name: "Cushing Academy Penguins",
      seed: 6,
      conference: "Central Mass Prep",
      logo: "🐧",
      record: "21-8-2",
      elo: 1610,
      offenseRating: 92,
      defenseRating: 88,
      goalieSvPct: ".921",
      goalieName: "Cooper Rautenstrauch",
      keyProspects: ["Landan Resendes", "Emerson Marshall", "AJ Sacco"],
      scoutingNote: "Speed-oriented lineup with dynamic rush playmakers and aggressive pinches from the blue line."
    },
    {
      id: "dexter",
      name: "Dexter Southfield Shield",
      seed: 7,
      conference: "Independent Prep",
      logo: "🛡️",
      record: "19-8-4",
      elo: 1600,
      offenseRating: 89,
      defenseRating: 89,
      goalieSvPct: ".920",
      goalieName: "Colin Davis",
      keyProspects: ["Sean Keohane", "Cullen Emery", "Jonathan Lanza"],
      scoutingNote: "Hard-nosed Boston-area program that thrives on physical board play and punishing transition counter-attacks."
    },
    {
      id: "stsebs",
      name: "St. Sebastian's Arrows",
      seed: 8,
      conference: "Independent School League",
      logo: "🏹",
      record: "18-9-3",
      elo: 1590,
      offenseRating: 88,
      defenseRating: 88,
      goalieSvPct: ".919",
      goalieName: "Pelle Russo",
      keyProspects: ["Teddy Mutryn", "Casey Mutryn", "Brendan Gorman"],
      scoutingNote: "Storied ISL institution with high hockey IQ, puck control, and exceptional special teams execution."
    }
  ];

  const NEPSAC_PLAYOFFS = {
    quarterfinals: [
      { id: "nepsac_qf1", match: "NEPSAC Quarterfinal 1", teamA: "avon", teamB: "stsebs", note: "#1 Avon Old Farms vs #8 St. Sebastian's" },
      { id: "nepsac_qf2", match: "NEPSAC Quarterfinal 2", teamA: "kua", teamB: "belmont", note: "#4 Kimball Union vs #5 Belmont Hill" },
      { id: "nepsac_qf3", match: "NEPSAC Quarterfinal 3", teamA: "shattuck", teamB: "cushing", note: "#3 Shattuck-St. Mary's vs #6 Cushing Academy" },
      { id: "nepsac_qf4", match: "NEPSAC Quarterfinal 4", teamA: "salisbury", teamB: "dexter", note: "#2 Salisbury vs #7 Dexter Southfield" }
    ],
    semifinals: [
      { id: "nepsac_sf1", match: "NEPSAC Semifinal 1", teamA: "avon", teamB: "kua", note: "Semifinal Saturday • Campus Sites" },
      { id: "nepsac_sf2", match: "NEPSAC Semifinal 2", teamA: "shattuck", teamB: "salisbury", note: "Semifinal Saturday • Elite 8 Heavyweight Clash" }
    ],
    championship: {
      id: "nepsac_final",
      title: "NEPSAC Martin / Earl Elite 8 Championship",
      teamA: "avon",
      teamB: "shattuck",
      note: "Championship Sunday • New England Prep Showcase"
    }
  };

  // Master Tournament Directory
  const TOURNAMENTS = {
    ncaa: {
      id: "ncaa",
      name: "NCAA Men's Frozen Four",
      tagline: "16-Team National Collegiate Bracket",
      trophy: "🏆",
      teams: NCAA_TEAMS,
      regionals: NCAA_REGIONALS
    },
    ushl: {
      id: "ushl",
      name: "USHL Clark Cup Playoffs",
      tagline: "12-Team Tier 1 Junior Championship Tree",
      trophy: "🛡️",
      teams: USHL_TEAMS,
      playoffs: USHL_PLAYOFFS
    },
    wjc: {
      id: "wjc",
      name: "IIHF World Junior Championship (U20)",
      tagline: "10-Nation Global Under-20 Showcase",
      trophy: "🥇",
      teams: WJC_TEAMS,
      playoffs: WJC_PLAYOFFS
    },
    memorial: {
      id: "memorial",
      name: "CHL Memorial Cup",
      tagline: "4-Team Major Junior Champions Showdown",
      trophy: "🍁",
      teams: MEMORIAL_TEAMS,
      playoffs: MEMORIAL_PLAYOFFS
    },
    mshsl: {
      id: "mshsl",
      name: "MSHSL Class AA State Tournament",
      tagline: "8-Team Minnesota High School Championship ('The Tourney')",
      trophy: "🌲",
      teams: MSHSL_TEAMS,
      playoffs: MSHSL_PLAYOFFS
    },
    nepsac: {
      id: "nepsac",
      name: "NEPSAC Elite 8 Prep Championship",
      tagline: "8-Team New England Prep School Championship",
      trophy: "🏛️",
      teams: NEPSAC_TEAMS,
      playoffs: NEPSAC_PLAYOFFS
    }
  };

  // ==========================================
  // 5. SIMULATION & PROBABILITY ENGINE
  // ==========================================
  function getWinProbability(teamA, teamB) {
    if (!teamA || !teamB) return 0.5;
    const eloDiff = teamA.elo - teamB.elo;
    return 1 / (1 + Math.pow(10, -eloDiff / 400));
  }

  function simulateGame(teamA, teamB) {
    const probA = getWinProbability(teamA, teamB);
    const rand = Math.random();
    const winner = rand < probA ? teamA : teamB;
    const loser = winner === teamA ? teamB : teamA;

    const goalsWinner = Math.floor(Math.random() * 3) + 3;
    const goalsLoser = Math.max(0, goalsWinner - Math.floor(Math.random() * 3) - 1);
    const isOT = goalsWinner === goalsLoser + 1 && Math.random() < 0.25;

    return {
      winner: winner,
      loser: loser,
      scoreWinner: goalsWinner,
      scoreLoser: goalsLoser,
      scoreStr: `${goalsWinner} - ${goalsLoser}${isOT ? " (OT)" : ""}`,
      isOT: isOT
    };
  }

  // 1,000-Iteration Monte Carlo Engine for Any Tournament
  function runMonteCarloSimulations(tournamentType = "ncaa", numSims = 1000) {
    const tourney = TOURNAMENTS[tournamentType] || TOURNAMENTS.ncaa;
    const teams = tourney.teams;

    const stats = {};
    teams.forEach(t => {
      stats[t.id] = {
        team: t,
        round1Wins: 0,
        semiWins: 0,
        champWins: 0
      };
    });

    for (let sim = 0; sim < numSims; sim++) {
      let remaining = [...teams];
      
      while (remaining.length > 1) {
        const nextRound = [];
        for (let i = 0; i < remaining.length; i += 2) {
          if (i + 1 < remaining.length) {
            const res = simulateGame(remaining[i], remaining[i + 1]);
            stats[res.winner.id].round1Wins++;
            if (remaining.length <= 4) stats[res.winner.id].semiWins++;
            nextRound.push(res.winner);
          } else {
            nextRound.push(remaining[i]);
          }
        }
        remaining = nextRound;
      }

      if (remaining.length === 1) {
        stats[remaining[0].id].champWins++;
      }
    }

    const results = Object.values(stats).map(s => ({
      team: s.team,
      champPct: ((s.champWins / numSims) * 100).toFixed(1),
      semiPct: ((s.semiWins / numSims) * 100).toFixed(1),
      frozenFourPct: ((s.semiWins / numSims) * 100).toFixed(1)
    }));

    results.sort((a, b) => parseFloat(b.champPct) - parseFloat(a.champPct));
    return results;
  }

  // User Bracket State (Persisted per tournament)
  function getUserPicksKey(tournamentType = "ncaa") {
    return `blueline_picks_${tournamentType}`;
  }

  function makeUserPick(gameId, pickedTeamId, tournamentType = "ncaa") {
    const key = getUserPicksKey(tournamentType);
    let picks = loadUserPicks(tournamentType);
    picks[gameId] = pickedTeamId;
    try {
      localStorage.setItem(key, JSON.stringify(picks));
    } catch (e) {}
    return picks;
  }

  function loadUserPicks(tournamentType = "ncaa") {
    const key = getUserPicksKey(tournamentType);
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  function clearUserPicks(tournamentType = "ncaa") {
    const key = getUserPicksKey(tournamentType);
    try {
      localStorage.removeItem(key);
    } catch (e) {}
    return {};
  }

  // Publish Tournament Bracketology to The Wire
  function broadcastBracketToWire(bracketSummary) {
    const post = {
      id: `post-bracket-${Date.now()}`,
      authorId: "usr_blueline_tournaments",
      timestamp: "Just now",
      content: `🏆 **OFFICIAL BRACKETOLOGY REPORT: ${(bracketSummary.tournamentName || "CHAMPIONSHIP").toUpperCase()}**\n\nBlueLine Monte Carlo Simulation completed 1,000 tournament iterations. Projected Champion: **${bracketSummary.favoriteName}** (${bracketSummary.favoriteOdds}% Championship Odds).\n\nTop Contenders: ${bracketSummary.top4Summary}.\n\n#Bracketology #ClarkCup #FrozenFour #WorldJuniors #MemorialCup #BlueLineDataWorks`,
      likes: 54,
      reposts: 22,
      replies: 15,
      likedByMe: false,
      pinned: false,
      tags: ["#Bracketology", "#ClarkCup", "#FrozenFour", "#WorldJuniors", "#MemorialCup", "#BlueLineDataWorks"],
      media: {
        type: "banner",
        title: `${(bracketSummary.tournamentName || "CHAMPIONSHIP").toUpperCase()} PREDICTOR`,
        subtitle: `Favorite: ${bracketSummary.favoriteName} • Monte Carlo Certified`
      }
    };

    try {
      const wireRaw = localStorage.getItem("blueline_social_state");
      let wireState = wireRaw ? JSON.parse(wireRaw) : { posts: [] };
      if (!Array.isArray(wireState.posts)) wireState.posts = [];
      wireState.posts.unshift(post);
      localStorage.setItem("blueline_social_state", JSON.stringify(wireState));
    } catch (e) {
      console.warn("Could not publish bracket post to Wire:", e);
    }

    return post;
  }

  // Export to Global
  window.BlueLineTournamentEngine = {
    TOURNAMENTS,
    NCAA_TEAMS,
    NCAA_REGIONALS,
    USHL_TEAMS,
    USHL_PLAYOFFS,
    WJC_TEAMS,
    WJC_PLAYOFFS,
    MEMORIAL_TEAMS,
    MEMORIAL_PLAYOFFS,
    MSHSL_TEAMS,
    MSHSL_PLAYOFFS,
    NEPSAC_TEAMS,
    NEPSAC_PLAYOFFS,
    getWinProbability,
    simulateGame,
    runMonteCarloSimulations,
    makeUserPick,
    loadUserPicks,
    clearUserPicks,
    broadcastBracketToWire
  };

})(window);
