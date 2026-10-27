// Procedural 3D assets generator for PLYHUB complying with Three.js Skill PBR standards
import * as THREE from 'three';
import { PlayerCustomization } from '../types/game';

// Procedural Canvas Textures (Zero 404 / no external files)
export function createRunicStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base stone gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#1a1f36');
  grad.addColorStop(0.5, '#252d4a');
  grad.addColorStop(1, '#15192c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Stone pavers / tiles
  ctx.strokeStyle = '#0e1220';
  ctx.lineWidth = 4;
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Ancient magical runes engraved in glowing cyan / gold
  ctx.strokeStyle = '#00f2fe33';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const rx = 40 + (i % 4) * 128;
    const ry = 40 + Math.floor(i / 4) * 256;
    ctx.beginPath();
    ctx.arc(rx, ry, 24, 0, Math.PI * 2);
    ctx.moveTo(rx - 16, ry);
    ctx.lineTo(rx + 16, ry);
    ctx.moveTo(rx, ry - 16);
    ctx.lineTo(rx, ry + 16);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createGrassPlateauTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Stylized celestial bioluminescent grass
  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 360);
  grad.addColorStop(0, '#104f55');
  grad.addColorStop(0.5, '#0b353b');
  grad.addColorStop(1, '#082329');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle luminous speckles
  ctx.fillStyle = '#38ef7d33';
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// Particle sprite generator
export function createGlowParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const radGrad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radGrad.addColorStop(0.3, 'rgba(0, 242, 254, 0.8)');
  radGrad.addColorStop(0.7, 'rgba(79, 172, 254, 0.2)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Player 3D Character Model (Composite 3-12 part THREE.Group)
export interface PlayerMeshGroup extends THREE.Group {
  userData: {
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    head: THREE.Group;
    thrusterCore: THREE.Mesh;
    visorMesh: THREE.Mesh;
    armorMeshes: THREE.Mesh[];
    accentMeshes: THREE.Mesh[];
  };
}

export function createPlayerCharacter(custom: PlayerCustomization): PlayerMeshGroup {
  const root = new THREE.Group() as PlayerMeshGroup;

  const armorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(custom.armorColor),
    metalness: 0.85,
    roughness: 0.25,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(custom.accentColor),
    metalness: 0.6,
    roughness: 0.4,
  });

  const darkUnderMat = new THREE.MeshStandardMaterial({
    color: 0x111625,
    metalness: 0.2,
    roughness: 0.85,
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(custom.visorColor),
    emissive: new THREE.Color(custom.visorColor),
    emissiveIntensity: 1.8,
    metalness: 0.1,
    roughness: 0.1,
  });

  const thrusterGlowMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00f2fe,
    emissiveIntensity: 2.2,
    metalness: 0.5,
    roughness: 0.2,
  });

  const armorMeshes: THREE.Mesh[] = [];
  const accentMeshes: THREE.Mesh[] = [];

  // Pelvis / Hips (Y = 0.85)
  const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.22, 8);
  const pelvis = new THREE.Mesh(pelvisGeo, darkUnderMat);
  pelvis.position.y = 0.85;
  pelvis.castShadow = true;
  root.add(pelvis);

  // Chest / Cuirass (Primary silhouette)
  const chestGeo = new THREE.BoxGeometry(0.55, 0.48, 0.35);
  const chest = new THREE.Mesh(chestGeo, armorMat);
  chest.position.y = 1.18;
  chest.castShadow = true;
  root.add(chest);
  armorMeshes.push(chest);

  // Chest energy core accent
  const coreGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12);
  coreGeo.rotateX(Math.PI / 2);
  const chestCore = new THREE.Mesh(coreGeo, visorMat);
  chestCore.position.set(0, 1.2, 0.18);
  root.add(chestCore);

  // Jetpack Thruster Backpack on back
  const jetpackGeo = new THREE.BoxGeometry(0.38, 0.42, 0.18);
  const jetpack = new THREE.Mesh(jetpackGeo, accentMat);
  jetpack.position.set(0, 1.2, -0.25);
  jetpack.castShadow = true;
  root.add(jetpack);
  accentMeshes.push(jetpack);

  // Dual exhaust nozzles
  [-0.11, 0.11].forEach((xOff) => {
    const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8);
    const nozzle = new THREE.Mesh(nozzleGeo, darkUnderMat);
    nozzle.position.set(xOff, 0.98, -0.25);
    root.add(nozzle);
  });

  const thrusterCoreGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const thrusterCore = new THREE.Mesh(thrusterCoreGeo, thrusterGlowMat);
  thrusterCore.position.set(0, 1.2, -0.32);
  root.add(thrusterCore);

  // Head & Helmet
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.55;

  const helmetGeo = new THREE.SphereGeometry(0.25, 12, 12);
  helmetGeo.scale(1, 1.1, 1.05);
  const helmet = new THREE.Mesh(helmetGeo, armorMat);
  helmet.castShadow = true;
  headGroup.add(helmet);
  armorMeshes.push(helmet);

  // Glowing Curved Visor
  const visorGeo = new THREE.BoxGeometry(0.32, 0.16, 0.16);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.02, 0.18);
  headGroup.add(visor);

  // Helmet side antennae / crests
  const crestGeo = new THREE.BoxGeometry(0.06, 0.22, 0.28);
  const crest = new THREE.Mesh(crestGeo, accentMat);
  crest.position.set(0, 0.2, -0.05);
  headGroup.add(crest);
  accentMeshes.push(crest);

  root.add(headGroup);

  // Limbs with pivots at upper joints
  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.8, 0);

  const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.42, 8), darkUnderMat);
  thighL.position.y = -0.21;
  thighL.castShadow = true;
  leftLeg.add(thighL);

  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.24), armorMat);
  bootL.position.set(0, -0.6, 0.02);
  bootL.castShadow = true;
  leftLeg.add(bootL);
  armorMeshes.push(bootL);
  root.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.8, 0);

  const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.42, 8), darkUnderMat);
  thighR.position.y = -0.21;
  thighR.castShadow = true;
  rightLeg.add(thighR);

  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.24), armorMat);
  bootR.position.set(0, -0.6, 0.02);
  bootR.castShadow = true;
  rightLeg.add(bootR);
  armorMeshes.push(bootR);
  root.add(rightLeg);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 1.35, 0);

  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), accentMat);
  leftArm.add(shoulderL);
  accentMeshes.push(shoulderL);

  const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.44, 8), darkUnderMat);
  armMeshL.position.y = -0.24;
  armMeshL.castShadow = true;
  leftArm.add(armMeshL);

  const gauntletL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.16), armorMat);
  gauntletL.position.y = -0.38;
  leftArm.add(gauntletL);
  armorMeshes.push(gauntletL);
  root.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 1.35, 0);

  const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), accentMat);
  rightArm.add(shoulderR);
  accentMeshes.push(shoulderR);

  const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.44, 8), darkUnderMat);
  armMeshR.position.y = -0.24;
  armMeshR.castShadow = true;
  rightArm.add(armMeshR);

  const gauntletR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.16), armorMat);
  gauntletR.position.y = -0.38;
  rightArm.add(gauntletR);
  armorMeshes.push(gauntletR);
  root.add(rightArm);

  // Radial contact shadow disk at ground
  const shadowGeo = new THREE.CircleGeometry(0.5, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x050810,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.02;
  root.add(shadowMesh);

  root.userData = {
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    head: headGroup,
    thrusterCore,
    visorMesh: visor,
    armorMeshes,
    accentMeshes,
  };

  return root;
}

