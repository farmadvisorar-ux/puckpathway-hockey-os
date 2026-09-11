/**
 * HockeyRinkCanvas: Enterprise-Grade Pro Hockey Drawing & ADM Whiteboard Engine
 * Supports Vector Line Notation (Skate, Pass, Shot, Crossover, Mohawks, Stop/Start),
 * Rich Hockey Token Palette (Forwards, Defense, Goalies, Pucks, Cones, Tires, Mini-Nets),
 * On-Ice Text Annotations, Multi-Zone Rink Modes (Full, Half, Cross-Ice ADM Stations),
 * Undo/Redo History Stack, and High-Resolution PNG Export.
 */

class HockeyRinkCanvas {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.mode = options.mode || 'full_ice'; // full_ice | half_ice | cross_ice
    this.tool = 'select'; // select | draw_skate | draw_backward | draw_pass | draw_shot | draw_wavy | add_token | add_text
    this.activeTokenPayload = { type: 'F1', color: '#0284c7', label: 'F1' };
    
    // Canvas dimensions
    this.width = 900;
    this.height = 480;
    
    // Canvas State
    this.elements = []; // Lines, tokens, cones, text annotations
    this.selectedElement = null;
    this.isDrawing = false;
    this.isDragging = false;
    this.currentLinePoints = [];
    this.dragOffset = { x: 0, y: 0 };
    
    // History Stack for Undo/Redo
    this.undoStack = [];
    this.redoStack = [];
    
