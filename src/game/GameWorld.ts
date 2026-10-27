// Main Three.js Scene, Render Pipeline, and Gameplay Loop for PLYHUB
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createPlayerCharacter,
  createCompanion,
  createEnergyCrystal,
  createAncientGateway,
  createFloatingIsland,
  createCheckpointRing,
  updatePlayerAppearance,
  PlayerMeshGroup,
  CompanionMeshGroup,
  IslandData,
  createGlowParticleTexture,
} from './proceduralAssets';
import { PhysicsEngine } from './physics';
import { PlayerController, InputState } from './PlayerController';
import { PlayerCustomization } from '../types/game';
import { soundManager } from '../audio/SoundSynth';

export interface GameWorldCallbacks {
  onCrystalCollected: (count: number, total: number) => void;
  onGatewayActivated: () => void;
  onCheckpointPassed: (index: number, total: number) => void;
  onTrialFinished: (elapsedSeconds: number) => void;
  onInteractionAvailable: (prompt: string | null) => void;
  onObjectiveMessage: (text: string) => void;
}

export class GameWorld {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public physics: PhysicsEngine;
  public player: PlayerController;
  public playerMesh: PlayerMeshGroup;
  public companion: CompanionMeshGroup;
  public isSoftwareGl: boolean;

  // World Elements
  private islands: IslandData[] = [];
  private crystals: THREE.Group[] = [];
  private checkpoints: THREE.Group[] = [];
  private gateway!: THREE.Group;
  private pulseWaveMesh: THREE.Mesh;
  private particles: THREE.Points;
  private particlePositions: Float32Array;

  // State
  public isTitleMode = true;
  private titleOrbitAngle = 0;
  private clock = new THREE.Clock();
  private frameId = 0;
  private isDestroyed = false;

  // Active Parkour Trial State
  public isTrialActive = false;
  public trialStartTime = 0;
  public currentCheckpointIndex = 0;

  // Energy Pulse Visuals
  private pulseMaterial: THREE.MeshBasicMaterial;

  constructor(
    private container: HTMLElement,
    private customization: PlayerCustomization,
    private callbacks: GameWorldCallbacks
  ) {
    // 1. Software WebGL Probe
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Setup Scene and Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

    // 3. Camera
    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.2, 500);
    this.camera.position.set(0, 12, 28);

