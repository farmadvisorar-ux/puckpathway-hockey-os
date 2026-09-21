/**
 * BlueLine DataWorks: Social Mesh, Universal Messaging & Gamified Player Engine
 * 
 * - Universal Sign-Up & Auth System (Athletes, Coaches, Scouts, Teams)
 * - X-Style Customizable Profiles (Banners, Avatars, @handles, Bios)
 * - Gamified Status & Leveling: PuckXP Engine (Lv. 1 to 99)
 * - Universal Peer-to-Peer Messaging (Player-to-Player, Coach-to-Coach, Team-to-Team)
 * - The BlueLine Wire: "X for Hockey" Community Feed
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'blueline_social_state';

  // ==========================================
  // 1. PRE-SEEDED ROLES & VERIFIED USERS
  // ==========================================
  const BADGES = {
    SCOUT: { type: 'scout', icon: '⭐', label: 'Verified Recruiter', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    ATHLETE: { type: 'athlete', icon: '⚡', label: 'Verified Athlete', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    COACH: { type: 'coach', icon: '👑', label: 'Verified Coach', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    TEAM: { type: 'team', icon: '🛡️', label: 'Verified Organization', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    PARENT: { type: 'parent', icon: '👨‍👩‍👦', label: 'Family Advisor', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' }
  };

  const DEFAULT_USERS = [
    {
      id: "usr_scout_director",
      name: "Director of Scouting",
      handle: "blueline_scouting",
      role: "scout",
      badge: BADGES.SCOUT,
      title: "Head of Scouting & Recruitment",
      organization: "BlueLine DataWorks Bureau",
      location: "Minneapolis / Chicago",
      bio: "Head of Scouting at BlueLine DataWorks. Tracking 2,974+ non-NHL athletes across NCAA D1, USHL, NAHL, and prep academies. DMs open for verified prospect submissions.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      avatarColor: "from-amber-500 to-indigo-600",
      banner: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80",
      level: 92,
      xp: 84500,
      xpNext: 90000,
      stats: { evaluated: 2974, reportsFiled: 812, commitsTracked: 340 },
      following: ["usr_michael_hage", "usr_logan_stein", "usr_mike_callahan"],
      followers: 1420
    },
    {
      id: "usr_michael_hage",
      name: "Michael Hage",
      handle: "michael_hage19",
      role: "athlete",
      badge: BADGES.ATHLETE,
      title: "Center / Forward (#19)",
      organization: "University of Michigan (NCAA D1)",
      location: "Ann Arbor, MI",
      bio: "Forward for Michigan Wolverines Ice Hockey | Montreal Canadiens 1st Round Pick (#21) | Former Chicago Steel (USHL) | Committed to the standard.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
      avatarColor: "from-cyan-500 to-blue-700",
      banner: "https://images.unsplash.com/photo-1515703407324-5f753eed24a1?auto=format&fit=crop&w=1200&q=80",
      level: 78,
      xp: 68200,
      xpNext: 75000,
      stats: { gp: 38, g: 24, a: 31, pts: 55, plusMinus: "+18" },
      following: ["usr_scout_director", "usr_logan_stein"],
      followers: 4890
    },
    {
      id: "usr_logan_stein",
      name: "Logan Stein",
      handle: "logan_stein1",
      role: "athlete",
      badge: BADGES.ATHLETE,
      title: "Goaltender (#1)",
      organization: "University of Michigan (NCAA D1)",
      location: "Suwanee, GA / Ann Arbor, MI",
      bio: "Starting Goaltender for Michigan Hockey | Graduate Transfer (Ferris State) | 6'2 210 lbs | Quick feet, active stick, calm in high-danger slots.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
      avatarColor: "from-emerald-500 to-teal-700",
      banner: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80",
      level: 75,
      xp: 64100,
      xpNext: 70000,
      stats: { gp: 28, svPct: ".924", gaa: "2.14", so: 4 },
      following: ["usr_scout_director", "usr_michael_hage"],
      followers: 2150
    },
    {
      id: "usr_mike_callahan",
      name: "Coach Mike Callahan",
      handle: "coach_callahan",
      role: "coach",
      badge: BADGES.COACH,
      title: "Head Coach (USA Hockey Level 4)",
      organization: "Chicagoland Hockey Academy",
      location: "Chicago, IL",
      bio: "Head Coach specializing in USA Hockey ADM transition systems, small-area games, and skill development from U12 through USHL tenders.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80",
      avatarColor: "from-purple-500 to-indigo-700",
      banner: "https://images.unsplash.com/photo-1515703407324-5f753eed24a1?auto=format&fit=crop&w=1200&q=80",
      level: 84,
      xp: 74900,
      xpNext: 80000,
      stats: { practicesBuilt: 142, playersDeveloped: 88, championships: 4 },
      following: ["usr_scout_director"],
      followers: 1840
    },
    {
      id: "usr_chicago_steel",
      name: "Chicago Steel Hockey",
      handle: "chicagosteel",
      role: "team",
      badge: BADGES.TEAM,
      title: "USHL Tier 1 Organization",
      organization: "United States Hockey League",
      location: "Geneva, IL",
      bio: "Official account of the Chicago Steel. Premier developmental hub for future NCAA and professional athletes. 2021 Clark Cup Champions.",
      avatar: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=250&q=80",
      avatarColor: "from-rose-500 to-red-700",
      banner: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80",
      level: 95,
      xp: 98000,
      xpNext: 100000,
      stats: { draftPicks: 42, clarkCups: 2, alumniInPro: 65 },
      following: ["usr_scout_director", "usr_michael_hage"],
      followers: 12400
    }
  ];

  // ==========================================
  // 2. PRE-SEEDED "X FOR HOCKEY" WIRE POSTS
  // ==========================================
  const DEFAULT_POSTS = [
    {
      id: "post_001",
      authorId: "usr_scout_director",
      timestamp: "12m ago",
      content: "Deep scouting review on Michael Hage (#19) from Michigan's weekend series. Elite edge work on the regroup with high-danger slot pass completion at 88%. Look for his transition speed to translate seamlessly to the next level. Complete dossier stamped in BlueLine DataWorks. #NCAA #ScoutingReport #MichiganHockey",
      tags: ["#NCAA", "#ScoutingReport", "#MichiganHockey"],
      likes: 142,
      reposts: 38,
      replies: 19,
      likedByMe: false,
      pinned: true,
      media: {
        type: "stats_card",
        playerName: "Michael Hage",
        team: "University of Michigan",
        stat1: "55 PTS",
        stat2: "24 G",
        stat3: "+18 DIFF",
        sqm: 96.4
      }
    },
    {
      id: "post_002",
      authorId: "usr_michael_hage",
      timestamp: "45m ago",
      content: "Big team win against Minnesota tonight. PP unit executing cleanly on the 1-3-1 setup. Back to work Monday at Yost. Thanks to all the scouts in attendance. #GoBlue #Wolverines #NCAAHockey",
      tags: ["#GoBlue", "#Wolverines", "#NCAAHockey"],
      likes: 389,
      reposts: 64,
      replies: 42,
      likedByMe: true,
      pinned: false,
      media: null
    },
    {
      id: "post_003",
      authorId: "usr_chicago_steel",
      timestamp: "2h ago",
      content: "🚨 COMMITMENT ALERT: Proud to announce 2008-born forward Cole Vance has signed his USHL tender with the Chicago Steel! Welcome to Geneva, Cole. #SteelStrong #USHL #FutureStars",
      tags: ["#SteelStrong", "#USHL", "#FutureStars"],
      likes: 512,
      reposts: 118,
      replies: 31,
      likedByMe: false,
      pinned: false,
      media: {
        type: "banner",
        title: "OFFICIAL USHL TENDER SIGNED",
        subtitle: "Cole Vance • 2025-26 Season"
      }
    },
    {
      id: "post_004",
      authorId: "usr_mike_callahan",
      timestamp: "3h ago",
      content: "Just uploaded a new 60-Minute ADM Practice Canvas into the BlueLine Whiteboard: 3v2 Neutral Zone Counter-Attack with continuous puck-support. High-tempo, maximum puck touches. Check it out in the systems playbook! #ADM #HockeyCoaching #DrillOfTheDay",
      tags: ["#ADM", "#HockeyCoaching", "#DrillOfTheDay"],
      likes: 88,
      reposts: 27,
      replies: 14,
      likedByMe: false,
      pinned: false,
      media: null
    },
    {
      id: "post_005",
      authorId: "usr_logan_stein",
      timestamp: "5h ago",
      content: "Goalie film room session with the coaching staff. Reviewing low-to-high slot one-timers and rebound control. The radar telemetry in BlueLine has been game changing for tracking lateral push recovery times. #GoalieLife #Netminder #FilmRoom",
      tags: ["#GoalieLife", "#Netminder", "#FilmRoom"],
      likes: 194,
      reposts: 22,
      replies: 18,
      likedByMe: false,
      pinned: false,
      media: null
    }
  ];

  // ==========================================
  // 3. PRE-SEEDED DIRECT MESSAGE THREADS
  // ==========================================
  const DEFAULT_CONVERSATIONS = [
    {
      id: "conv_director_michael",
      participantIds: ["usr_scout_director", "usr_michael_hage"],
      lastMessage: "Looking forward to reviewing your weekend film. Great execution on that 2nd period cutback.",
      lastTimestamp: "18m ago",
      unread: 1,
      messages: [
        { senderId: "usr_scout_director", text: "Hey Michael, Director of Scouting here from BlueLine DataWorks. Outstanding game against Wisconsin on Friday.", time: "Yesterday 4:15 PM" },
        { senderId: "usr_michael_hage", text: "Thanks Director! Really appreciate you coming out to Yost. The transition speed felt crisp.", time: "Yesterday 4:45 PM" },
        { senderId: "usr_scout_director", text: "Looking forward to reviewing your weekend film. Great execution on that 2nd period cutback.", time: "18m ago" }
      ]
    },
    {
      id: "conv_director_callahan",
      participantIds: ["usr_scout_director", "usr_mike_callahan"],
      lastMessage: "Let's review the U16 AAA invite list tomorrow morning.",
      lastTimestamp: "2h ago",
      unread: 0,
      messages: [
        { senderId: "usr_mike_callahan", text: "Director, did you get a chance to inspect the draft board for the upcoming combine?", time: "10:30 AM" },
        { senderId: "usr_scout_director", text: "Yes Mike, the telemetry numbers on the defenseman cohort look elite.", time: "11:15 AM" },
        { senderId: "usr_scout_director", text: "Let's review the U16 AAA invite list tomorrow morning.", time: "2h ago" }
      ]
    },
    {
      id: "conv_director_logan",
      participantIds: ["usr_scout_director", "usr_logan_stein"],
      lastMessage: "Your high-danger slot save percentage (.924) ranks top-3 in Division I right now.",
      lastTimestamp: "5h ago",
      unread: 0,
      messages: [
        { senderId: "usr_scout_director", text: "Logan, huge game in net on Saturday.", time: "1:20 PM" },
        { senderId: "usr_logan_stein", text: "Thanks Director! Defense did a great job clearing rebounds.", time: "2:00 PM" },
        { senderId: "usr_scout_director", text: "Your high-danger slot save percentage (.924) ranks top-3 in Division I right now.", time: "5h ago" }
      ]
    }
  ];

  // ==========================================
  // 4. GAMIFIED LEVELING SYSTEM (PUCK XP)
  // ==========================================
  function getLevelTitle(level) {
    if (level >= 86) return "Pro War Room Draft Eligible";
    if (level >= 61) return "NCAA Division I Prospect";
    if (level >= 36) return "Junior A / USHL Tendered";
    if (level >= 16) return "AAA Elite Travel Prospect";
    return "Grassroots ADM Phenom";
  }

  function getLevelBadgeColor(level) {
    if (level >= 86) return "from-purple-600 to-indigo-600 text-purple-200 border-purple-500/40";
    if (level >= 61) return "from-sky-600 to-blue-600 text-sky-200 border-sky-500/40";
    if (level >= 36) return "from-emerald-600 to-teal-600 text-emerald-200 border-emerald-500/40";
    if (level >= 16) return "from-amber-600 to-orange-600 text-amber-200 border-amber-500/40";
    return "from-slate-700 to-slate-800 text-slate-300 border-slate-600/40";
  }

  // Helper to format authenticated user into social profile
  function formatUserFromAuth(authUser) {
    if (!authUser) return null;
    let badge = BADGES.ATHLETE;
    if (authUser.role === 'coach') badge = BADGES.COACH;
    else if (authUser.role === 'scout') badge = BADGES.SCOUT;
    else if (authUser.role === 'parent') badge = BADGES.PARENT;
    else if (authUser.role === 'team') badge = BADGES.TEAM;

    let dossier = null;
    if (typeof window !== 'undefined' && window.BlueLineAuth && typeof window.BlueLineAuth.getAthleteDossier === 'function') {
      dossier = window.BlueLineAuth.getAthleteDossier(authUser);
    }

    const name = authUser.name || "Hockey Athlete";
    const handle = authUser.username || name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const title = authUser.role_title || (dossier ? `${dossier.primary_role} (#${dossier.num})` : (authUser.num ? `Forward (#${authUser.num})` : "Verified Athlete"));
    const org = authUser.team || (dossier ? dossier.team : "BlueLine DataWorks");
    const loc = authUser.location || (dossier ? (dossier.hometown || dossier.league) : "USA / Canada");
    const bio = authUser.bio || (dossier ? `Verified athlete dossier for ${dossier.name}. Competing in ${dossier.league || 'Amateur'} for ${dossier.team || 'Amateur Club'}.` : "BlueLine DataWorks registered member.");
    const avatar = authUser.avatarImg || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80";

    return {
      id: authUser.id,
      name: name,
      handle: handle,
      role: authUser.role || "athlete",
      badge: badge,
      title: title,
      organization: org,
      location: loc,
      bio: bio,
      avatar: avatar,
      avatarColor: authUser.avatar_gradient || "from-sky-500 to-indigo-600",
      banner: authUser.banner || "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80",
      level: authUser.level || (dossier ? Math.min(99, Math.max(1, Math.round(dossier.composite_score || 72))) : 72),
      xp: authUser.xp || 68500,
      xpNext: authUser.xpNext || 75000,
      stats: dossier ? {
        height: dossier.height_str || `${dossier.height_in}"`,
        weight: `${dossier.weight_lbs || 180} lbs`,
        score: dossier.composite_score || 88.5
      } : (authUser.stats || { gp: 34, g: 18, a: 22, pts: 40 }),
      linked_player_id: authUser.linked_player_id,
      logoOverlay: authUser.logoOverlay || null,
      following: ["usr_scout_director"],
      followers: 140,
      isAuthUser: true
    };
  }

  function getCurrentUser() {
    if (typeof window !== 'undefined' && window.BlueLineAuth && typeof window.BlueLineAuth.getCurrentUser === 'function') {
      const authUser = window.BlueLineAuth.getCurrentUser();
      if (authUser) {
        return formatUserFromAuth(authUser);
      }
    }
    const state = loadState();
    return state.currentUser || DEFAULT_USERS[0];
  }

  // ==========================================
  // 5. SOCIAL STATE MANAGER
  // ==========================================
  function loadState() {
    let state = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) {
      console.warn("Could not load social state:", e);
    }

    if (!state) {
      state = {
        currentUser: DEFAULT_USERS[0], // Director of Scouting active by default
        users: DEFAULT_USERS,
        posts: DEFAULT_POSTS,
        conversations: DEFAULT_CONVERSATIONS,
        dailyQuests: [
          { id: "q1", title: "Complete 60-min Practice Session", xp: 150, done: true },
          { id: "q2", title: "Send a Scout or Coach DM", xp: 100, done: true },
          { id: "q3", title: "Post a Highlight or Update to The Wire", xp: 100, done: false },
          { id: "q4", title: "Inspect 5 Prospect Dossiers in Directory", xp: 120, done: false }
        ]
      };
      saveState(state);
    }

    // Always keep active currentUser bound to BlueLineAuth session
    if (typeof window !== 'undefined' && window.BlueLineAuth && typeof window.BlueLineAuth.getCurrentUser === 'function') {
      const authUser = window.BlueLineAuth.getCurrentUser();
      if (authUser) {
        state.currentUser = formatUserFromAuth(authUser);
      }
    }

    return state;
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save social state:", e);
    }
  }

  // ==========================================
  // 6. PUBLIC API METHODS
  // ==========================================

  // Universal Sign-Up / Register
  function registerUser(formData) {
    const state = loadState();
    const id = "usr_" + (formData.handle || "user_" + Date.now()).toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    let badge = BADGES.ATHLETE;
    if (formData.role === 'coach') badge = BADGES.COACH;
    else if (formData.role === 'scout') badge = BADGES.SCOUT;
    else if (formData.role === 'team') badge = BADGES.TEAM;

    const newUser = {
      id: id,
      name: formData.name || "Hockey Athlete",
      handle: formData.handle || ("player_" + Math.floor(Math.random() * 9000 + 1000)),
      role: formData.role || "athlete",
      badge: badge,
      title: formData.title || (formData.role === 'athlete' ? "Forward / Defenseman" : "Team Personnel"),
      organization: formData.organization || "Independent Amateur",
      location: formData.location || "USA / Canada",
      bio: formData.bio || "BlueLine DataWorks registered member. Dedicated to lifelong hockey development and analytics.",
      avatar: formData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
      avatarColor: "from-sky-500 to-indigo-600",
      banner: formData.banner || "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80",
      level: 1,
      xp: 100,
      xpNext: 1000,
      stats: formData.stats || { gp: 0, g: 0, a: 0, pts: 0, plusMinus: "E" },
      following: ["usr_scout_director"],
      followers: 1
    };

    state.users.unshift(newUser);
    state.currentUser = newUser;
    saveState(state);
    return newUser;
  }

  // Switch Active User Persona
  function switchUser(userId) {
    const state = loadState();
    const found = state.users.find(u => u.id === userId);
    if (found) {
      state.currentUser = found;
      saveState(state);
    }
    return state.currentUser;
  }

  // Update Profile Customization
  function updateProfile(customData) {
    const state = loadState();
    const user = state.currentUser;
    if (!user) return null;

    if (customData.name) user.name = customData.name;
    if (customData.handle) user.handle = customData.handle;
    if (customData.bio) user.bio = customData.bio;
    if (customData.location) user.location = customData.location;
    if (customData.organization) user.organization = customData.organization;
    if (customData.title) user.title = customData.title;
    if (customData.banner) user.banner = customData.banner;
    if (customData.avatar) user.avatar = customData.avatar;
    if (customData.logoOverlay !== undefined) user.logoOverlay = customData.logoOverlay;
    if (customData.website) user.website = customData.website;

    // Sync in users array
    const idx = state.users.findIndex(u => u.id === user.id);
    if (idx !== -1) state.users[idx] = user;

    // Also persist to auth session if available
    try {
      if (typeof window !== 'undefined' && window.BlueLineAuth && typeof window.BlueLineAuth.getCurrentUser === 'function') {
        const authCur = window.BlueLineAuth.getCurrentUser();
        if (authCur && (authCur.id === user.id || authCur.name === user.name)) {
          if (customData.logoOverlay !== undefined) authCur.logoOverlay = customData.logoOverlay;
          if (customData.bio) authCur.bio = customData.bio;
          if (customData.name) authCur.name = customData.name;
          localStorage.setItem('blueline_auth_user', JSON.stringify(authCur));
        }
      }
    } catch (e) {}

    saveState(state);
    return user;
  }

  // Add PuckXP to current user
  function addXP(amount, reason) {
    const state = loadState();
    const user = state.currentUser;
    if (!user) return;

    user.xp = (user.xp || 0) + amount;
    // Check level up (every 1000 * level XP)
    while (user.xp >= user.xpNext && user.level < 99) {
      user.level += 1;
      user.xpNext = Math.round(user.xpNext * 1.25);
    }

    const idx = state.users.findIndex(u => u.id === user.id);
    if (idx !== -1) state.users[idx] = user;

    saveState(state);
    return { level: user.level, xp: user.xp, xpNext: user.xpNext, reason: reason };
  }

  // Send Direct Message
  function sendMessage(recipientId, text) {
    const state = loadState();
    const sender = state.currentUser;
    if (!sender || !text.trim()) return null;

    // Look for existing conversation between these two
    let conv = state.conversations.find(c => 
      c.participantIds.includes(sender.id) && c.participantIds.includes(recipientId)
    );

    const nowStr = "Just now";

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        participantIds: [sender.id, recipientId],
        lastMessage: text,
        lastTimestamp: nowStr,
        unread: 0,
        messages: []
      };
      state.conversations.unshift(conv);
    }

    conv.lastMessage = text;
    conv.lastTimestamp = nowStr;
    conv.messages.push({
      senderId: sender.id,
      text: text,
      time: nowStr
    });

    // Reward XP for communicating
    addXP(25, "Sent Scout/Player Message");

    saveState(state);
    return { conversation: conv, message: conv.messages[conv.messages.length - 1] };
  }

  // Post to The BlueLine Wire
  function createPost(content, tags, media) {
    const state = loadState();
    const author = getCurrentUser();
    if (!author || !content.trim()) return null;

    const newPost = {
      id: `post_${Date.now()}`,
      authorId: author.id,
      timestamp: "Just now",
      content: content.trim(),
      tags: tags || [],
      likes: 1,
      reposts: 0,
      replies: 0,
      likedByMe: true,
      pinned: false,
      media: media || null
    };

    state.posts.unshift(newPost);
    addXP(50, "Published to BlueLine Wire");
    saveState(state);
    return newPost;
  }

  // Post Commitment to The BlueLine Wire with Ledger Stamping
  function createCommitmentPost(data) {
    const author = getCurrentUser();
    if (!author) return null;

    const school = data.school || "NCAA Division I Program";
    const level = data.level || "NCAA Division I";
    const classYear = data.classYear || "2026";
    const status = data.status || "Committed";
    const notes = data.notes || `Extremely proud and honored to announce my commitment to play college hockey at ${school}!`;

    let blockHash = null;
    if (typeof window !== 'undefined' && window.BlueLineAuth && typeof window.BlueLineAuth.generateBlockHash === 'function') {
      blockHash = window.BlueLineAuth.generateBlockHash(`${author.name}_commitment_${school}_${Date.now()}`);
      window.BlueLineAuth.stampLedgerForUser(
        "Recruiting & Commitment",
        "Official Commitment Wire Dispatch",
        `Athlete ${author.name} announced official commitment to ${school} (${level}, Class of ${classYear}). Cryptographic block stamped.`
      );
    } else {
      blockHash = "0x" + Math.random().toString(16).substring(2, 10) + "a7f4";
    }

    const content = `🚨 **OFFICIAL COMMITMENT ANNOUNCEMENT**\n\nProud to announce my commitment to continue my athletic and academic journey at **${school}** (${level})! Huge thank you to my coaches, teammates, and family for the lifelong support.\n\n*${notes}*\n\n#Commitment #${level.replace(/[^a-zA-Z0-9]/g, '')} #BlueLineWire #NextChapter`;

    const post = {
      id: `post_commit_${Date.now()}`,
      authorId: author.id,
      timestamp: "Just now",
      content: content,
      tags: ["#Commitment", `#${level.replace(/[^a-zA-Z0-9]/g, '')}`, "#BlueLineWire", "#NextChapter"],
      likes: 42,
      reposts: 14,
      replies: 8,
      likedByMe: true,
      pinned: true,
      media: {
        type: "commitment_card",
        playerName: author.name,
        school: school,
        level: level,
        classYear: classYear,
        status: status,
        hash: blockHash,
        ledgerHash: blockHash,
        stampedAt: new Date().toISOString(),
        verified: true,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      }
    };

    const state = loadState();
    state.posts.unshift(post);
    addXP(150, "Announced Official Commitment on The Wire");
    saveState(state);
    return post;
  }

  // Post Combine Biometrics to The Wire with Ledger Stamping
  function createCombinePost(data) {
    const author = getCurrentUser();
    if (!author) return null;

    const speed = parseFloat(data.flying30m || data.speed) || 3.85;
    const jump = parseFloat(data.broadJump || data.jump) || 98;
    const bench = parseInt(data.bench150 || data.benchPress || data.bench) || 14;
    const wt = parseInt(data.weight || data.weightLbs) || 185;
    const notes = data.notes || "New personal best logged during off-season combine battery.";

    let blockHash = null;
    if (typeof window !== 'undefined' && window.BlueLineAuth && typeof window.BlueLineAuth.generateBlockHash === 'function') {
      blockHash = window.BlueLineAuth.generateBlockHash(`${author.name}_combine_${Date.now()}`);
      window.BlueLineAuth.stampLedgerForUser(
        "Combine Certification",
        "Biometrics Telemetry Logged",
        `Athlete ${author.name} registered verified combine metrics: Flying 30m ${speed}s, Broad Jump ${jump}in, Bench ${bench} reps. Ledger stamped.`
      );
    } else {
      blockHash = "0x" + Math.random().toString(16).substring(2, 10) + "b8c1";
    }

    const content = `🧬 **COMBINE TESTING BENCHMARK: ${author.name.toUpperCase()}**\n\nOfficial laser biometrics stamped into the BlueLine verification ledger: Flying 30m Laser Sprint at **${speed}s**, Standing Broad Jump at **${jump}in**, Bench Press **${bench} reps**.\n\n*${notes}*\n\n#CombineReport #Biometrics #LaserTelemetry #AthleteTesting #BlueLineDataWorks`;

    const post = {
      id: `post_combine_${Date.now()}`,
      authorId: author.id,
      timestamp: "Just now",
      content: content,
      tags: ["#CombineReport", "#Biometrics", "#LaserTelemetry", "#AthleteTesting"],
      likes: 28,
      reposts: 6,
      replies: 4,
      likedByMe: true,
      pinned: false,
      media: {
        type: "combine_card",
        playerName: author.name,
        speed: `${speed}s`,
        flying30m: speed,
        jump: `${jump}"`,
        broadJump: jump,
        bench: `${bench} reps`,
        bench150: bench,
        weight: wt,
        hash: blockHash,
        ledgerHash: blockHash,
        stampedAt: new Date().toISOString(),
        verified: true
      }
    };

    const state = loadState();
    state.posts.unshift(post);
    addXP(100, "Published Combine Telemetry to The Wire");
    saveState(state);
    return post;
  }

  // Post Game Log / Performance to The Wire
  function createGameLogPost(data) {
    const author = getCurrentUser();
    if (!author) return null;

    const opp = data.opponent || "Conference Opponent";
    const g = parseInt(data.goals) || 0;
    const a = parseInt(data.assists) || 0;
    const pts = typeof data.points !== 'undefined' ? parseInt(data.points) : (g + a);
    const pm = data.plusMinus || "+1";
    const sog = parseInt(data.shots) || 4;
    const notes = data.notes || "Solid 60-minute team effort and clean execution on the forecheck.";

    const content = `📊 **GAME PERFORMANCE LOG vs ${opp.toUpperCase()}**\n\nFinal Statline: **${pts} PTS (${g}G, ${a}A)** | **${pm}** | **${sog} SOG**.\n\n*${notes}*\n\n#GameDay #BoxScore #PlayerStats #HockeyPerformance`;

    const post = {
      id: `post_gamelog_${Date.now()}`,
      authorId: author.id,
      timestamp: "Just now",
      content: content,
      tags: ["#GameDay", "#BoxScore", "#PlayerStats", "#HockeyPerformance"],
      likes: 35,
      reposts: 8,
      replies: 5,
      likedByMe: true,
      pinned: false,
      media: {
        type: "game_log_card",
        playerName: author.name,
        opponent: opp,
        goals: g,
        assists: a,
        points: pts,
        plusMinus: pm,
        shots: sog,
        stat1: `${g} G`,
        stat2: `${a} A`,
        stat3: `${pts} PTS`,
        stat4: `${pm} / ${sog} SOG`
      }
    };

    const state = loadState();
    state.posts.unshift(post);
    addXP(75, "Logged Game Performance on The Wire");
    saveState(state);
    return post;
  }

  // Post Scouting Film / Drill to The Wire
  function createFilmPost(data) {
    const author = getCurrentUser();
    if (!author) return null;

    const title = data.title || data.clipTitle || "Game Film Breakdown";
    const cat = data.category || "Transition Play";
    const url = data.url || data.videoUrl || "https://youtu.be/sample_hockey_cut";
    const notes = data.notes || "Film room breakdown showing puck protection along the half-wall and deception on the blue line.";

    const content = `🎬 **SCOUTING FILM & TACTICAL BREAKDOWN: ${title}**\n\nCategory: **${cat}**\n\n*${notes}*\n\nFilm Source: ${url}\n\n#FilmRoom #VideoAnalysis #HockeyIQ #ScoutingFilm`;

    const post = {
      id: `post_film_${Date.now()}`,
      authorId: author.id,
      timestamp: "Just now",
      content: content,
      tags: ["#FilmRoom", "#VideoAnalysis", "#HockeyIQ", "#ScoutingFilm"],
      likes: 22,
      reposts: 5,
      replies: 3,
      likedByMe: true,
      pinned: false,
      media: {
        type: "film_card",
        playerName: author.name,
        title: title,
        category: cat,
        url: url,
        videoUrl: url,
        notes: notes
      }
    };

    const state = loadState();
    state.posts.unshift(post);
    addXP(60, "Shared Scouting Film on The Wire");
    saveState(state);
    return post;
  }

  // Like a post
  function toggleLikePost(postId) {
    const state = loadState();
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    post.likedByMe = !post.likedByMe;
    post.likes += post.likedByMe ? 1 : -1;
    saveState(state);
    return post;
  }

  // Toggle Bookmark on a post
  function toggleBookmarkPost(postId) {
    const state = loadState();
    const post = state.posts.find(p => p.id === postId);
    if (!post) return null;

    post.bookmarkedByMe = !post.bookmarkedByMe;
    saveState(state);
    return post;
  }

  // Repost a post to the feed
  function repostPost(postId) {
    const state = loadState();
    const post = state.posts.find(p => p.id === postId);
    if (!post) return null;

    post.reposts = (post.reposts || 0) + 1;
    const author = getUserById(post.authorId);

    const repostEntry = {
      id: `post_repost_${Date.now()}`,
      authorId: state.currentUser ? state.currentUser.id : "usr_scout_director",
      timestamp: "Just now",
      content: `🔁 **Reposted from @${author ? author.handle : 'hockey'}**\n\n${post.content.slice(0, 200)}${post.content.length > 200 ? '...' : ''}`,
      tags: Array.from(new Set([...(post.tags || []), '#Repost'])),
      likes: 1,
      reposts: 0,
      replies: 0,
      likedByMe: true,
      pinned: false,
      media: post.media || null
    };

    state.posts.unshift(repostEntry);
    addXP(30, "Reposted on The Wire");
    saveState(state);
    return post;
  }

  // Helper to find a user by ID with alias mapping
  const USER_ALIASES = {
    'director-scouting': 'usr_scout_director',
    'blueline-scout-director': 'usr_scout_director',
    'blueline_scouting': 'usr_scout_director',
    'coach-callahan': 'usr_mike_callahan',
    'coach_callahan': 'usr_mike_callahan',
    'chicagosteel': 'usr_chicago_steel',
    'chicago-steel': 'usr_chicago_steel',
    'caplab': 'usr_blueline_caplab',
    'cap-lab': 'usr_blueline_caplab',
    'tournaments': 'usr_blueline_tournaments',
    'bracketology': 'usr_blueline_tournaments'
  };

  const SPECIAL_ACCOUNTS = {
    'usr_blueline_combine': {
      id: 'usr_blueline_combine',
      name: 'BlueLine Combine Testing Lab',
      handle: 'blueline_combine',
      role: 'scout',
      badge: BADGES.SCOUT,
      title: 'Biometrics & Laser Telemetry Hub',
      organization: 'BlueLine Scouting Bureau',
      location: 'USA Hockey Arena / Plymouth, MI',
      bio: 'Official athletic testing and physical metrics validation lab. Measuring laser 30m speed, Wingate anaerobic power, force plate jump dynamics, and trajectory percentile curves.',
      avatar: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=250&q=80',
      avatarColor: 'from-amber-500 to-red-600',
      banner: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
      level: 94,
      xp: 89000,
      xpNext: 95000,
      stats: { athletesTested: 1420, reportsGenerated: 620, laserPBs: 388 },
      following: ['usr_scout_director'],
      followers: 3100
    },
    'usr_blueline_caplab': {
      id: 'usr_blueline_caplab',
      name: 'BlueLine Salary Cap & CBA Bureau',
      handle: 'blueline_caplab',
      role: 'scout',
      badge: BADGES.SCOUT,
      title: 'Director of Hockey Operations & CBA Analytics',
      organization: 'BlueLine Cap War Room',
      location: 'New York / Toronto',
      bio: 'Official front-office contract, salary cap, and CBA analytics desk. Tracking 32 franchise cap sheets, ELC slide matrices, and lifelong contract value curves.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      avatarColor: 'from-emerald-500 to-teal-600',
      banner: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
      level: 96,
      xp: 92000,
      xpNext: 100000,
      stats: { contractsAudited: 840, buyoutsModeled: 120, capSpaceTracked: '$2.8B' },
      following: ['usr_scout_director'],
      followers: 4200
    },
    'usr_blueline_tournaments': {
      id: 'usr_blueline_tournaments',
      name: 'BlueLine Tournament & Bracketology Bureau',
      handle: 'blueline_bracketology',
      role: 'scout',
      badge: BADGES.SCOUT,
      title: 'Director of Championship Analytics & Bracketology',
      organization: 'BlueLine Tournament Bureau',
      location: 'Boston / Minneapolis',
      bio: 'Official championship simulation and tournament bracketology desk. Modeling NCAA Frozen Four, IIHF World Juniors, and CHL Memorial Cup win probabilities.',
      avatar: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=250&q=80',
      avatarColor: 'from-amber-500 to-yellow-600',
      banner: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
      level: 95,
      xp: 91000,
      xpNext: 95000,
      stats: { bracketsSimulated: 1240, upsetsPredicted: 44, championshipsTracked: 18 },
      following: ['usr_scout_director'],
      followers: 3800
    }
  };

  function getUserById(rawUserId, fallbackObj) {
    const userId = USER_ALIASES[rawUserId] || rawUserId;
    if (SPECIAL_ACCOUNTS[userId]) return SPECIAL_ACCOUNTS[userId];

    // Check if matching currently active user
    const cur = getCurrentUser();
    if (cur && (cur.id === userId || cur.handle === userId || cur.linked_player_id === userId)) {
      return cur;
    }

    const state = loadState();
    let found = state.users.find(u => u.id === userId || u.handle === userId);
    if (found) return found;

    // Check BlueLineAuth athlete dossier (resolves custom players, demo personas, and master players)
    if (typeof window !== 'undefined' && window.BlueLineAuth && typeof window.BlueLineAuth.getAthleteDossier === 'function') {
      const dossier = window.BlueLineAuth.getAthleteDossier(userId);
      if (dossier) {
        const isStaff = dossier.entity_type === 'coach' || (dossier.id && dossier.id.startsWith('mc_'));
        return {
          id: dossier.id,
          name: dossier.name,
          handle: dossier.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          role: isStaff ? "coach" : "athlete",
          badge: isStaff ? BADGES.COACH : BADGES.ATHLETE,
          title: dossier.role_title || (isStaff ? "Coach / Hockey Ops" : `${dossier.primary_role || 'Forward'} (#${dossier.num || '--'})`),
          organization: dossier.team || dossier.institution || 'Amateur Hockey',
          location: dossier.hometown || dossier.league || 'USA / Canada',
          bio: `Verified prospect dossier for ${dossier.name}. Competing in ${dossier.league || 'Amateur'} for ${dossier.team || 'Amateur Club'}.`,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          banner: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
          level: Math.min(99, Math.max(1, Math.round(dossier.composite_score || 72))),
          xp: 65000,
          xpNext: 75000,
          stats: { height: dossier.height_str || `${dossier.height_in}"`, weight: `${dossier.weight_lbs || 180} lbs`, score: dossier.composite_score }
        };
      }
    }

    // If caller provided fallback author object (e.g. from post.author)
    if (fallbackObj && fallbackObj.name) {
      return {
        id: userId,
        name: fallbackObj.name,
        handle: fallbackObj.handle || 'blueline_scouting',
        role: fallbackObj.role || 'scout',
        badge: BADGES.SCOUT,
        title: fallbackObj.title || 'Scouting Specialist',
        organization: fallbackObj.organization || 'BlueLine DataWorks',
        location: 'North America',
        bio: 'Verified BlueLine Scouting Bureau contributor.',
        avatar: fallbackObj.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        banner: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
        level: 88,
        xp: 72000,
        xpNext: 80000,
        stats: { reports: 120 }
      };
    }

    // Check if it's a roster player from master_players
    const masterList = (typeof window !== 'undefined' && (window.MASTER_ALL_REGISTRY || window.MASTER_PLAYERS || window.SMRP_ALL_REGISTRY || window.SMRP_MASTER_PLAYERS)) || [];
    if (masterList.length > 0) {
      const p = masterList.find(x => x.id === userId);
      if (p) {
        const isStaff = p.entity_type === 'coach' || (p.id && p.id.startsWith('mc_'));
        return {
          id: p.id,
          name: p.name,
          handle: p.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          role: isStaff ? "coach" : "athlete",
          badge: isStaff ? BADGES.COACH : BADGES.ATHLETE,
          title: p.role_title || (isStaff ? "Coach / Staff" : `${p.pos || 'Forward'} (#${p.num || '--'})`),
          organization: p.team || p.institution || "Amateur Hockey",
          location: p.hometown || p.league || "USA / Canada",
          bio: `Verified dossier for ${p.name}. Competing in ${p.league || 'Collegiate/Junior'} for ${p.team || 'Program'}.`,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
          banner: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80",
          level: Math.min(99, Math.max(1, Math.round(p.composite_score || 70))),
          xp: 58000,
          xpNext: 65000,
          stats: { height: p.height_str || `${p.height_in}"`, weight: `${p.weight_lbs || 180} lbs`, score: p.composite_score }
        };
      }
    }

    return {
      id: userId,
      name: "Hockey Personnel",
      handle: "user",
      role: "athlete",
      badge: BADGES.ATHLETE,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"
    };
  }

  // Pre-defined Verified Logo Crests for Avatar Stamping
  const AVAILABLE_LOGOS = [
    { id: "logo_ncaa_michigan", label: "Michigan Wolverines", icon: "〽️", color: "#00274c", border: "#ffcb05", team: "University of Michigan" },
    { id: "logo_bu_terriers", label: "Boston University", icon: "🐾", color: "#cc0000", border: "#ffffff", team: "Boston University" },
    { id: "logo_msu_spartans", label: "Michigan State", icon: "⚔️", color: "#18453b", border: "#ffffff", team: "Michigan State University" },
    { id: "logo_chicago_steel", label: "Chicago Steel USHL", icon: "🛡️", color: "#000000", border: "#e11d48", team: "Chicago Steel" },
    { id: "logo_shattuck", label: "Shattuck St. Mary's", icon: "🏰", color: "#6b21a8", border: "#f59e0b", team: "Shattuck-St. Mary's" },
    { id: "logo_usa_hockey", label: "USA Hockey NTDP", icon: "🇺🇸", color: "#1e3a8a", border: "#dc2626", team: "USA Hockey NTDP" },
    { id: "logo_verified_gold", label: "Verified 5-Star Prospect", icon: "⭐", color: "#d97706", border: "#fbbf24", team: "BlueLine Bureau" },
    { id: "logo_commit_d1", label: "NCAA D1 Committed", icon: "🎓", color: "#0284c7", border: "#38bdf8", team: "NCAA Division I" }
  ];

  function getAvailableLogos() {
    return AVAILABLE_LOGOS;
  }

  function stampAvatarLogo(logoId, position = "bottom-right") {
    const logo = AVAILABLE_LOGOS.find(l => l.id === logoId) || { id: logoId, label: "Custom Badge", icon: "🛡️", color: "#0284c7", border: "#38bdf8" };
    return updateProfile({
      logoOverlay: {
        id: logo.id,
        label: logo.label,
        icon: logo.icon,
        color: logo.color,
        border: logo.border,
        position: position
      }
    });
  }

  function removeAvatarLogo() {
    return updateProfile({ logoOverlay: null });
  }

  function getUserPosts(userId) {
    const state = loadState();
    if (!userId) {
      const cur = getCurrentUser();
      userId = cur ? cur.id : "usr_michael_hage";
    }
    return state.posts.filter(p => p.authorId === userId);
  }

  function getConversationsForUser(userId) {
    const state = loadState();
    if (!userId) {
      const cur = getCurrentUser();
      userId = cur ? cur.id : "usr_scout_director";
    }
    return state.conversations.filter(c => c.participantIds.includes(userId));
  }

  // Export to Global
  window.BlueLineSocial = {
    BADGES: BADGES,
    DEFAULT_USERS: DEFAULT_USERS,
    AVAILABLE_LOGOS: AVAILABLE_LOGOS,
    getAvailableLogos: getAvailableLogos,
    stampAvatarLogo: stampAvatarLogo,
    removeAvatarLogo: removeAvatarLogo,
    getUserPosts: getUserPosts,
    getConversationsForUser: getConversationsForUser,
    getLevelTitle: getLevelTitle,
    getLevelBadgeColor: getLevelBadgeColor,
    getState: loadState,
    getCurrentUser: getCurrentUser,
    registerUser: registerUser,
    switchUser: switchUser,
    updateProfile: updateProfile,
    addXP: addXP,
    sendMessage: sendMessage,
    createPost: createPost,
    createCommitmentPost: createCommitmentPost,
    createCombinePost: createCombinePost,
    createGameLogPost: createGameLogPost,
    createFilmPost: createFilmPost,
    toggleLikePost: toggleLikePost,
    toggleBookmarkPost: toggleBookmarkPost,
    repostPost: repostPost,
    getUserById: getUserById
  };

})(window);
