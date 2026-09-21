/**
 * BlueLine DataWorks — 3D Interactive Virtual Rink & Practice Simulator
 * Built with Three.js:
 * - NHL regulation 200x85 ft 3D ice surface with boards, glass, and goal nets
 * - 5 Camera Perspectives: Broadcast, Overhead Bird's Eye, Skater POV, Goalie Crease, and Free Orbit
 * - Dynamic Goalie Sightline & Net Exposure Percentage Engine (0-100%)
 * - 5-Quadrant Target Net Telemetry (High Glove, High Blocker, Low Glove, Low Blocker, Five-Hole)
 * - Interactive Shot Release Simulator with Trajectory Particle Trails & Outcome Resolution
 * - 5 Curated Tactical Playbook Systems with Timeline Scrubbing
 * - Dynamic Shooter & Goalie Persona Integration with master_players.js
 * - The Wire Social Export Integration
 */

class BlueLine3DRinkSimulator {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.width = this.container.clientWidth || 1200;
    this.height = this.container.clientHeight || 675;

    // Simulation State
    this.isPlaying = true;
    this.currentTime = 0.0;
    this.duration = 14.0;
    this.playbackRate = 1.0;
    this.lastTime = performance.now();

    // Camera Modes: 'broadcast' | 'overhead' | 'pov' | 'goalie' | 'orbit'
    this.cameraMode = 'broadcast';
    this.showGoalieCone = true;

    // Native Orbit State (Touch & Mouse Drag)
    this.orbit = {
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      theta: 0.25, // Azimuthal angle
      phi: 0.65,   // Polar angle
      radius: 125, // Distance from target
      target: new THREE.Vector3(25, 0, 0)
    };

    // Active Shot Projectile State
    this.activeShot = null;

    // Telemetry Cache
    this.currentTelemetry = {
      netExposurePct: 24,
      distanceFt: 28.4,
      angleDeg: 18.2,
      xG: 0.18,
      dangerLevel: 'medium', // 'low' | 'medium' | 'high'
      goalieDepthFt: 3.2,
      quadrants: {
        highGlove: 18,
        highBlocker: 25,
        lowGlove: 12,
        lowBlocker: 15,
        fiveHole: 8
      }
    };

    // Tactical Plays (5 Scenarios)
    this.plays = [
      {
        id: 'play-1',
        title: '3-on-2 Rush & Royal Road One-Timer',
        level: 'NCAA D1 / USHL',
        description: 'Attacking Center gains neutral-zone speed, pulls defense wide, and hits trailing winger for a weak-side one-timer across the Royal Road.',
        duration: 14.0,
        skaterFocusIndex: 0,
        shooterName: 'Macklin Celebrini',
        shooterNum: '71'
      },
      {
        id: 'play-2',
        title: 'Power Play 1-3-1 Umbrella Bumper Seam',
        level: 'USHL / College Showcase',
        description: 'High quarterback at point feeds half-wall flanker, drawing penalty kill box out to open the bumper slot seam for a quick-release snapshot.',
        duration: 16.0,
        skaterFocusIndex: 1,
        shooterName: 'Michael Hage',
        shooterNum: '19'
      },
      {
        id: 'play-3',
        title: '2-on-1 Breakaway with Goalie Butterfly Slide',
        level: 'NCAA Division I Men',
        description: 'Attacking winger executes fake shot and saucer slip pass across the slot, forcing the netminder into a desperate post-to-post butterfly slide.',
        duration: 12.0,
        skaterFocusIndex: 0,
        shooterName: 'Cole Eiserman',
        shooterNum: '34'
      },
      {
        id: 'play-4',
        title: 'D-Zone Breakout & Center Support Route',
        level: 'AAA Bantam / Midget',
        description: 'Strong-side defenseman executes rim recovery under heavy forecheck, hitting low supporting center on the hashmarks for clean controlled exit.',
        duration: 13.0,
        skaterFocusIndex: 0,
        shooterName: 'James Hagens',
        shooterNum: '10'
      },
      {
        id: 'play-5',
        title: 'Point Shot with Net-Front Screen & High Tip',
        level: 'Major Junior / CHL',
        description: 'Defenseman walks the blue line and fires a low wrist shot into traffic, where the net-front center changes the puck trajectory 6 feet out.',
        duration: 15.0,
        skaterFocusIndex: 2,
        shooterName: 'Zeev Buium',
        shooterNum: '28'
      }
    ];
    this.currentPlayIndex = 0;

    // Three.js Core Objects
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.skaterMeshes = [];
    this.puckMesh = null;
    this.goalieConeMesh = null;
    this.netCoverageMesh = null;
    this.quadrantTargets = [];
    this.shotTrailMesh = null;

