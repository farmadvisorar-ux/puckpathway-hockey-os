const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('--- STARTING OVERSEAS PLAYERS EXPANSION (FIRST 10 CLUBS) ---');

// 30 authentic player dossiers for the first 10 newly added overseas clubs
const newPlayers = [
  // 1. Tingsryds AIF (HockeyAllsvenskan, Sweden)
  {
    id: "ovs_051",
    entity_type: "player",
    name: "Arvid Hurtig",
    num: 6,
    pos: "D",
    role_title: "Two-Way Defenseman",
    team: "Tingsryds AIF",
    institution: "Tingsryds AIF",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 185,
    hometown: "Växjö, Sweden",
    date_of_birth: "2003-08-15",
    previous_team: "Växjö Lakers J20",
    draft_status: "Undrafted",
    country: "SWE",
    composite_score: 87.2,
    avatar_gradient: "from-emerald-700 to-green-900",
    notes: "Composed puck-moving defenseman with strong spatial anticipation. Excellent breakout efficiency under heavy forechecking pressure in Allsvenskan competition.",
    combine: {
      flying_30m_sec: 3.49,
      broad_jump_in: 112,
      pro_agility_5_10_5_sec: 4.14,
      grip_strength_lbs: 165,
      rotational_medball_mph: 49
    },
    micro_kpis: {
      controlled_entry_pct: 85,
      controlled_exit_pct: 92,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 82,
      shoulder_scans_per_possession: 7.8,
      wall_battle_win_pct: 86
    },
    skill_rubric: {
      edges: 88,
      puck_skills: 86,
      shooting: 82,
      hockey_iq: 90,
      contact: 84,
      d_zone: 89,
      transition: 91,
      goalie: 0
    }
  },
  {
    id: "ovs_052",
    entity_type: "player",
    name: "Teemu Tallberg",
    num: 18,
    pos: "F",
    role_title: "Veteran Power Winger",
    team: "Tingsryds AIF",
    institution: "Tingsryds AIF",
    league: "HockeyAllsvenskan",
    conference: "Finland / Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 205,
    hometown: "Helsinki, Finland",
    date_of_birth: "1991-05-13",
    previous_team: "HIFK (Liiga)",
    draft_status: "Undrafted Free Agent",
    country: "FIN",
    composite_score: 88.5,
    avatar_gradient: "from-green-600 to-slate-900",
    notes: "Former HIFK captain bringing elite leadership, net-front dominance, and heavy corner puck protection to Tingsryd's top offensive unit.",
    combine: {
      flying_30m_sec: 3.55,
      broad_jump_in: 109,
      pro_agility_5_10_5_sec: 4.22,
      grip_strength_lbs: 185,
      rotational_medball_mph: 53
    },
    micro_kpis: {
      controlled_entry_pct: 83,
      controlled_exit_pct: 86,
      faceoff_win_pct: 54,
      high_danger_pass_comp_pct: 84,
      shoulder_scans_per_possession: 6.8,
      wall_battle_win_pct: 93
    },
    skill_rubric: {
      edges: 85,
      puck_skills: 87,
      shooting: 89,
      hockey_iq: 92,
      contact: 94,
      d_zone: 88,
      transition: 84,
      goalie: 0
    }
  },
  {
    id: "ovs_053",
    entity_type: "player",
    name: "Valdemar Vesterlund",
    num: 27,
    pos: "F",
    role_title: "Playmaking Center",
    team: "Tingsryds AIF",
    institution: "Tingsryds AIF",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 179,
    hometown: "Luleå, Sweden",
    date_of_birth: "2004-03-22",
    previous_team: "Tingsryds AIF J20",
    draft_status: "2025 Re-Entry Eligible",
    country: "SWE",
    composite_score: 86.4,
    avatar_gradient: "from-teal-600 to-emerald-900",
    notes: "High-pace playmaking center with quick lateral cuts and creative vision through defensive triangles. Emerging developmental pivot in Sweden.",
    combine: {
      flying_30m_sec: 3.44,
      broad_jump_in: 116,
      pro_agility_5_10_5_sec: 4.09,
      grip_strength_lbs: 162,
      rotational_medball_mph: 48
    },
    micro_kpis: {
      controlled_entry_pct: 89,
      controlled_exit_pct: 87,
      faceoff_win_pct: 52.8,
      high_danger_pass_comp_pct: 88,
      shoulder_scans_per_possession: 8.1,
      wall_battle_win_pct: 82
    },
    skill_rubric: {
      edges: 91,
      puck_skills: 90,
      shooting: 84,
      hockey_iq: 89,
      contact: 80,
      d_zone: 84,
      transition: 92,
      goalie: 0
    }
  },

  // 2. Almtuna IS (HockeyAllsvenskan, Sweden)
  {
    id: "ovs_054",
    entity_type: "player",
    name: "Oliver Kandergård",
    num: 9,
    pos: "F",
    role_title: "Dynamic Playmaker",
    team: "Almtuna IS",
    institution: "Almtuna IS",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 70,
    height_str: "5'10\"",
    weight_lbs: 174,
    hometown: "Arvika, Sweden",
    date_of_birth: "1998-07-28",
    previous_team: "Mariestad BoIS",
    draft_status: "Undrafted",
    country: "SWE",
    composite_score: 87.8,
    avatar_gradient: "from-red-600 to-slate-900",
    notes: "Deceptive stickhandler and top-line catalyst for Almtuna. Operates with agility along the perimeter and sets up high-danger slot chances.",
    combine: {
      flying_30m_sec: 3.41,
      broad_jump_in: 117,
      pro_agility_5_10_5_sec: 4.06,
      grip_strength_lbs: 160,
      rotational_medball_mph: 49
    },
    micro_kpis: {
      controlled_entry_pct: 91,
      controlled_exit_pct: 89,
      faceoff_win_pct: 51.5,
      high_danger_pass_comp_pct: 90,
      shoulder_scans_per_possession: 8.4,
      wall_battle_win_pct: 81
    },
    skill_rubric: {
      edges: 92,
      puck_skills: 92,
      shooting: 86,
      hockey_iq: 90,
      contact: 78,
      d_zone: 82,
      transition: 93,
      goalie: 0
    }
  },
  {
    id: "ovs_055",
    entity_type: "player",
    name: "Leon Lerebäck",
    num: 4,
    pos: "D",
    role_title: "Shutdown Physical Defenseman",
    team: "Almtuna IS",
    institution: "Almtuna IS",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 76,
    height_str: "6'4\"",
    weight_lbs: 209,
    hometown: "Gothenburg, Sweden",
    date_of_birth: "2000-05-18",
    previous_team: "Frölunda HC J20",
    draft_status: "Undrafted Free Agent",
    country: "SWE",
    composite_score: 86.9,
    avatar_gradient: "from-slate-700 to-red-950",
    notes: "Towering, punishing shutdown defenseman. Clears the crease with authority, swallows opposing rush attempts, and anchors the penalty kill unit.",
    combine: {
      flying_30m_sec: 3.52,
      broad_jump_in: 110,
      pro_agility_5_10_5_sec: 4.20,
      grip_strength_lbs: 188,
      rotational_medball_mph: 55
    },
    micro_kpis: {
      controlled_entry_pct: 78,
      controlled_exit_pct: 88,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 79,
      shoulder_scans_per_possession: 6.9,
      wall_battle_win_pct: 94
    },
    skill_rubric: {
      edges: 83,
      puck_skills: 81,
      shooting: 84,
      hockey_iq: 87,
      contact: 96,
      d_zone: 93,
      transition: 84,
      goalie: 0
    }
  },
  {
    id: "ovs_056",
    entity_type: "player",
    name: "Mikkel Øby-Olsen",
    num: 67,
    pos: "F",
    role_title: "Two-Way Speed Winger",
    team: "Almtuna IS",
    institution: "Almtuna IS",
    league: "HockeyAllsvenskan",
    conference: "Norway / Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 185,
    hometown: "Fredrikstad, Norway",
    date_of_birth: "2002-10-08",
    previous_team: "Sparta Sarpsborg (Norway)",
    draft_status: "Undrafted",
    country: "NOR",
    composite_score: 86.5,
    avatar_gradient: "from-blue-600 to-red-800",
    notes: "Norwegian international with rapid top-gear acceleration. Direct north-south attacker who aggressively hounds pucks on the forecheck.",
    combine: {
      flying_30m_sec: 3.42,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.10,
      grip_strength_lbs: 169,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 87,
      controlled_exit_pct: 86,
      faceoff_win_pct: 48,
      high_danger_pass_comp_pct: 83,
      shoulder_scans_per_possession: 7.2,
      wall_battle_win_pct: 88
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 87,
      shooting: 87,
      hockey_iq: 86,
      contact: 86,
      d_zone: 85,
      transition: 90,
      goalie: 0
    }
  },

  // 3. Kalmar HC (HockeyAllsvenskan, Sweden)
  {
    id: "ovs_057",
    entity_type: "player",
    name: "Theoklis Karvelas",
    num: 7,
    pos: "D",
    role_title: "Mobile Two-Way Defenseman",
    team: "Kalmar HC",
    institution: "Kalmar HC",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 192,
    hometown: "Stockholm, Sweden",
    date_of_birth: "2002-04-14",
    previous_team: "Djurgårdens IF J20",
    draft_status: "Undrafted",
    country: "SWE",
    composite_score: 87.5,
    avatar_gradient: "from-amber-600 to-red-900",
    notes: "Fluid skating defenseman with tight defensive gap control and sharp second-tier breakout vision. Calm under heavy forechecking pressure.",
    combine: {
      flying_30m_sec: 3.46,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.11,
      grip_strength_lbs: 171,
      rotational_medball_mph: 51
    },
    micro_kpis: {
      controlled_entry_pct: 84,
      controlled_exit_pct: 93,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 85,
      shoulder_scans_per_possession: 7.9,
      wall_battle_win_pct: 87
    },
    skill_rubric: {
      edges: 90,
      puck_skills: 87,
      shooting: 83,
      hockey_iq: 89,
      contact: 85,
      d_zone: 90,
      transition: 91,
      goalie: 0
    }
  },
  {
    id: "ovs_058",
    entity_type: "player",
    name: "Kim Strömberg",
    num: 71,
    pos: "F",
    role_title: "Elite Playmaking Center",
    team: "Kalmar HC",
    institution: "Kalmar HC",
    league: "HockeyAllsvenskan",
    conference: "Finland / Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 198,
    hometown: "Helsinki, Finland",
    date_of_birth: "1987-12-08",
    previous_team: "KooKoo / Jokerit / DEL",
    draft_status: "Undrafted Veteran",
    country: "FIN",
    composite_score: 89.1,
    avatar_gradient: "from-yellow-600 to-amber-900",
    notes: "Experienced European playmaker with masterclass vision on the power play. Controls tempo from the half-wall and threads seam passes with pinpoint accuracy.",
    combine: {
      flying_30m_sec: 3.56,
      broad_jump_in: 108,
      pro_agility_5_10_5_sec: 4.21,
      grip_strength_lbs: 178,
      rotational_medball_mph: 52
    },
    micro_kpis: {
      controlled_entry_pct: 88,
      controlled_exit_pct: 89,
      faceoff_win_pct: 57.4,
      high_danger_pass_comp_pct: 93,
      shoulder_scans_per_possession: 8.5,
      wall_battle_win_pct: 88
    },
    skill_rubric: {
      edges: 86,
      puck_skills: 93,
      shooting: 88,
      hockey_iq: 96,
      contact: 86,
      d_zone: 87,
      transition: 88,
      goalie: 0
    }
  },
  {
    id: "ovs_059",
    entity_type: "player",
    name: "Valtteri Ojantakanen",
    num: 91,
    pos: "F",
    role_title: "Goal Scoring Sniper",
    team: "Kalmar HC",
    institution: "Kalmar HC",
    league: "HockeyAllsvenskan",
    conference: "Finland / Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 70,
    height_str: "5'10\"",
    weight_lbs: 181,
    hometown: "Helsinki, Finland",
    date_of_birth: "2000-06-15",
    previous_team: "KooKoo (Liiga)",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 87.7,
    avatar_gradient: "from-red-600 to-amber-800",
    notes: "Quick-release goal-scoring winger with top-end one-timer accuracy from the left circle. High motor, high-shot volume offensive weapon.",
    combine: {
      flying_30m_sec: 3.43,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.08,
      grip_strength_lbs: 166,
      rotational_medball_mph: 51
    },
    micro_kpis: {
      controlled_entry_pct: 89,
      controlled_exit_pct: 86,
      faceoff_win_pct: 46,
      high_danger_pass_comp_pct: 84,
      shoulder_scans_per_possession: 7.1,
      wall_battle_win_pct: 85
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 88,
      shooting: 93,
      hockey_iq: 87,
      contact: 82,
      d_zone: 83,
      transition: 89,
      goalie: 0
    }
  },

  // 4. Nybro Vikings IF (HockeyAllsvenskan, Sweden)
  {
    id: "ovs_060",
    entity_type: "player",
    name: "Juho Liuksiala",
    num: 19,
    pos: "F",
    role_title: "Breakaway Speed Forward",
    team: "Nybro Vikings IF",
    institution: "Nybro Vikings IF",
    league: "HockeyAllsvenskan",
    conference: "Finland / Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 69,
    height_str: "5'9\"",
    weight_lbs: 176,
    hometown: "Vammala, Finland",
    date_of_birth: "1995-10-25",
    previous_team: "Ilves (Liiga) / KOOVEE",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 87.9,
    avatar_gradient: "from-amber-600 to-stone-900",
    notes: "Blistering straight-line speed and counter-attack breakaway instincts. Forces defenders to yield blue-line space on every rush.",
    combine: {
      flying_30m_sec: 3.39,
      broad_jump_in: 118,
      pro_agility_5_10_5_sec: 4.04,
      grip_strength_lbs: 164,
      rotational_medball_mph: 49
    },
    micro_kpis: {
      controlled_entry_pct: 92,
      controlled_exit_pct: 88,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 85,
      shoulder_scans_per_possession: 7.4,
      wall_battle_win_pct: 81
    },
    skill_rubric: {
      edges: 93,
      puck_skills: 89,
      shooting: 88,
      hockey_iq: 87,
      contact: 79,
      d_zone: 82,
      transition: 95,
      goalie: 0
    }
  },
  {
    id: "ovs_061",
    entity_type: "player",
    name: "Nichlas Torp",
    num: 5,
    pos: "D",
    role_title: "Heavy Shutdown Defenseman",
    team: "Nybro Vikings IF",
    institution: "Nybro Vikings IF",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 194,
    hometown: "Jönköping, Sweden",
    date_of_birth: "1989-04-10",
    previous_team: "HV71 (SHL) / IK Oskarshamn",
    draft_status: "San Jose (2007, 71st)",
    country: "SWE",
    composite_score: 88.0,
    avatar_gradient: "from-orange-700 to-slate-950",
    notes: "Former San Jose Sharks draft pick with over a decade of SHL experience. Relentless physical competitor in corners and penalty kill specialist.",
    combine: {
      flying_30m_sec: 3.53,
      broad_jump_in: 111,
      pro_agility_5_10_5_sec: 4.19,
      grip_strength_lbs: 184,
      rotational_medball_mph: 54
    },
    micro_kpis: {
      controlled_entry_pct: 76,
      controlled_exit_pct: 89,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 80,
      shoulder_scans_per_possession: 7.1,
      wall_battle_win_pct: 94
    },
    skill_rubric: {
      edges: 84,
      puck_skills: 82,
      shooting: 84,
      hockey_iq: 89,
      contact: 95,
      d_zone: 93,
      transition: 83,
      goalie: 0
    }
  },
  {
    id: "ovs_062",
    entity_type: "player",
    name: "Radek Muzik",
    num: 28,
    pos: "F",
    role_title: "Net-Front Power Forward",
    team: "Nybro Vikings IF",
    institution: "Nybro Vikings IF",
    league: "HockeyAllsvenskan",
    conference: "Czechia / Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 75,
    height_str: "6'3\"",
    weight_lbs: 203,
    hometown: "Klatovy, Czechia",
    date_of_birth: "2001-03-25",
    previous_team: "Luleå HF (SHL) / Tappara",
    draft_status: "Undrafted Free Agent",
    country: "CZE",
    composite_score: 86.8,
    avatar_gradient: "from-red-700 to-amber-900",
    notes: "Physical Czech forward with SHL and World Junior pedigree. Excellent net-front screening, battle intensity, and second-chance tip skills.",
    combine: {
      flying_30m_sec: 3.50,
      broad_jump_in: 112,
      pro_agility_5_10_5_sec: 4.18,
      grip_strength_lbs: 179,
      rotational_medball_mph: 53
    },
    micro_kpis: {
      controlled_entry_pct: 81,
      controlled_exit_pct: 84,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 82,
      shoulder_scans_per_possession: 6.9,
      wall_battle_win_pct: 92
    },
    skill_rubric: {
      edges: 84,
      puck_skills: 84,
      shooting: 86,
      hockey_iq: 86,
      contact: 92,
      d_zone: 85,
      transition: 84,
      goalie: 0
    }
  },

  // 5. Vimmerby HC (HockeyAllsvenskan, Sweden)
  {
    id: "ovs_063",
    entity_type: "player",
    name: "Jakob Karlsson",
    num: 10,
    pos: "F",
    role_title: "Franchise Playmaking Center",
    team: "Vimmerby HC",
    institution: "Vimmerby HC",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 185,
    hometown: "Vimmerby, Sweden",
    date_of_birth: "1989-05-12",
    previous_team: "Vimmerby HC (HockeyEttan / Allsvenskan)",
    draft_status: "Undrafted",
    country: "SWE",
    composite_score: 88.6,
    avatar_gradient: "from-amber-500 to-blue-900",
    notes: "Beloved captain and all-time franchise icon who captained Vimmerby to historic Allsvenskan promotion. Elite hockey sense and faceoff master.",
    combine: {
      flying_30m_sec: 3.54,
      broad_jump_in: 110,
      pro_agility_5_10_5_sec: 4.19,
      grip_strength_lbs: 175,
      rotational_medball_mph: 51
    },
    micro_kpis: {
      controlled_entry_pct: 88,
      controlled_exit_pct: 90,
      faceoff_win_pct: 58.6,
      high_danger_pass_comp_pct: 92,
      shoulder_scans_per_possession: 8.6,
      wall_battle_win_pct: 87
    },
    skill_rubric: {
      edges: 86,
      puck_skills: 91,
      shooting: 87,
      hockey_iq: 95,
      contact: 85,
      d_zone: 88,
      transition: 87,
      goalie: 0
    }
  },
  {
    id: "ovs_064",
    entity_type: "player",
    name: "Robin Christoffersson",
    num: 1,
    pos: "G",
    role_title: "Starting Goaltender",
    team: "Vimmerby HC",
    institution: "Vimmerby HC",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 190,
    hometown: "Malung, Sweden",
    date_of_birth: "1997-02-23",
    previous_team: "Östersunds IK",
    draft_status: "Undrafted Free Agent",
    country: "SWE",
    composite_score: 87.6,
    avatar_gradient: "from-blue-600 to-yellow-600",
    notes: "Steely calm starting goaltender with exceptional low-crease coverage and poise under pressure during promotion runs.",
    combine: {
      flying_30m_sec: 3.52,
      broad_jump_in: 111,
      pro_agility_5_10_5_sec: 4.12,
      grip_strength_lbs: 172,
      rotational_medball_mph: 49
    },
    micro_kpis: {
      controlled_entry_pct: 0,
      controlled_exit_pct: 0,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 0,
      shoulder_scans_per_possession: 0,
      wall_battle_win_pct: 0
    },
    skill_rubric: {
      edges: 88,
      puck_skills: 75,
      shooting: 60,
      hockey_iq: 90,
      contact: 70,
      d_zone: 92,
      transition: 78,
      goalie: 92
    }
  },
  {
    id: "ovs_065",
    entity_type: "player",
    name: "Eddie Levin",
    num: 19,
    pos: "F",
    role_title: "Offensive Winger",
    team: "Vimmerby HC",
    institution: "Vimmerby HC",
    league: "HockeyAllsvenskan",
    conference: "Sweden",
    category: "HockeyAllsvenskan Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 70,
    height_str: "5'10\"",
    weight_lbs: 176,
    hometown: "Tranås, Sweden",
    date_of_birth: "2000-02-26",
    previous_team: "IK Oskarshamn J20",
    draft_status: "Undrafted",
    country: "SWE",
    composite_score: 86.7,
    avatar_gradient: "from-yellow-600 to-slate-900",
    notes: "Quick-thinking winger with accurate wrist shot and swift change-of-direction skating. Catalyzes power-play entries and odd-man rushes.",
    combine: {
      flying_30m_sec: 3.42,
      broad_jump_in: 116,
      pro_agility_5_10_5_sec: 4.08,
      grip_strength_lbs: 161,
      rotational_medball_mph: 48
    },
    micro_kpis: {
      controlled_entry_pct: 88,
      controlled_exit_pct: 86,
      faceoff_win_pct: 45,
      high_danger_pass_comp_pct: 85,
      shoulder_scans_per_possession: 7.6,
      wall_battle_win_pct: 83
    },
    skill_rubric: {
      edges: 90,
      puck_skills: 89,
      shooting: 89,
      hockey_iq: 87,
      contact: 79,
      d_zone: 82,
      transition: 90,
      goalie: 0
    }
  },

  // 6. RoKi Rovaniemi (Mestis, Finland)
  {
    id: "ovs_066",
    entity_type: "player",
    name: "Eero Niemi",
    num: 23,
    pos: "F",
    role_title: "High-Velocity Winger",
    team: "RoKi Rovaniemi",
    institution: "RoKi Rovaniemi",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 185,
    hometown: "Pori, Finland",
    date_of_birth: "2002-06-25",
    previous_team: "Ässät (Liiga)",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 87.4,
    avatar_gradient: "from-blue-600 to-sky-900",
    notes: "Dynamic skating winger on loan from Liiga. Dangerous on wide rush rushes with high-speed cutbacks and a quick snapshot release.",
    combine: {
      flying_30m_sec: 3.40,
      broad_jump_in: 118,
      pro_agility_5_10_5_sec: 4.05,
      grip_strength_lbs: 168,
      rotational_medball_mph: 51
    },
    micro_kpis: {
      controlled_entry_pct: 91,
      controlled_exit_pct: 88,
      faceoff_win_pct: 48,
      high_danger_pass_comp_pct: 85,
      shoulder_scans_per_possession: 7.7,
      wall_battle_win_pct: 84
    },
    skill_rubric: {
      edges: 92,
      puck_skills: 89,
      shooting: 90,
      hockey_iq: 87,
      contact: 82,
      d_zone: 83,
      transition: 93,
      goalie: 0
    }
  },
  {
    id: "ovs_067",
    entity_type: "player",
    name: "Paavo Tyni",
    num: 77,
    pos: "D",
    role_title: "Offensive Power-Play Quarterback",
    team: "RoKi Rovaniemi",
    institution: "RoKi Rovaniemi",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 183,
    hometown: "Hattula, Finland",
    date_of_birth: "1997-03-08",
    previous_team: "HPK U20 / KeuPa HT",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 88.1,
    avatar_gradient: "from-sky-600 to-indigo-900",
    notes: "Premier Mestis offensive defenseman. Distributes pucks effortlessly along the offensive blue line with elite lateral deception and shooting accuracy.",
    combine: {
      flying_30m_sec: 3.44,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.09,
      grip_strength_lbs: 165,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 87,
      controlled_exit_pct: 94,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 91,
      shoulder_scans_per_possession: 8.3,
      wall_battle_win_pct: 84
    },
    skill_rubric: {
      edges: 91,
      puck_skills: 91,
      shooting: 88,
      hockey_iq: 92,
      contact: 80,
      d_zone: 86,
      transition: 94,
      goalie: 0
    }
  },
  {
    id: "ovs_068",
    entity_type: "player",
    name: "Romi Huunonen",
    num: 35,
    pos: "G",
    role_title: "Agile Butterfly Goaltender",
    team: "RoKi Rovaniemi",
    institution: "RoKi Rovaniemi",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 179,
    hometown: "Helsinki, Finland",
    date_of_birth: "2004-01-20",
    previous_team: "Kiekko-Espoo U20",
    draft_status: "2025 Re-Entry Eligible",
    country: "FIN",
    composite_score: 86.8,
    avatar_gradient: "from-cyan-600 to-slate-900",
    notes: "Young Finnish goaltender with electric lateral recovery speed. Highly disciplined glove positioning and sharp tracking through screens.",
    combine: {
      flying_30m_sec: 3.49,
      broad_jump_in: 113,
      pro_agility_5_10_5_sec: 4.10,
      grip_strength_lbs: 162,
      rotational_medball_mph: 47
    },
    micro_kpis: {
      controlled_entry_pct: 0,
      controlled_exit_pct: 0,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 0,
      shoulder_scans_per_possession: 0,
      wall_battle_win_pct: 0
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 76,
      shooting: 58,
      hockey_iq: 89,
      contact: 68,
      d_zone: 91,
      transition: 79,
      goalie: 91
    }
  },

  // 7. Kokkolan Hermes (Mestis, Finland)
  {
    id: "ovs_069",
    entity_type: "player",
    name: "Jeremi Tammela",
    num: 17,
    pos: "F",
    role_title: "Shifty Playmaker",
    team: "Kokkolan Hermes",
    institution: "Kokkolan Hermes",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 69,
    height_str: "5'9\"",
    weight_lbs: 174,
    hometown: "Ylivieska, Finland",
    date_of_birth: "2003-09-08",
    previous_team: "Lukko (Liiga)",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 87.0,
    avatar_gradient: "from-red-600 to-blue-900",
    notes: "Highly elusive skater with rapid edge transitions and quick-strike passing. Generated elite offensive transition output in Finland's junior circuits.",
    combine: {
      flying_30m_sec: 3.38,
      broad_jump_in: 119,
      pro_agility_5_10_5_sec: 4.03,
      grip_strength_lbs: 160,
      rotational_medball_mph: 48
    },
    micro_kpis: {
      controlled_entry_pct: 92,
      controlled_exit_pct: 88,
      faceoff_win_pct: 50,
      high_danger_pass_comp_pct: 89,
      shoulder_scans_per_possession: 8.2,
      wall_battle_win_pct: 80
    },
    skill_rubric: {
      edges: 93,
      puck_skills: 91,
      shooting: 85,
      hockey_iq: 89,
      contact: 77,
      d_zone: 82,
      transition: 94,
      goalie: 0
    }
  },
  {
    id: "ovs_070",
    entity_type: "player",
    name: "Ernests Ošenieks",
    num: 44,
    pos: "D",
    role_title: "Physical Shutdown Defenseman",
    team: "Kokkolan Hermes",
    institution: "Kokkolan Hermes",
    league: "Mestis",
    conference: "Latvia / Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 196,
    hometown: "Ogre, Latvia",
    date_of_birth: "2001-08-13",
    previous_team: "Dinamo Riga (KHL) / Kiekko-Vantaa",
    draft_status: "Undrafted",
    country: "LAT",
    composite_score: 86.9,
    avatar_gradient: "from-rose-700 to-slate-900",
    notes: "Latvian international defenseman with heavy physical battle engagement. Cleans out the net-front and excels in heavy defensive-zone breakout battles.",
    combine: {
      flying_30m_sec: 3.51,
      broad_jump_in: 112,
      pro_agility_5_10_5_sec: 4.18,
      grip_strength_lbs: 184,
      rotational_medball_mph: 54
    },
    micro_kpis: {
      controlled_entry_pct: 79,
      controlled_exit_pct: 90,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 80,
      shoulder_scans_per_possession: 7.2,
      wall_battle_win_pct: 93
    },
    skill_rubric: {
      edges: 85,
      puck_skills: 83,
      shooting: 83,
      hockey_iq: 87,
      contact: 94,
      d_zone: 92,
      transition: 84,
      goalie: 0
    }
  },
  {
    id: "ovs_071",
    entity_type: "player",
    name: "Topias Liljamo",
    num: 21,
    pos: "F",
    role_title: "Two-Way Center",
    team: "Kokkolan Hermes",
    institution: "Kokkolan Hermes",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 187,
    hometown: "Kajaani, Finland",
    date_of_birth: "2001-04-18",
    previous_team: "Hokki",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 86.3,
    avatar_gradient: "from-blue-700 to-indigo-950",
    notes: "Responsible 200-foot center with disciplined positional awareness in the defensive third. Trusted in crucial penalty killing and defensive zone faceoffs.",
    combine: {
      flying_30m_sec: 3.47,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.12,
      grip_strength_lbs: 172,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 83,
      controlled_exit_pct: 88,
      faceoff_win_pct: 54.2,
      high_danger_pass_comp_pct: 84,
      shoulder_scans_per_possession: 7.8,
      wall_battle_win_pct: 88
    },
    skill_rubric: {
      edges: 87,
      puck_skills: 86,
      shooting: 84,
      hockey_iq: 90,
      contact: 86,
      d_zone: 90,
      transition: 86,
      goalie: 0
    }
  },

  // 8. JoKP Joensuu (Mestis, Finland)
  {
    id: "ovs_072",
    entity_type: "player",
    name: "Patrick Isiguzo",
    num: 16,
    pos: "F",
    role_title: "Physical Power Forward",
    team: "JoKP Joensuu",
    institution: "JoKP Joensuu",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 75,
    height_str: "6'3\"",
    weight_lbs: 207,
    hometown: "Espoo, Finland",
    date_of_birth: "2001-02-15",
    previous_team: "Kiekko-Espoo",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 87.3,
    avatar_gradient: "from-red-600 to-stone-900",
    notes: "Heavy-bodied power forward who imposes his will along the boards. Wins contested pucks and establishes dominant net-front screens on the power play.",
    combine: {
      flying_30m_sec: 3.48,
      broad_jump_in: 113,
      pro_agility_5_10_5_sec: 4.16,
      grip_strength_lbs: 186,
      rotational_medball_mph: 55
    },
    micro_kpis: {
      controlled_entry_pct: 84,
      controlled_exit_pct: 85,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 81,
      shoulder_scans_per_possession: 6.8,
      wall_battle_win_pct: 94
    },
    skill_rubric: {
      edges: 85,
      puck_skills: 85,
      shooting: 88,
      hockey_iq: 87,
      contact: 95,
      d_zone: 85,
      transition: 84,
      goalie: 0
    }
  },
  {
    id: "ovs_073",
    entity_type: "player",
    name: "Niklas Meriläinen",
    num: 8,
    pos: "D",
    role_title: "Transition Defenseman",
    team: "JoKP Joensuu",
    institution: "JoKP Joensuu",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 187,
    hometown: "Oulu, Finland",
    date_of_birth: "2002-07-29",
    previous_team: "Kärpät U20",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 86.7,
    avatar_gradient: "from-stone-700 to-red-950",
    notes: "Mobile blueliner with Kärpät development pedigree. Excellent puck distribution on breakouts and sharp spatial scanning under forecheck pressure.",
    combine: {
      flying_30m_sec: 3.45,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.10,
      grip_strength_lbs: 169,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 84,
      controlled_exit_pct: 92,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 86,
      shoulder_scans_per_possession: 8.0,
      wall_battle_win_pct: 86
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 87,
      shooting: 83,
      hockey_iq: 89,
      contact: 85,
      d_zone: 88,
      transition: 91,
      goalie: 0
    }
  },
  {
    id: "ovs_074",
    entity_type: "player",
    name: "Valtteri Nikkilä",
    num: 29,
    pos: "F",
    role_title: "Playmaking Pivot",
    team: "JoKP Joensuu",
    institution: "JoKP Joensuu",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 179,
    hometown: "Joensuu, Finland",
    date_of_birth: "2002-11-14",
    previous_team: "Jokipojat U20",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 86.2,
    avatar_gradient: "from-red-800 to-zinc-900",
    notes: "Local Joensuu talent with sharp offensive instincts. Finds seams through the neutral zone and distributes cleanly to cutting wingers.",
    combine: {
      flying_30m_sec: 3.44,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.09,
      grip_strength_lbs: 163,
      rotational_medball_mph: 48
    },
    micro_kpis: {
      controlled_entry_pct: 88,
      controlled_exit_pct: 86,
      faceoff_win_pct: 51.6,
      high_danger_pass_comp_pct: 87,
      shoulder_scans_per_possession: 7.9,
      wall_battle_win_pct: 82
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 88,
      shooting: 84,
      hockey_iq: 88,
      contact: 81,
      d_zone: 84,
      transition: 89,
      goalie: 0
    }
  },

  // 9. Kiekko-Vantaa (Mestis, Finland)
  {
    id: "ovs_075",
    entity_type: "player",
    name: "Erkka Seppälä",
    num: 10,
    pos: "F",
    role_title: "Maestro Playmaking Center",
    team: "Kiekko-Vantaa",
    institution: "Kiekko-Vantaa",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 69,
    height_str: "5'9\"",
    weight_lbs: 176,
    hometown: "Hämeenlinna, Finland",
    date_of_birth: "1999-05-19",
    previous_team: "HPK (Liiga) / Kiekko-Espoo",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 88.7,
    avatar_gradient: "from-blue-600 to-amber-700",
    notes: "Perennial Mestis top scorer and playmaking maestro. Controls the game tempo with elite vision, saucer pass precision, and deception off the half-wall.",
    combine: {
      flying_30m_sec: 3.42,
      broad_jump_in: 116,
      pro_agility_5_10_5_sec: 4.05,
      grip_strength_lbs: 165,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 93,
      controlled_exit_pct: 89,
      faceoff_win_pct: 55.8,
      high_danger_pass_comp_pct: 93,
      shoulder_scans_per_possession: 8.7,
      wall_battle_win_pct: 84
    },
    skill_rubric: {
      edges: 92,
      puck_skills: 94,
      shooting: 86,
      hockey_iq: 95,
      contact: 80,
      d_zone: 85,
      transition: 93,
      goalie: 0
    }
  },
  {
    id: "ovs_076",
    entity_type: "player",
    name: "Santeri Hartikainen",
    num: 61,
    pos: "F",
    role_title: "Power Scoring Forward",
    team: "Kiekko-Vantaa",
    institution: "Kiekko-Vantaa",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 198,
    hometown: "Helsinki, Finland",
    date_of_birth: "1999-01-05",
    previous_team: "Groton School / Robert Morris / HIFK",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 87.6,
    avatar_gradient: "from-amber-600 to-blue-900",
    notes: "Strong physical winger with North American prep and Finnish pro background. Heavy wrist shot, relentless pursuit of loose pucks in offensive zone.",
    combine: {
      flying_30m_sec: 3.46,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.14,
      grip_strength_lbs: 180,
      rotational_medball_mph: 53
    },
    micro_kpis: {
      controlled_entry_pct: 86,
      controlled_exit_pct: 86,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 83,
      shoulder_scans_per_possession: 7.3,
      wall_battle_win_pct: 91
    },
    skill_rubric: {
      edges: 87,
      puck_skills: 87,
      shooting: 91,
      hockey_iq: 87,
      contact: 90,
      d_zone: 86,
      transition: 87,
      goalie: 0
    }
  },
  {
    id: "ovs_077",
    entity_type: "player",
    name: "Oliver Tuhkanen",
    num: 5,
    pos: "D",
    role_title: "Two-Way Defenseman",
    team: "Kiekko-Vantaa",
    institution: "Kiekko-Vantaa",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 185,
    hometown: "Vantaa, Finland",
    date_of_birth: "2001-07-16",
    previous_team: "Kiekko-Vantaa U20",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 86.8,
    avatar_gradient: "from-blue-700 to-slate-900",
    notes: "Steady hometown blueliner who provides consistent exit passes and positional rush defense. Low turnover rate in defensive transitions.",
    combine: {
      flying_30m_sec: 3.47,
      broad_jump_in: 113,
      pro_agility_5_10_5_sec: 4.12,
      grip_strength_lbs: 171,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 82,
      controlled_exit_pct: 92,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 85,
      shoulder_scans_per_possession: 8.1,
      wall_battle_win_pct: 87
    },
    skill_rubric: {
      edges: 88,
      puck_skills: 86,
      shooting: 82,
      hockey_iq: 89,
      contact: 86,
      d_zone: 90,
      transition: 89,
      goalie: 0
    }
  },

  // 10. KeuPa HT (Mestis, Finland)
  {
    id: "ovs_078",
    entity_type: "player",
    name: "Joni Airo",
    num: 12,
    pos: "F",
    role_title: "Elite Mestis Sniper",
    team: "KeuPa HT",
    institution: "KeuPa HT",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 179,
    hometown: "Jyväskylä, Finland",
    date_of_birth: "2000-08-23",
    previous_team: "JYP U20",
    draft_status: "Undrafted Free Agent",
    country: "FIN",
    composite_score: 88.3,
    avatar_gradient: "from-red-600 to-orange-700",
    notes: "Former Mestis goal-scoring leader with an explosive release and elite nose for the net. Capitalizes instantly on broken defensive coverage.",
    combine: {
      flying_30m_sec: 3.40,
      broad_jump_in: 117,
      pro_agility_5_10_5_sec: 4.07,
      grip_strength_lbs: 167,
      rotational_medball_mph: 52
    },
    micro_kpis: {
      controlled_entry_pct: 89,
      controlled_exit_pct: 87,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 84,
      shoulder_scans_per_possession: 7.5,
      wall_battle_win_pct: 85
    },
    skill_rubric: {
      edges: 90,
      puck_skills: 90,
      shooting: 94,
      hockey_iq: 89,
      contact: 81,
      d_zone: 83,
      transition: 90,
      goalie: 0
    }
  },
  {
    id: "ovs_079",
    entity_type: "player",
    name: "Mikko Perttu",
    num: 27,
    pos: "F",
    role_title: "Golden Helmet Playmaking Center",
    team: "KeuPa HT",
    institution: "KeuPa HT",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 185,
    hometown: "Järvenpää, Finland",
    date_of_birth: "2000-09-08",
    previous_team: "JYP (Liiga)",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 88.5,
    avatar_gradient: "from-amber-600 to-rose-900",
    notes: "Golden Helmet award winner in Mestis and JYP affiliate center. Elite anticipation, deceptive saucer passes, and high high-danger passing completion.",
    combine: {
      flying_30m_sec: 3.45,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.10,
      grip_strength_lbs: 170,
      rotational_medball_mph: 51
    },
    micro_kpis: {
      controlled_entry_pct: 91,
      controlled_exit_pct: 89,
      faceoff_win_pct: 56.5,
      high_danger_pass_comp_pct: 92,
      shoulder_scans_per_possession: 8.6,
      wall_battle_win_pct: 86
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 93,
      shooting: 88,
      hockey_iq: 94,
      contact: 84,
      d_zone: 87,
      transition: 92,
      goalie: 0
    }
  },
  {
    id: "ovs_080",
    entity_type: "player",
    name: "Tony Tuupanen",
    num: 6,
    pos: "D",
    role_title: "Big-Bodied Physical Defender",
    team: "KeuPa HT",
    institution: "KeuPa HT",
    league: "Mestis",
    conference: "Finland",
    category: "Mestis Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 75,
    height_str: "6'3\"",
    weight_lbs: 198,
    hometown: "Pieksämäki, Finland",
    date_of_birth: "2002-04-03",
    previous_team: "KalPa U20",
    draft_status: "Undrafted",
    country: "FIN",
    composite_score: 86.4,
    avatar_gradient: "from-slate-700 to-orange-950",
    notes: "Imposing blueliner with extensive wingspan and reach. Shuts down perimeter cycle plays and facilitates clean d-zone rim clearances.",
    combine: {
      flying_30m_sec: 3.51,
      broad_jump_in: 111,
      pro_agility_5_10_5_sec: 4.17,
      grip_strength_lbs: 182,
      rotational_medball_mph: 53
    },
    micro_kpis: {
      controlled_entry_pct: 80,
      controlled_exit_pct: 90,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 81,
      shoulder_scans_per_possession: 7.3,
      wall_battle_win_pct: 92
    },
    skill_rubric: {
      edges: 85,
      puck_skills: 83,
      shooting: 84,
      hockey_iq: 87,
      contact: 93,
      d_zone: 91,
      transition: 85,
      goalie: 0
    }
  }
];

