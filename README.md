# (SMRP) Shane McCoys Recurter Pro (SMRP) - Enterprise Scouting OS & Non-NHL Directory

Production Deployment: [https://puckpathway-hockey-os.vercel.app](https://puckpathway-hockey-os.vercel.app)

## Project Overview
**(SMRP) Shane McCoys Recurter Pro (SMRP)** is an enterprise-grade hockey tactical, scouting, and talent evaluation operating system featuring:
- **Master Scouting Directory (`database.html`)**: Searchable database of **2,974 active hockey personnel** (2,833 players + 141 coaches & hockey ops leaders) covering every major non-NHL tier: NCAA D1 Men & Women, NCAA D3, ACHA, USHL, NAHL, AHL Minor Pro, ECHL AA Minor, Canadian U Sports, Junior A, and Elite Prep (Strictly Non-NHL).
- **Live Broadcast Commentary & Voice AI Studio (`broadcast_ai.html`)**: Real-time Speech-to-Stats speech recognition, audio broadcast NLP telemetry parsing, momentum analytics, coach voice debrief, and instant verified PDF scouting telemetry generation.
- **Enterprise ADM Practice Canvas & Planner**: Full-ice and half-ice whiteboard with drill creation, skater/cone placement, passing routes, and export tools.
- **Vast Tactical Playbook & Custom Studio**: 20+ tactics covering 5v5 forecheck, neutral zone regroups, breakouts, special teams (PP/PK), and defensive coverage.
- **Player Tracking & Audit Ledger**: Roster ledger, scouting reports, biometrics, combine testing metrics, and immutable audit logs signed by Head Recruiter **Shane McCoy**.
- **Film Room & Video Breakdown**: Video telestration with draw tools, tactical overlays, timestamps, and play-by-play tagging.
- **Bench Management**: Shift timers, on-ice combinations, line chemistry analysis, and ice time tracking.
- **Standalone Verified Personnel Dossier (`player.html`)**: Individual scouting passport for athletes and coaches with interactive radar charts and PDF export.

## File Structure
- `index.html`: Main application shell with navigation, modals, tactical studio, and drill whiteboard.
- `database.html`: Master searchable database and directory across 2,974 non-NHL players and coaches with faceted filters, table/card views, and CSV/JSON export.
- `broadcast_ai.html`: Live broadcast voice AI studio for real-time speech recognition, commentary NLP ingestion, and telemetry reports.
- `player.html`: Standalone verified personnel dossier and passport page.
- `vercel.json`: Vercel routing configuration with clean URLs.
- `static/css/custom.css`: Cyber/ice glassmorphism theme, layout styling, and animations.
- `static/js/master_players.js`: 2,974 comprehensive non-NHL athlete and coach records (3.4 MB).
- `static/js/bundle_data.js`: Complete embedded master dataset (leagues, rosters, tactics, drills, combine benchmarks, and player registries).
- `static/js/broadcast_studio.js`: Web Speech API, commentary NLP simulation, momentum tracking, and telemetry ledger.
- `static/js/rink_canvas.js`: High-performance 2D HTML5 canvas hockey rink renderer with drawing, player node dragging, and animation support.
- `static/js/film_telestration.js`: Video telestration overlay and annotation tools.
- `static/js/app.js`: Main client-side state controller, event handlers, ledger sync, and tab routing.
