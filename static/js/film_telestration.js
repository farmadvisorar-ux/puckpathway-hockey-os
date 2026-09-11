/**
 * FilmTelestrationCanvas: Enterprise Pro Video Telestration & Tactical Film Studio
 * Provides 60 FPS simulated game-footage video playback, broadcast HUD overlay,
 * interactive drawing telestration tools (Spotlight Focus, Velocity Vectors,
 * Passing Seam Rays, Defensive Gap Rulers, Coaching Callout Notes),
 * multi-clip bookmarks, and real-time telemetry synchronization.
 */

class FilmTelestrationCanvas {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.activeTool = 'spotlight'; // select | spotlight | vector | pass | ruler | note | freehand
    this.activeColor = '#38bdf8'; // cyan, emerald, amber, red, white
    this.activeStrokeWidth = 3;

    // Canvas dimensions
    this.width = 960;
    this.height = 540; // 16:9 Broadcast Aspect Ratio

    // Playback State
    this.isPlaying = false;
    this.currentTime = 0.0;
    this.duration = 15.0;
    this.speed = 1.0;
    this.lastTimestamp = null;
    this.rafId = null;

    // Active Clip & Event
    this.currentClip = null;

    // Telestration Elements & History
    this.telestrations = [];
    this.undoStack = [];
    this.redoStack = [];

    // Active Drawing Interaction
    this.isDrawing = false;
    this.drawStartPoint = null;
    this.currentDrawingItem = null;
    this.freehandPoints = [];

    // Engine Event Callbacks
    this.onTick = options.onTick || null;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupListeners();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const w = Math.max(480, Math.floor(rect.width));
    const h = Math.floor(w * (9 / 16));