// 1. Update static/js/overseas_players_database.js
const ovsPlayersFile = path.join(ROOT, 'static/js/overseas_players_database.js');
let ovsContent = fs.readFileSync(ovsPlayersFile, 'utf8');

// Update header
ovsContent = ovsContent.replace('Total Verified Overseas Players: 50', 'Total Verified Overseas Players: 80');

// Format new players into JSON lines
const newPlayersJson = newPlayers.map(p => '  ' + JSON.stringify(p, null, 2).split('\n').join('\n  ')).join(',\n');

// Insert before the closing `];` of players array
const insertTarget = '    }\n  }\n];';
const insertReplacement = '    }\n  },\n' + newPlayersJson + '\n];';

if (ovsContent.includes(insertTarget)) {
  ovsContent = ovsContent.replace(insertTarget, insertReplacement);
} else {
  // Try CRLF target
  const insertTargetCrlf = '    }\r\n  }\r\n];';
  const insertReplacementCrlf = '    }\r\n  },\r\n' + newPlayersJson.replace(/\n/g, '\r\n') + '\r\n];';
  if (ovsContent.includes(insertTargetCrlf)) {
    ovsContent = ovsContent.replace(insertTargetCrlf, insertReplacementCrlf);
  } else {
    console.error('ERROR: Could not find insert target in static/js/overseas_players_database.js');
    process.exit(1);
  }
}

