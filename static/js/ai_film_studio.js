/**
 * BlueLine DataWorks — Enterprise AI Video Telestration & Tracking Engine
 * Provides:
 * - Computer Vision skater detection bounding boxes with confidence scores
 * - Optical flow speed telemetry (MPH) and skater velocity vectors
 * - Dynamic puck trajectory tracking with glowing velocity wake
 * - Defensive gap distance meter (feet) and passing seam rays
 * - Professional telestration drawing suite (Spotlight, Arrow, Seam, Gap, Pen, Callout)
 * - 60-Second AI Highlight Reel Compiler with cross-platform publishing to The Wire
 */

class BlueLineAIFilmStudio {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Display Dimensions
    this.width = 1280;
    this.height = 720; // 16:9 Broadcast Widescreen

    // Playback State
    this.isPlaying = true;
    this.currentTime = 0.0;
    this.duration = 18.0;
    this.playbackRate = 1.0;
    this.lastFrameTime = performance.now();

    // AI Computer Vision Toggles
    this.cvToggles = {
      skaterBoxes: true,
      speedTelemetry: true,
      puckTrail: true,
      gapRulers: true,
      offsideLine: true
    };

    // Active Telestration Tool & Settings
    this.activeTool = 'spotlight'; // 'spotlight' | 'vector' | 'pass' | 'gap' | 'freehand' | 'callout' | 'select'
    this.activeColor = '#00f0ff'; // cyan, amber, emerald, red, white
    this.activeStrokeWidth = 3;

    // Telestration Drawing State
    this.telestrations = [];
    this.undoStack = [];
    this.isDrawing = false;
    this.drawStart = null;
    this.currentDrawingItem = null;
    this.freehandPoints = [];

    // Puck Tracking History
    this.puckTrailPoints = [];
    this.maxPuckTrail = 35;

    // Simulated Broadcast Clip Presets
    this.clips = [
      {
        id: 'clip-1',
        title: 'Neutral Zone Controlled Entry & Cross-Ice Seam',
        level: 'NCAA Division I (Big Ten Conference)',
        playerFocus: 'Michael Hage (C #19 - Michigan)',
        duration: 16.0,
        events: [
          { time: 2.5, type: 'Controlled Exit', label: 'D-Zone Breakout Pass' },
          { time: 6.8, type: 'Neutral Zone Transition', label: 'Speed Differential Entry (22.4 MPH)' },
          { time: 11.2, type: 'Cross-Ice Seam', label: 'Royal Road High-Danger Pass' },
          { time: 14.5, type: 'Shot on Goal', label: 'Slot One-Timer (86.2 MPH)' }
        ]
      },
      {
        id: 'clip-2',
        title: 'Power Play 1-3-1 Umbrella & High Bumper Release',
        level: 'USHL Junior Tier 1 (Chicago Steel)',
        playerFocus: 'Jack Devine (RW #9 - Denver / Florida)',
        duration: 18.0,
        events: [
          { time: 3.0, type: 'Zone Setup', label: 'Umbrella Formation Established' },
          { time: 7.5, type: 'Pre-Touch Scan', label: 'Bumper Scan & Weak-Side Shift' },
          { time: 12.0, type: 'One-Timer Blast', label: 'Left Circle Blast (91.8 MPH)' }
        ]
      },
      {
        id: 'clip-3',
        title: 'D-Zone Net-Front Box-and-1 & Stick-on-Puck Gap',
        level: 'AAA Midget / Prep Showcase',
        playerFocus: 'Aiden Dubinsky (RD #4 - Minnesota Duluth)',
        duration: 15.0,
        events: [
          { time: 2.0, type: 'Rush Defense', label: 'Angling Blue Line Hold' },
          { time: 6.2, type: 'Gap Tightening', label: 'Defensive Gap Suppressed to 4.2 FT' },
          { time: 10.5, type: 'Stick Check', label: 'Puck Separation & Controlled Turnover' }
        ]
      }
    ];
    this.currentClipIndex = 0;

    // Synthetic Skater Tracking Entities
    this.skaters = this.initSkaters();

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = Math.max(480, Math.floor(rect.width));
    const h = Math.floor(w * (9 / 16));