// Update player character customization
export function updatePlayerAppearance(
  playerMesh: PlayerMeshGroup,
  custom: PlayerCustomization
) {
  const armorColor = new THREE.Color(custom.armorColor);
  const accentColor = new THREE.Color(custom.accentColor);
  const visorColor = new THREE.Color(custom.visorColor);

  playerMesh.userData.armorMeshes.forEach((mesh) => {
    (mesh.material as THREE.MeshStandardMaterial).color.copy(armorColor);
  });
  playerMesh.userData.accentMeshes.forEach((mesh) => {
    (mesh.material as THREE.MeshStandardMaterial).color.copy(accentColor);
  });

  const visorMat = playerMesh.userData.visorMesh.material as THREE.MeshStandardMaterial;
  visorMat.color.copy(visorColor);
  visorMat.emissive.copy(visorColor);

  const thrusterMat = playerMesh.userData.thrusterCore.material as THREE.MeshStandardMaterial;
  thrusterMat.color.copy(visorColor);
  thrusterMat.emissive.copy(visorColor);
}

// Procedural Companion Pet (Lumi / Chrono / Starling / Pyra)
export interface CompanionMeshGroup extends THREE.Group {
  userData: {
    coreMesh: THREE.Mesh;
    ring1: THREE.Mesh;
    ring2: THREE.Mesh;
    wings: THREE.Mesh[];
  };
}