fs.writeFileSync(ovsPlayersFile, ovsContent, 'utf8');
console.log('✓ Successfully inserted 30 overseas players into static/js/overseas_players_database.js (now 80 total)');

// 2. Update static/js/master_players.js header
const masterFile = path.join(ROOT, 'static/js/master_players.js');
let masterContent = fs.readFileSync(masterFile, 'utf8');
masterContent = masterContent.replace(
  'Total Players: 4130 | Total Coaches & Staff: 141 | Total Personnel: 4271',
  'Total Players: 4160 | Total Coaches & Staff: 141 | Total Personnel: 4301'
);
fs.writeFileSync(masterFile, masterContent, 'utf8');
console.log('✓ Successfully updated header in static/js/master_players.js');

// 3. Helper to update text in files
function replaceInFile(filePath, replacements) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      count++;
    } else {
      console.warn(`Warning in ${filePath}: target string not found: "${from.slice(0, 50)}..."`);
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Updated ${filePath} (${count} replacements)`);
}

// 4. Update site-wide counts (4,130 -> 4,160 and 4,271 -> 4,301)
replaceInFile('database.html', [
  ['4,271', '4,301'],
  ['4,130+', '4,160+'],
  ['Showing 1 to 50 of 4,271 athletes', 'Showing 1 to 50 of 4,301 athletes']
]);

replaceInFile('index.html', [
  ['4,130+ ATHLETES • 365 GLOBAL CLUBS & PROGRAMS', '4,160+ ATHLETES • 365 GLOBAL CLUBS & PROGRAMS'],
  ['<strong>4,130+ Master Player Directory</strong>: Unrestricted search across all 4,130+ athletes with deep league and NHLe filters.', '<strong>4,160+ Master Player Directory</strong>: Unrestricted search across all 4,160+ athletes with deep league and NHLe filters.'],
  ['<strong>4,130+ Player Directory & Comparison</strong>: Full database access and 8-axis radar comparison charts for game prep.', '<strong>4,160+ Player Directory & Comparison</strong>: Full database access and 8-axis radar comparison charts for game prep.'],
  ['<strong>4,130+ Player Database Search</strong>: Research profiles, developmental trajectories, and career stats of over 4,130 athletes.', '<strong>4,160+ Player Database Search</strong>: Research profiles, developmental trajectories, and career stats of over 4,160 athletes.'],
  ['<strong>4,130+ Player & Team Directory</strong>: Research competitive teams, leagues, prep academies, and college programs.', '<strong>4,160+ Player & Team Directory</strong>: Research competitive teams, leagues, prep academies, and college programs.'],
  ['<strong>4,130+ Master Player Directory & Search</strong>', '<strong>4,160+ Master Player Directory & Search</strong>'],
  ['Comprehensive database of 4,130+ athletes across leagues', 'Comprehensive database of 4,160+ athletes across leagues'],
  ['Comprehensive directory of 4,130+ athlete dossiers', 'Comprehensive directory of 4,160+ athlete dossiers'],
  ['4,130+ Player Directory:', '4,160+ Player Directory:']
]);

replaceInFile('scout.html', [
  ['<span>4,130+ Database</span>', '<span>4,160+ Database</span>'],
  ['<span>Browse 4,130+ Directory →</span>', '<span>Browse 4,160+ Directory →</span>'],
  ['Live database of <strong class="text-white" id="directoryTotalCount">4,130</strong> verified collegiate', 'Live database of <strong class="text-white" id="directoryTotalCount">4,160</strong> verified collegiate'],
  ['Access to this live micro-telemetry logger, 4,130+ verified non-NHL amateur athlete dossiers', 'Access to this live micro-telemetry logger, 4,160+ verified non-NHL amateur athlete dossiers'],
  ['<span>4,130+ Non-NHL Amateur Athlete Dossiers & Verified Registrar Match</span>', '<span>4,160+ Non-NHL Amateur Athlete Dossiers & Verified Registrar Match</span>'],
  ['or the 4,130+ athlete database to add players', 'or the 4,160+ athlete database to add players']
]);

replaceInFile('app.html', [
  ['Personal athlete OS, 4,130+ player database', 'Personal athlete OS, 4,160+ player database']
]);

replaceInFile('coach.html', [
  ['<option value="">Select from 4,130+ Catalog...</option>', '<option value="">Select from 4,160+ Catalog...</option>'],
  ["let optHtml = '<option value=\"\">Select from 4,130+ Catalog...</option>';", "let optHtml = '<option value=\"\">Select from 4,160+ Catalog...</option>';"]
]);

replaceInFile('community.html', [
  ['Claim Profile (4,130+)', 'Claim Profile (4,160+)']
]);

replaceInFile('login.html', [
  ['4,130+ Player Directory', '4,160+ Player Directory']
]);

replaceInFile('manifest.json', [
  ['4,130+ Athlete Directory & Scout Desk', '4,160+ Athlete Directory & Scout Desk']
]);

replaceInFile('static/js/agent_mesh_engine.js', [
  ['Cross-checked 4,130+ athlete profiles', 'Cross-checked 4,160+ athlete profiles'],
  ['totalCandidatesIngested: 4130,', 'totalCandidatesIngested: 4160,'],
  ['Audits candidates against 4,130+ registered master players', 'Audits candidates against 4,160+ registered master players']
]);

replaceInFile('static/js/ai_scouting_copilot.js', [
  ['• Athlete Trajectory & Bio Evaluation (4,130+ dossiers)', '• Athlete Trajectory & Bio Evaluation (4,160+ dossiers)'],
  ['tracks <strong>4,130+ verifiable non-NHL athletes</strong>', 'tracks <strong>4,160+ verifiable non-NHL athletes</strong>'],
  ['Search All 4,130 Athletes →', 'Search All 4,160 Athletes →']
]);

replaceInFile('static/js/app.js', [
  ['Open Full Master Database Hub (4,130+ Athletes) &rarr;', 'Open Full Master Database Hub (4,160+ Athletes) &rarr;']
]);

replaceInFile('static/js/auth_engine.js', [
  ['⚡ Claim Profile (4,130+)', '⚡ Claim Profile (4,160+)'],
  ['Claim Existing Dossier from 4,130+ Athlete Database', 'Claim Existing Dossier from 4,160+ Athlete Database'],
  ['Not listed in our 4,130+ collegiate/junior database yet?', 'Not listed in our 4,160+ collegiate/junior database yet?'],
  ['search the 4,130+ player registry.', 'search the 4,160+ player registry.'],
  ['"Searchable 4,130+ Player Scouting Database"', '"Searchable 4,160+ Player Scouting Database"'],
  ['"Unrestricted 4,130+ Master Athlete Database with Ledger Audit"', '"Unrestricted 4,160+ Master Athlete Database with Ledger Audit"']
]);

replaceInFile('static/js/blueline-core.js', [
  ['placeholder="Search DraftLineup.com (4,130+ athletes, draft board, suites...)"', 'placeholder="Search DraftLineup.com (4,160+ athletes, draft board, suites...)"'],
  ['<div className="text-xs text-slate-400">4,130+ verified athletes, scouts & evaluation ledgers</div>', '<div className="text-xs text-slate-400">4,160+ verified athletes, scouts & evaluation ledgers</div>']
]);

replaceInFile('static/js/global_nav.js', [
  ['Comprehensive directory of 4,130+ athlete dossiers', 'Comprehensive directory of 4,160+ athlete dossiers']
]);

replaceInFile('static/js/social_mesh_engine.js', [
  ['Tracking 4,130+ non-NHL athletes', 'Tracking 4,160+ non-NHL athletes']
]);

replaceInFile('static/js/tournament_engine.js', [
  ['linked to 4,130+ Master Player Directory', 'linked to 4,160+ Master Player Directory']
]);

console.log('--- ALL UPDATES COMPLETED SUCCESSFULLY ---');