    this.width = w;
    this.height = h;

    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.render();
  }

  loadClip(clipData) {
    this.pause();
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement = null;
    }
    this.currentClip = clipData;
    this.currentTime = 0.0;
    this.duration = clipData.duration || 15.0;
    this.telestrations = clipData.presetTelestrations ? JSON.parse(JSON.stringify(clipData.presetTelestrations)) : [];
    this.undoStack = [];
    this.redoStack = [];

    this.render();
    if (this.onTick) {
      this.onTick(this.getTickPayload());
    }
  }

  loadVideoFile(file) {
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    const title = file.name.replace(/\.[^/.]+$/, "");
    this.loadVideoUrl(blobUrl, title);
  }

  loadVideoUrl(url, title = 'Uploaded Video Breakdown') {
    this.pause();
    if (!this.videoElement) {
      this.videoElement = document.createElement('video');
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      this.videoElement.crossOrigin = 'anonymous';

      this.videoElement.addEventListener('loadedmetadata', () => {
        this.duration = this.videoElement.duration || 15.0;
        this.currentTime = 0.0;
        this.render();
        if (this.onTick) this.onTick(this.getTickPayload());
      });

      this.videoElement.addEventListener('ended', () => {
        this.pause();
      });

      this.videoElement.addEventListener('timeupdate', () => {
        if (this.isPlaying && this.videoElement) {
          this.currentTime = this.videoElement.currentTime;
          this.render();
          if (this.onTick) this.onTick(this.getTickPayload());
        }
      });
    }

    this.videoElement.src = url;
    this.currentClip = {
      id: 'user_upload_' + Date.now(),
      title: title,
      league: 'User Upload',
      event: 'Custom Video Breakdown',
      duration: 15.0,
      isUserVideo: true,
      telemetry: {
        skating_speed_mph: 'Tracked',
        shoulder_scans: 'Active',
        puck_hold_sec: 'Live',
        seam_clearance_pct: 95,
        decision_grade: 'Coach Review'
      }
    };
    this.currentTime = 0.0;
    this.telestrations = [];
    this.undoStack = [];
    this.redoStack = [];
    this.videoElement.load();
    this.videoElement.currentTime = 0;
    this.render();
    if (this.onTick) this.onTick(this.getTickPayload());
  }

  play() {
    if (this.isPlaying) return;
    if (this.currentTime >= this.duration - 0.05) {
      this.currentTime = 0.0;
    }
    this.isPlaying = true;
    this.lastTimestamp = performance.now();

    if (this.videoElement) {
      this.videoElement.playbackRate = this.speed;
      this.videoElement.play().catch(e => console.warn('Video playback warning:', e));
    }

    const loop = (timestamp) => {
      if (!this.isPlaying) return;
      const dt = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;

      if (this.videoElement) {
        this.currentTime = this.videoElement.currentTime;
      } else {
        this.currentTime += dt * this.speed;
        if (this.currentTime >= this.duration) {
          this.currentTime = 0.0; // Loop seamlessly
        }
      }

      this.render();

      if (this.onTick) {
        this.onTick(this.getTickPayload());
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
    if (this.onTick) this.onTick(this.getTickPayload());
  }

  pause() {
    this.isPlaying = false;
    if (this.videoElement) {
      this.videoElement.pause();
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.onTick) this.onTick(this.getTickPayload());
  }

  seek(time) {
    this.currentTime = Math.max(0, Math.min(this.duration, time));
    if (this.videoElement) {
      this.videoElement.currentTime = this.currentTime;
    }
    this.render();
    if (this.onTick) this.onTick(this.getTickPayload());
  }

  step(deltaSeconds) {
    this.seek(this.currentTime + deltaSeconds);
  }

  setSpeed(spd) {
    this.speed = parseFloat(spd) || 1.0;
    if (this.videoElement) {
      this.videoElement.playbackRate = this.speed;
    }
    if (this.onTick) this.onTick(this.getTickPayload());
  }

  setTool(tool) {
    this.activeTool = tool;
  }

  setColor(color) {
    this.activeColor = color;
  }

  saveState() {
    this.undoStack.push(JSON.stringify(this.telestrations));
    if (this.undoStack.length > 30) this.undoStack.shift();
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 0) {
      this.redoStack.push(JSON.stringify(this.telestrations));
      this.telestrations = JSON.parse(this.undoStack.pop());
      this.render();
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(JSON.stringify(this.telestrations));
      this.telestrations = JSON.parse(this.redoStack.pop());
      this.render();
    }
  }

  clearTelestrations() {
    this.saveState();
    this.telestrations = [];
    this.render();
  }

  exportPNG() {
    const link = document.createElement('a');
    link.download = puckpathway_film_breakdown_.png;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  getTickPayload() {
    let telemetry = {
      puck_hold_sec: 1.8,
      shoulder_scans: 3,
      skating_speed_mph: 21.4,
      seam_clearance_pct: 94,
      decision_grade: 'A+'
    };

    if (this.currentClip && this.currentClip.telemetry) {
      telemetry = { ...this.currentClip.telemetry };
      if (this.currentClip.telemetry.puck_hold_sec) {
        telemetry.live_hold = (Math.min(telemetry.puck_hold_sec, this.currentTime % 3.2)).toFixed(1);
      }
    }

    return {
      currentTime: this.currentTime,
      duration: this.duration,
      isPlaying: this.isPlaying,
      speed: this.speed,
      activeTool: this.activeTool,
      activeColor: this.activeColor,
      currentClip: this.currentClip,
      telemetry: telemetry
    };
  }

  // --- RENDERING PIPELINE ---

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Real Video Frame or Simulated 4K Broadcast Hockey Arena
    if (this.videoElement && this.videoElement.readyState >= 2) {
      ctx.drawImage(this.videoElement, 0, 0, this.width, this.height);
    } else {
      this.drawBroadcastRinkSurface();
      if (this.currentClip && this.currentClip.actors) {
        this.drawSimulatedActors();
      }
    }

    // 2. Draw Telestration Overlays
    this.drawTelestrations();

    // 3. Draw Active Drawing In-Progress
    this.drawActiveDrawing();

    // 4. Draw Broadcast HUD Overlays (REC 4K, Scoreboard Watermark, Timecode)
    this.drawBroadcastHUD();
  }

  drawBroadcastRinkSurface() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Realistic arena ice gradient
    const iceGrad = ctx.createLinearGradient(0, 0, 0, h);
    iceGrad.addColorStop(0, '#0e1726');
    iceGrad.addColorStop(0.12, '#1e293b');
    iceGrad.addColorStop(0.5, '#334155');
    iceGrad.addColorStop(0.88, '#1e293b');
    iceGrad.addColorStop(1, '#0e1726');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, 0, w, h);

    // Perspective Arena Boards (top and bottom dasher)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h * 0.08);
    ctx.fillRect(0, h * 0.92, w, h * 0.08);

    // Dasher Trim (Yellow kickplate & Gold rail)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, h * 0.075, w, 2.5);
    ctx.fillRect(0, h * 0.92, w, 2.5);

    // Ice Surface Markings
    ctx.save();
    ctx.globalAlpha = 0.45;

    // Center Red Line (Neutral Zone)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.08);
    ctx.lineTo(w * 0.5, h * 0.92);
    ctx.stroke();

    // Blue Lines
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.32, h * 0.08);
    ctx.lineTo(w * 0.32, h * 0.92);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.68, h * 0.08);
    ctx.lineTo(w * 0.68, h * 0.92);
    ctx.stroke();

    // Center Faceoff Circle
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, h * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    // Goal Creases
    ctx.strokeStyle = '#dc2626';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.arc(w * 0.12, h * 0.5, h * 0.10, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w * 0.88, h * 0.5, h * 0.10, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawSimulatedActors() {
    const ctx = this.ctx;
    const ct = this.currentTime;
    const actors = this.currentClip.actors;

    actors.forEach(actor => {
      const pos = this.interpolateActorPosition(actor, ct);

      // Shadow on ice
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(pos.x + 3, pos.y + 6, pos.isPuck ? 6 : 14, pos.isPuck ? 3 : 7, 0, 0, Math.PI * 2);
      ctx.fill();

      if (pos.isPuck) {
        // High-contrast video puck
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Skater with Jersey Badge
        const color = actor.color || (actor.team === 'away' ? '#dc2626' : '#0284c7');

        ctx.shadowColor = color;
        ctx.shadowBlur = actor.isKeyFocus ? 16 : 6;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = actor.isKeyFocus ? '#38bdf8' : '#ffffff';
        ctx.lineWidth = actor.isKeyFocus ? 3 : 2;
        ctx.stroke();

        // Jersey Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(actor.label || actor.id, pos.x, pos.y);

        // Skater Name Tag Floating Above
        if (actor.name) {
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(actor.name, pos.x, pos.y - 18);
        }
      }
      ctx.restore();
    });
  }

  interpolateActorPosition(actor, t) {
    const wps = actor.waypoints;
    if (!wps || wps.length === 0) return { x: this.width * 0.5, y: this.height * 0.5, isPuck: actor.type === 'puck' };

    if (t <= wps[0].t) {
      return { x: wps[0].x * this.width, y: wps[0].y * this.height, isPuck: actor.type === 'puck' };
    }
    if (t >= wps[wps.length - 1].t) {
      const last = wps[wps.length - 1];
      return { x: last.x * this.width, y: last.y * this.height, isPuck: actor.type === 'puck' };
    }

    let i = 0;
    while (i < wps.length - 1 && wps[i + 1].t < t) {
      i++;
    }

    const p0 = wps[i];
    const p1 = wps[i + 1];
    const segDur = p1.t - p0.t;
    const progress = segDur > 0 ? (t - p0.t) / segDur : 0;
    const eased = progress * progress * (3 - 2 * progress);

    const nx = p0.x + (p1.x - p0.x) * eased;
    const ny = p0.y + (p1.y - p0.y) * eased;

    return {
      x: nx * this.width,
      y: ny * this.height,
      isPuck: actor.type === 'puck'
    };
  }

  // --- TELESTRATION TOOLS RENDERING ---

  drawTelestrations() {
    this.telestrations.forEach(item => {
      this.renderTelestrationItem(item);
    });
  }

  renderTelestrationItem(item) {
    const ctx = this.ctx;
    ctx.save();

    if (item.type === 'spotlight') {
      const rad = item.radius || 55;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.arc(item.x, item.y, rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = item.color || '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = item.color || '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(item.x, item.y, rad, 0, Math.PI * 2);
      ctx.stroke();

      if (item.label) {
        ctx.setLineDash([]);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(item.x - 45, item.y + rad + 4, 90, 18);
        ctx.strokeStyle = item.color || '#38bdf8';
        ctx.strokeRect(item.x - 45, item.y + rad + 4, 90, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, item.x, item.y + rad + 13);
      }
    } else if (item.type === 'vector') {
      this.drawArrow(item.x1, item.y1, item.x2, item.y2, item.color || '#38bdf8', 3.5);
      if (item.speedLabel) {
        const midX = (item.x1 + item.x2) / 2;
        const midY = (item.y1 + item.y2) / 2 - 10;
        this.drawPillBadge(midX, midY, item.speedLabel, item.color || '#38bdf8');
      }
    } else if (item.type === 'pass') {
      ctx.strokeStyle = item.color || '#10b981';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.shadowColor = item.color || '#10b981';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(item.x1, item.y1);
      ctx.lineTo(item.x2, item.y2);
      ctx.stroke();

      this.drawArrowhead(item.x2, item.y2, Math.atan2(item.y2 - item.y1, item.x2 - item.x1), item.color || '#10b981');
      if (item.label) {
        const midX = (item.x1 + item.x2) / 2;
        const midY = (item.y1 + item.y2) / 2;
        this.drawPillBadge(midX, midY, item.label, item.color || '#10b981');
      }
    } else if (item.type === 'ruler') {
      ctx.strokeStyle = item.color || '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = item.color || '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(item.x1, item.y1);
      ctx.lineTo(item.x2, item.y2);
      ctx.stroke();

      this.drawRulerTick(item.x1, item.y1, item.x2, item.y2, 10, item.color || '#f59e0b');
      this.drawRulerTick(item.x2, item.y2, item.x1, item.y1, 10, item.color || '#f59e0b');

      const distPx = Math.hypot(item.x2 - item.x1, item.y2 - item.y1);
      const feet = ((distPx / this.width) * 200).toFixed(1);
      const midX = (item.x1 + item.x2) / 2;
      const midY = (item.y1 + item.y2) / 2 - 12;
      this.drawPillBadge(midX, midY, `${feet} FT GAP`, item.color || '#f59e0b');
    } else if (item.type === 'note') {
      this.drawCalloutBox(item.x, item.y, item.text, item.color || '#38bdf8');
    } else if (item.type === 'freehand') {
      if (item.points && item.points.length > 1) {
        ctx.strokeStyle = item.color || '#38bdf8';
        ctx.lineWidth = item.width || 3;
        ctx.shadowColor = item.color || '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let p = 1; p < item.points.length; p++) {
          ctx.lineTo(item.points[p].x, item.points[p].y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawActiveDrawing() {
    if (!this.isDrawing) return;
    const ctx = this.ctx;

    ctx.save();
    if (this.activeTool === 'spotlight' && this.drawStartPoint) {
      const rad = Math.max(25, Math.hypot(this.currentMousePos.x - this.drawStartPoint.x, this.currentMousePos.y - this.drawStartPoint.y));
      ctx.strokeStyle = this.activeColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(this.drawStartPoint.x, this.drawStartPoint.y, rad, 0, Math.PI * 2);
      ctx.stroke();
    } else if ((this.activeTool === 'vector' || this.activeTool === 'pass' || this.activeTool === 'ruler') && this.drawStartPoint) {
      ctx.strokeStyle = this.activeColor;
      ctx.lineWidth = 3;
      if (this.activeTool === 'pass') ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(this.drawStartPoint.x, this.drawStartPoint.y);
      ctx.lineTo(this.currentMousePos.x, this.currentMousePos.y);
      ctx.stroke();
    } else if (this.activeTool === 'freehand' && this.freehandPoints.length > 1) {
      ctx.strokeStyle = this.activeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.freehandPoints[0].x, this.freehandPoints[0].y);
      for (let i = 1; i < this.freehandPoints.length; i++) {
        ctx.lineTo(this.freehandPoints[i].x, this.freehandPoints[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBroadcastHUD() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Top-Left Broadcast REC HUD
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(14, 14, 180, 26, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const pulse = (Math.sin(performance.now() / 150) + 1) / 2;
    ctx.fillStyle = 
gba(239, 68, 68, );
    ctx.beginPath();
    ctx.arc(28, 27, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('REC • 4K 60FPS TEL', 38, 27);

    // Top-Right Timecode Display
    const cM = Math.floor(this.currentTime / 60);
    const cS = (this.currentTime % 60).toFixed(2).padStart(5, '0');
    const dM = Math.floor(this.duration / 60);
    const dS = (this.duration % 60).toFixed(2).padStart(5, '0');
    const tcStr = `${String(cM).padStart(2, '0')}:${cS} / ${String(dM).padStart(2, '0')}:${dS}`;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(w - 180, 14, 166, 26, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tcStr, w - 97, 27);

    // Bottom-Left Active Tag Label
    if (this.currentClip) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(14, h - 38, 320, 24, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.stroke();

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🎬 ${this.currentClip.title || 'Clip Telestration'}`, 22, h - 25);
    }

    ctx.restore();
  }

  // --- HELPER DRAWING METHODS ---

  drawArrow(x1, y1, x2, y2, color, width) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - y1, x2 - x1);
    this.drawArrowhead(x2, y2, angle, color);
    ctx.restore();
  }

  drawArrowhead(x, y, angle, color) {
    const ctx = this.ctx;
    const len = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * Math.cos(angle - Math.PI / 6), y - len * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - len * Math.cos(angle + Math.PI / 6), y - len * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  drawRulerTick(x1, y1, x2, y2, len, color) {
    const ctx = this.ctx;
    const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1 - (len / 2) * Math.cos(angle), y1 - (len / 2) * Math.sin(angle));
    ctx.lineTo(x1 + (len / 2) * Math.cos(angle), y1 + (len / 2) * Math.sin(angle));
    ctx.stroke();
    ctx.restore();
  }

  drawPillBadge(x, y, text, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 9px monospace';
    const txtW = ctx.measureText(text).width;
    const pad = 8;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x - (txtW + pad * 2) / 2, y - 9, txtW + pad * 2, 18, 5);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawCalloutBox(x, y, text, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 10px sans-serif';
    const lines = String(text).split('\n');
    let maxW = 0;
    lines.forEach(l => {
      const lw = ctx.measureText(l).width;
      if (lw > maxW) maxW = lw;
    });

    const boxW = maxW + 20;
    const boxH = lines.length * 15 + 14;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, 8);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    lines.forEach((line, idx) => {
      ctx.fillText(line, x + 10, y + 8 + idx * 15);
    });

    ctx.restore();
  }

  // --- MOUSE & TOUCH EVENT LISTENERS ---

  setupListeners() {
    this.currentMousePos = { x: 0, y: 0 };

    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleMouseUp(e);
    });
  }

  getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.width / rect.width),
      y: (e.clientY - rect.top) * (this.height / rect.height)
    };
  }

  handleMouseDown(e) {
    const pt = this.getCoords(e);
    this.drawStartPoint = pt;
    this.currentMousePos = pt;
    this.isDrawing = true;

    if (this.activeTool === 'note') {
      const noteText = prompt('Enter Tactical Telestration Note:', 'Scanned shoulder 2x; puck hold 1.8s');
      if (noteText) {
        this.saveState();
        this.telestrations.push({
          type: 'note',
          x: pt.x,
          y: pt.y,
          text: noteText,
          color: this.activeColor
        });
        this.render();
      }
      this.isDrawing = false;
    } else if (this.activeTool === 'freehand') {
      this.freehandPoints = [pt];
    }
  }

  handleMouseMove(e) {
    this.currentMousePos = this.getCoords(e);
    if (!this.isDrawing) return;

    if (this.activeTool === 'freehand') {
      this.freehandPoints.push(this.currentMousePos);
    }
    this.render();
  }

  handleMouseUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    const pt = this.getCoords(e);

    const dist = Math.hypot(pt.x - this.drawStartPoint.x, pt.y - this.drawStartPoint.y);

    this.saveState();

    if (this.activeTool === 'spotlight') {
      const rad = dist > 15 ? dist : 55;
      this.telestrations.push({
        type: 'spotlight',
        x: this.drawStartPoint.x,
        y: this.drawStartPoint.y,
        radius: rad,
        color: this.activeColor,
        label: '#9 Focus'
      });
    } else if (this.activeTool === 'vector') {
      if (dist > 10) {
        this.telestrations.push({
          type: 'vector',
          x1: this.drawStartPoint.x,
          y1: this.drawStartPoint.y,
          x2: pt.x,
          y2: pt.y,
          color: this.activeColor,
          speedLabel: '21.4 MPH'
        });
      }
    } else if (this.activeTool === 'pass') {
      if (dist > 10) {
        this.telestrations.push({
          type: 'pass',
          x1: this.drawStartPoint.x,
          y1: this.drawStartPoint.y,
          x2: pt.x,
          y2: pt.y,
          color: this.activeColor,
          label: 'SEAM OPEN'
        });
      }
    } else if (this.activeTool === 'ruler') {
      if (dist > 10) {
        this.telestrations.push({
          type: 'ruler',
          x1: this.drawStartPoint.x,
          y1: this.drawStartPoint.y,
          x2: pt.x,
          y2: pt.y,
          color: this.activeColor
        });
      }
    } else if (this.activeTool === 'freehand') {
      if (this.freehandPoints.length > 1) {
        this.telestrations.push({
          type: 'freehand',
          points: this.freehandPoints,
          color: this.activeColor,
          width: 3
        });
      }
      this.freehandPoints = [];
    }

    this.drawStartPoint = null;
    this.render();
  }
}
