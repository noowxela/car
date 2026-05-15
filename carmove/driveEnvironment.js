import * as THREE from 'three';
import { createDriveGround } from './driveGround.js';

function createCloudTexture() {

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  const puffs = [
    { x: 60, y: 120, r: 48 },
    { x: 110, y: 115, r: 42 },
    { x: 155, y: 125, r: 50 },
    { x: 90, y: 95, r: 36 },
    { x: 130, y: 90, r: 38 },
  ];

  for (let i = 0; i < puffs.length; i++) {

    const puff = puffs[i];
    const grad = ctx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, puff.r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
    ctx.fill();

  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;

}

function drawMountainLayer(ctx, width, height, baseRatio, color, amplitude, phase) {

  const baseY = height * baseRatio;
  const segments = 32;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, height);

  for (let i = 0; i <= segments; i++) {

    const t = i / segments;
    const x = t * width;
    const n1 = Math.sin(t * Math.PI * 2.8 + phase) * 0.5;
    const n2 = Math.cos(t * Math.PI * 5.2 + phase * 1.4) * 0.32;
    const n3 = Math.sin(t * Math.PI * 7.6 + phase * 2.1) * 0.18;
    const y = baseY - (n1 + n2 + n3 + 0.52) * height * amplitude;
    ctx.lineTo(x, y);

  }

  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

}

function createMountainBackdropTexture() {

  const width = 2048;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  const haze = ctx.createLinearGradient(0, 0, 0, height);
  haze.addColorStop(0, 'rgba(110, 176, 232, 0)');
  haze.addColorStop(0.4, 'rgba(158, 200, 239, 0.12)');
  haze.addColorStop(0.75, 'rgba(184, 200, 216, 0.35)');
  haze.addColorStop(1, 'rgba(140, 136, 132, 0.5)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height);

  // Back layer — light dark grey (distant)
  drawMountainLayer(ctx, width, height, 0.8, '#6d6864', 0.24, 0.2);

  // Front layer — dark grey (closer)
  drawMountainLayer(ctx, width, height, 0.68, '#383532', 0.36, 2.4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;

}

function createMountainBackdrop(floorY) {

  const texture = createMountainBackdropTexture();

  const backdrop = new THREE.Mesh(
    new THREE.CylinderGeometry(7800, 7800, 1100, 64, 1, true),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      fog: true,
    })
  );

  backdrop.position.y = floorY + 550;
  backdrop.renderOrder = -2;

  return backdrop;

}

function createClouds(floorY) {

  const clouds = new THREE.Group();
  const texture = createCloudTexture();

  const cloudMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    fog: true,
  });

  const cloudDefs = [
    { x: -2200, y: 520, z: -1800, w: 520, h: 160 },
    { x: -800, y: 680, z: -2400, w: 640, h: 190 },
    { x: 400, y: 450, z: -1600, w: 480, h: 140 },
    { x: 1400, y: 720, z: -2200, w: 700, h: 200 },
    { x: 2400, y: 580, z: -1900, w: 560, h: 165 },
    { x: -1600, y: 820, z: -2800, w: 780, h: 210 },
    { x: 200, y: 900, z: -3200, w: 820, h: 220 },
    { x: 1800, y: 760, z: -2600, w: 680, h: 195 },
    { x: -3000, y: 640, z: -2100, w: 600, h: 175 },
    { x: 3200, y: 850, z: -3000, w: 750, h: 205 },
    { x: 0, y: 980, z: -3500, w: 900, h: 240 },
    { x: -2600, y: 500, z: -1200, w: 450, h: 130 },
    { x: 2600, y: 540, z: -1400, w: 500, h: 145 },
  ];

  for (let i = 0; i < cloudDefs.length; i++) {

    const def = cloudDefs[i];
    const cloud = new THREE.Mesh(new THREE.PlaneGeometry(def.w, def.h), cloudMat);
    cloud.position.set(def.x, floorY + def.y, def.z);
    cloud.rotation.y = (i % 3) * 0.4;
    cloud.renderOrder = 1;
    clouds.add(cloud);

  }

  return clouds;

}

function createSkyDome() {

  const skyGeo = new THREE.SphereGeometry(8000, 32, 16);
  const positions = skyGeo.attributes.position;
  const colors = [];
  const horizon = new THREE.Color(0xc8b8a0);
  const mid = new THREE.Color(0x9ec8ef);
  const zenith = new THREE.Color(0x6eb0e8);

  for (let i = 0; i < positions.count; i++) {

    const y = positions.getY(i);
    const t = Math.max(0, Math.min(1, (y / 8000 + 1) * 0.5));
    let c;

    if (t < 0.48) {
      c = horizon;
    } else if (t < 0.72) {
      const blend = (t - 0.48) / 0.24;
      c = horizon.clone().lerp(mid, blend);
    } else {
      const blend = (t - 0.72) / 0.28;
      c = mid.clone().lerp(zenith, blend);
    }

    colors.push(c.r, c.g, c.b);

  }

  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  return new THREE.Mesh(
    skyGeo,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      fog: false,
    })
  );

}

function createSun(floorY) {

  const sunGroup = new THREE.Group();

  const sunPos = new THREE.Vector3(4200, floorY + 1100, -3200);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(180, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfff6e8,
      fog: false,
    })
  );
  glow.position.copy(sunPos);
  sunGroup.add(glow);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(320, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffe8c0,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      fog: false,
    })
  );
  halo.position.copy(sunPos);
  sunGroup.add(halo);

  return { group: sunGroup, position: sunPos };

}

export function initDriveEnvironment(floorY, renderer, metrics = null) {

  const root = new THREE.Group();
  root.name = 'driveEnvironment';
  root.visible = false;

  const groundSystem = createDriveGround(floorY, renderer, metrics);
  root.add(groundSystem.mesh);
  root.groundSystem = groundSystem;

  const sky = createSkyDome();
  sky.position.y = floorY + 200;
  root.add(sky);

  root.add(createMountainBackdrop(floorY));

  root.add(createClouds(floorY));

  const sunVisual = createSun(floorY);
  root.add(sunVisual.group);

  const hemi = new THREE.HemisphereLight(0x9ec8ef, 0x393534, 0.5);
  root.add(hemi);

  const ambient = new THREE.AmbientLight(0xc8c0b8, 0.28);
  root.add(ambient);

  const sun = new THREE.DirectionalLight(0xffe8c8, 1.35);
  sun.position.copy(sunVisual.position);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.025;
  sun.shadow.camera.near = 80;
  sun.shadow.camera.far = 2800;
  const sc = sun.shadow.camera;
  sc.left = -600;
  sc.right = 600;
  sc.top = 600;
  sc.bottom = -600;
  root.add(sun);
  root.add(sun.target);
  sun.target.position.set(0, floorY + 40, 0);

  return root;

}

export function rebuildDriveGround(driveEnv, floorY, renderer, metrics) {

  if (!driveEnv) return;

  if (driveEnv.groundSystem) {
    driveEnv.remove(driveEnv.groundSystem.mesh);
    driveEnv.groundSystem.dispose();
  }

  driveEnv.groundSystem = createDriveGround(floorY, renderer, metrics);
  driveEnv.add(driveEnv.groundSystem.mesh);
  driveEnv.groundSystem.wakeRipple();

}

export const DRIVE_SCENE_COLORS = {
  background: 0x9ec8ef,
  fog: 0xa8b4c4,
  fogNear: 350,
  fogFar: 6800,
  exposure: 1.08,
};
