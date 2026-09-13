/**
 * BlueLine DataWorks — NCAA Transfer Portal & NIL Valuation Engine
 * Manages live transfer portal state, BlueLine NIL Index™ valuation algorithm,
 * interactive portal declarations, and seamless recruiting messaging hooks.
 */

class BlueLinePortalEngine {
  constructor() {
    this.storageKey = 'blueline_portal_state';
    this.state = this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing portal state:', e);
      }
    }

    // Default Seed Registry
    const seed = {
      complianceStatus: {
        calendarPeriod: 'CONTACT PERIOD', // CONTACT PERIOD, QUIET PERIOD, DEAD PERIOD
        description: 'Coaches may engage in direct communications, in-person campus visits, and official evaluations.',
        windowCloses: 'May 15, 2026',
        complianceDirector: 'Director of Player Personnel'
      },
      athletes: [
        {
          id: 'portal-001',
          name: 'Michael Hage',
          handle: '@michaelhage',
          avatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
          originSchool: 'Michigan Wolverines',
          originLogo: '〽️',
          conference: 'Big Ten',
          position: 'C',
          shotHand: 'R',
          height: "6'1\"",
          weight: '190 lbs',
          classYear: 'Sophomore',
          eligibilityYears: 2,
          portalDate: '2026-04-02',
          status: 'Open to Contact', // 'Open to Contact' | 'Committed' | 'Do Not Contact' | 'Compliance Review'
          committedSchool: null,
          draftInfo: 'Montreal Canadiens (1st Round, 2024)',
          stats: { gp: 36, g: 18, a: 24, pts: 42, plusMinus: '+14', ppg: 1.17 },
          nilValuation: {
            min: 85000,
            max: 115000,
            tier: 'Tier 1 (National Elite)',
            score: 96,
            keyDrivers: ['1st Round Draft Pedigree', 'Top-6 Center Scarcity', 'Over 1.00 PPG Big Ten']
          },
          scoutingSummary: 'High-octane playmaking center with NHL release and dynamic neutral-zone transition speed. High-leverage powerplay quarterback.',
          interestedPrograms: ['Boston College', 'Denver', 'Minnesota', 'North Dakota']
        },
        {
          id: 'portal-002',
          name: 'Caelen Fitzpatrick',
          handle: '@c_fitzpatrick',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          originSchool: 'Niagara Purple Eagles',
          originLogo: '🦅',
          conference: 'Atlantic Hockey',
          position: 'RW',
          shotHand: 'R',
          height: "5'11\"",
          weight: '185 lbs',
          classYear: 'Junior',
          eligibilityYears: 1,
          portalDate: '2026-03-28',
          status: 'Committed',
          committedSchool: 'Quinnipiac Bobcats',
          draftInfo: 'Free Agent (NHL Camp Invite)',
          stats: { gp: 38, g: 16, a: 19, pts: 35, plusMinus: '+8', ppg: 0.92 },
          nilValuation: {
            min: 35000,
            max: 48000,
            tier: 'Tier 3 (Proven Veteran)',
            score: 79,
            keyDrivers: ['Proven D1 Veteran Scorer', 'Immediate Top-9 Impact', 'Atlantic All-Rookie Pedigree']
          },
          scoutingSummary: 'Relentless forechecker with explosive first-three strides. Excels in tight net-front areas and 5v5 cycle offense.',
          interestedPrograms: ['Quinnipiac', 'Maine', 'UMass']
        },
        {
          id: 'portal-003',
          name: 'Aiden Dubinsky',
          handle: '@a_dubinsky',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          originSchool: 'Minnesota Duluth Bulldogs',
          originLogo: '🐶',
          conference: 'NCHC',
          position: 'RD',
          shotHand: 'R',
          height: "6'2\"",
          weight: '198 lbs',
          classYear: 'Freshman',
          eligibilityYears: 3,
          portalDate: '2026-04-05',
          status: 'Open to Contact',
          committedSchool: null,
          draftInfo: '2026 Draft Eligible',
          stats: { gp: 34, g: 4, a: 18, pts: 22, plusMinus: '+11', ppg: 0.65 },
          nilValuation: {
            min: 68000,
            max: 92000,
            tier: 'Tier 2 (High Scarcity Premium)',
            score: 88,
            keyDrivers: ['Right-Shot Defenseman Premium (1.25x)', '3 Years D1 Eligibility', 'NCHC All-Rookie Team']
          },
          scoutingSummary: 'Modern two-way mobile blueliner. Elite stick placement off the rush, suppresses high-danger chances, triggers first passes under heavy pressure.',
          interestedPrograms: ['Wisconsin', 'Michigan State', 'Boston University', 'Western Michigan']
        },
        {
          id: 'portal-004',
          name: 'Hampton Slukynsky',
          handle: '@hslukynsky30',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
          originSchool: 'Western Michigan Broncos',
          originLogo: '🐎',
          conference: 'NCHC',
          position: 'G',
          shotHand: 'L',
          height: "6'1\"",
          weight: '185 lbs',
          classYear: 'Freshman',
          eligibilityYears: 3,
          portalDate: '2026-04-08',
          status: 'Open to Contact',
          committedSchool: null,
          draftInfo: 'LA Kings (4th Round, 2023)',
          stats: { gp: 28, gaa: '2.14', svPct: '.926', wins: 18, so: 4 },
          nilValuation: {
            min: 75000,
            max: 105000,
            tier: 'Tier 1 (Franchise Netminder)',
            score: 93,
            keyDrivers: ['Top-5 D1 Save % (.926)', 'NHL Drafted Goaltender', '3 Full Years of Eligibility']
          },
          scoutingSummary: 'Extremely calm post-to-post butterfly goaltender. Superior tracking through traffic and clean rebound absorption in high-danger slots.',
          interestedPrograms: ['Michigan', 'North Dakota', 'Minnesota', 'Denver']
        },
        {
          id: 'portal-005',
          name: 'Cole Knuble',
          handle: '@cole_knuble',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          originSchool: 'Notre Dame Fighting Irish',
          originLogo: '☘️',
          conference: 'Big Ten',
          position: 'C',
          shotHand: 'R',
          height: "5'11\"",
          weight: '188 lbs',
          classYear: 'Sophomore',
          eligibilityYears: 2,
          portalDate: '2026-04-01',
          status: 'Do Not Contact',
          committedSchool: null,
          draftInfo: 'Philadelphia Flyers (4th Round, 2023)',
          stats: { gp: 36, g: 14, a: 17, pts: 31, plusMinus: '+4', ppg: 0.86 },
          nilValuation: {
            min: 52000,
            max: 72000,
            tier: 'Tier 2 (Pro System Fit)',
            score: 84,
            keyDrivers: ['High Hockey IQ / Faceoff 57%', '200-Foot 2-Way Center', 'Big Ten All-Tournament']
          },
          scoutingSummary: 'Son of NHLer Mike Knuble. Outstanding 200-foot awareness, elite face-off percentage (57.4%), and shutdown capability against top lines.',
          interestedPrograms: ['Target List Kept Confidential']
        },
        {
          id: 'portal-006',
          name: 'Ty Mueller',
          handle: '@tymueller_11',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          originSchool: 'Omaha Mavericks',
          originLogo: '🐂',
          conference: 'NCHC',
          position: 'C',
          shotHand: 'L',
          height: "5'11\"",
          weight: '195 lbs',
          classYear: 'Junior',
          eligibilityYears: 1,
          portalDate: '2026-03-30',
          status: 'Committed',
          committedSchool: 'Boston University Terriers',
          draftInfo: 'Vancouver Canucks (4th Round, 2023)',
          stats: { gp: 37, g: 12, a: 21, pts: 33, plusMinus: '+9', ppg: 0.89 },
          nilValuation: {
            min: 60000,
            max: 82000,
            tier: 'Tier 2 (Impact Transfer)',
            score: 86,
            keyDrivers: ['Proven NCHC Center', 'Power Play Anchor', 'Immediate Frozen Four Contender']
          },
          scoutingSummary: 'Puck-protection monster below the goal line. High poise in traffic with deceptive vision to find backdoor wingers.',
          interestedPrograms: ['Boston University (COMMITTED)']
        },
        {
          id: 'portal-007',
          name: 'Ryan Chesley',
          handle: '@ryanchesley',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
          originSchool: 'Minnesota Golden Gophers',
          originLogo: '〽️',
          conference: 'Big Ten',
          position: 'RD',
          shotHand: 'R',
          height: "6'0\"",
          weight: '201 lbs',
          classYear: 'Junior',
          eligibilityYears: 1,
          portalDate: '2026-04-04',
          status: 'Open to Contact',
          committedSchool: null,
          draftInfo: 'Washington Capitals (2nd Round, 2022)',
          stats: { gp: 37, g: 3, a: 16, pts: 19, plusMinus: '+19', ppg: 0.51 },
          nilValuation: {
            min: 78000,
            max: 110000,
            tier: 'Tier 1 (Shutdown Blue-Chipper)',
            score: 94,
            keyDrivers: ['2nd Round NHL Drafted', 'World Junior Gold Medalist', 'Right-Shot Defensive Anchor']
          },
          scoutingSummary: 'Heavy-hitting, lockdown shutdown defenseman. World Junior Championship veteran with suffocating rush defense and heavy slap shot.',
          interestedPrograms: ['Boston College', 'Denver', 'Quinnipiac', 'North Dakota']
        },
        {
          id: 'portal-008',
          name: 'Jack Devine',
          handle: '@jackdevine_9',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
          originSchool: 'Denver Pioneers',
          originLogo: '🏔️',
          conference: 'NCHC',
          position: 'RW',
          shotHand: 'R',
          height: "5'11\"",
          weight: '180 lbs',
          classYear: 'Senior',
          eligibilityYears: 1,
          portalDate: '2026-04-06',
          status: 'Open to Contact',
          committedSchool: null,
          draftInfo: 'Florida Panthers (7th Round, 2022)',
          stats: { gp: 40, g: 27, a: 31, pts: 58, plusMinus: '+28', ppg: 1.45 },
          nilValuation: {
            min: 120000,
            max: 165000,
            tier: 'Tier 1 (Hobey Baker Finalist)',
            score: 99,
            keyDrivers: ['27 Goals in 40 Games (Top 3 NCAA)', 'National Championship Pedigree', 'Elite NIL Market Appeal']
          },
          scoutingSummary: 'Pure goal scorer with NHL one-timer from the left circle. National champion experience with clutch postseason scoring instincts.',
          interestedPrograms: ['Michigan', 'Boston University', 'Michigan State', 'Minnesota']
        }
      ]
    };

    this.saveState(seed);
    return seed;
  }

  saveState(state) {
    this.state = state;
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  getAthletes() {
    return this.state.athletes || [];
  }

  getAthleteById(id) {
    return this.getAthletes().find(a => a.id === id);
  }

  getCompliance() {
    return this.state.complianceStatus;
  }

  /**
   * Proprietary BlueLine NIL Index™ Valuation Formula
   * Calculates athlete fair-market NIL valuation based on production, position scarcity,
   * pro draft tier, conference prestige, and social reach on The Wire.
   */
  calculateNILValuation(params) {
    const {
      position = 'F',
      ppg = 0.75,
      savePct = 0.915,
      conference = 'Big Ten',
      eligibilityYears = 2,
      draftStatus = 'undrafted', // 'round1', 'round2_3', 'round4_7', 'undrafted'
      wireFollowers = 1200,
      puckXpLevel = 25
    } = params;

    let baseScore = 50;
    let baseValue = 20000;

    // 1. Performance Metric Contribution
    if (position === 'G') {
      const sv = parseFloat(savePct);
      if (sv >= 0.930) { baseValue += 45000; baseScore += 25; }
      else if (sv >= 0.920) { baseValue += 30000; baseScore += 18; }
      else if (sv >= 0.910) { baseValue += 18000; baseScore += 12; }
      else { baseValue += 8000; baseScore += 5; }
    } else {
      const p = parseFloat(ppg);
      if (p >= 1.30) { baseValue += 60000; baseScore += 30; }
      else if (p >= 1.00) { baseValue += 40000; baseScore += 22; }
      else if (p >= 0.75) { baseValue += 25000; baseScore += 15; }
      else if (p >= 0.50) { baseValue += 12000; baseScore += 8; }
      else { baseValue += 5000; baseScore += 3; }
    }

    // 2. Position Scarcity Multiplier
    let scarcityMult = 1.0;
    if (position === 'RD') {
      scarcityMult = 1.25; // High demand for right-shot puck movers
    } else if (position === 'G') {
      scarcityMult = 1.20; // Starting goalie stability
    } else if (position === 'C') {
      scarcityMult = 1.15; // Top-line two-way centers
    }
    baseValue = Math.round(baseValue * scarcityMult);

    // 3. Conference Prestige Factor
    const conferenceWeights = {
      'Big Ten': 1.20,
      'NCHC': 1.20,
      'Hockey East': 1.15,
      'ECAC': 1.05,
      'CCHA': 1.00,
      'Atlantic Hockey': 0.95,
      'Independent': 1.00
    };
    const confMult = conferenceWeights[conference] || 1.0;
    baseValue = Math.round(baseValue * confMult);

    // 4. Pro Draft Pedigree
    if (draftStatus === 'round1') {
      baseValue += 45000;
      baseScore += 20;
    } else if (draftStatus === 'round2_3') {
      baseValue += 28000;
      baseScore += 14;
    } else if (draftStatus === 'round4_7') {
      baseValue += 15000;
      baseScore += 8;
    }

    // 5. Social & Community Influence (The Wire & PuckXP)
    const socialBonus = Math.min(18000, Math.round((wireFollowers * 2.5) + (puckXpLevel * 120)));
    baseValue += socialBonus;
    baseScore = Math.min(99, Math.round(baseScore + (puckXpLevel * 0.15)));

    // Calculate Min and Max brackets
    const minVal = Math.round(baseValue * 0.85 / 1000) * 1000;
    const maxVal = Math.round(baseValue * 1.18 / 1000) * 1000;

    let tier = 'Tier 3 (Emerging Contributor)';
    if (baseValue >= 90000) tier = 'Tier 1 (National Elite)';
    else if (baseValue >= 50000) tier = 'Tier 2 (Core Impact Transfer)';

    return {
      min: minVal,
      max: maxVal,
      score: baseScore,
      tier: tier,
      formattedRange: `$${(minVal / 1000).toFixed(0)}k – $${(maxVal / 1000).toFixed(0)}k/yr`
    };
  }

  /**
   * Submit new transfer portal entry
   */
  declareForPortal(entryData) {
    const newAthlete = {
      id: `portal-${Date.now()}`,
      name: entryData.name,
      handle: entryData.handle || `@${entryData.name.toLowerCase().replace(/\s+/g, '')}`,
      avatar: entryData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      originSchool: entryData.originSchool,
      originLogo: entryData.originLogo || '🏒',
      conference: entryData.conference || 'Big Ten',
      position: entryData.position || 'F',
      shotHand: entryData.shotHand || 'L',
      height: entryData.height || "6'0\"",
      weight: entryData.weight || '185 lbs',
      classYear: entryData.classYear || 'Sophomore',
      eligibilityYears: parseInt(entryData.eligibilityYears) || 2,
      portalDate: new Date().toISOString().split('T')[0],
      status: entryData.status || 'Open to Contact',
      committedSchool: null,
      draftInfo: entryData.draftInfo || 'NCAA Free Agent',
      stats: entryData.stats || { gp: 32, g: 8, a: 12, pts: 20, plusMinus: '+3', ppg: 0.63 },
      nilValuation: this.calculateNILValuation({
        position: entryData.position,
        ppg: entryData.stats ? entryData.stats.ppg : 0.70,
        conference: entryData.conference,
        eligibilityYears: entryData.eligibilityYears,
        draftStatus: entryData.draftStatus || 'undrafted',
        wireFollowers: 850,
        puckXpLevel: 20
      }),
      scoutingSummary: entryData.scoutingSummary || 'Verified NCAA Transfer Portal entrant actively reviewing prospective collegiate rosters.',
      interestedPrograms: entryData.interestedPrograms || ['Open to all prospective D1 offers']
    };

    this.state.athletes.unshift(newAthlete);
    this.saveState(this.state);

    // Auto-broadcast to The BlueLine Wire if social mesh engine is available
    this.broadcastPortalEvent(newAthlete);

    return newAthlete;
  }

  /**
   * Automatically publish portal declarations to The BlueLine Wire
   */
  broadcastPortalEvent(athlete) {
    const wireStateRaw = localStorage.getItem('blueline_social_state');
    if (!wireStateRaw) return;

    try {
      const wireState = JSON.parse(wireStateRaw);
      if (!wireState.posts) return;

      const portalPost = {
        id: `post-portal-${Date.now()}`,
        authorId: athlete.id,
        authorName: athlete.name,
        handle: athlete.handle,
        role: 'athlete',
        avatar: athlete.avatar,
        verifiedBadge: 'verified-blue',
        timestamp: 'Just now',
        content: `🚨 **OFFICIAL PORTAL DECLARATION**\n\nI have officially entered the NCAA Transfer Portal with ${athlete.eligibilityYears} year(s) of collegiate eligibility remaining. Thank you to ${athlete.originSchool} for the incredible journey. Excited for what comes next. Open for recruiting discussions.\n\n#TransferPortal #NCAAHockey #BlueLineNIL`,
        likes: 12,
        reposts: 5,
        comments: 3,
        userLiked: false,
        userReposted: false,
        tags: ['#TransferPortal', '#NCAAHockey', '#BlueLineNIL'],
        playerBadge: {
          name: athlete.name,
          team: athlete.originSchool,
          pos: athlete.position,
          stats: `${athlete.position === 'G' ? athlete.stats.gaa + ' GAA | ' + athlete.stats.svPct : athlete.stats.pts + ' PTS (' + athlete.stats.g + 'G, ' + athlete.stats.a + 'A)'}`,
          nilVal: athlete.nilValuation.formattedRange || `$${athlete.nilValuation.min / 1000}k-$${athlete.nilValuation.max / 1000}k`
        }
      };

      wireState.posts.unshift(portalPost);
      localStorage.setItem('blueline_social_state', JSON.stringify(wireState));
    } catch (e) {
      console.warn('Could not pipe portal event to The Wire:', e);
    }
  }

  /**
   * Mark athlete as committed
   */
  commitAthlete(athleteId, committedSchool) {
    const athlete = this.getAthleteById(athleteId);
    if (!athlete) return null;

    athlete.status = 'Committed';
    athlete.committedSchool = committedSchool;
    this.saveState(this.state);

    // Auto-broadcast commitment to The Wire
    const wireStateRaw = localStorage.getItem('blueline_social_state');
    if (wireStateRaw) {
      try {
        const wireState = JSON.parse(wireStateRaw);
        if (wireState.posts) {
          const commitPost = {
            id: `post-commit-${Date.now()}`,
            authorId: athlete.id,
            authorName: athlete.name,
            handle: athlete.handle,
            role: 'athlete',
            avatar: athlete.avatar,
            verifiedBadge: 'verified-blue',
            timestamp: 'Just now',
            content: `🏒 **COMMITTED** ✍️\n\nProud to announce my commitment to **${committedSchool}**! Ready to get to work and compete for a National Championship. #Commitment #NCAAHockey #${committedSchool.replace(/\s+/g, '')}`,
            likes: 48,
            reposts: 19,
            comments: 11,
            userLiked: false,
            userReposted: false,
            tags: ['#Commitment', '#NCAAHockey', '#TransferPortal'],
            playerBadge: {
              name: athlete.name,
              team: committedSchool,
              pos: athlete.position,
              stats: `Transferred from ${athlete.originSchool}`,
              nilVal: `NIL Index: ${athlete.nilValuation.tier}`
            }
          };
          wireState.posts.unshift(commitPost);
          localStorage.setItem('blueline_social_state', JSON.stringify(wireState));
        }
      } catch (err) {
        console.warn('Error broadcasting commitment to The Wire:', err);
      }
    }

    return athlete;
  }

  /**
   * Filter athletes with multi-condition search
   */
  filterAthletes(filters = {}) {
    let list = this.getAthletes();

    if (filters.conference && filters.conference !== 'ALL') {
      list = list.filter(a => a.conference.toLowerCase() === filters.conference.toLowerCase());
    }

    if (filters.position && filters.position !== 'ALL') {
      if (filters.position === 'F') {
        list = list.filter(a => ['C', 'LW', 'RW', 'F'].includes(a.position));
      } else if (filters.position === 'D') {
        list = list.filter(a => ['D', 'LD', 'RD'].includes(a.position));
      } else {
        list = list.filter(a => a.position === filters.position);
      }
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.eligibility && filters.eligibility !== 'ALL') {
      const el = parseInt(filters.eligibility);
      list = list.filter(a => a.eligibilityYears === el);
    }

    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.originSchool.toLowerCase().includes(q) ||
        a.conference.toLowerCase().includes(q) ||
        (a.draftInfo && a.draftInfo.toLowerCase().includes(q)) ||
        (a.committedSchool && a.committedSchool.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Calculate summary KPIs
   */
  getStatsKPI() {
    const all = this.getAthletes();
    const active = all.filter(a => a.status === 'Open to Contact');
    const committed = all.filter(a => a.status === 'Committed');

    let totalValuation = 0;
    all.forEach(a => {
      if (a.nilValuation && a.nilValuation.min) {
        totalValuation += (a.nilValuation.min + a.nilValuation.max) / 2;
      }
    });

    const avgValuation = all.length > 0 ? Math.round(totalValuation / all.length) : 0;

    return {
      totalInPortal: all.length,
      openForContact: active.length,
      committed: committed.length,
      avgNilValuation: avgValuation,
      formattedAvgNIL: `$${(avgValuation / 1000).toFixed(1)}k`
    };
  }
}

// Global Export
if (typeof window !== 'undefined') {
  window.BlueLinePortalEngine = BlueLinePortalEngine;
  window.portalEngine = new BlueLinePortalEngine();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlueLinePortalEngine;
}