    // 4. Renderer with PBR color space & ACES Filmic
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 5. Mandatory Studio PMREM Environment Reflection
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback if webgl context is restricted
    }

    // 6. Balanced 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    keyLight.position.set(28, 45, 20);
    keyLight.castShadow = !this.isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 120;
      keyLight.shadow.camera.left = -30;
      keyLight.shadow.camera.right = 30;
      keyLight.shadow.camera.top = 30;
      keyLight.shadow.camera.bottom = -30;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x75d5fd, 0x141b2b, 1.1);
    this.scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
    rimLight.position.set(-25, 20, -35);
    this.scene.add(rimLight);

    // 7. Physics Engine
    this.physics = new PhysicsEngine();

    // 8. Build Floating Islands Environment
    this.buildWorld();

    // 9. Build Player and Companion
    this.playerMesh = createPlayerCharacter(customization);
    this.scene.add(this.playerMesh);

    this.player = new PlayerController(this.playerMesh, this.physics);

    this.companion = createCompanion(customization);
    this.scene.add(this.companion);

    // 10. Energy Pulse Expansion Ring Mesh
    const pulseRingGeo = new THREE.RingGeometry(0.1, 0.4, 32);
    pulseRingGeo.rotateX(-Math.PI / 2);
    this.pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.pulseWaveMesh = new THREE.Mesh(pulseRingGeo, this.pulseMaterial);
    this.pulseWaveMesh.position.y = 0.2;
    this.scene.add(this.pulseWaveMesh);

    // 11. Ambient Floating Motes / Stardust Particles
    const particleCount = 250;
    const particleGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 120;
      this.particlePositions[i * 3 + 1] = Math.random() * 25 - 2;
      this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 0.6,
      map: createGlowParticleTexture(),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);

    // 12. Setup Resize Listener
    window.addEventListener('resize', this.onResize);

    // 13. Pre-warm shaders
    if (!this.isSoftwareGl) {
      try {
        this.renderer.compile(this.scene, this.camera);
      } catch {
        // Safe skip
      }
    }

    // 14. Start Game Loop
    this.startLoop();
  }

  private buildWorld() {
    // 1. Sanctuary Island (Main Hub)
    const sanctuary = createFloatingIsland(new THREE.Vector3(0, 0, 0), 22, 14, 'sanctuary');
    this.islands.push(sanctuary);
    this.scene.add(sanctuary.mesh);

    // 2. Crystal Spire Island
    const spire = createFloatingIsland(new THREE.Vector3(34, 5, 18), 15, 12, 'spire');
    this.islands.push(spire);
    this.scene.add(spire.mesh);

    // 3. Sky Observatory Island
    const observatory = createFloatingIsland(new THREE.Vector3(-32, 8, -22), 17, 13, 'observatory');
    this.islands.push(observatory);
    this.scene.add(observatory.mesh);

    // 4. Stepping Stones for Parkour Trail
    const steppingLocs = [
      new THREE.Vector3(14, 2, -10),
      new THREE.Vector3(22, 4.5, -18),
      new THREE.Vector3(30, 7.5, -28),
      new THREE.Vector3(18, 10.5, -38),
      new THREE.Vector3(4, 13.5, -42), // Chrono Summit Goal
    ];

    steppingLocs.forEach((loc, idx) => {
      const radius = idx === steppingLocs.length - 1 ? 5.0 : 3.4;
      const step = createFloatingIsland(loc, radius, 7, 'stepping');
      this.islands.push(step);
      this.scene.add(step.mesh);

      // Add Checkpoint Ring at each stepping milestone
      const ring = createCheckpointRing(new THREE.Vector3(loc.x, loc.y + 2.5, loc.z), idx);
      this.checkpoints.push(ring);
      this.scene.add(ring);
    });

    this.physics.setIslands(this.islands);

    // 5. Ancient Gateway at Sanctuary Island
    this.gateway = createAncientGateway(new THREE.Vector3(0, 1.2, -13));
    this.scene.add(this.gateway);

    // 6. Distribute 10 Collectible Celestial Crystals
    const crystalPositions = [
      new THREE.Vector3(0, 2.2, -4),     // Near Hub fountain
      new THREE.Vector3(-8, 2.2, 3),     // West grove
      new THREE.Vector3(9, 2.2, 5),      // East overlook
      new THREE.Vector3(-12, 2.2, -8),   // Hidden ruin nook
      new THREE.Vector3(34, 7.2, 18),    // Spire peak
      new THREE.Vector3(28, 6.8, 12),    // Spire approach
      new THREE.Vector3(-32, 10.2, -22), // Observatory center
      new THREE.Vector3(-25, 9.6, -16),  // Observatory bridge
      new THREE.Vector3(22, 6.2, -18),   // Parkour stone 2
      new THREE.Vector3(4, 15.2, -42),   // Sky Summit
    ];

    crystalPositions.forEach((pos, idx) => {
      const crystal = createEnergyCrystal(`crystal_${idx}`, pos);
      this.crystals.push(crystal);
      this.scene.add(crystal);
    });
  }

  public updateCustomization(custom: PlayerCustomization) {
    this.customization = custom;
    updatePlayerAppearance(this.playerMesh, custom);

    // Update companion
    const coreColor = new THREE.Color(custom.companionColor);
    (this.companion.userData.coreMesh.material as THREE.MeshStandardMaterial).color.copy(coreColor);
    (this.companion.userData.coreMesh.material as THREE.MeshStandardMaterial).emissive.copy(coreColor);
  }

  public startParkourTrial() {
    this.isTrialActive = true;
    this.trialStartTime = performance.now();
    this.currentCheckpointIndex = 0;
    this.checkpoints.forEach((ring) => {
      ring.userData.passed = false;
      ring.userData.ringMat.color.setHex(0xf5d77f);
      ring.userData.ringMat.emissive.setHex(0xf5d77f);
    });
    this.callbacks.onObjectiveMessage('Chrono Trail Started! Race through the celestial rings!');
    soundManager.playCheckpoint();
  }

  public resetParkourTrial() {
    this.isTrialActive = false;
    this.currentCheckpointIndex = 0;
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.isDestroyed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (this.isDestroyed) return;
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  public updateGameplay(dt: number, input: InputState) {
    if (this.isTitleMode) {
      // Cinematic live-world camera panoramic orbit
      this.titleOrbitAngle += dt * 0.25;
      const orbitRadius = 24.0;
      this.camera.position.x = Math.sin(this.titleOrbitAngle) * orbitRadius;
      this.camera.position.y = 8.5 + Math.sin(this.titleOrbitAngle * 0.5) * 2.0;
      this.camera.position.z = Math.cos(this.titleOrbitAngle) * orbitRadius;
      this.camera.lookAt(0, 3.2, 0);

      // Subtle breathing on player and companion
      this.player.update(dt, { ...input, forward: false, backward: false, left: false, right: false, jump: false, pulse: false, virtualStick: { x: 0, y: 0 } }, this.camera);
      this.updateCompanion(dt);
      return;
    }

    // 1. Update Player Controller
    this.player.update(dt, input, this.camera);

    // 2. Energy Pulse Expansion VFX
    if (this.player.isPulsing) {
      const radius = 0.5 + this.player.pulseProgress * 9.0;
      this.pulseWaveMesh.position.set(this.player.position.x, this.player.position.y + 0.1, this.player.position.z);
      this.pulseWaveMesh.scale.set(radius, radius, 1);
      this.pulseMaterial.opacity = (1.0 - this.player.pulseProgress) * 0.85;
      this.pulseWaveMesh.visible = true;

      // Pulse reveals/collects nearby crystals
      this.crystals.forEach((c) => {
        if (!c.userData.collected) {
          const d = this.player.position.distanceTo(c.position);
          if (d <= radius + 1.2) {
            this.collectCrystal(c);
          }
        }
      });
    } else {
      this.pulseWaveMesh.visible = false;
    }

    // 3. Update Companion (Smooth Damped Spring Orbit)
    this.updateCompanion(dt);

    // 4. Update Crystals Animation & Proximity
    this.crystals.forEach((c) => {
      if (!c.userData.collected) {
        c.rotation.y += dt * 1.5;
        c.userData.ringMesh.rotation.z += dt * 2.0;
        c.position.y = c.userData.initialY + Math.sin(performance.now() * 0.003 + c.position.x) * 0.22;

        const dist = this.player.position.distanceTo(c.position);
        if (dist < 1.8) {
          this.collectCrystal(c);
        }
      }
    });

    // 5. Gateway Proximity & Activation Check
    const distToGate = this.player.position.distanceTo(this.gateway.position);
    const collectedCount = this.crystals.filter((c) => c.userData.collected).length;

    if (distToGate < 4.5 && !this.gateway.userData.activated) {
      if (collectedCount >= 5) {
        this.callbacks.onInteractionAvailable('Press [E] to Awaken Ancient Gateway');
        if (input.pulse || (input as unknown as { interact?: boolean }).interact) {
          this.activateGateway();
        }
      } else {
        this.callbacks.onInteractionAvailable(`Gateway requires 5 Celestial Crystals (${collectedCount}/5)`);
      }
    } else if (distToGate >= 4.5) {
      this.callbacks.onInteractionAvailable(null);
    }

    if (this.gateway.userData.activated) {
      this.gateway.userData.portalDisk.rotation.z += dt * 1.2;
      this.gateway.userData.keystone.rotation.y += dt * 1.6;
    }

    // 6. Parkour Checkpoint Detection
    if (this.isTrialActive && this.currentCheckpointIndex < this.checkpoints.length) {
      const activeCheckpoint = this.checkpoints[this.currentCheckpointIndex];
      const distToCheckpoint = this.player.position.distanceTo(activeCheckpoint.position);

      if (distToCheckpoint < 3.2) {
        activeCheckpoint.userData.passed = true;
        activeCheckpoint.userData.ringMat.color.setHex(0x38ef7d);
        activeCheckpoint.userData.ringMat.emissive.setHex(0x38ef7d);
        soundManager.playCheckpoint();

        this.currentCheckpointIndex++;
        this.callbacks.onCheckpointPassed(this.currentCheckpointIndex, this.checkpoints.length);

        if (this.currentCheckpointIndex >= this.checkpoints.length) {
          // Completed Trial!
          const elapsed = (performance.now() - this.trialStartTime) / 1000;
          this.isTrialActive = false;
          soundManager.playPortalOpen();
          this.callbacks.onTrialFinished(elapsed);
        }
      }
    }
  }

  private collectCrystal(c: THREE.Group) {
    if (c.userData.collected) return;
    c.userData.collected = true;

    // Disappear animation
    c.visible = false;

    const collectedTotal = this.crystals.filter((cr) => cr.userData.collected).length;
    soundManager.playCrystalPickup(collectedTotal);
    this.callbacks.onCrystalCollected(collectedTotal, this.crystals.length);
  }

  public activateGateway() {
    if (this.gateway.userData.activated) return;
    this.gateway.userData.activated = true;

    const portalMat = this.gateway.userData.portalMat as THREE.MeshStandardMaterial;
    portalMat.opacity = 0.85;
    portalMat.emissiveIntensity = 2.4;

    soundManager.playPortalOpen();
    this.callbacks.onGatewayActivated();
  }

  private updateCompanion(dt: number) {
    // Target position: floating around player's right shoulder
    const targetX = this.player.position.x + Math.sin(this.player.rotationY + Math.PI / 3) * 1.2;
    const targetZ = this.player.position.z + Math.cos(this.player.rotationY + Math.PI / 3) * 1.2;
    const hoverY = this.player.position.y + 1.8 + Math.sin(performance.now() * 0.004) * 0.15;

    this.companion.position.x = THREE.MathUtils.damp(this.companion.position.x, targetX, 8.0, dt);
    this.companion.position.y = THREE.MathUtils.damp(this.companion.position.y, hoverY, 8.0, dt);
    this.companion.position.z = THREE.MathUtils.damp(this.companion.position.z, targetZ, 8.0, dt);

    // Spin companion gyro rings
    this.companion.userData.ring1.rotation.y += dt * 2.8;
    this.companion.userData.ring2.rotation.x += dt * 2.2;
    this.companion.userData.coreMesh.rotation.y += dt * 1.5;
  }

  private update(dt: number) {
    // Ambient floating stardust drift
    const posAttr = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    const count = posAttr.count;
    for (let i = 0; i < count; i++) {
      let py = posAttr.getY(i) + dt * 0.6;
      if (py > 25) py = -2;
      posAttr.setY(i, py);
    }
    posAttr.needsUpdate = true;
  }

  public setScreenMode(mode: 'title' | 'playing') {
    this.isTitleMode = mode === 'title';
    if (!this.isTitleMode) {
      // Position camera behind player smoothly
      this.player.cameraYaw = this.player.rotationY;
    }
  }

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    }
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