export function createCompanion(custom: PlayerCustomization): CompanionMeshGroup {
  const root = new THREE.Group() as CompanionMeshGroup;

  const coreColor = new THREE.Color(custom.companionColor);
  const coreMat = new THREE.MeshStandardMaterial({
    color: coreColor,
    emissive: coreColor,
    emissiveIntensity: 2.2,
    roughness: 0.1,
    metalness: 0.2,
  });

  // Central glowing core
  const coreGeo = new THREE.OctahedronGeometry(0.18, 1);
  const core = new THREE.Mesh(coreGeo, coreMat);
  root.add(core);

  // Rotating outer gyro rings with rune gold / cyan material
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xf5d77f,
    metalness: 0.9,
    roughness: 0.2,
  });

  const ringGeo1 = new THREE.TorusGeometry(0.28, 0.02, 8, 24);
  const ring1 = new THREE.Mesh(ringGeo1, ringMat);
  root.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(0.36, 0.02, 8, 24);
  const ring2 = new THREE.Mesh(ringGeo2, ringMat);
  ring2.rotation.x = Math.PI / 3;
  root.add(ring2);

  // Cute celestial wings / fins
  const wings: THREE.Mesh[] = [];
  const wingGeo = new THREE.ConeGeometry(0.08, 0.25, 4);
  wingGeo.rotateZ(Math.PI / 2);

  [-1, 1].forEach((side) => {
    const wing = new THREE.Mesh(wingGeo, ringMat);
    wing.position.set(side * 0.26, 0.08, 0);
    wing.scale.set(1, side, 1);
    root.add(wing);
    wings.push(wing);
  });

  // Soft omni light emitted by companion
  const companionLight = new THREE.PointLight(coreColor, 1.2, 5);
  root.add(companionLight);

  root.userData = {
    coreMesh: core,
    ring1,
    ring2,
    wings,
  };

  return root;
}

// Procedural Energy Crystal
export function createEnergyCrystal(id: string, position: THREE.Vector3): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(position);

  // Dual pyramid facet crystal
  const crystalGeo = new THREE.OctahedronGeometry(0.45, 0);
  crystalGeo.scale(0.8, 1.4, 0.8);

  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00c6ff,
    emissiveIntensity: 1.6,
    roughness: 0.15,
    metalness: 0.3,
  });

  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.castShadow = true;
  group.add(crystal);

  // Orbiting energy ring
  const ringGeo = new THREE.TorusGeometry(0.65, 0.02, 6, 20);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xfee140,
    emissive: 0xfa709a,
    emissiveIntensity: 0.8,
    metalness: 0.8,
    roughness: 0.2,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  // Base stone pedestal with glyphs
  const pedestalGeo = new THREE.CylinderGeometry(0.5, 0.7, 0.4, 8);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x1f273d,
    metalness: 0.4,
    roughness: 0.7,
  });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.y = -0.9;
  pedestal.receiveShadow = true;
  group.add(pedestal);

  // Glow light
  const light = new THREE.PointLight(0x00f2fe, 1.0, 6);
  group.add(light);

  group.userData = {
    id,
    type: 'crystal',
    collected: false,
    initialY: position.y,
    crystalMesh: crystal,
    ringMesh: ring,
  };

  return group;
}

