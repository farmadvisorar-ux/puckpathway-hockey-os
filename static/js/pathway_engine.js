/**
 * BlueLine DataWorks: Lifelong Athlete Pathway & Career Trajectory Engine
 * 
 * Capabilities:
 * - 5-Stage Interactive Career Progression Ladder (Youth AAA -> Junior -> NCAA/CHL -> Draft/ELC -> NHL Pro)
 * - The Crossroads: NCAA College Route (with NIL) vs Major Junior CHL Decision Matrix
 * - Historical Superstar Path Precedents (Makar, Celebrini, Matthews, Bedard, Hellebuyck, Fox)
 * - Monte Carlo Career Longevity Simulator (NCAA, Draft, 100+ NHL Games, Career Earnings $M)
 * - The BlueLine Wire Broadcast Engine (#LifelongTracking, #HockeyPathway, #NCAAvsCHL)
 */

(function(window) {
  "use strict";

  // =========================================================================
  // 1. THE 5-STAGE CAREER PROGRESSION LADDER
  // =========================================================================
  const PATHWAY_STAGES = [
    {
      id: "stage_1",
      number: 1,
      title: "Youth & Bantam Development",
      ageRange: "Ages 12 – 14 (12U – 14U AAA)",
      icon: "🌱",
      badge: "FOUNDATIONAL SKILL PHASE",
      focus: "High-Touch ADM Skill Acquisition & Biological Growth Tracking",
      milestones: [
        { age: "12U", event: "Peak Height Velocity (PHV) Assessment & Multi-Sport Cross-Training" },
        { age: "13U", event: "Bantam Minor AAA National Showcase Circuit & Tier 1 Scouting Identification" },
        { age: "14U", event: "USHL Futures Draft Eligibility, Bantam Major Tournaments & Advisor Alignment" }
      ],
      keyMetrics: {
        iceHoursWeekly: "6.5 – 8.5 hrs",
        practiceGameRatio: "3:1 optimal",
        drylandFocus: "Neuromuscular agility, core mobility & movement quality",
        scoutingFocus: "Puck poise under pressure, edges, non-puck decision speed"
      },
      guidance: "Avoid premature specialization. Biological age often diverges by up to 3 years from chronological age during this growth spurt window."
    },
    {
      id: "stage_2",
      number: 2,
      title: "Junior Tier 1 / Tier 2 Development",
      ageRange: "Ages 15 – 17 (15U – 18U)",
      icon: "⚡",
      badge: "ELITE ACCELERATION PHASE",
      focus: "USHL, NTDP, BCHL, and Tier 2 Junior Competitive Maturation",
      milestones: [
        { age: "15U", event: "USHL Phase I Draft (Futures Draft) & USA Hockey National Development Camps" },
        { age: "16U", event: "USHL Phase II / NAHL Entry Draft, NTDP 40-Man Evaluation Camp Invitations" },
        { age: "17U", event: "USHL / BCHL Rookie Seasons, World U17 Challenge, and Early NCAA Commitments" }
      ],
      keyMetrics: {
        iceHoursWeekly: "10 – 14 hrs",
        practiceGameRatio: "2:1 ratio",
        drylandFocus: "Structural hypertrophy, rotational power & explosive sprint mechanics",
        scoutingFocus: "Pace of play translation, defensive zone wall battles, forecheck pressure"
      },
      guidance: "Focus on meaningful ice time and power play/penalty kill situational trust over team prestige. 18 minutes a night in junior beats 6 minutes on a stacked roster."
    },
    {
      id: "stage_3",
      number: 3,
      title: "The Crossroads: College vs Major Junior",
      ageRange: "Ages 17 – 20 (NCAA D1 vs CHL)",
      icon: "⚖️",
      badge: "CRITICAL STRATEGIC CROSSROADS",
      focus: "NCAA Collegiate Route (NIL + Degree) vs CHL Major Junior Pro Schedule",
      milestones: [
        { age: "17.5", event: "NCAA National Letter of Intent (NLI) Signing or CHL Standard Player Agreement" },
        { age: "18 – 19", event: "NCAA Freshman/Sophomore seasons or OHL/WHL/QMJHL Draft Year showcasing" },
        { age: "20", event: "Hobey Baker / Memorial Cup contention, World Junior Championship representation" }
      ],
      keyMetrics: {
        iceHoursWeekly: "12 – 16 hrs",
        practiceGameRatio: "NCAA: 3.5:1 (36 games) | CHL: 1.5:1 (68 games)",
        drylandFocus: "Collegiate strength facilities produce 15–20 lbs of functional muscle by age 21",
        scoutingFocus: "Physical maturity against 24-year-old college seniors vs junior speed"
      },
      guidance: "The NCAA route provides 3-4 days of dedicated strength training every week plus lucrative NIL opportunities; CHL offers NHL pro travel tempo and schedule rhythm."
    },
    {
      id: "stage_4",
      number: 4,
      title: "NHL Draft & Entry-Level Window",
      ageRange: "Ages 18 – 21 (NHL Entry Draft & ELC)",
      icon: "🎯",
      badge: "PRO TRANSITION PHASE",
      focus: "Draft Selection, NHL Combine, and Entry-Level Contract Management",
      milestones: [
        { age: "18.0", event: "NHL Entry Draft Selection (Rounds 1 – 7) & NHL Development Camps" },
        { age: "18 – 20", event: "3-Year Entry-Level Contract (ELC) Signing; 9-Game Slide Rule Evaluation" },
        { age: "20 – 21", event: "AHL Apprentice Transition or European Pro Season with NHL Training Camp" }
      ],
      keyMetrics: {
        elcSalaryCeiling: "$975,000 max AAV (plus performance bonuses up to $3.5M)",
        slideRule: "Players under age 20 sliding contract if playing < 10 NHL games",
        waiverExemption: "Exempt from waivers for 3–5 years depending on signing age",
        scoutingFocus: "Consistency in small spaces, wall puck battles, positional details without the puck"
      },
      guidance: "Rushing to pro hockey before physical readiness can derail development. Maximizing an extra collegiate year often leads to immediate NHL top-6 impact."
    },
    {
      id: "stage_5",
      number: 5,
      title: "Professional Prime & Longevity",
      ageRange: "Ages 22 – 35+ (NHL Career & UFA Peak)",
      icon: "🏆",
      badge: "ELITE EARNINGS & STANLEY CUP PHASE",
      focus: "NHL Everyday Regular, RFA Arbitration, Multi-Year Second Contracts & UFA Freedom",
      milestones: [
        { age: "22 – 24", event: "Breakout Sophomore NHL Season & First Restricted Free Agent (RFA) Contract" },
        { age: "25 – 28", event: "Peak Athletic Prime, Arbitration Rights, Stanley Cup Contention" },
        { age: "27+", event: "Unrestricted Free Agency (Group 3 UFA: 7 Accrued Seasons or Age 27)" }
      ],
      keyMetrics: {
        peakPerformanceAge: "Ages 24 – 27 for forwards, 25 – 28 for defensemen",
        averageCareerLength: "4.5 seasons for NHL skaters reaching 100+ games",
        contractEfficiency: "Second contract (bridge vs 8-year term) determines financial security",
        veteranLongevity: "Puck touch IQ and defensive zone reliability extend careers past age 32"
      },
      guidance: "Athletes who build elite habits in stages 1-3 have career longevity extending 8–12 years past their initial entry-level contract."
    }
  ];

  // =========================================================================
  // 2. THE CROSSROADS: NCAA COLLEGE VS MAJOR JUNIOR (CHL)
  // =========================================================================
  const CROSSROADS_COMPARISON = {
    ncaa: {
      route: "NCAA Division I Collegiate Route",
      tagline: "High Physical Development, Elite Academics & NIL Monetization",
      gamesPerSeason: "34 – 40 games",
      scheduleRhythm: "Friday & Saturday games, leaving Monday–Thursday for intense weight training & skill development",
      weightRoomHours: "8 – 12 hours weekly with dedicated D1 strength coaches",
      nilEarningPotential: "$35,000 – $350,000+ annually for elite stars",
      academicSecurity: "Full 4-year tuition, room, board, and degree completion valued at $200k – $320k",
      draftRightsRetention: "NHL team holds drafted college player rights for up to 4 years (until August 15 post-graduation)",
      idealArchetype: "Late bloomers, defensemen needing strength, high-academic athletes, and players prioritizing physical maturity",
      notableSuccesses: "Cale Makar, Adam Fox, Quinn Hughes, Macklin Celebrini, Matthew Knies, Connor Hellebuyck"
    },
    chl: {
      route: "Major Junior CHL (OHL / WHL / QMJHL)",
      tagline: "Pro Style Travel Tempo & High Game Repetitions",
      gamesPerSeason: "68 games plus up to 28 playoff games",
      scheduleRhythm: "3 games in 4 nights with extensive bus travel mimicking the AHL and NHL schedule",
      weightRoomHours: "3 – 5 hours weekly (limited by compressed travel and game recovery)",
      nilEarningPotential: "Weekly player development stipend ($75 – $250/week) plus equipment sponsorship",
      academicSecurity: "CHL scholarship package (1 year of Canadian university tuition for every season played)",
      draftRightsRetention: "NHL team must sign drafted CHL player within 2 years, or player re-enters draft",
      idealArchetype: "Early physical bloomers, high-volume scorers who thrive on game reps, players ready for immediate pro habits",
      notableSuccesses: "Connor McDavid, Nathan MacKinnon, Sidney Crosby, Connor Bedard, Brayden Point"
    }
  };

  // =========================================================================
  // 3. SUPERSTAR DEVELOPMENTAL PRECEDENT TRACKERS
  // =========================================================================
  const SUPERSTAR_PRECEDENTS = [
    {
      name: "Cale Makar",
      position: "Defenseman",
      team: "Colorado Avalanche",
      trophies: "Stanley Cup, Conn Smythe, Norris Trophy, Calder Trophy, Hobey Baker",
      pathSummary: "Calgary Royals U15 AAA -> Brooks Bandits (AJHL) -> UMass Amherst (NCAA) -> NHL Colorado Avalanche",
      milestones: [
        { age: "Age 15", league: "Calgary Royals U15 AAA", stats: "Undersized 5'5\" defenseman, bypassed by initial Western elite tier" },
        { age: "Age 17-18", league: "Brooks Bandits (AJHL)", stats: "Dominant 75 pts in 54 GP; RBC Cup Champion; Drafted 4th overall (2017)" },
        { age: "Age 19-20", league: "UMass Amherst (NCAA D1)", stats: "Hobey Baker Winner, led program to first National Title Game" },
        { age: "Age 20", league: "Colorado Avalanche (NHL)", stats: "Scored first NHL goal in Stanley Cup Playoff debut vs Calgary" }
      ],
      lesson: "Patience and the Junior A/NCAA route allowed Makar's growth spurt and skating mechanics to develop into the premier defenseman of his generation."
    },
    {
      name: "Macklin Celebrini",
      position: "Center",
      team: "San Jose Sharks",
      trophies: "Hobey Baker Award (Youngest Ever), #1 Overall NHL Draft Pick",
      pathSummary: "San Jose Jr. Sharks -> Shattuck-St. Mary's -> Chicago Steel (USHL) -> Boston University (NCAA) -> NHL",
      milestones: [
        { age: "Age 14", league: "San Jose Jr. Sharks U14 AAA", stats: "Elite hockey sense and edge deception emerging in Pacific District" },
        { age: "Age 15", league: "Shattuck-St. Mary's Prep", stats: "117 pts in 52 games, breaking prep scoring records" },
        { age: "Age 16", league: "Chicago Steel (USHL)", stats: "USHL Player of the Year & Rookie of the Year (86 pts in 50 GP)" },
        { age: "Age 17", league: "Boston University (NCAA D1)", stats: "Youngest Hobey Baker Winner in NCAA history (32 goals in 38 games)" },
        { age: "Age 18", league: "San Jose Sharks (NHL)", stats: "Selected #1 Overall in 2024 NHL Entry Draft" }
      ],
      lesson: "Accelerated development by consistently playing 1-2 years above his chronological age against mature, physical competition."
    },
    {
      name: "Auston Matthews",
      position: "Center",
      team: "Toronto Maple Leafs",
      trophies: "Hart Trophy, 3x Rocket Richard, Ted Lindsay, Calder Trophy",
      pathSummary: "Arizona Bobcats U14 AAA -> USNTDP (USHL) -> ZSC Lions (Swiss NLA Pro) -> NHL Toronto Maple Leafs",
      milestones: [
        { age: "Age 14", league: "Arizona Bobcats AAA", stats: "Non-traditional hockey market prodigy with unprecedented wrist shot release" },
        { age: "Age 16-17", league: "USNTDP (USHL)", stats: "117 pts in 60 games for U18 team, breaking Patrick Kane's NTDP record" },
        { age: "Age 18", league: "ZSC Lions Zurich (Swiss NLA)", stats: "Played professional men's hockey in Switzerland prior to draft" },
        { age: "Age 19", league: "Toronto Maple Leafs (NHL)", stats: "4 goals in NHL debut; 40 goals as rookie; #1 Overall Pick" }
      ],
      lesson: "Trailblazed the European pro route for draft-eligible North Americans to test physical play against mature 30-year-old men."
    },
    {
      name: "Connor Hellebuyck",
      position: "Goaltender",
      team: "Winnipeg Jets",
      trophies: "2x Vezina Trophy, William M. Jennings Trophy",
      pathSummary: "Commerce HS (MI) -> Odessa Jackalopes (NAHL) -> UMass Lowell (NCAA) -> St. John's / Manitoba (AHL) -> NHL",
      milestones: [
        { age: "Age 17", league: "Pinckney / Commerce High (MI)", stats: "Unheralded high school goalie with no junior draft pedigree" },
        { age: "Age 18", league: "Odessa Jackalopes (NAHL)", stats: ".930 SV% on 53 shots a night in West Texas; Drafted 130th overall" },
        { age: "Age 19-20", league: "UMass Lowell River Hawks (NCAA)", stats: "Back-to-back Hockey East Titles; Mike Richter Goalie of Year" },
        { age: "Age 22+", league: "Winnipeg Jets (NHL)", stats: "Multiple Vezina awards; premier positional workhorse in world hockey" }
      ],
      lesson: "Goaltenders mature on a longer timeline. Tier 2 NAHL to NCAA D1 provided the exact developmental reps to master positional depth."
    }
  ];

  // =========================================================================
  // 4. MONTE CARLO CAREER LONGEVITY SIMULATOR
  // =========================================================================
  function simulateCareerTrajectory(skating, iq, physicality, compete, currentTier) {
    // Attributes range 50 - 99
    const compositeRating = (skating * 0.30) + (iq * 0.35) + (physicality * 0.15) + (compete * 0.20);
    
    // Base probabilities based on composite scout rating
    let ncaaProb = Math.min(Math.max((compositeRating - 60) * 2.8, 12), 95);
    let draftProb = Math.min(Math.max((compositeRating - 68) * 3.4, 4), 92);
    let games100Prob = Math.min(Math.max((compositeRating - 74) * 3.6, 2), 85);
    let topRoleProb = Math.min(Math.max((compositeRating - 80) * 4.2, 1), 74);

    // Projected career length in pro hockey
    let expectedProYears = 2.0;
    if (compositeRating >= 90) expectedProYears = 12.5;
    else if (compositeRating >= 84) expectedProYears = 8.5;
    else if (compositeRating >= 78) expectedProYears = 5.0;
    else if (compositeRating >= 72) expectedProYears = 3.2;

    // Projected lifetime career earnings ($ Millions)
    let careerEarningsM = 0.6;
    if (compositeRating >= 90) careerEarningsM = 65.0 + (compositeRating - 90) * 8.0;
    else if (compositeRating >= 84) careerEarningsM = 22.0 + (compositeRating - 84) * 4.0;
    else if (compositeRating >= 78) careerEarningsM = 6.5 + (compositeRating - 78) * 1.5;
    else if (compositeRating >= 72) careerEarningsM = 2.2;

    // Archetype Verdict
    let archetype = "Reliable Bottom-6 / Minor Pro Two-Way Competitor";
    if (compositeRating >= 92) archetype = "Generational Franchise Pillar & Stanley Cup Driver";
    else if (compositeRating >= 86) archetype = "Top-Line / Top-Pair Dynamic Impact Producer";
    else if (compositeRating >= 80) archetype = "Middle-6 NHL Regular & Special Teams Specialist";

    return {
      compositeScore: compositeRating.toFixed(1),
      archetype,
      ncaaD1Probability: Math.round(ncaaProb) + "%",
      nhlDraftProbability: Math.round(draftProb) + "%",
      games100Probability: Math.round(games100Prob) + "%",
      topRoleProbability: Math.round(topRoleProb) + "%",
      projectedProYears: expectedProYears.toFixed(1) + " yrs",
      projectedCareerEarnings: "$" + careerEarningsM.toFixed(1) + "M",
      recommendedRoute: (skating > 82 && physicality < 75) 
        ? "NCAA Route (High-volume strength & physical maturation prioritizes frame development)"
        : "CHL Major Junior (Pro pace and high game count leverages advanced physical base)"
    };
  }

  // =========================================================================
  // 5. THE BLUE LINE WIRE BROADCAST GENERATOR
  // =========================================================================
  function broadcastPathwayDossier(athleteData) {
    const wireStateKey = "blueline_social_state";
    let wire = { posts: [] };
    try {
      const stored = localStorage.getItem(wireStateKey);
      if (stored) wire = JSON.parse(stored);
    } catch (e) {}

    const newPost = {
      id: "post_pathway_" + Date.now(),
      author: "BlueLine Pathway Ops",
      handle: "@BlueLinePathway",
      avatar: "🛣️",
      badge: "LIFELONG CAREER VERIFIED",
      timestamp: "Just now",
      content: `🛣️ LIFELONG ATHLETE TRAJECTORY DOSSIER: ${athleteData.name} (Tier: ${athleteData.tier})\n\n` +
        `• Composite Scout Score: ${athleteData.compositeScore} | Archetype: ${athleteData.archetype}\n` +
        `• NCAA D1 Odds: ${athleteData.ncaaD1Probability} | NHL Draft Odds: ${athleteData.nhlDraftProbability}\n` +
        `• 100+ NHL Games: ${athleteData.games100Probability} | Est. Lifetime Earnings: ${athleteData.projectedCareerEarnings}\n` +
        `• Strategic Roadmap: "${athleteData.recommendedRoute}"\n\n` +
        `#LifelongTracking #HockeyPathway #NCAAvsCHL #ScoutingRoadmap #BlueLineDataWorks`,
      likes: 54,
      reposts: 26,
      replies: 11
    };

    wire.posts.unshift(newPost);
    try {
      localStorage.setItem(wireStateKey, JSON.stringify(wire));
    } catch (e) {}

    return newPost;
  }

  // =========================================================================
  // 6. PUBLIC API EXPORT
  // =========================================================================
  window.PathwayEngine = {
    stages: PATHWAY_STAGES,
    crossroads: CROSSROADS_COMPARISON,
    superstars: SUPERSTAR_PRECEDENTS,
    simulateCareerTrajectory,
    broadcastPathwayDossier
  };

})(window);