    this.onTelemetryUpdate = null;
    this.onShotResult = null;

    this.initThree();
  }

  initThree() {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b14);
    this.scene.fog = new THREE.FogExp2(0x060b14, 0.0035);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.setCameraView('broadcast');

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Suite
    this.setupLighting();

    // 5. Build 3D Arena Geometry
    this.buildRinkGeometry();

    // 6. Build Entities & Dual Cones
    this.buildEntities();

    // 7. Setup Native Touch & Mouse Orbit Event Handlers
    this.setupOrbitHandlers();

    // 8. Handle Window Resizing
    window.addEventListener('resize', () => this.onResize());

    // 9. Start 60 FPS Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.75);
    this.scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.25);
    mainLight.position.set(0, 150, 40);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 10;
    mainLight.shadow.camera.far = 300;
    mainLight.shadow.camera.left = -120;
    mainLight.shadow.camera.right = 120;
    mainLight.shadow.camera.top = 60;
    mainLight.shadow.camera.bottom = -60;
    this.scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.7);
    rimLight.position.set(-100, 40, -60);
    this.scene.add(rimLight);

    const goalSpot = new THREE.SpotLight(0xfbbf24, 0.9, 120, Math.PI / 4, 0.3);
    goalSpot.position.set(88, 50, 0);
    goalSpot.target.position.set(88, 0, 0);
    this.scene.add(goalSpot);
    this.scene.add(goalSpot.target);
  }

  buildRinkGeometry() {
    const rinkLength = 200;
    const rinkWidth = 85;

    // Ice Floor
    const iceGeo = new THREE.PlaneGeometry(rinkLength, rinkWidth, 64, 32);
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0x0c192c,
      roughness: 0.12,
      metalness: 0.3
    });
    const iceMesh = new THREE.Mesh(iceGeo, iceMat);
    iceMesh.rotation.x = -Math.PI / 2;
    iceMesh.receiveShadow = true;
    this.scene.add(iceMesh);

    // Markings Canvas Texture
    const markingsCanvas = document.createElement('canvas');
    markingsCanvas.width = 2048;
    markingsCanvas.height = 1024;
    const mCtx = markingsCanvas.getContext('2d');

    mCtx.fillStyle = '#0c192c';
    mCtx.fillRect(0, 0, 2048, 1024);

    // Center Red Line
    mCtx.strokeStyle = '#ef4444';
    mCtx.lineWidth = 14;
    mCtx.beginPath();
    mCtx.moveTo(1024, 0);
    mCtx.lineTo(1024, 1024);
    mCtx.stroke();

    // Center Faceoff Circle
    mCtx.strokeStyle = '#0284c7';
    mCtx.lineWidth = 8;
    mCtx.beginPath();
    mCtx.arc(1024, 512, 180, 0, Math.PI * 2);
    mCtx.stroke();

    mCtx.fillStyle = '#0284c7';
    mCtx.beginPath();
    mCtx.arc(1024, 512, 16, 0, Math.PI * 2);
    mCtx.fill();

    // Blue Lines
    mCtx.strokeStyle = '#00f0ff';
    mCtx.lineWidth = 20;

    mCtx.beginPath();
    mCtx.moveTo(1024 - 300, 0);
    mCtx.lineTo(1024 - 300, 1024);
    mCtx.stroke();

    mCtx.beginPath();
    mCtx.moveTo(1024 + 300, 0);
    mCtx.lineTo(1024 + 300, 1024);
    mCtx.stroke();

    // End Zone Circles
    mCtx.strokeStyle = '#ef4444';
    mCtx.lineWidth = 6;
    [1024 - 650, 1024 + 650].forEach(cx => {
      [280, 744].forEach(cy => {
        mCtx.beginPath();
        mCtx.arc(cx, cy, 140, 0, Math.PI * 2);
        mCtx.stroke();

        mCtx.fillStyle = '#ef4444';
        mCtx.beginPath();
        mCtx.arc(cx, cy, 12, 0, Math.PI * 2);
        mCtx.fill();
      });
    });

    // Goal Crease
    mCtx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    mCtx.strokeStyle = '#ef4444';
    mCtx.lineWidth = 6;
    mCtx.beginPath();
    mCtx.arc(1024 + 860, 512, 85, -Math.PI / 2, Math.PI / 2);
    mCtx.fill();
    mCtx.stroke();

    // Royal Road Indicator Line
    mCtx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    mCtx.setLineDash([12, 12]);
    mCtx.lineWidth = 4;
    mCtx.beginPath();
    mCtx.moveTo(1024 + 300, 512);
    mCtx.lineTo(1024 + 860, 512);
    mCtx.stroke();
    mCtx.setLineDash([]);

    const markingsTex = new THREE.CanvasTexture(markingsCanvas);
    const markingsMat = new THREE.MeshBasicMaterial({
      map: markingsTex,
      transparent: true,
      opacity: 0.9
    });
    const markingsMesh = new THREE.Mesh(iceGeo, markingsMat);
    markingsMesh.rotation.x = -Math.PI / 2;
    markingsMesh.position.y = 0.05;
    this.scene.add(markingsMesh);

    // Dasher Boards
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 });
    const boardHeight = 4.2;

    const sideGeo = new THREE.BoxGeometry(rinkLength, boardHeight, 1.5);
    const northBoard = new THREE.Mesh(sideGeo, boardMat);
    northBoard.position.set(0, boardHeight / 2, -rinkWidth / 2 - 0.75);
    northBoard.castShadow = true;
    this.scene.add(northBoard);

    const southBoard = new THREE.Mesh(sideGeo, boardMat);
    southBoard.position.set(0, boardHeight / 2, rinkWidth / 2 + 0.75);
    southBoard.castShadow = true;
    this.scene.add(southBoard);

    const endGeo = new THREE.BoxGeometry(1.5, boardHeight, rinkWidth);
    const westBoard = new THREE.Mesh(endGeo, boardMat);
    westBoard.position.set(-rinkLength / 2 - 0.75, boardHeight / 2, 0);
    this.scene.add(westBoard);

    const eastBoard = new THREE.Mesh(endGeo, boardMat);
    eastBoard.position.set(rinkLength / 2 + 0.75, boardHeight / 2, 0);
    this.scene.add(eastBoard);

    // Acrylic Protective Glass
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5
    });
    const glassHeight = 6.0;
    const glassGeo = new THREE.BoxGeometry(rinkLength, glassHeight, 0.4);
    const northGlass = new THREE.Mesh(glassGeo, glassMat);
    northGlass.position.set(0, boardHeight + glassHeight / 2, -rinkWidth / 2);
    this.scene.add(northGlass);

    const southGlass = new THREE.Mesh(glassGeo, glassMat);
    southGlass.position.set(0, boardHeight + glassHeight / 2, rinkWidth / 2);
    this.scene.add(southGlass);

    // Goal Net
    this.buildGoalNet(88, 0);
  }

  buildGoalNet(x, z) {
    const netGroup = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25 });

    const postGeo = new THREE.CylinderGeometry(0.4, 0.4, 4, 16);
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(0, 2, -3);
    netGroup.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(0, 2, 3);
    netGroup.add(rightPost);

    const barGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 16);
    const crossbar = new THREE.Mesh(barGeo, postMat);
    crossbar.rotation.x = Math.PI / 2;
    crossbar.position.set(0, 4, 0);
    netGroup.add(crossbar);

    const netMeshMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const meshGeo = new THREE.BoxGeometry(4, 4, 6);
    const meshBox = new THREE.Mesh(meshGeo, netMeshMat);
    meshBox.position.set(2, 2, 0);
    netGroup.add(meshBox);

    // Glowing 5-Quadrant Target Overlays inside the Net Frame
    const quadrantDefs = [
      { id: 'highGlove', name: 'High Glove', pos: [0.1, 3.1, -1.6], size: [0.1, 1.6, 2.5], color: 0x00f0ff },
      { id: 'highBlocker', name: 'High Blocker', pos: [0.1, 3.1, 1.6], size: [0.1, 1.6, 2.5], color: 0x00f0ff },
      { id: 'lowGlove', name: 'Low Glove', pos: [0.1, 1.1, -1.8], size: [0.1, 1.8, 2.2], color: 0x10b981 },
      { id: 'lowBlocker', name: 'Low Blocker', pos: [0.1, 1.1, 1.8], size: [0.1, 1.8, 2.2], color: 0x10b981 },
      { id: 'fiveHole', name: 'Five-Hole', pos: [0.1, 0.9, 0], size: [0.1, 1.6, 1.4], color: 0xf59e0b }
    ];

    this.quadrantTargets = quadrantDefs.map(def => {
      const qGeo = new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]);
      const qMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.25,
        wireframe: false
      });
      const qMesh = new THREE.Mesh(qGeo, qMat);
      qMesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
      netGroup.add(qMesh);
      return { id: def.id, name: def.name, mesh: qMesh, baseColor: def.color };
    });

    netGroup.position.set(x, 0, z);
    this.scene.add(netGroup);
  }

  buildEntities() {
    const skatersData = [
      { name: 'Macklin Celebrini', num: '71', team: 'home', color: 0x0284c7, isFwd: true, initialX: -60, initialZ: 0 },
      { name: 'Michael Hage', num: '19', team: 'home', color: 0x0284c7, isFwd: true, initialX: -40, initialZ: -20 },
      { name: 'A. Dubinsky', num: '4', team: 'away', color: 0xf59e0b, isFwd: false, initialX: 20, initialZ: -12 },
      { name: 'R. Chesley', num: '2', team: 'away', color: 0xf59e0b, isFwd: false, initialX: 25, initialZ: 14 },
      { name: 'H. Slukynsky', num: '30', team: 'away', color: 0xec4899, isGoalie: true, initialX: 85, initialZ: 0 }
    ];

    this.skaterMeshes = skatersData.map(data => {
      const group = new THREE.Group();

      const torsoGeo = new THREE.CylinderGeometry(1.2, 1.4, 3.2, 16);
      const jerseyMat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.4 });
      const torso = new THREE.Mesh(torsoGeo, jerseyMat);
      torso.position.y = 3.2;
      torso.castShadow = true;
      group.add(torso);

      const helmetGeo = new THREE.SphereGeometry(1.0, 16, 16);
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
      const head = new THREE.Mesh(helmetGeo, helmetMat);
      head.position.y = 5.3;
      head.castShadow = true;
      group.add(head);

      const stickGeo = new THREE.CylinderGeometry(0.15, 0.15, 5.5, 8);
      const stickMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const stick = new THREE.Mesh(stickGeo, stickMat);
      stick.rotation.z = Math.PI / 4;
      stick.position.set(1.6, 2.0, 1.2);
      group.add(stick);

      const ringGeo = new THREE.RingGeometry(1.8, 2.3, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: data.team === 'home' ? 0x00f0ff : 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      group.add(ring);

      group.position.set(data.initialX, 0, data.initialZ);
      this.scene.add(group);

      return {
        group: group,
        data: data,
        headPos: head.position
      };
    });

    // Puck Entity
    const puckGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const puckMat = new THREE.MeshStandardMaterial({ color: 0x090e17, roughness: 0.3 });
    this.puckMesh = new THREE.Mesh(puckGeo, puckMat);
    this.puckMesh.position.set(-56, 0.15, 1.5);
    this.puckMesh.castShadow = true;
    this.scene.add(this.puckMesh);

    // Goalie Sightline Cone (FOV Tracking Puck)
    const coneGeo = new THREE.ConeGeometry(18, 55, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    this.goalieConeMesh = new THREE.Mesh(coneGeo, coneMat);
    this.goalieConeMesh.rotation.x = Math.PI / 2;
    this.goalieConeMesh.rotation.z = -Math.PI / 2;
    this.goalieConeMesh.position.set(85, 2.5, 0);
    this.scene.add(this.goalieConeMesh);

    // Net Coverage Shadow Wedge
    const wedgeGeo = new THREE.ConeGeometry(9, 45, 16, 1, true);
    const wedgeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    this.netCoverageMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
    this.netCoverageMesh.rotation.x = Math.PI / 2;
    this.netCoverageMesh.position.set(85, 2.0, 0);
    this.scene.add(this.netCoverageMesh);
  }

  setupOrbitHandlers() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      if (this.cameraMode !== 'orbit') return;
      this.orbit.isDragging = true;
      this.orbit.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.orbit.isDragging || this.cameraMode !== 'orbit') return;
      const dx = e.clientX - this.orbit.prevMouse.x;
      const dy = e.clientY - this.orbit.prevMouse.y;
      this.orbit.prevMouse = { x: e.clientX, y: e.clientY };

      this.orbit.theta -= dx * 0.007;
      this.orbit.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.orbit.phi + dy * 0.007));
      this.updateOrbitCamera();
    });

    window.addEventListener('mouseup', () => {
      this.orbit.isDragging = false;
    });

    el.addEventListener('wheel', (e) => {
      if (this.cameraMode !== 'orbit') return;
      e.preventDefault();
      this.orbit.radius = Math.max(30, Math.min(220, this.orbit.radius + e.deltaY * 0.1));
      this.updateOrbitCamera();
    }, { passive: false });

    // Touch Support
    let initialTouchDist = null;

    el.addEventListener('touchstart', (e) => {
      if (this.cameraMode !== 'orbit') return;
      if (e.touches.length === 1) {
        this.orbit.isDragging = true;
        this.orbit.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      if (this.cameraMode !== 'orbit') return;
      if (e.touches.length === 1 && this.orbit.isDragging) {
        const dx = e.touches[0].clientX - this.orbit.prevMouse.x;
        const dy = e.touches[0].clientY - this.orbit.prevMouse.y;
        this.orbit.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        this.orbit.theta -= dx * 0.009;
        this.orbit.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.orbit.phi + dy * 0.009));
        this.updateOrbitCamera();
      } else if (e.touches.length === 2 && initialTouchDist) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = initialTouchDist - currentDist;
        initialTouchDist = currentDist;
        this.orbit.radius = Math.max(30, Math.min(220, this.orbit.radius + diff * 0.2));
        this.updateOrbitCamera();
      }
    }, { passive: true });

    el.addEventListener('touchend', () => {
      this.orbit.isDragging = false;
      initialTouchDist = null;
    }, { passive: true });
  }

  updateOrbitCamera() {
    const x = this.orbit.target.x + this.orbit.radius * Math.sin(this.orbit.phi) * Math.cos(this.orbit.theta);
    const y = this.orbit.target.y + this.orbit.radius * Math.cos(this.orbit.phi);
    const z = this.orbit.target.z + this.orbit.radius * Math.sin(this.orbit.phi) * Math.sin(this.orbit.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.orbit.target);
  }

  setCameraView(mode) {
    this.cameraMode = mode;

    if (mode === 'broadcast') {
      this.camera.position.set(0, 75, 95);
      this.camera.lookAt(15, 0, 0);
    } else if (mode === 'overhead') {
      this.camera.position.set(0, 160, 0.001);
      this.camera.lookAt(0, 0, 0);
    } else if (mode === 'goalie') {
      this.camera.position.set(90, 4.5, 0);
      this.camera.lookAt(-20, 3, 0);
    } else if (mode === 'pov') {
      if (this.skaterMeshes && this.skaterMeshes[0]) {
        const headWorld = new THREE.Vector3();
        this.skaterMeshes[0].group.getWorldPosition(headWorld);
        headWorld.y += 5.2;
        this.camera.position.copy(headWorld);
        this.camera.lookAt(headWorld.x + 40, 2.5, headWorld.z);
      }
    } else if (mode === 'orbit') {
      this.updateOrbitCamera();
    }
  }

  resetOrbit() {
    this.orbit.theta = 0.25;
    this.orbit.phi = 0.65;
    this.orbit.radius = 125;
    this.orbit.target.set(25, 0, 0);
    this.updateOrbitCamera();
  }

  toggleGoalieCone(show) {
    this.showGoalieCone = show;
    if (this.goalieConeMesh) this.goalieConeMesh.visible = show;
    if (this.netCoverageMesh) this.netCoverageMesh.visible = show;
  }

  loadPlay(index) {
    if (this.plays[index]) {
      this.currentPlayIndex = index;
      this.currentTime = 0;
      this.duration = this.plays[index].duration;
      this.activeShot = null;
      if (this.shotTrailMesh) {
        this.scene.remove(this.shotTrailMesh);
        this.shotTrailMesh = null;
      }
    }
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.lastTime = performance.now();
    return this.isPlaying;
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
    this.activeShot = null;
  }

  setSpeed(rate) {
    this.playbackRate = parseFloat(rate);
  }

  setShooter(name, num) {
    if (this.skaterMeshes[0]) {
      this.skaterMeshes[0].data.name = name;
      this.skaterMeshes[0].data.num = num || '71';
    }
  }

  setGoalie(name, num) {
    if (this.skaterMeshes[4]) {
      this.skaterMeshes[4].data.name = name;
      this.skaterMeshes[4].data.num = num || '30';
    }
  }

  onResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  releaseShot(targetQuadrant = null) {
    if (!this.puckMesh) return null;

    const startPos = this.puckMesh.position.clone();
    const netX = 88;
    const dist = netX - startPos.x;

    if (dist <= 2) {
      return { success: false, reason: 'Puck is already past the goal line.' };
    }

    const targets = {
      highGlove: { x: netX, y: 3.2, z: -2.0, name: 'High Glove' },
      highBlocker: { x: netX, y: 3.2, z: 2.0, name: 'High Blocker' },
      lowGlove: { x: netX, y: 0.8, z: -2.2, name: 'Low Glove' },
      lowBlocker: { x: netX, y: 0.8, z: 2.2, name: 'Low Blocker' },
      fiveHole: { x: netX, y: 0.6, z: 0.0, name: 'Five-Hole' }
    };

    const targetKey = targetQuadrant || Object.keys(targets)[Math.floor(Math.random() * 5)];
    const chosen = targets[targetKey] || targets.highGlove;

    const velocityMph = Math.round(74 + Math.random() * 22);
    const flightTime = Math.max(0.2, Math.min(0.6, (dist / 140) * (90 / velocityMph)));

    const exposure = this.currentTelemetry.quadrants[targetKey] || this.currentTelemetry.netExposurePct;
    let outcome = 'goal';
    let outcomeTitle = '🚨 GOAL! Top Corner Sniped!';
    let outcomeDesc = velocityMph + ' MPH release beat the netminder clean into ' + chosen.name + '.';

    if (exposure < 20) {
      outcome = 'save_glove';
      outcomeTitle = '🧤 GLOVE SAVE! Flashed the Leather';
      outcomeDesc = 'Goaltender held square depth and snatched the ' + velocityMph + ' MPH one-timer.';
    } else if (exposure < 35) {
      outcome = 'save_blocker';
      outcomeTitle = '🛡️ BLOCKER SAVE! Deflected Away';
      outcomeDesc = 'Puck deflected into the corner boards off the blocker face.';
    } else if (exposure < 48) {
      outcome = 'save_pad';
      outcomeTitle = '🥅 PAD SAVE! Rebound Control';
      outcomeDesc = 'Kick save with right leg pad, clearing the high-danger slot.';
    } else if (Math.random() < 0.12) {
      outcome = 'post';
      outcomeTitle = '🔔 POST! Off the Iron!';
      outcomeDesc = 'Rung off the inner iron post and stayed out!';
    }

    this.activeShot = {
      startPos: startPos,
      targetPos: new THREE.Vector3(chosen.x, chosen.y, chosen.z),
      startTime: performance.now(),
      flightTimeSec: flightTime,
      velocityMph: velocityMph,
      targetName: chosen.name,
      outcome: outcome,
      outcomeTitle: outcomeTitle,
      outcomeDesc: outcomeDesc
    };

    this.createShotTrajectory(startPos, new THREE.Vector3(chosen.x, chosen.y, chosen.z), velocityMph);

    if (typeof this.onShotResult === 'function') {
      this.onShotResult(this.activeShot);
    }

    return this.activeShot;
  }

  createShotTrajectory(from, to, mph) {
    if (this.shotTrailMesh) {
      this.scene.remove(this.shotTrailMesh);
    }

    const points = [from, to];
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.25, 8, false);

    const color = mph >= 85 ? 0x00f0ff : (mph >= 75 ? 0x10b981 : 0xf59e0b);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.85
    });

    this.shotTrailMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.shotTrailMesh);
  }

  animate(now) {
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (this.isPlaying) {
      this.currentTime += dt * this.playbackRate;
      if (this.currentTime >= this.duration) {
        this.currentTime = 0;
        this.activeShot = null;
      }
    }

    this.updateSimulation(this.currentTime, now);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  updateSimulation(t, now) {
    const progress = t / this.duration;

    // 1. Skater 1 (Attacking Center / Shooter)
    const shooter = this.skaterMeshes[0];
    if (shooter) {
      let curX, curZ;
      if (this.currentPlayIndex === 0) {
        curX = -70 + (65 - -70) * progress;
        curZ = Math.sin(t * 1.5) * 14;
      } else if (this.currentPlayIndex === 1) {
        curX = 45 + Math.sin(t * 0.8) * 8;
        curZ = -22 + Math.cos(t * 0.8) * 6;
      } else if (this.currentPlayIndex === 2) {
        curX = -60 + (72 - -60) * progress;
        curZ = -14 + Math.sin(t * 2) * 12;
      } else if (this.currentPlayIndex === 3) {
        curX = -85 + (30 - -85) * progress;
        curZ = Math.sin(t * 1.2) * 18;
      } else {
        curX = 40 + Math.sin(t * 0.6) * 5;
        curZ = -10 + Math.cos(t * 0.6) * 16;
      }

      shooter.group.position.set(curX, 0, curZ);
      shooter.group.rotation.y = Math.sin(t * 4) * 0.15 - Math.PI / 2;
    }

    // 2. Skater 2 (Trailing Wing / Support)
    const wing = this.skaterMeshes[1];
    if (wing) {
      let curX = -50 + (62 - -50) * progress * 0.85;
      let curZ = -22 + (14 - -22) * progress;
      wing.group.position.set(curX, 0, curZ);
      wing.group.rotation.y = -Math.PI / 2;
    }

    // 3. Defensemen Gap Control
    const dubinsky = this.skaterMeshes[2];
    if (dubinsky) {
      const curX = 35 + (70 - 35) * progress * 0.8;
      const curZ = -10 + Math.sin(t * 1.2) * 6;
      dubinsky.group.position.set(curX, 0, curZ);
      dubinsky.group.rotation.y = Math.PI / 2;
    }

    const chesley = this.skaterMeshes[3];
    if (chesley) {
      const curX = 40 + (72 - 40) * progress * 0.8;
      const curZ = 12 + Math.cos(t * 1.2) * 6;
      chesley.group.position.set(curX, 0, curZ);
      chesley.group.rotation.y = Math.PI / 2;
    }

    // 4. Goalie Crease Stance & Tracking
    const goalie = this.skaterMeshes[4];
    if (goalie && shooter) {
      const puckZ = this.puckMesh ? this.puckMesh.position.z : 0;
      const targetZ = puckZ * 0.35;
      const targetX = 85.5 - Math.min(3.5, Math.abs(puckZ) * 0.08);
      goalie.group.position.set(targetX, 0, targetZ);
    }

    // 5. Puck Motion
    if (this.puckMesh && shooter) {
      if (this.activeShot) {
        const elapsed = (performance.now() - this.activeShot.startTime) / 1000;
        const progressShot = Math.min(1.0, elapsed / this.activeShot.flightTimeSec);

        const curPuck = THREE.MathUtils.lerp(this.activeShot.startPos.x, this.activeShot.targetPos.x, progressShot);
        const curY = THREE.MathUtils.lerp(this.activeShot.startPos.y, this.activeShot.targetPos.y, Math.sin(progressShot * Math.PI * 0.5));
        const curZ = THREE.MathUtils.lerp(this.activeShot.startPos.z, this.activeShot.targetPos.z, progressShot);

        this.puckMesh.position.set(curPuck, curY, curZ);
      } else if (t < 10.0) {
        this.puckMesh.position.set(
          shooter.group.position.x + 3.5,
          0.15,
          shooter.group.position.z + Math.sin(t * 6) * 1.2
        );
      } else {
        const shotProgress = (t - 10.0) / 3.0;
        const targetX = 88;
        const targetY = 2.4;
        const targetZ = -2.0;

        const pX = THREE.MathUtils.lerp(this.puckMesh.position.x, targetX, Math.min(1.0, shotProgress * 1.8));
        const pY = THREE.MathUtils.lerp(0.15, targetY, Math.min(1.0, shotProgress * 1.5));
        const pZ = THREE.MathUtils.lerp(this.puckMesh.position.z, targetZ, Math.min(1.0, shotProgress * 1.8));
        this.puckMesh.position.set(pX, pY, pZ);
      }
    }

    // 6. Skater POV Camera View Tracking
    if (this.cameraMode === 'pov' && shooter) {
      const headWorld = new THREE.Vector3();
      shooter.group.getWorldPosition(headWorld);
      headWorld.y += 5.2;

      this.camera.position.copy(headWorld);
      this.camera.lookAt(headWorld.x + 40, 2.5, headWorld.z);
    }

    // 7. Real-Time 3D Net Exposure & Telemetry
    this.computeNetExposureTelemetry();
  }

  computeNetExposureTelemetry() {
    if (!this.puckMesh || !this.goalieConeMesh) return;

    const puckPos = this.puckMesh.position;
    const goaliePos = new THREE.Vector3(85, 2.0, this.skaterMeshes[4] ? this.skaterMeshes[4].group.position.z : 0);
    const netCenter = new THREE.Vector3(88, 2.0, 0);

    const distToNet = Math.max(1, puckPos.distanceTo(netCenter));
    const distToGoalie = Math.max(1, puckPos.distanceTo(goaliePos));
    const angleRad = Math.atan2(Math.abs(puckPos.z), Math.max(0.1, 88 - puckPos.x));
    const angleDeg = (angleRad * 180 / Math.PI).toFixed(1);

    if (this.showGoalieCone) {
      this.goalieConeMesh.position.copy(goaliePos);
      this.goalieConeMesh.lookAt(puckPos.x, puckPos.y, puckPos.z);
      this.goalieConeMesh.rotateX(Math.PI / 2);

      if (this.netCoverageMesh) {
        this.netCoverageMesh.position.copy(goaliePos);
        this.netCoverageMesh.lookAt(netCenter.x, netCenter.y, netCenter.z);
        this.netCoverageMesh.rotateX(Math.PI / 2);
      }
    }

    const idealZ = puckPos.z * 0.38;
    const goalieOffset = Math.abs(goaliePos.z - idealZ);
    const depthFt = ((88 - goaliePos.x) * 0.8).toFixed(1);

    const netAngularWidth = Math.atan(3.0 / distToNet);
    const goalieAngularWidth = Math.atan(1.6 / distToGoalie);

    let exposureFraction = Math.max(0.08, Math.min(0.88, 1.0 - (goalieAngularWidth / netAngularWidth)));
    exposureFraction = Math.min(0.92, exposureFraction + (goalieOffset * 0.08));

    const netExposurePct = Math.round(exposureFraction * 100);

    const isHighDangerSlot = distToNet < 32 && Math.abs(puckPos.z) < 14;
    const isRoyalRoad = Math.abs(puckPos.z) > 12 && puckPos.x > 30;
    let xG = (exposureFraction * 0.45) + (isHighDangerSlot ? 0.28 : 0.04) + (isRoyalRoad ? 0.15 : 0);
    xG = Math.max(0.02, Math.min(0.89, parseFloat(xG.toFixed(2))));

    const hGlove = Math.min(95, Math.max(5, Math.round(netExposurePct * (puckPos.z < 0 ? 1.3 : 0.7))));
    const hBlocker = Math.min(95, Math.max(5, Math.round(netExposurePct * (puckPos.z > 0 ? 1.3 : 0.7))));
    const lGlove = Math.min(95, Math.max(5, Math.round(netExposurePct * 0.85)));
    const lBlocker = Math.min(95, Math.max(5, Math.round(netExposurePct * 0.85)));
    const fiveHole = Math.min(85, Math.max(4, Math.round(goalieOffset * 22 + (isHighDangerSlot ? 18 : 6))));

    if (this.goalieConeMesh) {
      if (distToNet < 30 || netExposurePct > 60) {
        this.goalieConeMesh.material.color.setHex(0xef4444);
        this.goalieConeMesh.material.opacity = 0.4;
      } else if (distToNet < 45 || netExposurePct > 35) {
        this.goalieConeMesh.material.color.setHex(0xf59e0b);
        this.goalieConeMesh.material.opacity = 0.28;
      } else {
        this.goalieConeMesh.material.color.setHex(0x10b981);
        this.goalieConeMesh.material.opacity = 0.2;
      }
    }

    if (this.quadrantTargets.length === 5) {
      const qVals = [hGlove, hBlocker, lGlove, lBlocker, fiveHole];
      this.quadrantTargets.forEach((q, idx) => {
        const val = qVals[idx];
        q.mesh.material.opacity = Math.max(0.1, val / 140);
        if (val >= 60) {
          q.mesh.material.color.setHex(0xef4444);
        } else if (val >= 35) {
          q.mesh.material.color.setHex(0xf59e0b);
        } else {
          q.mesh.material.color.setHex(q.baseColor);
        }
      });
    }

    this.currentTelemetry = {
      netExposurePct: netExposurePct,
      distanceFt: parseFloat((distToNet * 0.9).toFixed(1)),
      angleDeg: parseFloat(angleDeg),
      xG: xG,
      dangerLevel: distToNet < 30 ? 'high' : (distToNet < 45 ? 'medium' : 'low'),
      goalieDepthFt: parseFloat(depthFt),
      quadrants: {
        highGlove: hGlove,
        highBlocker: hBlocker,
        lowGlove: lGlove,
        lowBlocker: lBlocker,
        fiveHole: fiveHole
      }
    };

    if (typeof this.onTelemetryUpdate === 'function') {
      this.onTelemetryUpdate(this.currentTelemetry);
    }
  }

  exportToWire(metadata = {}) {
    const play = this.plays[this.currentPlayIndex];
    const wireStateRaw = localStorage.getItem('blueline_social_state');
    if (!wireStateRaw) return null;

    try {
      const wireState = JSON.parse(wireStateRaw);
      if (!wireState.posts) return null;

      const playPost = {
        id: 'post-3d-' + Date.now(),
        authorId: 'coach-callahan',
        authorName: 'Coach Callahan',
        handle: '@callahan_coach',
        role: 'coach',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        verifiedBadge: 'verified-purple',
        timestamp: 'Just now',
        content: '🧊 **NEW 3D VIRTUAL RINK PLAY SIMULATION**\n\nDesigned **' + play.title + '** (' + play.level + ') with WebGL Goalie Crease Coverage analysis.\n\n📌 **Tactical Insight**: ' + play.description + '\n\n📊 Net Exposure: ' + this.currentTelemetry.netExposurePct + '% • xG: ' + this.currentTelemetry.xG + ' • Shooter: ' + play.shooterName + ' (#' + play.shooterNum + ')\n\n#Tactical3D #PracticeSimulator #GoalieCrease #BlueLineDataWorks',
        likes: 31,
        reposts: 12,
        comments: 6,
        userLiked: false,
        userReposted: false,
        tags: ['#Tactical3D', '#PracticeSimulator', '#GoalieCrease'],
        playerBadge: {
          name: play.title,
          team: play.level,
          pos: '3D Simulation',
          stats: play.duration + 's 60 FPS WebGL • 5-Cam Orbit',
          nilVal: 'Director of Scouting Certified Playbook'
        }
      };

      wireState.posts.unshift(playPost);
      localStorage.setItem('blueline_social_state', JSON.stringify(wireState));
      return playPost;
    } catch (err) {
      console.warn('Error exporting 3D play to The Wire:', err);
      return null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.BlueLine3DRinkSimulator = BlueLine3DRinkSimulator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlueLine3DRinkSimulator;
}
