/**
 * BlueLine DataWorks: Faceoff Dot Mastery & Set-Play Engine
 * 
 * Capabilities:
 * - 9-Dot Spatial Rink Geometry & Zone Win Percentages
 * - Technique Classification (Clean Draw, Tie-Up Battle, Stick Lift, Skate Kick)
 * - Reaction Latency Benchmark Telemetry (Puck drop millisecond delta)
 * - Interactive 5v5 & Special Teams Set-Play Routes
 * - Head-to-Head Dot Matchup Matrix (Crosby, Matthews, Horvat, Giroux, Celebrini, Bergeron benchmark)
 * - The BlueLine Wire Set-Play Broadcast Generator
 */

(function(window) {
  "use strict";

  // =========================================================================
  // 1. 9-DOT SPATIAL RINK DEFINITIONS
  // =========================================================================
  const FACEOFF_DOTS = [
    { id: "oz_left", name: "Offensive Zone Left", zone: "Offensive", x: 140, y: 100, strongSide: "L", avgWinRate: "54.2%", importance: "High-Danger Scoring" },
    { id: "oz_right", name: "Offensive Zone Right", zone: "Offensive", x: 480, y: 100, strongSide: "R", avgWinRate: "55.8%", importance: "High-Danger Scoring" },
    { id: "nz_left_off", name: "Neutral Zone Off Left", zone: "Neutral", x: 190, y: 175, strongSide: "L", avgWinRate: "51.4%", importance: "Rush Generation" },
    { id: "nz_right_off", name: "Neutral Zone Off Right", zone: "Neutral", x: 430, y: 175, strongSide: "R", avgWinRate: "52.1%", importance: "Rush Generation" },
    { id: "center_ice", name: "Center Ice", zone: "Neutral", x: 310, y: 220, strongSide: "Both", avgWinRate: "50.0%", importance: "First Possession" },
    { id: "nz_left_def", name: "Neutral Zone Def Left", zone: "Neutral", x: 190, y: 265, strongSide: "L", avgWinRate: "49.6%", importance: "Regroup Control" },
    { id: "nz_right_def", name: "Neutral Zone Def Right", zone: "Neutral", x: 430, y: 265, strongSide: "R", avgWinRate: "50.8%", importance: "Regroup Control" },
    { id: "dz_left", name: "Defensive Zone Left", zone: "Defensive", x: 140, y: 340, strongSide: "L", avgWinRate: "53.1%", importance: "Pressure Relief" },
    { id: "dz_right", name: "Defensive Zone Right", zone: "Defensive", x: 480, y: 340, strongSide: "R", avgWinRate: "52.4%", importance: "Pressure Relief" }
  ];

  // =========================================================================
  // 2. ELITE FACEOFF SPECIALIST DOSSIERS
  // =========================================================================
  const FACEOFF_SPECIALISTS = [
    {
      id: "fo_crosby",
      name: "Sidney Crosby",
      pos: "C",
      hand: "L",
      team: "Pittsburgh Penguins",
      league: "NHL / QMJHL Alum (Rimouski)",
      overallWinPct: "56.4%",
      cleanDrawPct: "48.5%",
      tieUpWinPct: "62.8%",
      stickLiftPct: "54.1%",
      reactionLatencyMs: 192,
      ozWinPct: "58.2%",
      dzWinPct: "55.8%",
      nzWinPct: "54.9%",
      profile: "Master of lower-body positioning and stick leverage. Elite forehand tie-up allowing wingers to swoop in cleanly."
    },
    {
      id: "fo_bergeron",
      name: "Patrice Bergeron",
      pos: "C",
      hand: "R",
      team: "Boston Bruins (Legend Benchmark)",
      league: "NHL / Historical Standard",
      overallWinPct: "61.8%",
      cleanDrawPct: "58.4%",
      tieUpWinPct: "66.2%",
      stickLiftPct: "60.5%",
      reactionLatencyMs: 182,
      ozWinPct: "63.5%",
      dzWinPct: "61.2%",
      nzWinPct: "60.4%",
      profile: "The gold standard in hockey history. Flawless timing on referee drop and unmatched rotational core strength."
    },
    {
      id: "fo_matthews",
      name: "Auston Matthews",
      pos: "C",
      hand: "L",
      team: "Toronto Maple Leafs",
      league: "NHL / USNTDP Alum",
      overallWinPct: "54.8%",
      cleanDrawPct: "52.1%",
      tieUpWinPct: "57.4%",
      stickLiftPct: "55.0%",
      reactionLatencyMs: 204,
      ozWinPct: "56.9%",
      dzWinPct: "53.2%",
      nzWinPct: "54.0%",
      profile: "Long reach and powerful wrist snap. Excels on offensive left-dot clean pulls back to the point."
    },
    {
      id: "fo_horvat",
      name: "Bo Horvat",
      pos: "C",
      hand: "L",
      team: "New York Islanders",
      league: "NHL / OHL Alum (London)",
      overallWinPct: "57.9%",
      cleanDrawPct: "54.2%",
      tieUpWinPct: "63.0%",
      stickLiftPct: "56.8%",
      reactionLatencyMs: 188,
      ozWinPct: "59.4%",
      dzWinPct: "57.1%",
      nzWinPct: "56.8%",
      profile: "Heavy volume workhorse. Wins defensive zone draws cleanly under pressure to initiate zone exits."
    },
    {
      id: "fo_giroux",
      name: "Claude Giroux",
      pos: "C/RW",
      hand: "R",
      team: "Ottawa Senators",
      league: "NHL / QMJHL Alum (Gatineau)",
      overallWinPct: "59.1%",
      cleanDrawPct: "56.8%",
      tieUpWinPct: "61.5%",
      stickLiftPct: "59.2%",
      reactionLatencyMs: 185,
      ozWinPct: "61.0%",
      dzWinPct: "58.6%",
      nzWinPct: "57.5%",
      profile: "Deceptive stick preparation. Masters the quick blade twist and skate kick on right-circle dots."
    },
    {
      id: "fo_celebrini",
      name: "Macklin Celebrini",
      pos: "C",
      hand: "L",
      team: "San Jose Sharks",
      league: "NHL / NCAA Alum (BU)",
      overallWinPct: "51.8%",
      cleanDrawPct: "46.2%",
      tieUpWinPct: "55.4%",
      stickLiftPct: "53.9%",
      reactionLatencyMs: 208,
      ozWinPct: "53.5%",
      dzWinPct: "50.4%",
      nzWinPct: "51.2%",
      profile: "Rapidly progressing rookie center. Rapid wrist snap and improving physical posture against veteran centers."
    }
  ];

  // =========================================================================
  // 3. STRUCTURED 5V5 & SPECIAL TEAMS SET-PLAY BLUEPRINTS
  // =========================================================================
  const SET_PLAYS = [
    {
      id: "sp_overload_slingshot",
      title: "The Overload Slingshot",
      type: "Power Play / 5v5 O-Zone",
      dot: "oz_left",
      description: "Center executes a clean backhand pull to Left Point. Left Defenseman immediately walks the line and delivers a slap-pass to Right Winger cutting backdoor behind the collapsed penalty box.",
      expectedXg: "0.28 xG",
      keyMovement: "Center pins opposing center; RW slips blindside; RD provides top safety valve."
    },
    {
      id: "sp_bumper_snap",
      title: "The Slot Bumper Quick-Snap",
      type: "5v5 Offensive Zone",
      dot: "oz_right",
      description: "Center initiates a physical stick tie-up against the opposing center. Left Winger swoops into the circle, scoops the contested puck, and dishes a 4-foot touch pass to Right Winger in the high bumper for a one-timer.",
      expectedXg: "0.32 xG",
      keyMovement: "Tie-up creates a shielded pocket for the inside winger curl."
    },
    {
      id: "sp_d2d_blast",
      title: "Point D-to-D One-Timer",
      type: "Power Play Setup",
      dot: "oz_left",
      description: "Clean draw direct to Left Defenseman, who takes two lateral strides to draw the shot-blocker, then slides a crisp diagonal pass to Right Defenseman for a heavy one-timer through net-front screen.",
      expectedXg: "0.24 xG",
      keyMovement: "Lateral D-to-D shift changes shooting lane angle by 28 degrees."
    },
    {
      id: "sp_dzone_wheel",
      title: "Defensive Zone Quick-Wheel Exit",
      type: "5v5 D-Zone Breakout",
      dot: "dz_left",
      description: "Center pulls the puck softly toward the back boards. Left Defenseman retrieves on the wheel, rounds the net with momentum, and connects with Right Winger blowing the neutral zone lane.",
      expectedXg: "0.14 xG (Counter-attack)",
      keyMovement: "Neutralizes aggressive opponent forecheck pin."
    },
    {
      id: "sp_pk_glass_lock",
      title: "Shorthanded High-Glass Pin & Clear",
      type: "Penalty Kill",
      dot: "dz_right",
      description: "Center locks up opposing center's stick and body. PK Winger engages the wall, controls puck with skates, and vaults a high-arching bank off the glass to clear the zone.",
      expectedXg: "0.01 xGA (Zone Cleanse)",
      keyMovement: "Zero-risk structural safety move killing 14 seconds off power play."
    }
  ];

  // =========================================================================
  // 4. THE BLUE LINE WIRE SET-PLAY BROADCAST
  // =========================================================================
  function broadcastSetPlay(setPlay, player) {
    const wireStateKey = "blueline_social_state";
    let wire = { posts: [] };
    try {
      const stored = localStorage.getItem(wireStateKey);
      if (stored) wire = JSON.parse(stored);
    } catch (e) {}

    const newPost = {
      id: "post_fo_" + Date.now(),
      author: "BlueLine Faceoff Desk",
      handle: "@BlueLineFaceoffs",
      avatar: "🎯",
      badge: "SET-PLAY PLAYBOOK VERIFIED",
      timestamp: "Just now",
      content: `📋 SET-PLAY TACTICAL BLUEPRINT: "${setPlay.title}" (${setPlay.type})\n\n` +
        `• Dot Location: ${setPlay.dot.toUpperCase().replace("_", " ")} | Expected Rush xG: ${setPlay.expectedXg}\n` +
        `• Lead Center Specialist: ${player.name} (${player.team}) — Overall FO%: ${player.overallWinPct}\n` +
        `• Tactical Execution: ${setPlay.description}\n` +
        `• Key Movement: "${setPlay.keyMovement}"\n\n` +
        `#SetPlays #FaceoffMastery #TacticalPlaybook #BlueLineDataWorks`,
      likes: 78,
      reposts: 34,
      replies: 16
    };

    wire.posts.unshift(newPost);
    try {
      localStorage.setItem(wireStateKey, JSON.stringify(wire));
    } catch (e) {}

    return newPost;
  }

  // =========================================================================
  // PUBLIC API EXPORT
  // =========================================================================
  window.FaceoffEngine = {
    dots: FACEOFF_DOTS,
    specialists: FACEOFF_SPECIALISTS,
    setPlays: SET_PLAYS,
    broadcastSetPlay
  };

})(window);
