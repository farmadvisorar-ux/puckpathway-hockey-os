const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const defaultOgImage = 'https://draftlineup.com/static/img/draftlineup_og_banner.jpg';
const defaultFavicon = 'static/img/draftlineup_logo.jpg';
const defaultCrest = 'static/img/draftlineup_crest.svg';

const titles = {
  'index.html': 'DraftLineup.com - Lifelong Hockey Intelligence & Draft OS',
  'app.html': 'DraftLineup.com - Athlete Pathway & Development OS',
  'scout.html': 'DraftLineup.com OS | Lead Scout Workspace & Prospect Desk',
  'database.html': 'Master Global Hockey Directory & Player Passport Registry | DraftLineup.com',
  'scoreboard.html': 'Live Multi-Game Scouting War Room & xG Feed | DraftLineup.com',
  'community.html': 'The Wire - Verified Hockey Scouting Network | DraftLineup.com',
  'security.html': 'Aegis Cyber Defense Grid & Security Co-Pilot Swarm | DraftLineup.com',
  'film.html': 'AI Video Telestration & Shift Breakdown Studio | DraftLineup.com',
  'broadcast_ai.html': 'Live Broadcast Commentary & Voice AI Studio | DraftLineup.com',
  'tracking.html': 'Microstat & Spatial Passing Network Studio | DraftLineup.com',
  'crease.html': 'Crease Lab - Goaltender Geometry & GSAx Studio | DraftLineup.com',
  'combine.html': 'AI Combine & Biometric Benchmark Suite | DraftLineup.com',
  'compare.html': 'Multi-Player Head-to-Head Radar Comparison | DraftLineup.com',
  'coach.html': 'Coach Command Center & Practice Plan Studio | DraftLineup.com',
  'tactics.html': 'Tactics & Lineup Chemistry Studio | DraftLineup.com',
  'tournament.html': 'Tournament Bracketology & Championship War Room | DraftLineup.com',
  'international.html': 'International Best-on-Best & Olympic War Room | DraftLineup.com',
  'parent.html': 'Parent & Family Advisor Portal | DraftLineup.com',
  'market.html': 'Pro Scouting, Trade Machine & Market War Room | DraftLineup.com',
  'caplab.html': 'Cap Lab - NHL Salary Cap Ledger & Buyout Simulator | DraftLineup.com',
  'pathway.html': 'Lifelong Athlete Pathway & Career Trajectory Studio | DraftLineup.com',
  'draft.html': '7-Round NHL Entry Draft Simulator & War Room | DraftLineup.com',
  'portal.html': 'NCAA Transfer Portal & NIL War Room | DraftLineup.com',
  'agents.html': 'Emergent 24-Agent Multi-Agent Scouting Mesh | DraftLineup.com',
  'player.html': 'Athlete Dossier & Trajectory Passport | DraftLineup.com',
  'login.html': 'Log In & Identity Gateway | DraftLineup.com',
  'signup.html': 'Sign Up & Tiered Subscription | DraftLineup.com'
};

const desc = "DraftLineup.com is the only hockey analytics platform that tracks athletes from their earliest competitive stages through their professional careers — giving scouts, coaches, and organizations a complete view of a player’s evolution, potential, and performance trajectory.";

let updatedCount = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const pageTitle = titles[file] || `DraftLineup.com - ${file.replace('.html', '').toUpperCase()} OS`;

  // Standard OpenGraph & Twitter block
  const metaBlock = `  <!-- Favicons & Icons -->
  <link rel="icon" type="image/svg+xml" href="${defaultCrest}">
  <link rel="icon" type="image/jpeg" href="${defaultFavicon}">
  <link rel="apple-touch-icon" href="${defaultFavicon}">

  <!-- Open Graph / Social Link Preview -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="DraftLineup.com">
  <meta property="og:url" content="https://draftlineup.com/${file}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${defaultOgImage}">
  <meta property="og:image:secure_url" content="${defaultOgImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="720">
  <meta property="og:image:alt" content="DraftLineup.com - Lifelong Hockey Intelligence & Draft OS">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@DraftLineup">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${defaultOgImage}">
  <meta name="twitter:image:alt" content="DraftLineup.com - Lifelong Hockey Intelligence & Draft OS">`;

  // Remove old OG, twitter, and icon tags in head to avoid duplicates
  html = html.replace(/\s*<!--\s*(Open Graph|Twitter Card|Favicons|Icons)[^>]*-->/gi, '');
  html = html.replace(/\s*<link rel="(icon|apple-touch-icon|image_src)"[^>]*>/gi, '');
  html = html.replace(/\s*<meta property="og:[^"]+"[^>]*>/gi, '');
  html = html.replace(/\s*<meta name="twitter:[^"]+"[^>]*>/gi, '');
  html = html.replace(/\s*<meta name="thumbnail"[^>]*>/gi, '');

  // Insert standard block right after <title>...</title>
  if (html.includes('</title>')) {
    html = html.replace('</title>', `</title>\n${metaBlock}\n`);
    fs.writeFileSync(filePath, html, 'utf8');
    updatedCount++;
    console.log(`✓ Updated meta image tags in: ${file}`);
  }
});

console.log(`\nSuccessfully standardized meta tags with new images across ${updatedCount} HTML files.`);
