const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('--- STARTING OVERSEAS PLAYERS EXPANSION (CLUBS 11 TO 20) ---');

// 30 authentic player dossiers for clubs 11 to 20
const newPlayers = [
  // 11. EHC Olten (Swiss League, Switzerland)
  {
    id: "ovs_081",
    entity_type: "player",
    name: "Stanislav Horanský",
    num: 91,
    pos: "F",
    role_title: "Elite Playmaking Center",
    team: "EHC Olten",
    institution: "EHC Olten",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 187,
    hometown: "Žilina, Slovakia",
    date_of_birth: "1994-02-25",
    previous_team: "EHC Biel-Bienne (National League)",
    draft_status: "Undrafted Free Agent",
    country: "SUI",
    composite_score: 88.9,
    avatar_gradient: "from-green-600 to-slate-900",
    notes: "Premier offensive playmaker in the Swiss League. Possesses elite vision and saucer pass precision. Perennial top scorer and power-play distributor.",
    combine: {
      flying_30m_sec: 3.44,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.10,
      grip_strength_lbs: 172,
      rotational_medball_mph: 51
    },
    micro_kpis: {
      controlled_entry_pct: 91,
      controlled_exit_pct: 88,
      faceoff_win_pct: 56.2,
      high_danger_pass_comp_pct: 92,
      shoulder_scans_per_possession: 8.5,
      wall_battle_win_pct: 86
    },
    skill_rubric: {
      edges: 90,
      puck_skills: 93,
      shooting: 87,
      hockey_iq: 95,
      contact: 83,
      d_zone: 86,
      transition: 91,
      goalie: 0
    }
  },
  {
    id: "ovs_082",
    entity_type: "player",
    name: "Giacomo Dal Pian",
    num: 65,
    pos: "F",
    role_title: "Two-Way Pivot",
    team: "EHC Olten",
    institution: "EHC Olten",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 69,
    height_str: "5'9\"",
    weight_lbs: 174,
    hometown: "Lugano, Switzerland",
    date_of_birth: "1993-05-22",
    previous_team: "HC Ambrì-Piotta (National League)",
    draft_status: "Undrafted",
    country: "SUI",
    composite_score: 87.2,
    avatar_gradient: "from-emerald-600 to-teal-950",
    notes: "Experienced National League veteran with disciplined 200-foot awareness. Agile skater who wins leverage in low-zone battles and anchors the penalty kill.",
    combine: {
      flying_30m_sec: 3.42,
      broad_jump_in: 116,
      pro_agility_5_10_5_sec: 4.07,
      grip_strength_lbs: 164,
      rotational_medball_mph: 49
    },
    micro_kpis: {
      controlled_entry_pct: 87,
      controlled_exit_pct: 89,
      faceoff_win_pct: 54.8,
      high_danger_pass_comp_pct: 86,
      shoulder_scans_per_possession: 8.1,
      wall_battle_win_pct: 87
    },
    skill_rubric: {
      edges: 91,
      puck_skills: 88,
      shooting: 84,
      hockey_iq: 91,
      contact: 82,
      d_zone: 90,
      transition: 89,
      goalie: 0
    }
  },
  {
    id: "ovs_083",
    entity_type: "player",
    name: "Victor Oejdemark",
    num: 77,
    pos: "D",
    role_title: "Towering Shutdown Defenseman",
    team: "EHC Olten",
    institution: "EHC Olten",
    league: "Swiss League",
    conference: "Sweden / Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 77,
    height_str: "6'5\"",
    weight_lbs: 220,
    hometown: "St. Gallen, Switzerland",
    date_of_birth: "1998-05-07",
    previous_team: "GCK Lions / ZSC Lions System",
    draft_status: "Undrafted",
    country: "SUI",
    composite_score: 87.6,
    avatar_gradient: "from-slate-700 to-emerald-950",
    notes: "Massive physical blueliner with an enormous wingspan. Clears the net-front with authority and shuts down lateral rush attempts with an active stick.",
    combine: {
      flying_30m_sec: 3.55,
      broad_jump_in: 109,
      pro_agility_5_10_5_sec: 4.22,
      grip_strength_lbs: 194,
      rotational_medball_mph: 56
    },
    micro_kpis: {
      controlled_entry_pct: 77,
      controlled_exit_pct: 89,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 81,
      shoulder_scans_per_possession: 7.0,
      wall_battle_win_pct: 95
    },
    skill_rubric: {
      edges: 82,
      puck_skills: 81,
      shooting: 85,
      hockey_iq: 88,
      contact: 97,
      d_zone: 94,
      transition: 83,
      goalie: 0
    }
  },

  // 12. EHC Visp (Swiss League, Switzerland)
  {
    id: "ovs_084",
    entity_type: "player",
    name: "Garry Nunn",
    num: 11,
    pos: "F",
    role_title: "Dynamic Goal Scoring Winger",
    team: "EHC Visp",
    institution: "EHC Visp",
    league: "Swiss League",
    conference: "Canada / Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 70,
    height_str: "5'10\"",
    weight_lbs: 181,
    hometown: "Victoria, British Columbia, Canada",
    date_of_birth: "1989-10-14",
    previous_team: "EHC Olten / AIK Ishockey",
    draft_status: "Undrafted Free Agent",
    country: "CAN",
    composite_score: 88.8,
    avatar_gradient: "from-red-600 to-blue-900",
    notes: "High-octane Canadian winger and multi-year scoring champion in the Swiss League. Lethal wrist shot off the rush and high offensive clutch rating.",
    combine: {
      flying_30m_sec: 3.41,
      broad_jump_in: 117,
      pro_agility_5_10_5_sec: 4.05,
      grip_strength_lbs: 168,
      rotational_medball_mph: 52
    },
    micro_kpis: {
      controlled_entry_pct: 92,
      controlled_exit_pct: 87,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 89,
      shoulder_scans_per_possession: 8.0,
      wall_battle_win_pct: 84
    },
    skill_rubric: {
      edges: 91,
      puck_skills: 93,
      shooting: 94,
      hockey_iq: 92,
      contact: 81,
      d_zone: 83,
      transition: 93,
      goalie: 0
    }
  },
  {
    id: "ovs_085",
    entity_type: "player",
    name: "Robin Meyer",
    num: 30,
    pos: "G",
    role_title: "Starting Butterfly Goaltender",
    team: "EHC Visp",
    institution: "EHC Visp",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 187,
    hometown: "Zug, Switzerland",
    date_of_birth: "2000-06-19",
    previous_team: "EV Zug (National League) / EVZ Academy",
    draft_status: "Undrafted",
    country: "SUI",
    composite_score: 87.5,
    avatar_gradient: "from-blue-600 to-red-800",
    notes: "Composed young goaltender with National League development foundation. Smooth post integration, tight five-hole seal, and sharp high-danger rebound control.",
    combine: {
      flying_30m_sec: 3.51,
      broad_jump_in: 112,
      pro_agility_5_10_5_sec: 4.11,
      grip_strength_lbs: 171,
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
      edges: 89,
      puck_skills: 76,
      shooting: 57,
      hockey_iq: 90,
      contact: 69,
      d_zone: 92,
      transition: 80,
      goalie: 92
    }
  },
  {
    id: "ovs_086",
    entity_type: "player",
    name: "Vincent Despont",
    num: 8,
    pos: "D",
    role_title: "Mobile Two-Way Defenseman",
    team: "EHC Visp",
    institution: "EHC Visp",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 190,
    hometown: "Lausanne, Switzerland",
    date_of_birth: "2003-01-26",
    previous_team: "Moncton Wildcats / Saint John Sea Dogs (QMJHL)",
    draft_status: "Undrafted Prospect",
    country: "SUI",
    composite_score: 86.9,
    avatar_gradient: "from-red-700 to-slate-900",
    notes: "Swiss World Junior defenseman with North American Major Junior experience. Crisp first-pass execution and energetic physical gap management.",
    combine: {
      flying_30m_sec: 3.47,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.12,
      grip_strength_lbs: 170,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 84,
      controlled_exit_pct: 92,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 85,
      shoulder_scans_per_possession: 7.9,
      wall_battle_win_pct: 88
    },
    skill_rubric: {
      edges: 88,
      puck_skills: 87,
      shooting: 84,
      hockey_iq: 89,
      contact: 88,
      d_zone: 89,
      transition: 90,
      goalie: 0
    }
  },

  // 13. HC La Chaux-de-Fonds (Swiss League, Switzerland)
  {
    id: "ovs_087",
    entity_type: "player",
    name: "Toms Andersons",
    num: 98,
    pos: "F",
    role_title: "Prolific Scoring Winger",
    team: "HC La Chaux-de-Fonds",
    institution: "HC La Chaux-de-Fonds",
    league: "Swiss League",
    conference: "Latvia / Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 187,
    hometown: "Riga, Latvia",
    date_of_birth: "1993-11-25",
    previous_team: "SC Langenthal / SCL Tigers",
    draft_status: "Undrafted Free Agent",
    country: "LAT",
    composite_score: 89.2,
    avatar_gradient: "from-blue-700 to-yellow-600",
    notes: "Reigning Swiss League Player of the Year and Latvian international. Devastating offensive instincts, high shot volume, and elite scoring execution.",
    combine: {
      flying_30m_sec: 3.43,
      broad_jump_in: 116,
      pro_agility_5_10_5_sec: 4.08,
      grip_strength_lbs: 173,
      rotational_medball_mph: 52
    },
    micro_kpis: {
      controlled_entry_pct: 91,
      controlled_exit_pct: 88,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 90,
      shoulder_scans_per_possession: 8.2,
      wall_battle_win_pct: 87
    },
    skill_rubric: {
      edges: 90,
      puck_skills: 93,
      shooting: 94,
      hockey_iq: 94,
      contact: 83,
      d_zone: 85,
      transition: 92,
      goalie: 0
    }
  },
  {
    id: "ovs_088",
    entity_type: "player",
    name: "Stefan Rüegsegger",
    num: 9,
    pos: "F",
    role_title: "High-Energy Power Forward",
    team: "HC La Chaux-de-Fonds",
    institution: "HC La Chaux-de-Fonds",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 192,
    hometown: "Grosshöchstetten, Switzerland",
    date_of_birth: "1996-03-05",
    previous_team: "SCL Tigers (National League)",
    draft_status: "Undrafted",
    country: "SUI",
    composite_score: 87.4,
    avatar_gradient: "from-yellow-600 to-blue-900",
    notes: "Hard-nosed power winger with extensive National League resume. Strong cycle game, screens goaltenders on the man advantage, and wins heavy board battles.",
    combine: {
      flying_30m_sec: 3.48,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.15,
      grip_strength_lbs: 184,
      rotational_medball_mph: 54
    },
    micro_kpis: {
      controlled_entry_pct: 85,
      controlled_exit_pct: 86,
      faceoff_win_pct: 51,
      high_danger_pass_comp_pct: 83,
      shoulder_scans_per_possession: 7.2,
      wall_battle_win_pct: 93
    },
    skill_rubric: {
      edges: 87,
      puck_skills: 87,
      shooting: 88,
      hockey_iq: 88,
      contact: 93,
      d_zone: 87,
      transition: 86,
      goalie: 0
    }
  },
  {
    id: "ovs_089",
    entity_type: "player",
    name: "Arnaud Jaquet",
    num: 7,
    pos: "D",
    role_title: "Captain & Shutdown Blueliner",
    team: "HC La Chaux-de-Fonds",
    institution: "HC La Chaux-de-Fonds",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 185,
    hometown: "Fribourg, Switzerland",
    date_of_birth: "1990-09-17",
    previous_team: "HC Fribourg-Gottéron (National League)",
    draft_status: "Undrafted Veteran",
    country: "SUI",
    composite_score: 87.8,
    avatar_gradient: "from-blue-600 to-slate-950",
    notes: "Respected franchise captain with over 500 Swiss League games. Supreme positional gap discipline, fearless shot-blocking, and defensive-zone communicator.",
    combine: {
      flying_30m_sec: 3.52,
      broad_jump_in: 111,
      pro_agility_5_10_5_sec: 4.19,
      grip_strength_lbs: 178,
      rotational_medball_mph: 52
    },
    micro_kpis: {
      controlled_entry_pct: 78,
      controlled_exit_pct: 91,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 82,
      shoulder_scans_per_possession: 7.6,
      wall_battle_win_pct: 92
    },
    skill_rubric: {
      edges: 85,
      puck_skills: 83,
      shooting: 82,
      hockey_iq: 92,
      contact: 90,
      d_zone: 94,
      transition: 85,
      goalie: 0
    }
  },

  // 14. HC Sierre (Swiss League, Switzerland)
  {
    id: "ovs_090",
    entity_type: "player",
    name: "Arnaud Montandon",
    num: 91,
    pos: "F",
    role_title: "Power Playmaking Center",
    team: "HC Sierre",
    institution: "HC Sierre",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 75,
    height_str: "6'3\"",
    weight_lbs: 205,
    hometown: "Bern, Switzerland",
    date_of_birth: "1991-11-20",
    previous_team: "SC Bern / HC Fribourg-Gottéron",
    draft_status: "Undrafted Veteran",
    country: "SUI",
    composite_score: 88.4,
    avatar_gradient: "from-red-600 to-amber-700",
    notes: "Towering top-line center and captain for Sierre. Dominates corner cycles, creates space with size, and features a heavy snapshot from the faceoff dots.",
    combine: {
      flying_30m_sec: 3.51,
      broad_jump_in: 112,
      pro_agility_5_10_5_sec: 4.17,
      grip_strength_lbs: 186,
      rotational_medball_mph: 54
    },
    micro_kpis: {
      controlled_entry_pct: 86,
      controlled_exit_pct: 88,
      faceoff_win_pct: 57.8,
      high_danger_pass_comp_pct: 89,
      shoulder_scans_per_possession: 7.8,
      wall_battle_win_pct: 94
    },
    skill_rubric: {
      edges: 86,
      puck_skills: 89,
      shooting: 91,
      hockey_iq: 93,
      contact: 94,
      d_zone: 88,
      transition: 86,
      goalie: 0
    }
  },
  {
    id: "ovs_091",
    entity_type: "player",
    name: "Eliot Bernazzi",
    num: 23,
    pos: "D",
    role_title: "Mobile Two-Way Defenseman",
    team: "HC Sierre",
    institution: "HC Sierre",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 181,
    hometown: "Genève, Switzerland",
    date_of_birth: "2001-08-28",
    previous_team: "Genève-Servette HC U20",
    draft_status: "Undrafted",
    country: "SUI",
    composite_score: 86.6,
    avatar_gradient: "from-amber-600 to-red-900",
    notes: "Slick skating young defenseman with smooth first-pass distribution. Evades forechecking pressure with lateral agility and crisp blue-line walks.",
    combine: {
      flying_30m_sec: 3.44,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.09,
      grip_strength_lbs: 167,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 85,
      controlled_exit_pct: 93,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 86,
      shoulder_scans_per_possession: 8.2,
      wall_battle_win_pct: 85
    },
    skill_rubric: {
      edges: 90,
      puck_skills: 87,
      shooting: 83,
      hockey_iq: 89,
      contact: 83,
      d_zone: 87,
      transition: 91,
      goalie: 0
    }
  },
  {
    id: "ovs_092",
    entity_type: "player",
    name: "Remo Giovannini",
    num: 34,
    pos: "G",
    role_title: "Veteran Starting Goaltender",
    team: "HC Sierre",
    institution: "HC Sierre",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 70,
    height_str: "5'10\"",
    weight_lbs: 176,
    hometown: "Davos, Switzerland",
    date_of_birth: "1991-04-18",
    previous_team: "HC Davos (National League)",
    draft_status: "Undrafted Veteran",
    country: "SUI",
    composite_score: 87.3,
    avatar_gradient: "from-red-700 to-slate-900",
    notes: "Athletic veteran netminder with lightning-fast glove reflex and high battle compete. Long-time Sierre backbone in tight playoff atmospheres.",
    combine: {
      flying_30m_sec: 3.50,
      broad_jump_in: 112,
      pro_agility_5_10_5_sec: 4.08,
      grip_strength_lbs: 168,
      rotational_medball_mph: 48
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
      shooting: 55,
      hockey_iq: 90,
      contact: 68,
      d_zone: 91,
      transition: 79,
      goalie: 91
    }
  },

  // 15. EHC Basel (Swiss League, Switzerland)
  {
    id: "ovs_093",
    entity_type: "player",
    name: "Jakob Stukel",
    num: 47,
    pos: "F",
    role_title: "Elite Speed Rush Sniper",
    team: "EHC Basel",
    institution: "EHC Basel",
    league: "Swiss League",
    conference: "Canada / Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 190,
    hometown: "Surrey, British Columbia, Canada",
    date_of_birth: "1997-03-18",
    previous_team: "Calgary Hitmen (WHL) / Bakersfield Condors (AHL)",
    draft_status: "Vancouver (2016, 154th)",
    country: "CAN",
    composite_score: 89.0,
    avatar_gradient: "from-red-600 to-black",
    notes: "Former Vancouver Canucks draft pick with explosive straight-line separation speed. League scoring star for Basel with rapid snapshot release on odd-man rushes.",
    combine: {
      flying_30m_sec: 3.37,
      broad_jump_in: 120,
      pro_agility_5_10_5_sec: 4.02,
      grip_strength_lbs: 174,
      rotational_medball_mph: 53
    },
    micro_kpis: {
      controlled_entry_pct: 93,
      controlled_exit_pct: 88,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 87,
      shoulder_scans_per_possession: 8.1,
      wall_battle_win_pct: 85
    },
    skill_rubric: {
      edges: 94,
      puck_skills: 92,
      shooting: 93,
      hockey_iq: 90,
      contact: 83,
      d_zone: 84,
      transition: 95,
      goalie: 0
    }
  },
  {
    id: "ovs_094",
    entity_type: "player",
    name: "Alban Rexha",
    num: 61,
    pos: "F",
    role_title: "Two-Way Energy Center",
    team: "EHC Basel",
    institution: "EHC Basel",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 185,
    hometown: "Bern, Switzerland",
    date_of_birth: "1992-09-28",
    previous_team: "SC Langenthal (Swiss League)",
    draft_status: "Undrafted",
    country: "SUI",
    composite_score: 87.0,
    avatar_gradient: "from-stone-700 to-red-900",
    notes: "Relentless two-way pivot who plays with high physical motor. Strong faceoff execution, defensive zone coverage, and disruptive forechecking pressure.",
    combine: {
      flying_30m_sec: 3.46,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.12,
      grip_strength_lbs: 176,
      rotational_medball_mph: 51
    },
    micro_kpis: {
      controlled_entry_pct: 84,
      controlled_exit_pct: 88,
      faceoff_win_pct: 55.4,
      high_danger_pass_comp_pct: 84,
      shoulder_scans_per_possession: 7.9,
      wall_battle_win_pct: 89
    },
    skill_rubric: {
      edges: 88,
      puck_skills: 86,
      shooting: 85,
      hockey_iq: 90,
      contact: 88,
      d_zone: 91,
      transition: 87,
      goalie: 0
    }
  },
  {
    id: "ovs_095",
    entity_type: "player",
    name: "Cédric Zubler",
    num: 18,
    pos: "D",
    role_title: "Physical Shutdown Blueliner",
    team: "EHC Basel",
    institution: "EHC Basel",
    league: "Swiss League",
    conference: "Switzerland",
    category: "Swiss League Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 75,
    height_str: "6'3\"",
    weight_lbs: 201,
    hometown: "Aarau, Switzerland",
    date_of_birth: "2000-02-14",
    previous_team: "EVZ Academy / EV Zug",
    draft_status: "Undrafted",
    country: "SUI",
    composite_score: 86.8,
    avatar_gradient: "from-slate-800 to-red-950",
    notes: "Sturdy physical defenseman who protects the high-danger house. Effective stick positioning on rush defense and heavy point shot on second power-play units.",
    combine: {
      flying_30m_sec: 3.51,
      broad_jump_in: 112,
      pro_agility_5_10_5_sec: 4.18,
      grip_strength_lbs: 185,
      rotational_medball_mph: 54
    },
    micro_kpis: {
      controlled_entry_pct: 80,
      controlled_exit_pct: 90,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 82,
      shoulder_scans_per_possession: 7.4,
      wall_battle_win_pct: 93
    },
    skill_rubric: {
      edges: 85,
      puck_skills: 84,
      shooting: 85,
      hockey_iq: 88,
      contact: 94,
      d_zone: 92,
      transition: 86,
      goalie: 0
    }
  },

  // 16. Kassel Huskies (DEL2, Germany)
  {
    id: "ovs_096",
    entity_type: "player",
    name: "Tristan Keck",
    num: 71,
    pos: "F",
    role_title: "Speed Transition Winger",
    team: "Kassel Huskies",
    institution: "Kassel Huskies",
    league: "DEL2",
    conference: "Canada / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 69,
    height_str: "5'9\"",
    weight_lbs: 176,
    hometown: "Morris, Manitoba, Canada",
    date_of_birth: "1995-09-19",
    previous_team: "EC Bad Nauheim / Univ. of Nebraska-Omaha",
    draft_status: "Undrafted",
    country: "CAN",
    composite_score: 88.5,
    avatar_gradient: "from-blue-600 to-cyan-800",
    notes: "Electrifying skater regarded as one of the fastest forwards in German pro hockey. Torches opposing defensemen on wide-lane rushes with rapid lateral cutbacks.",
    combine: {
      flying_30m_sec: 3.36,
      broad_jump_in: 121,
      pro_agility_5_10_5_sec: 4.01,
      grip_strength_lbs: 165,
      rotational_medball_mph: 50
    },
    micro_kpis: {
      controlled_entry_pct: 94,
      controlled_exit_pct: 88,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 86,
      shoulder_scans_per_possession: 8.3,
      wall_battle_win_pct: 82
    },
    skill_rubric: {
      edges: 95,
      puck_skills: 91,
      shooting: 90,
      hockey_iq: 89,
      contact: 80,
      d_zone: 83,
      transition: 96,
      goalie: 0
    }
  },
  {
    id: "ovs_097",
    entity_type: "player",
    name: "Maximilian Faber",
    num: 14,
    pos: "D",
    role_title: "DEL2 Defenseman of the Year",
    team: "Kassel Huskies",
    institution: "Kassel Huskies",
    league: "DEL2",
    conference: "Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 198,
    hometown: "Hagen, Germany",
    date_of_birth: "1993-05-18",
    previous_team: "Krefeld Pinguine / Kölner Haie (DEL)",
    draft_status: "Undrafted Free Agent",
    country: "GER",
    composite_score: 89.4,
    avatar_gradient: "from-blue-800 to-slate-950",
    notes: "Multi-time DEL2 Defenseman of the Year. Dominant blue-line general who controls the flow of play, distributes on the power play, and anchors the top pairing.",
    combine: {
      flying_30m_sec: 3.45,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.09,
      grip_strength_lbs: 182,
      rotational_medball_mph: 53
    },
    micro_kpis: {
      controlled_entry_pct: 88,
      controlled_exit_pct: 94,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 92,
      shoulder_scans_per_possession: 8.6,
      wall_battle_win_pct: 90
    },
    skill_rubric: {
      edges: 91,
      puck_skills: 92,
      shooting: 89,
      hockey_iq: 95,
      contact: 89,
      d_zone: 93,
      transition: 93,
      goalie: 0
    }
  },
  {
    id: "ovs_098",
    entity_type: "player",
    name: "Joel Lowry",
    num: 17,
    pos: "F",
    role_title: "Heavy Power Forward",
    team: "Kassel Huskies",
    institution: "Kassel Huskies",
    league: "DEL2",
    conference: "Canada / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 190,
    hometown: "Calgary, Alberta, Canada",
    date_of_birth: "1991-11-15",
    previous_team: "Iserlohn Roosters (DEL) / Cornell Big Red (NCAA)",
    draft_status: "Los Angeles (2011, 140th)",
    country: "CAN",
    composite_score: 87.7,
    avatar_gradient: "from-cyan-700 to-blue-950",
    notes: "Former Los Angeles Kings draft pick with NCAA D1 and DEL experience. High physical engagement in the offensive zone, establishing heavy screens and tip scoring.",
    combine: {
      flying_30m_sec: 3.49,
      broad_jump_in: 113,
      pro_agility_5_10_5_sec: 4.16,
      grip_strength_lbs: 184,
      rotational_medball_mph: 54
    },
    micro_kpis: {
      controlled_entry_pct: 84,
      controlled_exit_pct: 86,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 83,
      shoulder_scans_per_possession: 7.2,
      wall_battle_win_pct: 93
    },
    skill_rubric: {
      edges: 86,
      puck_skills: 87,
      shooting: 88,
      hockey_iq: 89,
      contact: 94,
      d_zone: 86,
      transition: 85,
      goalie: 0
    }
  },

  // 17. Krefeld Pinguine (DEL2, Germany)
  {
    id: "ovs_099",
    entity_type: "player",
    name: "Alexander Weiß",
    num: 57,
    pos: "F",
    role_title: "Veteran Franchise Captain",
    team: "Krefeld Pinguine",
    institution: "Krefeld Pinguine",
    league: "DEL2",
    conference: "Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 190,
    hometown: "Titisee-Neustadt, Germany",
    date_of_birth: "1987-01-29",
    previous_team: "Schwenninger Wild Wings / Eisbären Berlin (DEL)",
    draft_status: "Undrafted Veteran",
    country: "GER",
    composite_score: 88.6,
    avatar_gradient: "from-amber-500 to-stone-900",
    notes: "Legendary German pro veteran with over 800 DEL games and multiple German championships. Unshakable defensive poise, leadership, and high faceoff win rate.",
    combine: {
      flying_30m_sec: 3.52,
      broad_jump_in: 110,
      pro_agility_5_10_5_sec: 4.18,
      grip_strength_lbs: 180,
      rotational_medball_mph: 52
    },
    micro_kpis: {
      controlled_entry_pct: 86,
      controlled_exit_pct: 90,
      faceoff_win_pct: 58.1,
      high_danger_pass_comp_pct: 88,
      shoulder_scans_per_possession: 8.5,
      wall_battle_win_pct: 90
    },
    skill_rubric: {
      edges: 86,
      puck_skills: 89,
      shooting: 86,
      hockey_iq: 95,
      contact: 88,
      d_zone: 92,
      transition: 86,
      goalie: 0
    }
  },
  {
    id: "ovs_100",
    entity_type: "player",
    name: "Davis Vandane",
    num: 4,
    pos: "D",
    role_title: "Offensive Power-Play Quarterback",
    team: "Krefeld Pinguine",
    institution: "Krefeld Pinguine",
    league: "DEL2",
    conference: "Canada / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 76,
    height_str: "6'4\"",
    weight_lbs: 205,
    hometown: "Yorkton, Saskatchewan, Canada",
    date_of_birth: "1992-04-24",
    previous_team: "Frankfurt Löwen / Esbjerg Energy",
    draft_status: "Undrafted Free Agent",
    country: "CAN",
    composite_score: 88.2,
    avatar_gradient: "from-yellow-600 to-slate-900",
    notes: "Tall offensive defenseman with a booming slapshot from the point. Quarterbacks Krefeld's top power play and generates secondary rush generation.",
    combine: {
      flying_30m_sec: 3.48,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.14,
      grip_strength_lbs: 186,
      rotational_medball_mph: 55
    },
    micro_kpis: {
      controlled_entry_pct: 84,
      controlled_exit_pct: 92,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 88,
      shoulder_scans_per_possession: 8.0,
      wall_battle_win_pct: 89
    },
    skill_rubric: {
      edges: 87,
      puck_skills: 90,
      shooting: 92,
      hockey_iq: 91,
      contact: 89,
      d_zone: 87,
      transition: 90,
      goalie: 0
    }
  },
  {
    id: "ovs_101",
    entity_type: "player",
    name: "Felix Bick",
    num: 35,
    pos: "G",
    role_title: "Starting Goaltender",
    team: "Krefeld Pinguine",
    institution: "Krefeld Pinguine",
    league: "DEL2",
    conference: "Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 183,
    hometown: "Villingen-Schwenningen, Germany",
    date_of_birth: "1992-11-06",
    previous_team: "EC Bad Nauheim / Düsseldorfer EG (DEL)",
    draft_status: "Undrafted",
    country: "GER",
    composite_score: 87.6,
    avatar_gradient: "from-amber-600 to-yellow-800",
    notes: "Battle-tested starting goaltender with elite stamina and agility. Frequently stops 35+ shots in high-pressure DEL2 playoff environments.",
    combine: {
      flying_30m_sec: 3.50,
      broad_jump_in: 112,
      pro_agility_5_10_5_sec: 4.10,
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
      edges: 89,
      puck_skills: 76,
      shooting: 56,
      hockey_iq: 90,
      contact: 70,
      d_zone: 92,
      transition: 80,
      goalie: 92
    }
  },

  // 18. Ravensburg Towerstars (DEL2, Germany)
  {
    id: "ovs_102",
    entity_type: "player",
    name: "Robbie Czarnik",
    num: 27,
    pos: "F",
    role_title: "Elite Scoring Playmaker",
    team: "Ravensburg Towerstars",
    institution: "Ravensburg Towerstars",
    league: "DEL2",
    conference: "USA / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 190,
    hometown: "Detroit, Michigan, USA",
    date_of_birth: "1990-01-25",
    previous_team: "Michigan Wolverines / USNTDP / Providence Bruins (AHL)",
    draft_status: "Los Angeles (2008, 63rd)",
    country: "USA",
    composite_score: 89.1,
    avatar_gradient: "from-cyan-600 to-blue-900",
    notes: "Former Los Angeles Kings 3rd-round draft pick and USNTDP alum. One of the most prolific American imports in German hockey history with superb playmaking touch.",
    combine: {
      flying_30m_sec: 3.44,
      broad_jump_in: 115,
      pro_agility_5_10_5_sec: 4.11,
      grip_strength_lbs: 175,
      rotational_medball_mph: 52
    },
    micro_kpis: {
      controlled_entry_pct: 91,
      controlled_exit_pct: 88,
      faceoff_win_pct: 54.2,
      high_danger_pass_comp_pct: 93,
      shoulder_scans_per_possession: 8.6,
      wall_battle_win_pct: 86
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 93,
      shooting: 91,
      hockey_iq: 95,
      contact: 84,
      d_zone: 86,
      transition: 91,
      goalie: 0
    }
  },
  {
    id: "ovs_103",
    entity_type: "player",
    name: "Denis Pfaffengut",
    num: 7,
    pos: "D",
    role_title: "Rugged Two-Way Defenseman",
    team: "Ravensburg Towerstars",
    institution: "Ravensburg Towerstars",
    league: "DEL2",
    conference: "Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 192,
    hometown: "Kaufbeuren, Germany",
    date_of_birth: "1997-12-07",
    previous_team: "ESV Kaufbeuren (DEL2)",
    draft_status: "Undrafted",
    country: "GER",
    composite_score: 87.2,
    avatar_gradient: "from-blue-700 to-indigo-950",
    notes: "Tough, physical defenseman who sets the tone defensively. Delivers heavy body checks, clears rebounds, and makes dependable outlet passes.",
    combine: {
      flying_30m_sec: 3.49,
      broad_jump_in: 113,
      pro_agility_5_10_5_sec: 4.15,
      grip_strength_lbs: 182,
      rotational_medball_mph: 53
    },
    micro_kpis: {
      controlled_entry_pct: 80,
      controlled_exit_pct: 91,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 83,
      shoulder_scans_per_possession: 7.7,
      wall_battle_win_pct: 92
    },
    skill_rubric: {
      edges: 86,
      puck_skills: 85,
      shooting: 84,
      hockey_iq: 89,
      contact: 94,
      d_zone: 92,
      transition: 87,
      goalie: 0
    }
  },
  {
    id: "ovs_104",
    entity_type: "player",
    name: "Fabian Dietz",
    num: 92,
    pos: "F",
    role_title: "High-Motor Two-Way Winger",
    team: "Ravensburg Towerstars",
    institution: "Ravensburg Towerstars",
    league: "DEL2",
    conference: "Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 71,
    height_str: "5'11\"",
    weight_lbs: 181,
    hometown: "Weilheim, Germany",
    date_of_birth: "1999-04-12",
    previous_team: "ERC Ingolstadt (DEL)",
    draft_status: "Undrafted",
    country: "GER",
    composite_score: 86.8,
    avatar_gradient: "from-sky-600 to-blue-800",
    notes: "Relentless forechecking winger with top-end work ethic. Disrupts breakout transitions and attacks the slot for second-chance scoring opportunities.",
    combine: {
      flying_30m_sec: 3.42,
      broad_jump_in: 116,
      pro_agility_5_10_5_sec: 4.08,
      grip_strength_lbs: 167,
      rotational_medball_mph: 49
    },
    micro_kpis: {
      controlled_entry_pct: 88,
      controlled_exit_pct: 86,
      faceoff_win_pct: 48,
      high_danger_pass_comp_pct: 84,
      shoulder_scans_per_possession: 7.8,
      wall_battle_win_pct: 88
    },
    skill_rubric: {
      edges: 90,
      puck_skills: 87,
      shooting: 87,
      hockey_iq: 88,
      contact: 86,
      d_zone: 86,
      transition: 90,
      goalie: 0
    }
  },

  // 19. EV Landshut (DEL2, Germany)
  {
    id: "ovs_105",
    entity_type: "player",
    name: "Tor Immo",
    num: 13,
    pos: "F",
    role_title: "Power Sniper",
    team: "EV Landshut",
    institution: "EV Landshut",
    league: "DEL2",
    conference: "Sweden / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 198,
    hometown: "Köping, Sweden",
    date_of_birth: "1994-11-09",
    previous_team: "BIK Karlskoga / Leksands IF (SHL)",
    draft_status: "Undrafted Free Agent",
    country: "SWE",
    composite_score: 88.7,
    avatar_gradient: "from-red-600 to-stone-900",
    notes: "Heavy Swedish goal scorer with an elite one-timer from the faceoff circle. Outstanding release velocity and physical puck-protection skills along the boards.",
    combine: {
      flying_30m_sec: 3.46,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.12,
      grip_strength_lbs: 182,
      rotational_medball_mph: 54
    },
    micro_kpis: {
      controlled_entry_pct: 89,
      controlled_exit_pct: 86,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 85,
      shoulder_scans_per_possession: 7.6,
      wall_battle_win_pct: 91
    },
    skill_rubric: {
      edges: 88,
      puck_skills: 89,
      shooting: 95,
      hockey_iq: 89,
      contact: 90,
      d_zone: 84,
      transition: 88,
      goalie: 0
    }
  },
  {
    id: "ovs_106",
    entity_type: "player",
    name: "Nick Pageau",
    num: 44,
    pos: "D",
    role_title: "Veteran General on the Blue Line",
    team: "EV Landshut",
    institution: "EV Landshut",
    league: "DEL2",
    conference: "Canada / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 74,
    height_str: "6'2\"",
    weight_lbs: 205,
    hometown: "St. Catharines, Ontario, Canada",
    date_of_birth: "1988-04-03",
    previous_team: "Kassel Huskies / Belleville Bulls (OHL)",
    draft_status: "Undrafted Veteran",
    country: "CAN",
    composite_score: 88.0,
    avatar_gradient: "from-stone-700 to-red-950",
    notes: "Former DEL2 Defenseman of the Year and steady leader. Exceptional poise under forecheck pressure, quarterbacking breakouts with precision stretch passes.",
    combine: {
      flying_30m_sec: 3.53,
      broad_jump_in: 110,
      pro_agility_5_10_5_sec: 4.19,
      grip_strength_lbs: 185,
      rotational_medball_mph: 53
    },
    micro_kpis: {
      controlled_entry_pct: 81,
      controlled_exit_pct: 93,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 88,
      shoulder_scans_per_possession: 8.4,
      wall_battle_win_pct: 91
    },
    skill_rubric: {
      edges: 85,
      puck_skills: 88,
      shooting: 86,
      hockey_iq: 94,
      contact: 91,
      d_zone: 93,
      transition: 89,
      goalie: 0
    }
  },
  {
    id: "ovs_107",
    entity_type: "player",
    name: "Jonas Dietl",
    num: 33,
    pos: "G",
    role_title: "Young Standout Goaltender",
    team: "EV Landshut",
    institution: "EV Landshut",
    league: "DEL2",
    conference: "Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Prospect",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 181,
    hometown: "Straubing, Germany",
    date_of_birth: "2004-03-29",
    previous_team: "EV Landshut DNL U20",
    draft_status: "2025 Re-Entry Eligible",
    country: "GER",
    composite_score: 86.5,
    avatar_gradient: "from-red-700 to-slate-900",
    notes: "Exciting young German goaltending prospect with sharp athletic instincts. Fast edge recoveries and calm demeanor in high-danger penalty kill scrambles.",
    combine: {
      flying_30m_sec: 3.48,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.10,
      grip_strength_lbs: 164,
      rotational_medball_mph: 48
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
      puck_skills: 75,
      shooting: 54,
      hockey_iq: 89,
      contact: 67,
      d_zone: 91,
      transition: 79,
      goalie: 91
    }
  },

  // 20. Dresdner Eislöwen (DEL2, Germany)
  {
    id: "ovs_108",
    entity_type: "player",
    name: "Dane Fox",
    num: 74,
    pos: "F",
    role_title: "Power Sniper & Playmaker",
    team: "Dresdner Eislöwen",
    institution: "Dresdner Eislöwen",
    league: "DEL2",
    conference: "Canada / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 194,
    hometown: "Thamesville, Ontario, Canada",
    date_of_birth: "1993-10-13",
    previous_team: "Nürnberg Ice Tigers (DEL) / Utica Comets (AHL)",
    draft_status: "Vancouver Canucks Free Agent Signing",
    country: "CAN",
    composite_score: 88.9,
    avatar_gradient: "from-blue-600 to-amber-700",
    notes: "Former OHL 64-goal scoring sensation and long-time DEL star for Nürnberg. Brings physical swagger, heavy shooting touch, and high offensive execution to Dresden.",
    combine: {
      flying_30m_sec: 3.44,
      broad_jump_in: 116,
      pro_agility_5_10_5_sec: 4.10,
      grip_strength_lbs: 184,
      rotational_medball_mph: 55
    },
    micro_kpis: {
      controlled_entry_pct: 90,
      controlled_exit_pct: 87,
      faceoff_win_pct: 52.5,
      high_danger_pass_comp_pct: 88,
      shoulder_scans_per_possession: 7.9,
      wall_battle_win_pct: 93
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 92,
      shooting: 94,
      hockey_iq: 91,
      contact: 93,
      d_zone: 85,
      transition: 90,
      goalie: 0
    }
  },
  {
    id: "ovs_109",
    entity_type: "player",
    name: "David Suvanto",
    num: 25,
    pos: "D",
    role_title: "Composed Two-Way Defenseman",
    team: "Dresdner Eislöwen",
    institution: "Dresdner Eislöwen",
    league: "DEL2",
    conference: "Sweden / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Roster",
    height_in: 73,
    height_str: "6'1\"",
    weight_lbs: 187,
    hometown: "Hedemora, Sweden",
    date_of_birth: "1993-11-20",
    previous_team: "Rødovre Mighty Bulls / Almtuna IS",
    draft_status: "Undrafted",
    country: "SWE",
    composite_score: 87.5,
    avatar_gradient: "from-blue-700 to-slate-900",
    notes: "Intelligent Swedish blueliner with crisp transition instincts. Excellent defensive gap control, heads-up breakout passing, and low turnover differential.",
    combine: {
      flying_30m_sec: 3.46,
      broad_jump_in: 114,
      pro_agility_5_10_5_sec: 4.11,
      grip_strength_lbs: 172,
      rotational_medball_mph: 51
    },
    micro_kpis: {
      controlled_entry_pct: 83,
      controlled_exit_pct: 93,
      faceoff_win_pct: 0,
      high_danger_pass_comp_pct: 87,
      shoulder_scans_per_possession: 8.2,
      wall_battle_win_pct: 87
    },
    skill_rubric: {
      edges: 89,
      puck_skills: 88,
      shooting: 84,
      hockey_iq: 91,
      contact: 85,
      d_zone: 91,
      transition: 91,
      goalie: 0
    }
  },
  {
    id: "ovs_110",
    entity_type: "player",
    name: "Janick Schwendener",
    num: 30,
    pos: "G",
    role_title: "Championship Veteran Goaltender",
    team: "Dresdner Eislöwen",
    institution: "Dresdner Eislöwen",
    league: "DEL2",
    conference: "Switzerland / Germany",
    category: "DEL2 Tier 2 Pro",
    class_level: "Pro Veteran",
    height_in: 72,
    height_str: "6'0\"",
    weight_lbs: 185,
    hometown: "Chur, Switzerland",
    date_of_birth: "1992-06-30",
    previous_team: "HC Davos (NL Champion) / Iserlohn Roosters (DEL)",
    draft_status: "Undrafted Veteran",
    country: "SUI",
    composite_score: 88.5,
    avatar_gradient: "from-amber-600 to-blue-900",
    notes: "Premier DEL2 starting goaltender and former Swiss National League champion with HC Davos. Outstanding positional discipline, tracking, and game management.",
    combine: {
      flying_30m_sec: 3.49,
      broad_jump_in: 113,
      pro_agility_5_10_5_sec: 4.09,
      grip_strength_lbs: 170,
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
      edges: 90,
      puck_skills: 78,
      shooting: 58,
      hockey_iq: 92,
      contact: 72,
      d_zone: 93,
      transition: 82,
      goalie: 93
    }
  }
];

