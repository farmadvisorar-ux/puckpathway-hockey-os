/**
 * BlueLine DataWorks — 3D Interactive Virtual Rink & Practice Simulator
 * Built with Three.js:
 * - NHL regulation 200x85 ft 3D ice surface with boards, glass, and goal nets
 * - 4 Camera Perspectives: Broadcast, Overhead Bird's Eye, Skater POV, Goalie Crease
 * - Dynamic Goalie Sightline & Angle Coverage Cone
 * - Animated 3D Skaters with jersey colors, sticks, and puck physics
 * - Tactical systems playback with timeline scrubbing and Wire export
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

    // Camera Modes: 'broadcast' | 'overhead' | 'pov' | 'goalie'
    this.cameraMode = 'broadcast';
    this.showGoalieCone = true;

    // Tactical Plays
    this.plays = [
      {
        id: 'play-1',
        title: '3-on-2 Rush & Royal Road One-Timer',
        level: 'NCAA D1 / USHL',
        description: 'Attacking Center (M. Hage) gains neutral-zone speed, pulls defense wide, and hits trailing winger for a weak-side one-timer across the Royal Road.',
        duration: 14.0,
        skaterFocusIndex: 0
      },
      {
        id: 'play-2',
        title: 'Power Play 1-3-1 Umbrella Rotation',
        level: 'USHL / College Showcase',
        description: 'High quarterback at point feeds half-wall flanker, drawing penalty kill box out to open the bumper slot seam.',
        duration: 16.0,
        skaterFocusIndex: 1
      },
      {
        id: 'play-3',
        title: 'D-Zone Breakout & Center Support Route',
        level: 'AAA Bantam / Midget',
        description: 'Strong-side defenseman executes rim recovery under pressure, hitting low supporting center on the hashmarks for clean controlled exit.',
        duration: 12.0,
        skaterFocusIndex: 0
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
    this.puckTrailPoints = [];

    this.initThree();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b14);
    this.scene.fog = new THREE.FogExp2(0x060b14, 0.0035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.setCameraView('broadcast');

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Build 3D Arena & Ice Geometry
    this.buildRinkGeometry();

    // 6. Build Skaters & Puck
    this.buildEntities();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onResize());

    // 8. Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient Light
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.7);
    this.scene.add(ambient);

    // Main Overhead Arena Floodlights
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
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

    // Cyan BlueLine Accent Rim Light
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.6);
    rimLight.position.set(-100, 40, -60);
    this.scene.add(rimLight);
  }

  buildRinkGeometry() {
    // Regulation Scale: 200 units long (X), 85 units wide (Z)
    const rinkLength = 200;
    const rinkWidth = 85;

    // A. Ice Floor with Reflective Material
    const iceGeo = new THREE.PlaneGeometry(rinkLength, rinkWidth, 64, 32);
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0x0f1c30,
      roughness: 0.15,
      metalness: 0.25
    });
    const iceMesh = new THREE.Mesh(iceGeo, iceMat);
    iceMesh.rotation.x = -Math.PI / 2;
    iceMesh.receiveShadow = true;
    this.scene.add(iceMesh);

    // B. Ice Markings via Procedural Canvas Texture
    const markingsCanvas = document.createElement('canvas');
    markingsCanvas.width = 2048;
    markingsCanvas.height = 1024;
    const mCtx = markingsCanvas.getContext('2d');

    // Ice Background
    mCtx.fillStyle = '#0f1c30';
    mCtx.fillRect(0, 0, 2048, 1024);

    // Center Red Line
    mCtx.strokeStyle = '#ef4444';
    mCtx.lineWidth = 12;
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

    // Blue Lines
    mCtx.strokeStyle = '#00f0ff';
    mCtx.lineWidth = 18;

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
      });
    });

    // Goal Crease
    mCtx.fillStyle = 'rgba(0, 240, 255, 0.3)';
    mCtx.beginPath();
    mCtx.arc(1024 + 860, 512, 80, -Math.PI / 2, Math.PI / 2);
    mCtx.fill();
    mCtx.stroke();

    const markingsTex = new THREE.CanvasTexture(markingsCanvas);
    const markingsMat = new THREE.MeshBasicMaterial({
      map: markingsTex,
      transparent: true,
      opacity: 0.85
    });
    const markingsMesh = new THREE.Mesh(iceGeo, markingsMat);
    markingsMesh.rotation.x = -Math.PI / 2;
    markingsMesh.position.y = 0.05;
    this.scene.add(markingsMesh);

    // C. Dasher Boards (White with yellow kickplate & blue cap)
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const boardHeight = 4.2;

    // Side Boards
    const sideGeo = new THREE.BoxGeometry(rinkLength, boardHeight, 1.5);
    const northBoard = new THREE.Mesh(sideGeo, boardMat);
    northBoard.position.set(0, boardHeight / 2, -rinkWidth / 2 - 0.75);
    northBoard.castShadow = true;
    this.scene.add(northBoard);

    const southBoard = new THREE.Mesh(sideGeo, boardMat);
    southBoard.position.set(0, boardHeight / 2, rinkWidth / 2 + 0.75);
    southBoard.castShadow = true;
    this.scene.add(southBoard);

    // End Boards
    const endGeo = new THREE.BoxGeometry(1.5, boardHeight, rinkWidth);
    const westBoard = new THREE.Mesh(endGeo, boardMat);
    westBoard.position.set(-rinkLength / 2 - 0.75, boardHeight / 2, 0);
    this.scene.add(westBoard);

    const eastBoard = new THREE.Mesh(endGeo, boardMat);
    eastBoard.position.set(rinkLength / 2 + 0.75, boardHeight / 2, 0);
    this.scene.add(eastBoard);

    // D. Protective Glass (Transparent Acrylic)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.22,
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

    // E. Goal Net (Right Side Target)
    this.buildGoalNet(rinkLength / 2 - 12, 0);
  }

  buildGoalNet(x, z) {
    const netGroup = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2 });

    // Posts & Crossbar
    const postGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(0, 2, -3);
    netGroup.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(0, 2, 3);
    netGroup.add(rightPost);

    const barGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 16);
    const crossbar = new THREE.Mesh(barGeo, postMat);
    crossbar.rotation.x = Math.PI / 2;
    crossbar.position.set(0, 4, 0);
    netGroup.add(crossbar);

    // White Netting Mesh Box
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

    netGroup.position.set(x, 0, z);
    this.scene.add(netGroup);
  }

  buildEntities() {
    // Skater Configuration
    const skatersData = [
      { name: 'M. Hage', num: '19', team: 'home', color: 0x0284c7, isFwd: true, initialX: -60, initialZ: 0 },
      { name: 'J. Devine', num: '9', team: 'home', color: 0x0284c7, isFwd: true, initialX: -40, initialZ: -20 },
      { name: 'A. Dubinsky', num: '4', team: 'away', color: 0xf59e0b, isFwd: false, initialX: 20, initialZ: -12 },
      { name: 'R. Chesley', num: '2', team: 'away', color: 0xf59e0b, isFwd: false, initialX: 25, initialZ: 14 },
      { name: 'H. Slukynsky', num: '30', team: 'away', color: 0xec4899, isGoalie: true, initialX: 86, initialZ: 0 }
    ];

    this.skaterMeshes = skatersData.map(data => {
      const group = new THREE.Group();

      // Torso / Jersey
      const torsoGeo = new THREE.CylinderGeometry(1.2, 1.4, 3.2, 16);
      const jerseyMat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.4 });
      const torso = new THREE.Mesh(torsoGeo, jerseyMat);
      torso.position.y = 3.2;
      torso.castShadow = true;
      group.add(torso);

      // Head & Helmet
      const helmetGeo = new THREE.SphereGeometry(1.0, 16, 16);
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
      const head = new THREE.Mesh(helmetGeo, helmetMat);
      head.position.y = 5.3;
      head.castShadow = true;
      group.add(head);

      // Hockey Stick
      const stickGeo = new THREE.CylinderGeometry(0.15, 0.15, 5.5, 8);
      const stickMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const stick = new THREE.Mesh(stickGeo, stickMat);
      stick.rotation.z = Math.PI / 4;
      stick.position.set(1.6, 2.0, 1.2);
      group.add(stick);

      // Glow Ring Under Skater
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

    // Goalie Sightline & Coverage Cone
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
    this.goalieConeMesh.position.set(86, 2.5, 0);
    this.scene.add(this.goalieConeMesh);
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
    }
  }

  toggleGoalieCone(show) {
    this.showGoalieCone = show;
    if (this.goalieConeMesh) {
      this.goalieConeMesh.visible = show;
    }
  }

  loadPlay(index) {
    if (this.plays[index]) {
      this.currentPlayIndex = index;
      this.currentTime = 0;
      this.duration = this.plays[index].duration;
    }
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.lastTime = performance.now();
    return this.isPlaying;
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
  }

  setSpeed(rate) {
    this.playbackRate = parseFloat(rate);
  }

  onResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate(now) {
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (this.isPlaying) {
      this.currentTime += dt * this.playbackRate;
      if (this.currentTime >= this.duration) {
        this.currentTime = 0; // Loop play
      }
    }

    this.updateSimulation(this.currentTime);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  updateSimulation(t) {
    const progress = t / this.duration;

    // 1. Skater 1 (Attacking Center - M. Hage) Rush Motion
    const hage = this.skaterMeshes[0];
    if (hage) {
      const startX = -70;
      const endX = 65;
      const curX = startX + (endX - startX) * progress;
      const curZ = Math.sin(t * 1.5) * 14;
      hage.group.position.set(curX, 0, curZ);

      // Stride sway animation
      hage.group.rotation.y = Math.sin(t * 4) * 0.15 - Math.PI / 2;
    }

    // 2. Skater 2 (Trailing Wing - J. Devine) Support Cut
    const devine = this.skaterMeshes[1];
    if (devine) {
      const curX = -50 + (60 - -50) * progress * 0.85;
      const curZ = -22 + (12 - -22) * progress;
      devine.group.position.set(curX, 0, curZ);
      devine.group.rotation.y = -Math.PI / 2;
    }

    // 3. Defensemen Gap Control (A. Dubinsky & R. Chesley)
    const dubinsky = this.skaterMeshes[2];
    if (dubinsky) {
      const curX = 35 + (70 - 35) * progress * 0.8;
      const curZ = -10 + Math.sin(t * 1.2) * 6;
      dubinsky.group.position.set(curX, 0, curZ);
      dubinsky.group.rotation.y = Math.PI / 2; // Facing the rush
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
    if (goalie) {
      const targetZ = hage ? hage.group.position.z * 0.28 : 0;
      goalie.group.position.set(85, 0, targetZ);
    }

    // 5. Puck Position & Shot Elevation
    if (this.puckMesh && hage) {
      if (t < 10.0) {
        // Stickhandling with Hage
        this.puckMesh.position.set(
          hage.group.position.x + 3.5,
          0.15,
          hage.group.position.z + Math.sin(t * 6) * 1.2
        );
      } else {
        // Released Shot Toward Right Net
        const shotProgress = (t - 10.0) / 3.0;
        const targetX = 87;
        const targetY = 2.4; // Top corner
        const targetZ = -2.0;

        const pX = THREE.MathUtils.lerp(this.puckMesh.position.x, targetX, Math.min(1.0, shotProgress * 1.8));
        const pY = THREE.MathUtils.lerp(0.15, targetY, Math.min(1.0, shotProgress * 1.5));
        const pZ = THREE.MathUtils.lerp(this.puckMesh.position.z, targetZ, Math.min(1.0, shotProgress * 1.8));
        this.puckMesh.position.set(pX, pY, pZ);
      }
    }

    // 6. First-Person Skater POV Camera Tracking
    if (this.cameraMode === 'pov' && hage) {
      const headWorld = new THREE.Vector3();
      hage.group.getWorldPosition(headWorld);
      headWorld.y += 5.2;

      this.camera.position.copy(headWorld);
      this.camera.lookAt(headWorld.x + 40, 2.5, headWorld.z);
    }

    // 7. Update Goalie Coverage Cone Angle toward Puck
    if (this.goalieConeMesh && this.puckMesh && this.showGoalieCone) {
      const puckPos = this.puckMesh.position;
      const goaliePos = new THREE.Vector3(86, 2.5, 0);

      this.goalieConeMesh.position.copy(goaliePos);
      this.goalieConeMesh.lookAt(puckPos.x, puckPos.y, puckPos.z);
      this.goalieConeMesh.rotateX(Math.PI / 2);

      // Color Shift: Red if high-danger slot (<25 ft), Green if low danger
      const distToNet = goaliePos.distanceTo(puckPos);
      if (distToNet < 38) {
        this.goalieConeMesh.material.color.setHex(0xef4444); // Red high-danger
        this.goalieConeMesh.material.opacity = 0.45;
      } else {
        this.goalieConeMesh.material.color.setHex(0x10b981); // Green safe angle
        this.goalieConeMesh.material.opacity = 0.25;
      }
    }
  }

  /**
   * Share 3D Play Simulation Card to The BlueLine Wire
   */
  exportToWire(metadata = {}) {
    const play = this.plays[this.currentPlayIndex];
    const wireStateRaw = localStorage.getItem('blueline_social_state');
    if (!wireStateRaw) return null;

    try {
      const wireState = JSON.parse(wireStateRaw);
      if (!wireState.posts) return null;

      const playPost = {
        id: `post-3d-${Date.now()}`,
        authorId: 'coach-callahan',
        authorName: 'Coach Callahan',
        handle: '@callahan_coach',
        role: 'coach',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        verifiedBadge: 'verified-purple',
        timestamp: 'Just now',
        content: `🧊 **NEW 3D VIRTUAL RINK PLAY SIMULATION**\n\nDesigned **${play.title}** (${play.level}) in 3D WebGL space.\n\n📌 **Key Tactical Coaching Insight**: ${play.description}\n\nReview camera angles: Broadcast, Skater POV & Goalie Coverage Cone.\n\n#Tactical3D #PracticeSimulator #HockeySystems #BlueLineDataWorks`,
        likes: 24,
        reposts: 9,
        comments: 4,
        userLiked: false,
        userReposted: false,
        tags: ['#Tactical3D', '#PracticeSimulator', '#HockeySystems'],
        playerBadge: {
          name: play.title,
          team: play.level,
          pos: '3D Simulation',
          stats: `${play.duration}s 60 FPS WebGL • Multi-Cam POV`,
          nilVal: 'Shane McCoy Certified Playbook'
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

// Global Export
if (typeof window !== 'undefined') {
  window.BlueLine3DRinkSimulator = BlueLine3DRinkSimulator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlueLine3DRinkSimulator;
}