// Procedural Ancient Gateway (Portal)
export function createAncientGateway(position: THREE.Vector3): THREE.Group {
  const gate = new THREE.Group();
  gate.position.copy(position);

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x181e30,
    metalness: 0.3,
    roughness: 0.7,
  });

  const runeMat = new THREE.MeshStandardMaterial({
    color: 0xfa709a,
    emissive: 0xfa709a,
    emissiveIntensity: 1.2,
    metalness: 0.5,
    roughness: 0.3,
  });

  // Left & Right Monolith Pillars
  [-2.2, 2.2].forEach((x) => {
    const pillarGeo = new THREE.BoxGeometry(0.9, 5.2, 0.9);
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.set(x, 2.6, 0);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    gate.add(pillar);

    // Glowing rune stripes
    const stripeGeo = new THREE.BoxGeometry(0.92, 0.15, 0.92);
    const stripe1 = new THREE.Mesh(stripeGeo, runeMat);
    stripe1.position.set(x, 1.8, 0);
    const stripe2 = new THREE.Mesh(stripeGeo, runeMat);
    stripe2.position.set(x, 3.6, 0);
    gate.add(stripe1);
    gate.add(stripe2);
  });

  // Archway Keystone Top Beam
  const archGeo = new THREE.BoxGeometry(5.4, 0.8, 1.0);
  const arch = new THREE.Mesh(archGeo, stoneMat);
  arch.position.set(0, 5.4, 0);
  arch.castShadow = true;
  gate.add(arch);

  // Floating Center Diamond Keystone
  const keystoneGeo = new THREE.OctahedronGeometry(0.55, 0);
  const keystone = new THREE.Mesh(keystoneGeo, runeMat);
  keystone.position.set(0, 4.4, 0);
  gate.add(keystone);

  // Stepped Plinth Base
  const baseGeo = new THREE.CylinderGeometry(3.5, 4.0, 0.5, 16);
  const base = new THREE.Mesh(baseGeo, stoneMat);
  base.position.y = 0.25;
  base.receiveShadow = true;
  gate.add(base);

  // Shimmering Portal Vortex Disk
  const portalDiskGeo = new THREE.CircleGeometry(1.9, 32);
  const portalMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x4facfe,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const portalDisk = new THREE.Mesh(portalDiskGeo, portalMat);
  portalDisk.position.set(0, 2.8, 0);
  gate.add(portalDisk);

  gate.userData = {
    type: 'gateway',
    activated: false,
    portalDisk,
    keystone,
    portalMat,
  };

  return gate;
}

// Procedural Floating Island builder
export interface IslandData {
  mesh: THREE.Group;
  center: THREE.Vector3;
  radius: number;
  height: number;
}

