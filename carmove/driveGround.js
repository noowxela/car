import * as THREE from 'three';
import RippleGen from './rippleGen.js';

// FF 91 VR ground — ported from carmove/move.js Grid + RippleGen

const GRID_VERT = /* glsl */`
#define PI 3.1415926

attribute float diagonal;

uniform sampler2D heightmap;
uniform float vpH;
uniform float pointScale;
uniform float waveAmp;
uniform vec2 origin;
uniform float prog;

varying float opacity;
varying float diag;

float normFloat(float n, float minVal, float maxVal) {
  return clamp((n - minVal) / (maxVal - minVal), 0.0, 1.0);
}

void main() {
  diag = diagonal;
  float fluctuation = -texture2D(heightmap, uv).r;

  vec3 newPos = position;
  newPos.xz -= origin;
  newPos.x = (fract((newPos.x + RANGE) / RANGE2) * RANGE2) - RANGE;
  newPos.z = (fract((newPos.z + RANGE) / RANGE2) * RANGE2) - RANGE;
  newPos.y = 0.0;

  float size = 0.42;

  float distOrigin = distance(newPos.xz, vec2(-0.5, 0.0));
  float edgeFade = 1.0 - normFloat(distOrigin, RANGE * 0.65, RANGE);
  opacity = max(0.4, (fluctuation + 0.55) * edgeFade);

  float ffLogo = step(distOrigin, 1.7) * prog;
  opacity = max(ffLogo, opacity);
  size = max(ffLogo, size);

  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = max(vpH * size * pointScale / max(-mvPosition.z, 80.0), 4.0);
}
`;

const GRID_FRAG = /* glsl */`
uniform sampler2D led;
uniform vec3 color;

varying float opacity;
varying float diag;

void main() {
  gl_FragColor = texture2D(led, vec2(abs(diag - gl_PointCoord.x), gl_PointCoord.y)) * vec4(color, opacity);
}
`;

function mod(n, m) {
  return ((n % m) + m) % m;
}

function createLedTexture() {

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(size - 10, size - 10);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;

}

export class DriveGround {

  constructor(floorY, renderer, metrics) {

    this.floorY = floorY;
    this.renderer = renderer;
    this.applyMetrics(metrics);

    this.root = new THREE.Group();
    this.root.name = 'driveGround';

    this.ripplePos = new THREE.Vector2();
    this.scrollWorld = new THREE.Vector2();
    this.rippleWorld = new THREE.Vector2();
    this.rippleActive = false;
    this.rippleGen = new RippleGen(renderer, this.ripplePos, this.GRID_SIZE, this.metrics.rippleSize);

    this.ledSprite = createLedTexture();
    this.gridColor = new THREE.Color(0x9a9592);

    this.buildGrid();
    this.buildBase();

    this.root.position.y = floorY;
    this.mesh = this.root;

  }

  applyMetrics(metrics) {

    this.metrics = metrics ?? {
      carLength: 380,
      unitScale: 38,
      tileSize: 38,
      gridCells: 32,
      waveAmp: 16,
      pointScale: 85,
      groundRadius: 8000,
      rippleSize: 2.2,
    };

    const m = this.metrics;
    this.unitScale = m.unitScale;
    this.TILE = m.tileSize;
    this.GRID_SIZE = m.gridCells;
    this.GRID_HALFSIZE = m.gridCells / 2;

  }