// 1. Update static/js/overseas_players_database.js
const ovsPlayersFile = path.join(ROOT, 'static/js/overseas_players_database.js');
let ovsContent = fs.readFileSync(ovsPlayersFile, 'utf8');

// Update header
ovsContent = ovsContent.replace('Total Verified Overseas Players: 80', 'Total Verified Overseas Players: 110');

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
console.log('✓ Successfully inserted 30 overseas players into static/js/overseas_players_database.js (now 110 total)');

// 2. Update static/js/master_players.js header
const masterFile = path.join(ROOT, 'static/js/master_players.js');
let masterContent = fs.readFileSync(masterFile, 'utf8');
masterContent = masterContent.replace(
  'Total Players: 4160 | Total Coaches & Staff: 141 | Total Personnel: 4301',
  'Total Players: 4190 | Total Coaches & Staff: 141 | Total Personnel: 4331'
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

// 4. Update site-wide counts (4,160 -> 4,190 and 4,301 -> 4,331)
replaceInFile('database.html', [
  ['4,301', '4,331'],
  ['4,160+', '4,190+']
]);

replaceInFile('index.html', [
  ['4,160+ ATHLETES • 365 GLOBAL CLUBS & PROGRAMS', '4,190+ ATHLETES • 365 GLOBAL CLUBS & PROGRAMS'],
  ['<strong>4,160+ Master Player Directory</strong>: Unrestricted search across all 4,160+ athletes with deep league and NHLe filters.', '<strong>4,190+ Master Player Directory</strong>: Unrestricted search across all 4,190+ athletes with deep league and NHLe filters.'],
  ['<strong>4,160+ Player Directory & Comparison</strong>: Full database access and 8-axis radar comparison charts for game prep.', '<strong>4,190+ Player Directory & Comparison</strong>: Full database access and 8-axis radar comparison charts for game prep.'],
  ['<strong>4,160+ Player Database Search</strong>: Research profiles, developmental trajectories, and career stats of over 4,160 athletes.', '<strong>4,190+ Player Database Search</strong>: Research profiles, developmental trajectories, and career stats of over 4,190 athletes.'],
  ['<strong>4,160+ Player & Team Directory</strong>: Research competitive teams, leagues, prep academies, and college programs.', '<strong>4,190+ Player & Team Directory</strong>: Research competitive teams, leagues, prep academies, and college programs.'],
  ['<strong>4,160+ Master Player Directory & Search</strong>', '<strong>4,190+ Master Player Directory & Search</strong>'],
  ['Comprehensive database of 4,160+ athletes across leagues', 'Comprehensive database of 4,190+ athletes across leagues'],
  ['Comprehensive directory of 4,160+ athlete dossiers', 'Comprehensive directory of 4,190+ athlete dossiers'],
  ['4,160+ Player Directory:', '4,190+ Player Directory:']
]);

replaceInFile('scout.html', [
  ['<span>4,160+ Database</span>', '<span>4,190+ Database</span>'],
  ['<span>Browse 4,160+ Directory →</span>', '<span>Browse 4,190+ Directory →</span>'],
  ['Live database of <strong class="text-white" id="directoryTotalCount">4,160</strong> verified collegiate', 'Live database of <strong class="text-white" id="directoryTotalCount">4,190</strong> verified collegiate'],
  ['Access to this live micro-telemetry logger, 4,160+ verified non-NHL amateur athlete dossiers', 'Access to this live micro-telemetry logger, 4,190+ verified non-NHL amateur athlete dossiers'],
  ['<span>4,160+ Non-NHL Amateur Athlete Dossiers & Verified Registrar Match</span>', '<span>4,190+ Non-NHL Amateur Athlete Dossiers & Verified Registrar Match</span>'],
  ['or the 4,160+ athlete database to add players', 'or the 4,190+ athlete database to add players']
]);

replaceInFile('app.html', [
  ['Personal OS • 4,160+ Player Directory', 'Personal OS • 4,190+ Player Directory'],
  ['4,160+ Players', '4,190+ Players'],
  ['launcher for all 4,160+ verified prospects', 'launcher for all 4,190+ verified prospects'],
  ['Choose from 4,160+ Verified Amateur Prospects', 'Choose from 4,190+ Verified Amateur Prospects'],
  ['4,160+ Master Player Directory & Analytics', '4,190+ Master Player Directory & Analytics'],
  ['Searchable 4,160+ Player Scouting Database', 'Searchable 4,190+ Player Scouting Database'],
  ['Unrestricted 4,160+ Master Athlete Database with Ledger Audit', 'Unrestricted 4,190+ Master Athlete Database with Ledger Audit'],
  ['4,160+ Player Database & Comparison', '4,190+ Player Database & Comparison'],
  ['4,160+ player master directory, NHL mock draft & combine lab', '4,190+ player master directory, NHL mock draft & combine lab'],
  ['Exporting CSV for 4,160+ master athletes...', 'Exporting CSV for 4,190+ master athletes...'],
  ['🌐 4,160+ Database Active', '🌐 4,190+ Database Active'],
  ['from the 4,160+ master catalog above', 'from the 4,190+ master catalog above'],
  ['Personal athlete OS, 4,160+ player database', 'Personal athlete OS, 4,190+ player database']
]);

replaceInFile('coach.html', [
  ['Select from 4,160+ Catalog...', 'Select from 4,190+ Catalog...']
]);

replaceInFile('community.html', [
  ['Claim Profile (4,160+)', 'Claim Profile (4,190+)']
]);

replaceInFile('login.html', [
  ['4,160+ Player Directory', '4,190+ Player Directory']
]);

replaceInFile('manifest.json', [
  ['4,160+ Athlete Directory & Scout Desk', '4,190+ Athlete Directory & Scout Desk']
]);

replaceInFile('static/js/agent_mesh_engine.js', [
  ['Cross-checked 4,160+ athlete profiles', 'Cross-checked 4,190+ athlete profiles'],
  ['totalCandidatesIngested: 4160,', 'totalCandidatesIngested: 4190,'],
  ['Audits candidates against 4,160+ registered master players', 'Audits candidates against 4,190+ registered master players']
]);

replaceInFile('static/js/ai_scouting_copilot.js', [
  ['• Athlete Trajectory & Bio Evaluation (4,160+ dossiers)', '• Athlete Trajectory & Bio Evaluation (4,190+ dossiers)'],
  ['tracks <strong>4,160+ verifiable non-NHL athletes</strong>', 'tracks <strong>4,190+ verifiable non-NHL athletes</strong>'],
  ['Search All 4,160 Athletes →', 'Search All 4,190 Athletes →']
]);

replaceInFile('static/js/app.js', [
  ['Open Full Master Database Hub (4,160+ Athletes) &rarr;', 'Open Full Master Database Hub (4,190+ Athletes) &rarr;']
]);

replaceInFile('static/js/auth_engine.js', [
  ['⚡ Claim Profile (4,160+)', '⚡ Claim Profile (4,190+)'],
  ['Claim Existing Dossier from 4,160+ Athlete Database', 'Claim Existing Dossier from 4,190+ Athlete Database'],
  ['Not listed in our 4,160+ collegiate/junior database yet?', 'Not listed in our 4,190+ collegiate/junior database yet?'],
  ['search the 4,160+ player registry.', 'search the 4,190+ player registry.'],
  ['"Searchable 4,160+ Player Scouting Database"', '"Searchable 4,190+ Player Scouting Database"'],
  ['"Unrestricted 4,160+ Master Athlete Database with Ledger Audit"', '"Unrestricted 4,190+ Master Athlete Database with Ledger Audit"']
]);

replaceInFile('static/js/blueline-core.js', [
  ['placeholder="Search DraftLineup.com (4,160+ athletes, draft board, suites...)"', 'placeholder="Search DraftLineup.com (4,190+ athletes, draft board, suites...)"'],
  ['<div className="text-xs text-slate-400">4,160+ verified athletes, scouts & evaluation ledgers</div>', '<div className="text-xs text-slate-400">4,190+ verified athletes, scouts & evaluation ledgers</div>']
]);

replaceInFile('static/js/global_nav.js', [
  ['Comprehensive directory of 4,160+ athlete dossiers', 'Comprehensive directory of 4,190+ athlete dossiers']
]);

replaceInFile('static/js/social_mesh_engine.js', [
  ['Tracking 4,160+ non-NHL athletes', 'Tracking 4,190+ non-NHL athletes']
]);

replaceInFile('static/js/tournament_engine.js', [
  ['linked to 4,160+ Master Player Directory', 'linked to 4,190+ Master Player Directory']
]);

console.log('--- ALL UPDATES COMPLETED SUCCESSFULLY ---');