export function createFloatingIsland(
  center: THREE.Vector3,
  radius: number,
  height: number,
  biome: 'sanctuary' | 'spire' | 'observatory' | 'stepping'
): IslandData {
  const island = new THREE.Group();
  island.position.copy(center);

  // Top Plateau (Hexagonal/Cylindrical tiered surface)
  const topGeo = new THREE.CylinderGeometry(radius, radius * 1.08, 1.2, 16);
  const grassMat = new THREE.MeshStandardMaterial({
    color: biome === 'spire' ? 0x1b2845 : 0x0e4749,
    metalness: 0.2,
    roughness: 0.8,
  });
  const topPlateau = new THREE.Mesh(topGeo, grassMat);
  topPlateau.position.y = 0.6;
  topPlateau.receiveShadow = true;
  island.add(topPlateau);

  // Underbelly Rock Cone (Inverted rocky cliff tapering downward)
  const cliffGeo = new THREE.ConeGeometry(radius * 1.08, height, 14);
  cliffGeo.rotateX(Math.PI);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x161a29,
    metalness: 0.35,
    roughness: 0.85,
  });
  const cliff = new THREE.Mesh(cliffGeo, rockMat);
  cliff.position.y = -height / 2;
  cliff.castShadow = true;
  cliff.receiveShadow = true;
  island.add(cliff);

  // Decorative jagged stone stalactites hanging below
  const subCliffsCount = Math.floor(radius / 2.5);
  for (let i = 0; i < subCliffsCount; i++) {
    const angle = (i / subCliffsCount) * Math.PI * 2;
    const dist = (radius * 0.6) * (0.4 + Math.random() * 0.5);
    const subGeo = new THREE.ConeGeometry(1.2, height * 0.7, 5);
    subGeo.rotateX(Math.PI);
    const sub = new THREE.Mesh(subGeo, rockMat);
    sub.position.set(Math.cos(angle) * dist, -height * 0.4, Math.sin(angle) * dist);
    island.add(sub);
  }

  // Ancient flora / trees / crystal clusters on plateau
  if (biome !== 'stepping') {
    const plantCount = Math.floor(radius * 1.2);
    for (let p = 0; p < plantCount; p++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (radius - 2.5);
      const px = Math.cos(angle) * dist;
      const pz = Math.sin(angle) * dist;

      if (p % 3 === 0) {
        // Celestial Tree (3-part composite)
        const tree = createCelestialTree();
        tree.position.set(px, 1.2, pz);
        island.add(tree);
      } else {
        // Glowing Crystal Shrub
        const shrub = createCrystalCluster();
        shrub.position.set(px, 1.2, pz);
        island.add(shrub);
      }
    }
  }

  return {
    mesh: island,
    center,
    radius,
    height,
  };
}

// Composite Celestial Tree (Trunk + 2-3 Canopy tiers + luminous fruit)
function createCelestialTree(): THREE.Group {
  const tree = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 2.2, 7);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x221a2e,
    roughness: 0.9,
    metalness: 0.1,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  tree.add(trunk);

  // Tiered stylized canopy
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x005577,
    emissiveIntensity: 0.4,
    roughness: 0.4,
    metalness: 0.2,
  });

  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.6, 7), canopyMat);
  cone1.position.y = 2.4;
  cone1.castShadow = true;
  tree.add(cone1);

  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 7), canopyMat);
  cone2.position.y = 3.2;
  cone2.castShadow = true;
  tree.add(cone2);

  return tree;
}

// Glowing crystal cluster
function createCrystalCluster(): THREE.Group {
  const cluster = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfa709a,
    emissive: 0xfa709a,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.5,
  });

  for (let i = 0; i < 4; i++) {
    const geo = new THREE.ConeGeometry(0.12, 0.6 + i * 0.15, 5);
    const spike = new THREE.Mesh(geo, mat);
    spike.position.set((Math.random() - 0.5) * 0.4, 0.3, (Math.random() - 0.5) * 0.4);
    spike.rotation.z = (Math.random() - 0.5) * 0.4;
    cluster.add(spike);
  }

  return cluster;
}

// Parkour Checkpoint Ring
export function createCheckpointRing(position: THREE.Vector3, index: number): THREE.Group {
  const ringGroup = new THREE.Group();
  ringGroup.position.copy(position);

  const ringGeo = new THREE.TorusGeometry(1.8, 0.12, 8, 28);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xf5d77f,
    emissive: 0xf5d77f,
    emissiveIntensity: 1.0,
    metalness: 0.8,
    roughness: 0.2,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringGroup.add(ringMesh);

  ringGroup.userData = {
    type: 'checkpoint',
    index,
    passed: false,
    ringMesh,
    ringMat,
  };

  return ringGroup;
}