  buildGrid() {

    if (this.lightGrid) {
      this.root.remove(this.lightGrid);
      this.lightGrid.geometry.dispose();
      this.gridMaterial.dispose();
    }

    const range = (this.GRID_HALFSIZE * this.TILE).toFixed(1);
    const range2 = (this.GRID_SIZE * this.TILE).toFixed(1);
    const m = this.metrics;

    this.gridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        led: { value: this.ledSprite },
        heightmap: { value: null },
        vpH: { value: window.innerHeight },
        pointScale: { value: m.pointScale },
        waveAmp: { value: m.waveAmp },
        prog: { value: 0.0 },
        origin: { value: new THREE.Vector2() },
        color: { value: this.gridColor },
      },
      defines: {
        RANGE: range,
        RANGE2: range2,
      },
      vertexShader: GRID_VERT,
      fragmentShader: GRID_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      fog: false,
      blending: THREE.AdditiveBlending,
    });

    const vertCount = this.GRID_SIZE * this.GRID_SIZE;
    const position = new Float32Array(vertCount * 3);
    const uvs = new Float32Array(vertCount * 2);
    const diagonal = new Float32Array(vertCount);

    for (let i = 0, i3 = 0; i < vertCount; i++, i3 += 3) {
      const xPos = i % this.GRID_SIZE;
      const zPos = Math.floor(i / this.GRID_SIZE);
      position[i3 + 0] = (xPos - this.GRID_HALFSIZE) * this.TILE;
      position[i3 + 1] = 0;
      position[i3 + 2] = (zPos - this.GRID_HALFSIZE) * this.TILE;
      uvs[i * 2 + 0] = xPos / this.GRID_SIZE;
      uvs[i * 2 + 1] = 1.0 - zPos / this.GRID_SIZE;
      diagonal[i] = (xPos + zPos) % 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute('diagonal', new THREE.BufferAttribute(diagonal, 1));

    this.lightGrid = new THREE.Points(geometry, this.gridMaterial);
    this.lightGrid.frustumCulled = false;
    this.lightGrid.renderOrder = 0;
    this.root.add(this.lightGrid);

  }

  buildBase() {

    if (this.base) {
      this.root.remove(this.base);
      this.base.geometry.dispose();
      this.base.material.dispose();
    }

    const extent = this.metrics.groundRadius * 2;
    this.base = new THREE.Mesh(
      new THREE.PlaneGeometry(extent, extent),
      new THREE.MeshBasicMaterial({ color: 0x393534 })
    );
    this.base.rotation.x = -Math.PI / 2;
    this.base.position.y = -0.5;
    this.base.renderOrder = -10;
    this.base.receiveShadow = true;
    this.root.add(this.base);

  }

  moveRippleOrigin(x, y) {
    this.ripplePos.set(x, y);
  }

  wakeRipple() {

    if (!this.gridMaterial || !this.rippleGen) return;

    this.moveRippleOrigin(0, 0);
    this.rippleGen.newRippleImpact(0.2);
    let tex = null;
    for (let i = 0; i < 8; i++) {
      tex = this.rippleGen.update();
    }
    this.gridMaterial.uniforms.heightmap.value = tex;
    this.moveRippleOrigin(1000, 1000);

  }

  onWindowResize(vpH, pixelRatio = 1) {
    if (this.gridMaterial) {
      this.gridMaterial.uniforms.vpH.value = vpH * pixelRatio;
    }
  }

  update(props, groundY, forward, visualTreadmill = true) {

    if (!this.gridMaterial || !this.rippleGen) return;

    const s = this.unitScale;
    const px = props.pos.x;
    const py = props.pos.y;

    if (groundY !== undefined) {
      this.root.position.y = groundY;
    }

    const origin = this.gridMaterial.uniforms.origin.value;
    origin.set(px * s, py * s);
    this.scrollWorld.set(origin.x, -origin.y);

    const moving = props.frameDist > 0.0001 || props.speed > 0.02;
    let tex;

    if (moving) {
      const wake = 2.2;
      const theta = props.theta;
      const vx = Math.cos(theta);
      const vy = -Math.sin(theta);
      let rippleX;
      let rippleY;

      if (visualTreadmill) {
        rippleX = -vx * wake;
        rippleY = -vy * wake;
      } else {
        const behindX = px - vx * (wake / s);
        const behindY = py - vy * (wake / s);
        rippleX = mod(behindX + this.GRID_HALFSIZE, this.GRID_SIZE) - this.GRID_HALFSIZE;
        rippleY = mod(behindY + this.GRID_HALFSIZE, this.GRID_SIZE) - this.GRID_HALFSIZE;
      }

      const distImpact = props.frameDist * 12;
      const speedImpact = props.speed / 36;
      const impact = Math.max(distImpact, speedImpact, 0.08);
      const speedRatio = Math.min(props.speed / 22, 1);

      this.rippleGen.setRippleSize(this.metrics.rippleSize * (0.85 + speedRatio * 0.4));
      this.rippleGen.newRippleImpact(impact);
      this.moveRippleOrigin(rippleX, rippleY);
      this.rippleWorld.set(rippleX * s, -rippleY * s);
      this.rippleActive = true;

      tex = this.rippleGen.update();
      tex = this.rippleGen.update();
      if (props.frameDist > 0.008) {
        tex = this.rippleGen.update();
      }
    } else {
      this.rippleActive = false;
      tex = this.rippleGen.update();
    }

    this.gridMaterial.uniforms.heightmap.value = tex;
    this.moveRippleOrigin(1000, 1000);

  }

  getLocationDisplay(target) {

    target.root.copy(this.root.position);
    target.scroll.copy(this.scrollWorld);
    target.ripple.copy(this.rippleWorld);
    target.rippleActive = this.rippleActive;
    return target;

  }

  dispose() {

    if (this.lightGrid) {
      this.lightGrid.geometry.dispose();
      this.gridMaterial.dispose();
    }
    if (this.base) {
      this.base.geometry.dispose();
      this.base.material.dispose();
    }
    if (this.ledSprite) this.ledSprite.dispose();
    if (this.rippleGen) this.rippleGen.dispose();

  }

}

export function createDriveGround(floorY, renderer, metrics) {

  return new DriveGround(floorY, renderer, metrics);

}