    this.initAnimationEngine();
    this.initCanvas();
    this.setupEventListeners();
  }

  initCanvas() {
    this.resizeCanvas();
    this.saveState();
    this.render();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = Math.max(600, Math.floor(rect.width));
    const h = Math.floor(w * 0.52); // Pro 200:85 proportion with borders

    this.width = w;
    this.height = h;

    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.render();
  }

  saveState() {
    this.undoStack.push(JSON.stringify(this.elements));
    if (this.undoStack.length > 30) this.undoStack.shift();
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop());
      this.elements = JSON.parse(this.undoStack[this.undoStack.length - 1]);
      this.selectedElement = null;
      this.render();
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const state = this.redoStack.pop();
      this.undoStack.push(state);
      this.elements = JSON.parse(state);
      this.selectedElement = null;
      this.render();
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.render();
  }

  setTool(tool, payload = {}) {
    this.tool = tool;
    if (payload.token) this.activeTokenPayload = payload.token;
    this.selectedElement = null;
    this.render();
  }

  clearRink() {
    this.saveState();
    this.elements = [];
    this.selectedElement = null;
    this.render();
  }

  deleteSelected() {
    if (this.selectedElement) {
      this.saveState();
      this.elements = this.elements.filter(el => el !== this.selectedElement);
      this.selectedElement = null;
      this.render();
    }
  }

  exportPNG() {
    const link = document.createElement('a');
    link.download = `puckpathway_drill_${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  // --- RINK RENDERING ENGINE ---

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawRinkBase();
    this.drawElements();
    if (this.animState && this.animState.currentAnimation) {
      this.renderAnimationOverlay();
    }
  }

  drawRinkBase() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const r = 35; // Corner radius

    // Ice Surface gradient & border
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, r);
    ctx.fill();
    ctx.stroke();

    // Boards dasher color
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rink markings based on mode
    if (this.mode === 'full_ice') {
      this.drawFullIceMarkings();
    } else if (this.mode === 'half_ice') {
      this.drawHalfIceMarkings();
    } else if (this.mode === 'cross_ice') {
      this.drawCrossIceMarkings();
    }

    ctx.restore();
  }

  drawFullIceMarkings() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const midX = w / 2;
    const midY = h / 2;

    // Center Red Line (12in standard)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 10);
    ctx.lineTo(midX, h - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center Ice Faceoff Circle & Dot
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(midX, midY, h * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(midX, midY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Blue Lines (Neutral Zone / Zone Entry)
    const blueLineOffset = w * 0.18;
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    
    // Strongside & Weakside Blue Lines
    [midX - blueLineOffset, midX + blueLineOffset].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, h - 10);
      ctx.stroke();
    });

    // Goal Lines (Red 2in)
    const goalLineOffset = w * 0.08;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    [goalLineOffset + 10, w - goalLineOffset - 10].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, 18);
      ctx.lineTo(x, h - 18);
      ctx.stroke();
    });

    // Faceoff Circles (4 End-Zone Circles)
    const circleRadius = h * 0.18;
    const endCircleX1 = w * 0.22;
    const endCircleX2 = w * 0.78;
    const endCircleY1 = h * 0.30;
    const endCircleY2 = h * 0.70;

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    [
      { x: endCircleX1, y: endCircleY1 },
      { x: endCircleX1, y: endCircleY2 },
      { x: endCircleX2, y: endCircleY1 },
      { x: endCircleX2, y: endCircleY2 }
    ].forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, circleRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Goal Nets & Creases
    this.drawGoalNet(goalLineOffset + 10, midY, -1);
    this.drawGoalNet(w - goalLineOffset - 10, midY, 1);
  }

  drawHalfIceMarkings() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const midY = h / 2;

    // Blue Line at Top
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(10, h * 0.22);
    ctx.lineTo(w - 10, h * 0.22);
    ctx.stroke();

    // Goal Line at Bottom
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, h * 0.85);
    ctx.lineTo(w - 10, h * 0.85);
    ctx.stroke();

    // Faceoff Circles in Half Ice
    const r = h * 0.20;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    [
      { x: w * 0.25, y: h * 0.55 },
      { x: w * 0.75, y: h * 0.55 }
    ].forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Goal Net
    this.drawGoalNetVertical(w / 2, h * 0.85);
  }

  drawCrossIceMarkings() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Dividers splitting ice into 3 ADM Stations
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(w * 0.33, 10);
    ctx.lineTo(w * 0.33, h - 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.66, 10);
    ctx.lineTo(w * 0.66, h - 10);
    ctx.stroke();

    ctx.setLineDash([]);

    // Station Labels
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('STATION 1 (SAG)', w * 0.12, 30);
    ctx.fillText('STATION 2 (SKILL/EDGES)', w * 0.42, 30);
    ctx.fillText('STATION 3 (SHOOTING)', w * 0.76, 30);
  }

  drawGoalNet(x, y, dir) {
    const ctx = this.ctx;
    const creaseR = 24;

    // Crease
    ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, creaseR, -Math.PI / 2, Math.PI / 2, dir < 0);
    ctx.fill();
    ctx.stroke();

    // Net Frame
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - (dir > 0 ? 0 : 12), y - 14, 12, 28);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - (dir > 0 ? 0 : 12), y - 14, 12, 28);
  }

  drawGoalNetVertical(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI, true);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - 16, y, 32, 10);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 16, y, 32, 10);
  }

  // --- DRAWING ELEMENTS (TOKENS, LINES, ANNOTATIONS) ---

  drawElements() {
    this.elements.forEach(el => {
      if (el.type === 'token') {
        this.drawToken(el);
      } else if (el.type === 'line') {
        this.drawLine(el);
      } else if (el.type === 'text') {
        this.drawTextAnnotation(el);
      }
    });

    // Draw active drawing path
    if (this.isDrawing && this.currentLinePoints.length > 1) {
      this.drawLine({
        lineStyle: this.tool.replace('draw_', ''),
        points: this.currentLinePoints,
        color: this.getToolColor(this.tool)
      });
    }
  }

  drawToken(t) {
    const ctx = this.ctx;
    const isSel = this.selectedElement === t;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    if (t.tokenType === 'puck') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (t.tokenType === 'cone') {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - 9);
      ctx.lineTo(t.x - 7, t.y + 7);
      ctx.lineTo(t.x + 7, t.y + 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c2410c';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (t.tokenType === 'tire') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Player Token (F1, D1, G, etc.)
      const bg = t.color || '#0284c7';
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSel ? '#38bdf8' : '#ffffff';
      ctx.lineWidth = isSel ? 2.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.label || t.tokenType, t.x, t.y);
    }

    if (isSel) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  drawLine(l) {
    const pts = l.points;
    if (!pts || pts.length < 2) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.strokeStyle = l.color || '#0284c7';
    ctx.lineWidth = 2.5;

    if (l.lineStyle === 'pass') {
      ctx.setLineDash([6, 4]); // Dashed
    } else if (l.lineStyle === 'shot') {
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    if (l.lineStyle === 'wavy') {
      // Wavy crossover line
      for (let i = 1; i < pts.length; i++) {
        const p1 = pts[i - 1];
        const p2 = pts[i];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x + 5, p1.y - 5, midX, midY);
        ctx.quadraticCurveTo(p2.x - 5, p2.y + 5, p2.x, p2.y);
      }
    } else {
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Arrowhead at final segment
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    this.drawArrowhead(last.x, last.y, angle, l.color || ctx.strokeStyle);

    ctx.restore();
  }

  drawArrowhead(x, y, angle, color) {
    const ctx = this.ctx;
    const headLen = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  drawTextAnnotation(t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }

  getToolColor(tool) {
    if (tool.includes('pass')) return '#0284c7';
    if (tool.includes('shot')) return '#dc2626';
    if (tool.includes('wavy')) return '#10b981';
    return '#3b82f6';
  }

  // --- EVENT LISTENERS & INTERACTIVITY ---

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    // Mobile & Tablet Touch Support (Finger & Stylus)
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, shiftKey: false, button: 0 });
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY, shiftKey: false });
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleMouseUp(e);
    }, { passive: false });

    window.addEventListener('resize', () => this.resizeCanvas());

    // Keyboard Shortcuts (Delete, Ctrl+Z, Ctrl+Y)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          this.deleteSelected();
        }
      } else if (e.ctrlKey && e.key === 'z') {
        this.undo();
      } else if (e.ctrlKey && e.key === 'y') {
        this.redo();
      }
    });
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  handleMouseDown(e) {
    const pt = this.getCanvasCoords(e);

    if (this.tool === 'select') {
      const hit = this.hitTest(pt);
      if (hit) {
        this.selectedElement = hit;
        this.isDragging = true;
        this.dragOffset = { x: hit.x - pt.x, y: hit.y - pt.y };
      } else {
        this.selectedElement = null;
      }
      this.render();
    } else if (this.tool.startsWith('draw_')) {
      this.isDrawing = true;
      this.currentLinePoints = [pt];
    } else if (this.tool === 'add_token') {
      this.saveState();
      this.elements.push({
        type: 'token',
        tokenType: this.activeTokenPayload.type,
        label: this.activeTokenPayload.label,
        color: this.activeTokenPayload.color,
        x: pt.x,
        y: pt.y
      });
      this.render();
    } else if (this.tool === 'add_text') {
      const text = prompt('Enter Coaching Note to place on ice:', 'Scan Before Touch');
      if (text) {
        this.saveState();
        this.elements.push({
          type: 'text',
          text: text,
          x: pt.x,
          y: pt.y
        });
        this.render();
      }
    }
  }

  handleMouseMove(e) {
    const pt = this.getCanvasCoords(e);

    if (this.isDrawing) {
      this.currentLinePoints.push(pt);
      this.render();
    } else if (this.isDragging && this.selectedElement) {
      this.selectedElement.x = pt.x + this.dragOffset.x;
      this.selectedElement.y = pt.y + this.dragOffset.y;
      this.render();
    }
  }

  handleMouseUp(e) {
    if (this.isDrawing && this.currentLinePoints.length > 1) {
      this.saveState();
      const style = this.tool.replace('draw_', '');
      this.elements.push({
        type: 'line',
        lineStyle: style,
        points: this.currentLinePoints,
        color: this.getToolColor(this.tool)
      });
      this.isDrawing = false;
      this.currentLinePoints = [];
      this.render();
    }

    if (this.isDragging) {
      this.saveState();
      this.isDragging = false;
    }
  }

  hitTest(pt) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (el.type === 'token') {
        const dx = el.x - pt.x;
        const dy = el.y - pt.y;
        if (Math.sqrt(dx * dx + dy * dy) <= 15) return el;
      }
    }
    return null;
  }

  // --- 60 FPS VECTOR ANIMATION ENGINE & PASSING RAYCASTER ---

  initAnimationEngine() {
    this.animState = {
      isPlaying: false,
      currentTime: 0.0,
      duration: 8.0,
      speed: 1.0,
      lastTimestamp: null,
      rafId: null,
      showTrails: true,
      showPassingLanes: true,
      trailsHistory: {},
      currentAnimation: null,
      activeCue: null,
      lastClearanceStatus: { status: 'clear', text: 'Passing Lane: Clear (100% Tape-to-Tape)', color: 'green' },
      onTick: null
    };
  }

  loadAnimation(animDataOrId) {
    if (this.animState.rafId) {
      cancelAnimationFrame(this.animState.rafId);
      this.animState.rafId = null;
    }

    let animData = null;
    if (typeof animDataOrId === 'string') {
      animData = this.getAnimationPreset(animDataOrId);
    } else if (animDataOrId && typeof animDataOrId === 'object') {
      animData = animDataOrId;
    }

    if (!animData) {
      animData = this.getAnimationPreset('drill_001');
    }

    this.animState.currentAnimation = animData;
    this.animState.duration = animData.duration || 8.0;
    this.animState.currentTime = 0.0;
    this.animState.isPlaying = false;
    this.animState.trailsHistory = {};
    this.animState.activeCue = null;
    this.animState.lastClearanceStatus = { status: 'clear', text: 'Passing Lane: Clear (100% Tape-to-Tape)', color: 'green' };

    if (animData.mode && animData.mode !== this.mode) {
      this.setMode(animData.mode);
    } else {
      this.render();
    }

    if (this.animState.onTick) {
      this.animState.onTick(this.getAnimationTickData());
    }
  }

  playAnimation() {
    if (!this.animState.currentAnimation) {
      this.loadAnimation('drill_001');
    }

    if (this.animState.isPlaying) return;

    if (this.animState.currentTime >= this.animState.duration - 0.05) {
      this.animState.currentTime = 0.0;
      this.animState.trailsHistory = {};
    }

    this.animState.isPlaying = true;
    this.animState.lastTimestamp = performance.now();

    const loop = (timestamp) => {
      if (!this.animState.isPlaying) return;
      const dt = Math.min(0.1, (timestamp - this.animState.lastTimestamp) / 1000);
      this.animState.lastTimestamp = timestamp;

      this.animState.currentTime += dt * this.animState.speed;

      if (this.animState.currentTime >= this.animState.duration) {
        this.animState.currentTime = 0.0;
        this.animState.trailsHistory = {};
      }

      this.render();

      if (this.animState.onTick) {
        this.animState.onTick(this.getAnimationTickData());
      }

      this.animState.rafId = requestAnimationFrame(loop);
    };

    this.animState.rafId = requestAnimationFrame(loop);
    if (this.animState.onTick) {
      this.animState.onTick(this.getAnimationTickData());
    }
  }

  pauseAnimation() {
    this.animState.isPlaying = false;
    if (this.animState.rafId) {
      cancelAnimationFrame(this.animState.rafId);
      this.animState.rafId = null;
    }
    if (this.animState.onTick) {
      this.animState.onTick(this.getAnimationTickData());
    }
  }

  resetAnimation() {
    this.pauseAnimation();
    this.animState.currentTime = 0.0;
    this.animState.trailsHistory = {};
    this.render();
    if (this.animState.onTick) {
      this.animState.onTick(this.getAnimationTickData());
    }
  }

  seekAnimation(targetTime) {
    this.animState.currentTime = Math.max(0, Math.min(this.animState.duration, targetTime));
    this.render();
    if (this.animState.onTick) {
      this.animState.onTick(this.getAnimationTickData());
    }
  }

  setSpeed(speed) {
    this.animState.speed = parseFloat(speed) || 1.0;
    if (this.animState.onTick) {
      this.animState.onTick(this.getAnimationTickData());
    }
  }

  toggleTrails(enabled) {
    this.animState.showTrails = !!enabled;
    this.render();
  }

  togglePassingLanes(enabled) {
    this.animState.showPassingLanes = !!enabled;
    this.render();
  }

  getAnimationTickData() {
    return {
      currentTime: this.animState.currentTime,
      duration: this.animState.duration,
      isPlaying: this.animState.isPlaying,
      speed: this.animState.speed,
      showTrails: this.animState.showTrails,
      showPassingLanes: this.animState.showPassingLanes,
      activeCue: this.getActiveCue(),
      clearanceStatus: this.animState.lastClearanceStatus,
      animationTitle: this.animState.currentAnimation ? this.animState.currentAnimation.title : 'No Active Simulation'
    };
  }

  getActiveCue() {
    if (!this.animState.currentAnimation || !this.animState.currentAnimation.coachingCues) return null;
    const cues = this.animState.currentAnimation.coachingCues;
    let active = null;
    for (const cue of cues) {
      if (cue.t <= this.animState.currentTime) {
        if (!active || cue.t >= active.t) {
          active = cue;
        }
      }
    }
    return active || cues[0] || null;
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return { dist: Math.hypot(px - x1, py - y1), projX: x1, projY: y1, t: 0 };
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return { dist: Math.hypot(px - projX, py - projY), projX, projY, t };
  }

  interpolateTokenPosition(token, t) {
    const wps = token.waypoints;
    if (!wps || wps.length === 0) {
      return { ...token, x: 0, y: 0, angle: 0 };
    }
    if (t <= wps[0].t) {
      return { ...token, x: wps[0].x * this.width, y: wps[0].y * this.height, angle: 0 };
    }
    if (t >= wps[wps.length - 1].t) {
      const last = wps[wps.length - 1];
      return { ...token, x: last.x * this.width, y: last.y * this.height, angle: 0 };
    }

    let i = 0;
    while (i < wps.length - 1 && wps[i + 1].t < t) {
      i++;
    }

    const p0 = wps[i];
    const p1 = wps[i + 1];
    const segDur = p1.t - p0.t;
    const progress = segDur > 0 ? (t - p0.t) / segDur : 0;
    // Cubic Smoothstep Easing (natural acceleration and gliding deceleration)
    const eased = progress * progress * (3 - 2 * progress);

    const nx = p0.x + (p1.x - p0.x) * eased;
    const ny = p0.y + (p1.y - p0.y) * eased;
    const sx = nx * this.width;
    const sy = ny * this.height;

    const angle = Math.atan2((p1.y - p0.y) * this.height, (p1.x - p0.x) * this.width);

    return {
      ...token,
      x: sx,
      y: sy,
      angle: angle,
      speedMag: Math.hypot((p1.x - p0.x) * this.width, (p1.y - p0.y) * this.height) / (segDur || 1)
    };
  }

  renderAnimationOverlay() {
    const anim = this.animState.currentAnimation;
    if (!anim || !anim.tokens) return;

    const ctx = this.ctx;
    const currentTokens = anim.tokens.map(tok => this.interpolateTokenPosition(tok, this.animState.currentTime));

    // Update trails buffer
    const ct = this.animState.currentTime;
    currentTokens.forEach(tok => {
      if (!this.animState.trailsHistory[tok.id]) {
        this.animState.trailsHistory[tok.id] = [];
      }
      this.animState.trailsHistory[tok.id].push({ x: tok.x, y: tok.y, t: ct });
      // Keep trailing points within 0.7s
      this.animState.trailsHistory[tok.id] = this.animState.trailsHistory[tok.id].filter(pt => ct - pt.t <= 0.7 && ct - pt.t >= 0);
    });

    // 1. Draw Ghost Motion Trails
    if (this.animState.showTrails) {
      this.drawMotionTrails(currentTokens);
    }

    // 2. Draw Raycast Passing Lanes
    if (this.animState.showPassingLanes && anim.passingLanes) {
      this.drawPassingRaycastLanes(currentTokens, anim.passingLanes);
    }

    // 3. Highlight Focused Token with Pulsing Target Ring for Active Coaching Cue
    const activeCue = this.getActiveCue();
    let focusToken = null;
    if (activeCue && activeCue.focusTokenId) {
      focusToken = currentTokens.find(t => t.id === activeCue.focusTokenId);
    }

    // 4. Draw Animated Tokens
    currentTokens.forEach(tok => {
      const isFocus = focusToken && focusToken.id === tok.id;
      this.drawAnimatedToken(tok, isFocus);
    });

    // 5. Draw Watermark & HUD Tag on Ice
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.font = '900 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ 60 FPS SIMULATION ENGINE • ${anim.title || 'ADM VECTOR PLAYBOOK'}`, 24, 24);
    ctx.restore();
  }

  drawMotionTrails(currentTokens) {
    const ctx = this.ctx;
    const ct = this.animState.currentTime;

    currentTokens.forEach(tok => {
      const history = this.animState.trailsHistory[tok.id];
      if (!history || history.length < 2) return;

      const isPuck = tok.tokenType === 'puck';
      const baseColor = tok.color || (isPuck ? '#0f172a' : '#0284c7');

      for (let i = 0; i < history.length; i++) {
        const pt = history[i];
        const age = (ct - pt.t) / 0.7; // 0 (brand new) to 1 (expiring)
        const alpha = Math.max(0, (1 - age) * 0.45);
        const radius = isPuck ? Math.max(2, 6 * (1 - age * 0.5)) : Math.max(4, 12 * (1 - age * 0.6));

        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);

        if (baseColor.startsWith('#')) {
          // Hex to rgba
          const hex = baseColor.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = alpha;
        }

        ctx.fill();
        ctx.restore();
      }
    });
  }

  drawPassingRaycastLanes(currentTokens, passingLanes) {
    const ctx = this.ctx;
    const ct = this.animState.currentTime;
    const defenders = currentTokens.filter(t => t.team === 'away' || t.color === '#dc2626' || (t.tokenType && t.tokenType.startsWith('D')) || (t.tokenType && t.tokenType.startsWith('PK')));

    passingLanes.forEach(lane => {
      if (ct >= lane.startT && ct <= lane.endT) {
        const p1 = currentTokens.find(t => t.id === lane.passerId);
        const p2 = currentTokens.find(t => t.id === lane.receiverId);
        if (!p1 || !p2) return;

        // Perform Raycasting Interception check
        const interceptRadius = this.width * 0.045; // ~36px
        let minD = 999999;
        let closestDef = null;
        let hitProj = null;

        defenders.forEach(d => {
          if (d.id === p1.id || d.id === p2.id) return;
          const res = this.distToSegment(d.x, d.y, p1.x, p1.y, p2.x, p2.y);
          if (res.dist < minD) {
            minD = res.dist;
            closestDef = d;
            hitProj = res;
          }
        });

        const isBlocked = closestDef && minD < interceptRadius;

        ctx.save();
        if (isBlocked) {
          // Red Laser Warning with Interception Ring
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3.5;
          ctx.setLineDash([8, 6]);
          ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
          ctx.shadowBlur = 12;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Draw Interception Marker
          if (hitProj) {
            ctx.fillStyle = '#ef4444';
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(hitProj.projX, hitProj.projY, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✖', hitProj.projX, hitProj.projY);
          }

          this.animState.lastClearanceStatus = {
            status: 'blocked',
            text: `⚠️ Pass Contested by ${closestDef.label || 'Defender'} (Clearance: ${Math.round(minD)}px)`,
            color: 'red'
          };
        } else {
          // Vibrant Emerald Seam with animated glow
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.9)';
          ctx.shadowBlur = 14;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Midpoint tape-to-tape beacon
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(midX, midY, 5, 0, Math.PI * 2);
          ctx.fill();

          this.animState.lastClearanceStatus = {
            status: 'clear',
            text: '🟢 Tape-to-Tape Passing Seam 100% Clear (Zero Deflection Risk)',
            color: 'green'
          };
        }
        ctx.restore();
      }
    });
  }

  drawAnimatedToken(t, isFocus = false) {
    const ctx = this.ctx;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    if (t.tokenType === 'puck') {
      // High-Contrast Pro Puck with Glare
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 7.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Puck Top Highlight
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(t.x - 2, t.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Skater Token
      const bg = t.color || '#0284c7';

      // Coaching Cue Focus Ring (Expanding Pulse)
      if (isFocus) {
        const pulse = (Math.sin(performance.now() / 120) + 1) / 2;
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5 + pulse * 1.5;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 17 + pulse * 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(t.x, t.y, 24 + pulse * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Outer Ring
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isFocus ? '#38bdf8' : '#ffffff';
      ctx.lineWidth = isFocus ? 3 : 2;
      ctx.stroke();

      // Heading orientation stick pointer
      if (t.angle !== undefined && t.speedMag > 15) {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(18, 0);
        ctx.stroke();
        ctx.restore();
      }

      // Player Label / Number
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.label || t.tokenType || 'P', t.x, t.y);
    }

    ctx.restore();
  }

  // --- COMPREHENSIVE TACTICAL & DRILL ANIMATION PRESET LIBRARY ---

  getAnimationPreset(id) {
    if (id === 'drill_001' || id === '2v2_gretzky') {
      return {
        id: 'drill_001',
        title: '2v2 Gretzky Behind-the-Net SAG (Cross-Ice)',
        mode: 'cross_ice',
        duration: 7.5,
        tokens: [
          {
            id: 'G',
            tokenType: 'G',
            label: 'GRETZKY',
            color: '#10b981',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.05, y: 0.50 },
              { t: 1.5, x: 0.07, y: 0.44 },
              { t: 3.5, x: 0.06, y: 0.56 },
              { t: 5.5, x: 0.08, y: 0.50 },
              { t: 7.5, x: 0.05, y: 0.50 }
            ]
          },
          {
            id: 'F1',
            tokenType: 'F1',
            label: 'F1',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.22, y: 0.32 },
              { t: 1.8, x: 0.16, y: 0.40 },
              { t: 3.5, x: 0.18, y: 0.45 },
              { t: 4.8, x: 0.15, y: 0.43 },
              { t: 6.2, x: 0.10, y: 0.46 },
              { t: 7.5, x: 0.22, y: 0.32 }
            ]
          },
          {
            id: 'F2',
            tokenType: 'F2',
            label: 'F2',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.24, y: 0.68 },
              { t: 2.5, x: 0.26, y: 0.60 },
              { t: 4.5, x: 0.18, y: 0.64 },
              { t: 5.5, x: 0.12, y: 0.59 },
              { t: 6.8, x: 0.08, y: 0.52 },
              { t: 7.5, x: 0.24, y: 0.68 }
            ]
          },
          {
            id: 'D1',
            tokenType: 'D1',
            label: 'D1',
            color: '#dc2626',
            team: 'away',
            waypoints: [
              { t: 0.0, x: 0.14, y: 0.42 },
              { t: 1.8, x: 0.12, y: 0.44 },
              { t: 3.5, x: 0.15, y: 0.43 },
              { t: 5.0, x: 0.14, y: 0.46 },
              { t: 7.5, x: 0.14, y: 0.42 }
            ]
          },
          {
            id: 'D2',
            tokenType: 'D2',
            label: 'D2',
            color: '#dc2626',
            team: 'away',
            waypoints: [
              { t: 0.0, x: 0.17, y: 0.58 },
              { t: 2.5, x: 0.19, y: 0.56 },
              { t: 4.5, x: 0.16, y: 0.57 },
              { t: 5.8, x: 0.13, y: 0.56 },
              { t: 7.5, x: 0.17, y: 0.58 }
            ]
          },
          {
            id: 'puck',
            tokenType: 'puck',
            label: 'PUCK',
            waypoints: [
              { t: 0.0, x: 0.06, y: 0.50 },
              { t: 1.5, x: 0.07, y: 0.44 },
              { t: 2.0, x: 0.16, y: 0.40 }, // pass G -> F1
              { t: 3.5, x: 0.18, y: 0.45 },
              { t: 4.8, x: 0.15, y: 0.43 },
              { t: 5.5, x: 0.12, y: 0.59 }, // Royal Road seam pass F1 -> F2
              { t: 6.3, x: 0.08, y: 0.52 }, // One-timer shot into goal!
              { t: 7.5, x: 0.06, y: 0.50 }
            ]
          }
        ],
        passingLanes: [
          { id: 'p1', passerId: 'G', receiverId: 'F1', startT: 1.4, endT: 2.2, desc: 'Low-to-High Gretzky Feed' },
          { id: 'p2', passerId: 'F1', receiverId: 'F2', startT: 4.6, endT: 5.6, desc: 'Royal Road Cross-Slot Seam' }
        ],
        coachingCues: [
          { t: 0.0, title: 'Quarterback Scanning Below Goal Line', note: 'Gretzky operates below the goal line with head up. F1 and F2 execute high-low scissor cut.', focusTokenId: 'G' },
          { t: 1.6, title: 'Tape-to-Tape Low-to-High Feed', note: 'Gretzky threads pass between D1 and net straight to F1 entering shooting pocket.', focusTokenId: 'F1' },
          { t: 4.5, title: 'Royal Road Seam Disruption', note: 'F1 fakes snapshot to freeze D1, dishing cross-slot seam pass to F2 driving backdoor.', focusTokenId: 'F1' },
          { t: 5.8, title: 'One-Touch Catch & Release', note: 'F2 strikes one-timer into open netting before D2 stick can recover.', focusTokenId: 'F2' }
        ]
      };
    }

    if (id === 'drill_002' || id === 'russian_weave') {
      return {
        id: 'drill_002',
        title: 'Russian 5-Man Weave & Continuous Regroup (Full-Ice)',
        mode: 'full_ice',
        duration: 8.5,
        tokens: [
          {
            id: 'C',
            tokenType: 'C',
            label: 'C',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.15, y: 0.50 },
              { t: 2.5, x: 0.38, y: 0.72 },
              { t: 5.0, x: 0.62, y: 0.32 },
              { t: 7.0, x: 0.82, y: 0.50 },
              { t: 8.5, x: 0.15, y: 0.50 }
            ]
          },
          {
            id: 'LW',
            tokenType: 'LW',
            label: 'LW',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.12, y: 0.25 },
              { t: 2.5, x: 0.35, y: 0.48 },
              { t: 5.0, x: 0.60, y: 0.75 },
              { t: 7.0, x: 0.85, y: 0.28 },
              { t: 8.5, x: 0.12, y: 0.25 }
            ]
          },
          {
            id: 'RW',
            tokenType: 'RW',
            label: 'RW',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.12, y: 0.75 },
              { t: 2.5, x: 0.35, y: 0.25 },
              { t: 5.0, x: 0.58, y: 0.50 },
              { t: 7.0, x: 0.84, y: 0.74 },
              { t: 8.5, x: 0.12, y: 0.75 }
            ]
          },
          {
            id: 'D1',
            tokenType: 'D1',
            label: 'D1',
            color: '#dc2626',
            team: 'away',
            waypoints: [
              { t: 0.0, x: 0.65, y: 0.38 },
              { t: 3.5, x: 0.60, y: 0.40 },
              { t: 6.5, x: 0.78, y: 0.42 },
              { t: 8.5, x: 0.65, y: 0.38 }
            ]
          },
          {
            id: 'D2',
            tokenType: 'D2',
            label: 'D2',
            color: '#dc2626',
            team: 'away',
            waypoints: [
              { t: 0.0, x: 0.65, y: 0.62 },
              { t: 3.5, x: 0.62, y: 0.60 },
              { t: 6.5, x: 0.78, y: 0.58 },
              { t: 8.5, x: 0.65, y: 0.62 }
            ]
          },
          {
            id: 'puck',
            tokenType: 'puck',
            label: 'PUCK',
            waypoints: [
              { t: 0.0, x: 0.15, y: 0.50 },
              { t: 2.0, x: 0.35, y: 0.25 }, // pass C -> RW
              { t: 4.5, x: 0.60, y: 0.75 }, // pass RW -> LW
              { t: 6.8, x: 0.82, y: 0.50 }, // pass LW -> C in slot
              { t: 7.8, x: 0.92, y: 0.50 }, // shot on goal!
              { t: 8.5, x: 0.15, y: 0.50 }
            ]
          }
        ],
        passingLanes: [
          { id: 'p1', passerId: 'C', receiverId: 'RW', startT: 1.5, endT: 2.2 },
          { id: 'p2', passerId: 'RW', receiverId: 'LW', startT: 4.0, endT: 4.8 },
          { id: 'p3', passerId: 'LW', receiverId: 'C', startT: 6.2, endT: 7.0 }
        ],
        coachingCues: [
          { t: 0.0, title: 'Continuous 3-Lane Speed & Timing', note: 'All three forwards maintain speed without slowing. C begins crossover weave across ice.', focusTokenId: 'C' },
          { t: 1.8, title: 'Drop & Criss-Cross Lateral Feed', note: 'Center drops puck into RW lane while looping into weakside space.', focusTokenId: 'RW' },
          { t: 4.2, title: 'Diagonal Stretch Pass', note: 'RW threads diagonal saucer pass through neutral zone right to LW blade in full stride.', focusTokenId: 'LW' },
          { t: 6.5, title: 'High-Speed Zone Entry & Shot', note: 'LW drives defense back and centers puck to C arriving at royal road.', focusTokenId: 'C' }
        ]
      };
    }

    if (id === 'sys_122' || id === '1-2-2_trap') {
      return {
        id: 'sys_122',
        title: '1-2-2 Neutral Zone Trap & Transition Strike',
        mode: 'full_ice',
        duration: 8.0,
        tokens: [
          {
            id: 'F1',
            tokenType: 'F1',
            label: 'F1',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.32, y: 0.50 },
              { t: 2.2, x: 0.38, y: 0.68 }, // Steers carrier wide
              { t: 5.0, x: 0.45, y: 0.60 },
              { t: 8.0, x: 0.32, y: 0.50 }
            ]
          },
          {
            id: 'F2',
            tokenType: 'F2',
            label: 'F2',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.46, y: 0.72 },
              { t: 2.8, x: 0.50, y: 0.80 }, // Seals wall at red line
              { t: 5.5, x: 0.68, y: 0.75 },
              { t: 8.0, x: 0.46, y: 0.72 }
            ]
          },
          {
            id: 'F3',
            tokenType: 'F3',
            label: 'F3',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.45, y: 0.30 },
              { t: 3.0, x: 0.52, y: 0.45 }, // Locks down middle ice
              { t: 5.5, x: 0.76, y: 0.48 }, // Counter-attack break!
              { t: 8.0, x: 0.45, y: 0.30 }
            ]
          },
          {
            id: 'D1',
            tokenType: 'D1',
            label: 'D1',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.58, y: 0.68 },
              { t: 2.8, x: 0.55, y: 0.78 }, // Pinches red line to intercept
              { t: 5.0, x: 0.60, y: 0.65 }, // Distributes turnover
              { t: 8.0, x: 0.58, y: 0.68 }
            ]
          },
          {
            id: 'D2',
            tokenType: 'D2',
            label: 'D2',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.65, y: 0.35 },
              { t: 3.5, x: 0.64, y: 0.38 }, // Staggers back for safety
              { t: 8.0, x: 0.65, y: 0.35 }
            ]
          },
          {
            id: 'OppC',
            tokenType: 'OppC',
            label: 'RED-C',
            color: '#dc2626',
            team: 'away',
            waypoints: [
              { t: 0.0, x: 0.20, y: 0.50 },
              { t: 2.2, x: 0.32, y: 0.70 }, // Forced to boards
              { t: 3.5, x: 0.42, y: 0.76 }, // Suffocated & turns over
              { t: 8.0, x: 0.20, y: 0.50 }
            ]
          },
          {
            id: 'OppW',
            tokenType: 'OppW',
            label: 'RED-W',
            color: '#dc2626',
            team: 'away',
            waypoints: [
              { t: 0.0, x: 0.25, y: 0.85 },
              { t: 3.0, x: 0.48, y: 0.88 },
              { t: 8.0, x: 0.25, y: 0.85 }
            ]
          },
          {
            id: 'puck',
            tokenType: 'puck',
            label: 'PUCK',
            waypoints: [
              { t: 0.0, x: 0.20, y: 0.50 },
              { t: 2.2, x: 0.32, y: 0.70 },
              { t: 3.0, x: 0.46, y: 0.80 }, // OppC tries pass to OppW; D1 intercepts!
              { t: 4.8, x: 0.60, y: 0.65 }, // D1 has puck
              { t: 5.5, x: 0.76, y: 0.48 }, // Crisp counter pass D1 -> F3 breaking!
              { t: 7.2, x: 0.88, y: 0.50 }, // Shot on net
              { t: 8.0, x: 0.20, y: 0.50 }
            ]
          }
        ],
        passingLanes: [
          { id: 'p1', passerId: 'OppC', receiverId: 'OppW', startT: 2.6, endT: 3.4 }, // Blocked!
          { id: 'p2', passerId: 'D1', receiverId: 'F3', startT: 4.9, endT: 5.8 } // Clear!
        ],
        coachingCues: [
          { t: 0.0, title: 'F1 Angling & Steering', note: 'F1 leads with stick blade on ice, forcing puck carrier into the boards.', focusTokenId: 'F1' },
          { t: 2.5, title: 'Neutral Zone Pincer Clamp', note: 'F2 seals wall while D1 pinches aggressively to suffocate pass.', focusTokenId: 'D1' },
          { t: 4.8, title: 'Turnover & Rapid Seam Transition', note: 'D1 retrieves loose puck and immediately lasers tape-to-tape pass to F3.', focusTokenId: 'F3' }
        ]
      };
    }

    if (id === 'sys_131' || id === '1-3-1_pp') {
      return {
        id: 'sys_131',
        title: '1-3-1 Power Play Seam Overload & Royal Road One-Timer',
        mode: 'half_ice',
        duration: 8.0,
        tokens: [
          {
            id: 'QB',
            tokenType: 'QB',
            label: 'QB',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.20, y: 0.50 },
              { t: 2.0, x: 0.22, y: 0.35 },
              { t: 5.0, x: 0.20, y: 0.50 },
              { t: 8.0, x: 0.20, y: 0.50 }
            ]
          },
          {
            id: 'FLW',
            tokenType: 'FLW',
            label: 'FLW',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.38, y: 0.20 },
              { t: 2.5, x: 0.42, y: 0.22 },
              { t: 5.0, x: 0.40, y: 0.24 },
              { t: 8.0, x: 0.38, y: 0.20 }
            ]
          },
          {
            id: 'BMP',
            tokenType: 'BMP',
            label: 'BMP',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.38, y: 0.50 },
              { t: 3.0, x: 0.42, y: 0.48 },
              { t: 5.0, x: 0.39, y: 0.52 },
              { t: 8.0, x: 0.38, y: 0.50 }
            ]
          },
          {
            id: 'FRW',
            tokenType: 'FRW',
            label: 'FRW',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.38, y: 0.80 },
              { t: 3.5, x: 0.40, y: 0.78 },
              { t: 5.2, x: 0.42, y: 0.74 },
              { t: 8.0, x: 0.38, y: 0.80 }
            ]
          },
          {
            id: 'NET',
            tokenType: 'NET',
            label: 'NET',
            color: '#0284c7',
            team: 'home',
            waypoints: [
              { t: 0.0, x: 0.46, y: 0.50 },
              { t: 4.5, x: 0.48, y: 0.48 },
              { t: 8.0, x: 0.46, y: 0.50 }
            ]
          },
          {
            id: 'PK1',
            tokenType: 'PK1',
            label: 'PK1',
            color: '#dc2626',
            team: 'away',
            waypoints: [
              { t: 0.0, x: 0.28, y: 0.45 },
              { t: 2.0, x: 0.28, y: 0.36 },
              { t: 8.0, x: 0.28, y: 0.45 }
            ]
          },
          {
            id: 'PK2',
            tokenType: 'PK2',
            label: 'PK2',
            color: '#dc2626',
            team: 'away',
            waypoints: [
              { t: 0.0, x: 0.34, y: 0.65 },
              { t: 3.5, x: 0.36, y: 0.62 },
              { t: 8.0, x: 0.34, y: 0.65 }
            ]
          },
          {
            id: 'puck',
            tokenType: 'puck',
            label: 'PUCK',
            waypoints: [
              { t: 0.0, x: 0.20, y: 0.50 },
              { t: 1.8, x: 0.22, y: 0.35 },
              { t: 2.6, x: 0.42, y: 0.22 }, // Slide pass QB -> FLW
              { t: 4.8, x: 0.40, y: 0.24 }, // FLW fakes shot
              { t: 5.6, x: 0.42, y: 0.74 }, // Royal Road bullet FLW -> FRW!
              { t: 6.4, x: 0.49, y: 0.50 }, // One-timer into top corner!
              { t: 8.0, x: 0.20, y: 0.50 }
            ]
          }
        ],
        passingLanes: [
          { id: 'p1', passerId: 'QB', receiverId: 'FLW', startT: 1.8, endT: 2.7 },
          { id: 'p2', passerId: 'FLW', receiverId: 'FRW', startT: 4.6, endT: 5.8 }
        ],
        coachingCues: [
          { t: 0.0, title: 'Point QB Shifts Box', note: 'Defenseman walks blue line to pull high penalty killer out of shooting lane.', focusTokenId: 'QB' },
          { t: 2.4, title: 'Half-Wall Triple-Threat Hold', note: 'FLW loads stick to freeze goalie, drawing low PK defender.', focusTokenId: 'FLW' },
          { t: 4.6, title: 'Royal Road Cross-Slot Seam', note: 'FLW delivers cross-seam bullet pass through the heart of the diamond to FRW.', focusTokenId: 'FRW' },
          { t: 6.0, title: 'Catch-and-Release One-Timer', note: 'FRW hammers one-timer inside the post with NET providing visual screen.', focusTokenId: 'NET' }
        ]
      };
    }

    // Fallback: Synthesize high-quality dynamic choreography tailored to any system or drill
    return this.generateDynamicAnimation(id, id, 'Hockey Tactical System', this.mode);
  }

  generateDynamicAnimation(id, title, category, mode = 'full_ice') {
    const isHalf = mode === 'half_ice' || mode === 'cross_ice';
    const dur = 8.0;

    return {
      id: id,
      title: title || 'Tactical System 60 FPS Simulation',
      mode: mode,
      duration: dur,
      tokens: [
        {
          id: 'F1',
          tokenType: 'F1',
          label: 'F1',
          color: '#0284c7',
          team: 'home',
          waypoints: [
            { t: 0.0, x: isHalf ? 0.20 : 0.25, y: 0.35 },
            { t: 2.5, x: isHalf ? 0.35 : 0.50, y: 0.30 },
            { t: 5.5, x: isHalf ? 0.42 : 0.75, y: 0.45 },
            { t: dur, x: isHalf ? 0.20 : 0.25, y: 0.35 }
          ]
        },
        {
          id: 'F2',
          tokenType: 'F2',
          label: 'F2',
          color: '#0284c7',
          team: 'home',
          waypoints: [
            { t: 0.0, x: isHalf ? 0.20 : 0.20, y: 0.65 },
            { t: 2.8, x: isHalf ? 0.32 : 0.45, y: 0.70 },
            { t: 5.8, x: isHalf ? 0.44 : 0.78, y: 0.58 },
            { t: dur, x: isHalf ? 0.20 : 0.20, y: 0.65 }
          ]
        },
        {
          id: 'C',
          tokenType: 'C',
          label: 'C',
          color: '#0284c7',
          team: 'home',
          waypoints: [
            { t: 0.0, x: isHalf ? 0.15 : 0.18, y: 0.50 },
            { t: 3.0, x: isHalf ? 0.28 : 0.40, y: 0.50 },
            { t: 6.0, x: isHalf ? 0.38 : 0.68, y: 0.50 },
            { t: dur, x: isHalf ? 0.15 : 0.18, y: 0.50 }
          ]
        },
        {
          id: 'D1',
          tokenType: 'D1',
          label: 'D1',
          color: '#dc2626',
          team: 'away',
          waypoints: [
            { t: 0.0, x: isHalf ? 0.38 : 0.60, y: 0.40 },
            { t: 3.0, x: isHalf ? 0.36 : 0.58, y: 0.42 },
            { t: 6.0, x: isHalf ? 0.42 : 0.72, y: 0.46 },
            { t: dur, x: isHalf ? 0.38 : 0.60, y: 0.40 }
          ]
        },
        {
          id: 'D2',
          tokenType: 'D2',
          label: 'D2',
          color: '#dc2626',
          team: 'away',
          waypoints: [
            { t: 0.0, x: isHalf ? 0.38 : 0.60, y: 0.60 },
            { t: 3.0, x: isHalf ? 0.36 : 0.58, y: 0.58 },
            { t: 6.0, x: isHalf ? 0.42 : 0.72, y: 0.54 },
            { t: dur, x: isHalf ? 0.38 : 0.60, y: 0.60 }
          ]
        },
        {
          id: 'puck',
          tokenType: 'puck',
          label: 'PUCK',
          waypoints: [
            { t: 0.0, x: isHalf ? 0.15 : 0.18, y: 0.50 },
            { t: 2.2, x: isHalf ? 0.35 : 0.50, y: 0.30 }, // Pass to F1
            { t: 5.0, x: isHalf ? 0.44 : 0.78, y: 0.58 }, // Cross-ice seam pass to F2
            { t: 6.8, x: isHalf ? 0.49 : 0.90, y: 0.50 }, // Shot on net
            { t: dur, x: isHalf ? 0.15 : 0.18, y: 0.50 }
          ]
        }
      ],
      passingLanes: [
        { id: 'p1', passerId: 'C', receiverId: 'F1', startT: 1.2, endT: 2.4 },
        { id: 'p2', passerId: 'F1', receiverId: 'F2', startT: 4.2, endT: 5.2 }
      ],
      coachingCues: [
        { t: 0.0, title: 'Breakout Retrieval & Support', note: 'Center initiates puck movement with strong shoulder scanning. Wingers time lane entries.', focusTokenId: 'C' },
        { t: 2.0, title: 'Neutral Zone Tape-to-Tape Pass', note: 'Crisp distribution into speed lane, putting pressure on defending pairing.', focusTokenId: 'F1' },
        { t: 4.5, title: 'Royal Road Seam Read', note: 'Puck carrier reads open ice across royal road, completing cross-slot seam dish.', focusTokenId: 'F2' }
      ]
    };
  }

  // --- ADM DRILL TEMPLATE PRESETS (WHITEBOARD + ANIMATION DUAL SYNC) ---

  loadDrillTemplate(drillId) {
    this.saveState();
    this.elements = [];

    const w = this.width;
    const h = this.height;

    if (drillId === 'drill_001') {
      this.mode = 'cross_ice';
      this.elements = [
        { type: 'token', tokenType: 'F1', label: 'F1', color: '#0284c7', x: w * 0.15, y: h * 0.35 },
        { type: 'token', tokenType: 'F2', label: 'F2', color: '#0284c7', x: w * 0.20, y: h * 0.65 },
        { type: 'token', tokenType: 'D1', label: 'D1', color: '#dc2626', x: w * 0.12, y: h * 0.45 },
        { type: 'token', tokenType: 'D2', label: 'D2', color: '#dc2626', x: w * 0.18, y: h * 0.55 },
        { type: 'token', tokenType: 'G', label: 'GRETZKY', color: '#10b981', x: w * 0.05, y: h * 0.50 },
        { type: 'token', tokenType: 'puck', x: w * 0.07, y: h * 0.50 },
        { type: 'line', lineStyle: 'pass', color: '#0284c7', points: [{ x: w * 0.07, y: h * 0.50 }, { x: w * 0.15, y: h * 0.35 }] },
        { type: 'line', lineStyle: 'shot', color: '#dc2626', points: [{ x: w * 0.15, y: h * 0.35 }, { x: w * 0.08, y: h * 0.50 }] }
      ];
    } else if (drillId === 'drill_002') {
      this.mode = 'full_ice';
      this.elements = [
        { type: 'token', tokenType: 'C', label: 'C', color: '#0284c7', x: w * 0.15, y: h * 0.50 },
        { type: 'token', tokenType: 'LW', label: 'LW', color: '#0284c7', x: w * 0.12, y: h * 0.25 },
        { type: 'token', tokenType: 'RW', label: 'RW', color: '#0284c7', x: w * 0.12, y: h * 0.75 },
        { type: 'token', tokenType: 'D1', label: 'D1', color: '#dc2626', x: w * 0.60, y: h * 0.35 },
        { type: 'token', tokenType: 'D2', label: 'D2', color: '#dc2626', x: w * 0.55, y: h * 0.65 },
        { type: 'line', lineStyle: 'skate', color: '#0284c7', points: [{ x: w * 0.15, y: h * 0.50 }, { x: w * 0.35, y: h * 0.30 }, { x: w * 0.50, y: h * 0.50 }] },
        { type: 'line', lineStyle: 'pass', color: '#0284c7', points: [{ x: w * 0.12, y: h * 0.25 }, { x: w * 0.35, y: h * 0.30 }] }
      ];
    }

    // Automatically synchronize animation engine with drill preset!
    this.loadAnimation(drillId);
  }
}