    this.width = w;
    this.height = h;

    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  initSkaters() {
    return [
      {
        id: 'skater-1',
        name: 'M. Hage',
        number: '19',
        team: 'HOME',
        position: 'C',
        color: '#38bdf8',
        baseX: 0.25,
        baseY: 0.5,
        speedMph: 22.4,
        confidence: 0.985,
        isKeyFocus: true
      },
      {
        id: 'skater-2',
        name: 'A. Dubinsky',
        number: '4',
        team: 'AWAY',
        position: 'RD',
        color: '#f59e0b',
        baseX: 0.65,
        baseY: 0.38,
        speedMph: 18.2,
        confidence: 0.972,
        isKeyFocus: false
      },
      {
        id: 'skater-3',
        name: 'R. Chesley',
        number: '2',
        team: 'AWAY',
        position: 'LD',
        color: '#f59e0b',
        baseX: 0.68,
        baseY: 0.62,
        speedMph: 17.8,
        confidence: 0.968,
        isKeyFocus: false
      },
      {
        id: 'skater-4',
        name: 'J. Devine',
        number: '9',
        team: 'HOME',
        position: 'RW',
        color: '#38bdf8',
        baseX: 0.35,
        baseY: 0.22,
        speedMph: 20.6,
        confidence: 0.981,
        isKeyFocus: false
      },
      {
        id: 'skater-5',
        name: 'H. Slukynsky',
        number: '30',
        team: 'AWAY',
        position: 'G',
        color: '#ec4899',
        baseX: 0.92,
        baseY: 0.5,
        speedMph: 4.1,
        confidence: 0.994,
        isKeyFocus: false
      }
    ];
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('mouseleave', () => this.onMouseUp());

    // Touch Support for Tablets & Touchscreens
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
      e.preventDefault();
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
      e.preventDefault();
    });

    this.canvas.addEventListener('touchend', (e) => {
      const mouseEvent = new MouseEvent('mouseup', {});
      this.canvas.dispatchEvent(mouseEvent);
    });
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  onMouseDown(e) {
    const pos = this.getCanvasCoords(e);
    this.isDrawing = true;
    this.drawStart = pos;

    if (this.activeTool === 'freehand') {
      this.freehandPoints = [pos];
      this.currentDrawingItem = {
        type: 'freehand',
        points: this.freehandPoints,
        color: this.activeColor,
        strokeWidth: this.activeStrokeWidth
      };
    } else if (this.activeTool === 'callout') {
      const text = prompt('Enter Coaching Telestration Callout:', 'High-Danger Seam / Controlled Gap');
      if (text && text.trim()) {
        this.telestrations.push({
          type: 'callout',
          x: pos.x,
          y: pos.y,
          text: text.trim(),
          color: this.activeColor
        });
        this.updateUndoStack();
      }
      this.isDrawing = false;
    } else {
      this.currentDrawingItem = {
        type: this.activeTool,
        start: pos,
        end: pos,
        color: this.activeColor,
        strokeWidth: this.activeStrokeWidth
      };
    }
  }

  onMouseMove(e) {
    if (!this.isDrawing || !this.currentDrawingItem) return;
    const pos = this.getCanvasCoords(e);

    if (this.activeTool === 'freehand') {
      this.freehandPoints.push(pos);
    } else {
      this.currentDrawingItem.end = pos;
    }
  }

  onMouseUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentDrawingItem) {
      this.telestrations.push(this.currentDrawingItem);
      this.currentDrawingItem = null;
      this.freehandPoints = [];
      this.updateUndoStack();
    }
  }

  updateUndoStack() {
    this.undoStack.push(JSON.parse(JSON.stringify(this.telestrations)));
  }

  undo() {
    if (this.telestrations.length === 0) return;
    this.telestrations.pop();
  }

  clearTelestrations() {
    this.telestrations = [];
    this.undoStack = [];
  }

  setTool(tool) {
    this.activeTool = tool;
  }

  setColor(color) {
    this.activeColor = color;
  }

  toggleCV(feature, isEnabled) {
    if (this.cvToggles[feature] !== undefined) {
      this.cvToggles[feature] = isEnabled;
    }
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.lastFrameTime = performance.now();
    return this.isPlaying;
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
  }

  stepFrame(deltaFrames) {
    const frameDuration = 1 / 30; // 30 FPS step
    this.seek(this.currentTime + deltaFrames * frameDuration);
  }

  setPlaybackRate(rate) {
    this.playbackRate = parseFloat(rate);
  }

  loadClipPreset(index) {
    if (this.clips[index]) {
      this.currentClipIndex = index;
      this.currentTime = 0.0;
      this.duration = this.clips[index].duration;
      this.puckTrailPoints = [];
      this.clearTelestrations();
    }
  }

  animate(now) {
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    if (this.isPlaying) {
      this.currentTime += dt * this.playbackRate;
      if (this.currentTime >= this.duration) {
        this.currentTime = 0; // Loop playback
      }
    }

    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Simulated Ice Surface & Rink Geometry
    this.drawIceSurface();

    // 2. Calculate Real-Time Skater & Puck Positions
    const t = this.currentTime;
    const skaterPositions = this.calculateSkaterTelemetry(t);
    const puckPos = this.calculatePuckTelemetry(t, skaterPositions);

    // 3. Draw AI Computer Vision Overlays
    if (this.cvToggles.puckTrail) {
      this.drawPuckTrail(puckPos);
    }

    if (this.cvToggles.gapRulers) {
      this.drawDefensiveGapRuler(skaterPositions);
    }

    this.drawSkaters(skaterPositions);

    // 4. Draw User Telestrations Layer
    this.drawTelestrations();

    // 5. Draw Active In-Progress Drawing
    if (this.isDrawing && this.currentDrawingItem) {
      this.renderTelestrationItem(this.currentDrawingItem);
    }

    // 6. Draw Broadcast Telemetry HUD Overlay
    this.drawBroadcastHUD(puckPos);
  }

  drawIceSurface() {
    const w = this.width;
    const h = this.height;

    // Deep ice sheen background
    const iceGrad = this.ctx.createLinearGradient(0, 0, w, h);
    iceGrad.addColorStop(0, '#0c1626');
    iceGrad.addColorStop(0.5, '#07101d');
    iceGrad.addColorStop(1, '#050a12');
    this.ctx.fillStyle = iceGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Rink Blue Lines & Center Red Line
    this.ctx.save();
    this.ctx.lineWidth = 4;

    // Center Red Line
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    this.ctx.setLineDash([10, 8]);
    this.ctx.beginPath();
    this.ctx.moveTo(w * 0.5, 0);
    this.ctx.lineTo(w * 0.5, h);
    this.ctx.stroke();

    // Neutral Zone Blue Lines
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    this.ctx.setLineDash([]);
    this.ctx.lineWidth = 6;

    this.ctx.beginPath();
    this.ctx.moveTo(w * 0.35, 0);
    this.ctx.lineTo(w * 0.35, h);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(w * 0.65, 0);
    this.ctx.lineTo(w * 0.65, h);
    this.ctx.stroke();

    // Faceoff Circles
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(w * 0.5, h * 0.5, h * 0.18, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(w * 0.82, h * 0.3, h * 0.16, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(w * 0.82, h * 0.7, h * 0.16, 0, Math.PI * 2);
    this.ctx.stroke();

    // Goal Crease
    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    this.ctx.beginPath();
    this.ctx.arc(w * 0.94, h * 0.5, h * 0.1, Math.PI * 0.5, Math.PI * 1.5);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  calculateSkaterTelemetry(t) {
    const w = this.width;
    const h = this.height;

    return this.skaters.map((s, idx) => {
      // Dynamic simulated motion paths based on clip time
      let xProgress = (t / this.duration);
      let oscX = Math.sin(t * 1.2 + idx) * 0.04;
      let oscY = Math.cos(t * 0.9 + idx * 1.5) * 0.06;

      let normX = Math.min(0.95, Math.max(0.08, s.baseX + (xProgress * 0.45) + oscX));
      let normY = Math.min(0.9, Math.max(0.1, s.baseY + oscY));

      if (s.position === 'G') {
        normX = 0.93 + (Math.sin(t * 2) * 0.015);
        normY = 0.5 + (Math.sin(t * 1.5) * 0.08);
      }

      const pixelX = normX * w;
      const pixelY = normY * h;

      const dynamicSpeed = (s.speedMph + Math.sin(t * 2.5 + idx) * 1.8).toFixed(1);

      return {
        ...s,
        x: pixelX,
        y: pixelY,
        currentSpeed: dynamicSpeed
      };
    });
  }

  calculatePuckTelemetry(t, skaters) {
    // Puck stays near the lead carrier or passes across seams
    const puckCarrier = skaters[0]; // M. Hage
    let px = puckCarrier.x + 24 + Math.sin(t * 3) * 6;
    let py = puckCarrier.y + 12 + Math.cos(t * 3) * 4;

    // Release shot event near end of clip
    if (t > 12.0) {
      const shotProgress = (t - 12.0) / 4.0;
      const targetX = this.width * 0.94;
      const targetY = this.height * 0.48;
      px = px + (targetX - px) * Math.min(1.0, shotProgress * 2.5);
      py = py + (targetY - py) * Math.min(1.0, shotProgress * 2.5);
    }

    const puck = { x: px, y: py, shotSpeed: (78.4 + (t * 0.8)).toFixed(1) };

    // Record trail point
    this.puckTrailPoints.push({ x: px, y: py, time: t });
    if (this.puckTrailPoints.length > this.maxPuckTrail) {
      this.puckTrailPoints.shift();
    }

    return puck;
  }

  drawPuckTrail(puck) {
    if (this.puckTrailPoints.length < 2) return;
    this.ctx.save();
    for (let i = 0; i < this.puckTrailPoints.length - 1; i++) {
      const p1 = this.puckTrailPoints[i];
      const p2 = this.puckTrailPoints[i + 1];
      const alpha = (i / this.puckTrailPoints.length) * 0.8;

      this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
      this.ctx.lineWidth = 1 + (i / this.puckTrailPoints.length) * 4;
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
    }

    // Actual Puck
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 12;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(puck.x, puck.y, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawDefensiveGapRuler(skaters) {
    const fwd = skaters[0]; // M. Hage
    const def = skaters[1]; // A. Dubinsky
    if (!fwd || !def) return;

    const dx = def.x - fwd.x;
    const dy = def.y - fwd.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const distFeet = ((distPx / this.width) * 200 * 0.15).toFixed(1); // Approximate 200ft rink ratio

    this.ctx.save();
    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeStyle = distFeet < 7.0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(56, 189, 248, 0.6)';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(fwd.x, fwd.y);
    this.ctx.lineTo(def.x, def.y);
    this.ctx.stroke();

    // Gap Label Badge
    const midX = (fwd.x + def.x) / 2;
    const midY = (fwd.y + def.y) / 2 - 12;

    this.ctx.setLineDash([]);
    this.ctx.fillStyle = 'rgba(9, 14, 23, 0.85)';
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(midX - 35, midY - 10, 70, 20, 6);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = '10px "JetBrains Mono", monospace';
    this.ctx.fillStyle = distFeet < 7.0 ? '#f87171' : '#38bdf8';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`GAP: ${distFeet} FT`, midX, midY + 4);

    this.ctx.restore();
  }

  drawSkaters(skaters) {
    skaters.forEach((s) => {
      const boxW = 44;
      const boxH = 58;
      const bx = s.x - boxW / 2;
      const by = s.y - boxH / 2;

      // 1. Computer Vision Bounding Box
      if (this.cvToggles.skaterBoxes) {
        this.ctx.save();
        this.ctx.strokeStyle = s.isKeyFocus ? 'rgba(0, 240, 255, 0.85)' : 'rgba(148, 163, 184, 0.5)';
        this.ctx.lineWidth = s.isKeyFocus ? 2 : 1;
        this.ctx.strokeRect(bx, by, boxW, boxH);

        // Corner tick marks
        const tick = 6;
        this.ctx.strokeStyle = s.color;
        this.ctx.lineWidth = 2;

        // Top Left
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by + tick);
        this.ctx.lineTo(bx, by);
        this.ctx.lineTo(bx + tick, by);
        this.ctx.stroke();

        // Top Right
        this.ctx.beginPath();
        this.ctx.moveTo(bx + boxW - tick, by);
        this.ctx.lineTo(bx + boxW, by);
        this.ctx.lineTo(bx + boxW, by + tick);
        this.ctx.stroke();

        // Bottom Left
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by + boxH - tick);
        this.ctx.lineTo(bx, by + boxH);
        this.ctx.lineTo(bx + tick, by + boxH);
        this.ctx.stroke();

        // Bottom Right
        this.ctx.beginPath();
        this.ctx.moveTo(bx + boxW - tick, by + boxH);
        this.ctx.lineTo(bx + boxW, by + boxH);
        this.ctx.lineTo(bx + boxW, by + boxH - tick);
        this.ctx.stroke();

        this.ctx.restore();
      }

      // 2. Skater Icon / Body Representation
      this.ctx.save();
      this.ctx.fillStyle = s.color;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y - 6, 12, 0, Math.PI * 2);
      this.ctx.fill();

      // Number on Jersey
      this.ctx.fillStyle = '#060b14';
      this.ctx.font = 'bold 9px "Inter", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(s.number, s.x, s.y - 6);

      // 3. Name, Position & Optical Flow Velocity Pill
      if (this.cvToggles.speedTelemetry) {
        const tagY = by - 16;
        this.ctx.fillStyle = 'rgba(6, 11, 20, 0.88)';
        this.ctx.strokeStyle = s.isKeyFocus ? '#00f0ff' : 'rgba(255,255,255,0.15)';
        this.ctx.lineWidth = 1;

        const tagText = `${s.name} (${s.position}) • ${s.currentSpeed} MPH`;
        this.ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const tagW = this.ctx.measureText(tagText).width + 12;

        this.ctx.beginPath();
        this.ctx.roundRect(s.x - tagW / 2, tagY, tagW, 14, 4);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = s.isKeyFocus ? '#00f0ff' : '#f1f5f9';
        this.ctx.fillText(tagText, s.x, tagY + 10);
      }

      this.ctx.restore();
    });
  }

  drawTelestrations() {
    this.telestrations.forEach((item) => {
      this.renderTelestrationItem(item);
    });
  }

  renderTelestrationItem(item) {
    this.ctx.save();

    if (item.type === 'spotlight') {
      const radius = Math.max(30, Math.sqrt(
        Math.pow(item.end.x - item.start.x, 2) + Math.pow(item.end.y - item.start.y, 2)
      ));

      // Broadcast Spotlight Halo
      const grad = this.ctx.createRadialGradient(item.start.x, item.start.y, 10, item.start.x, item.start.y, radius);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      grad.addColorStop(0.7, 'rgba(0, 240, 255, 0.12)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(item.start.x, item.start.y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = item.color || '#00f0ff';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(item.start.x, item.start.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();

    } else if (item.type === 'vector') {
      // Velocity Vector Arrow
      this.drawArrow(item.start.x, item.start.y, item.end.x, item.end.y, item.color || '#38bdf8', item.strokeWidth || 3);

    } else if (item.type === 'pass') {
      // Passing Seam Laser Ray
      this.ctx.setLineDash([8, 6]);
      this.ctx.strokeStyle = item.color || '#fbbf24';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = item.color || '#fbbf24';
      this.ctx.shadowBlur = 8;

      this.ctx.beginPath();
      this.ctx.moveTo(item.start.x, item.start.y);
      this.ctx.lineTo(item.end.x, item.end.y);
      this.ctx.stroke();

      // Passing Reticle Target
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      this.ctx.arc(item.end.x, item.end.y, 8, 0, Math.PI * 2);
      this.ctx.stroke();

    } else if (item.type === 'gap') {
      // Defensive Gap Measurement Ruler
      this.ctx.strokeStyle = item.color || '#f87171';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(item.start.x, item.start.y);
      this.ctx.lineTo(item.end.x, item.end.y);
      this.ctx.stroke();

      // Tick ends
      const angle = Math.atan2(item.end.y - item.start.y, item.end.x - item.start.x) + Math.PI / 2;
      const tLen = 8;
      this.ctx.beginPath();
      this.ctx.moveTo(item.start.x - Math.cos(angle) * tLen, item.start.y - Math.sin(angle) * tLen);
      this.ctx.lineTo(item.start.x + Math.cos(angle) * tLen, item.start.y + Math.sin(angle) * tLen);
      this.ctx.moveTo(item.end.x - Math.cos(angle) * tLen, item.end.y - Math.sin(angle) * tLen);
      this.ctx.lineTo(item.end.x + Math.cos(angle) * tLen, item.end.y + Math.sin(angle) * tLen);
      this.ctx.stroke();

    } else if (item.type === 'freehand') {
      if (item.points && item.points.length > 1) {
        this.ctx.strokeStyle = item.color || '#00f0ff';
        this.ctx.lineWidth = item.strokeWidth || 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          this.ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        this.ctx.stroke();
      }

    } else if (item.type === 'callout') {
      // Coaching Callout Box
      this.ctx.font = 'bold 11px "Inter", sans-serif';
      const textW = this.ctx.measureText(item.text).width + 16;
      const boxH = 24;

      this.ctx.fillStyle = 'rgba(9, 14, 23, 0.92)';
      this.ctx.strokeStyle = item.color || '#00f0ff';
      this.ctx.lineWidth = 1.5;

      this.ctx.beginPath();
      this.ctx.roundRect(item.x, item.y, textW, boxH, 6);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`📌 ${item.text}`, item.x + 8, item.y + 16);
    }

    this.ctx.restore();
  }

  drawArrow(fromX, fromY, toX, toY, color, width) {
    const headLen = 14;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = width;

    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawBroadcastHUD(puck) {
    const w = this.width;
    const clip = this.clips[this.currentClipIndex];

    this.ctx.save();

    // Top Broadcast Scorebug / Telemetry Bar
    this.ctx.fillStyle = 'rgba(6, 11, 20, 0.85)';
    this.ctx.fillRect(16, 14, 380, 36);
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(16, 14, 380, 36);

    // Cyan live pulse indicator
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.beginPath();
    this.ctx.arc(32, 32, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.font = 'bold 11px "Chakra Petch", sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('BLUELINE CV TRACKER', 44, 28);

    this.ctx.font = '9px "JetBrains Mono", monospace';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(`60 FPS • CV CONF: 98.4% • PUCK: ${puck.shotSpeed} MPH`, 44, 42);

    // Current Timecode Stamp (Right Top)
    const mins = Math.floor(this.currentTime / 60);
    const secs = (this.currentTime % 60).toFixed(1).padStart(4, '0');
    const durMins = Math.floor(this.duration / 60);
    const durSecs = (this.duration % 60).toFixed(1).padStart(4, '0');

    this.ctx.fillStyle = 'rgba(6, 11, 20, 0.85)';
    this.ctx.fillRect(w - 180, 14, 164, 36);
    this.ctx.strokeRect(w - 180, 14, 164, 36);

    this.ctx.font = 'bold 11px "JetBrains Mono", monospace';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`TC: ${mins}:${secs} / ${durMins}:${durSecs}`, w - 98, 36);

    this.ctx.restore();
  }

  /**
   * One-Click 60-Second AI Highlight Reel Compiler
   * Exports annotated film clip directly to The BlueLine Wire & player passport
   */
  exportHighlightReel(metadata = {}) {
    const clip = this.clips[this.currentClipIndex];
    const reel = {
      id: `reel-${Date.now()}`,
      title: metadata.title || clip.title,
      athlete: metadata.athlete || clip.playerFocus,
      level: clip.level,
      duration: `${this.duration.toFixed(0)}s Broadcast Cut`,
      annotationsCount: this.telestrations.length,
      scoutSeal: 'Verified by Shane McCoy (Head Recruiter)',
      createdAt: new Date().toISOString(),
      tags: ['#ScoutingFilm', '#TelestrationAI', '#DraftReel', '#BlueLineDataWorks']
    };

    // Auto-Publish to The BlueLine Wire
    const wireStateRaw = localStorage.getItem('blueline_social_state');
    if (wireStateRaw) {
      try {
        const wireState = JSON.parse(wireStateRaw);
        if (wireState.posts) {
          const reelPost = {
            id: `post-reel-${Date.now()}`,
            authorId: 'shane-mccoy-recruiter',
            authorName: 'Shane McCoy',
            handle: '@shanemccoy_scout',
            role: 'recruiter',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            verifiedBadge: 'verified-gold',
            timestamp: 'Just now',
            content: `🎬 **NEW AI TELESTRATION FILM BREAKDOWN**\n\nAnalyzed high-leverage film on **${reel.athlete}** (${reel.level}).\n\n📌 **Key Scouting Notes**: Dynamic speed differential in neutral zone (+22.4 MPH entry), suppressed defensive gap down to 4.2 FT, and clean seam vision.\n\n#ScoutingFilm #DraftReel #BlueLineCV`,
            likes: 31,
            reposts: 14,
            comments: 7,
            userLiked: false,
            userReposted: false,
            tags: reel.tags,
            playerBadge: {
              name: reel.athlete,
              team: reel.level,
              pos: 'C / Fwd',
              stats: `60s AI Reel • ${reel.annotationsCount} Tactical Annotations`,
              nilVal: 'CV Evaluated: Top Tier Entry'
            }
          };

          wireState.posts.unshift(reelPost);
          localStorage.setItem('blueline_social_state', JSON.stringify(wireState));
        }
      } catch (err) {
        console.warn('Error publishing highlight reel to The Wire:', err);
      }
    }

    return reel;
  }
}

// Global Export
if (typeof window !== 'undefined') {
  window.BlueLineAIFilmStudio = BlueLineAIFilmStudio;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlueLineAIFilmStudio;
}
