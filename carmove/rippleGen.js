import * as THREE from 'three';

const RIPPLE_FRAG = /* glsl */`
uniform vec2 ripplePos;
uniform float rippleSize;
uniform float viscosity;
uniform float rippleImpact;
uniform sampler2D heightmap;
uniform vec2 resolution;

#define deltaTime ( 1.0 / 60.0 )

void main() {
  vec2 cellSize = 1.0 / resolution;
  vec2 uv = gl_FragCoord.xy * cellSize;

  vec4 heightmapValue = texture2D(heightmap, uv);

  float north = texture2D(heightmap, uv + vec2(0.0, cellSize.y)).r;
  float south = texture2D(heightmap, uv + vec2(0.0, -cellSize.y)).r;
  float east = texture2D(heightmap, uv + vec2(cellSize.x, 0.0)).r;
  float west = texture2D(heightmap, uv + vec2(-cellSize.x, 0.0)).r;

  float bounds = resolution.x;
  float gravity = bounds * deltaTime;

  float sump = north + south + east + west - 4.0 * heightmapValue.x;
  float accel = sump * gravity;

  heightmapValue.y += accel;
  heightmapValue.x += heightmapValue.y * deltaTime;
  heightmapValue.x += sump * viscosity;

  float mousePhase = clamp(
    length((uv - vec2(0.5)) * bounds - vec2(ripplePos.x, -ripplePos.y)) * 3.14159265 / rippleSize,
    0.0,
    3.14159265
  );
  heightmapValue.x += (cos(mousePhase) + 1.0) * rippleImpact;

  heightmapValue.x *= 0.998;

  gl_FragColor = heightmapValue;
}
`;

function pickRenderTargetType(renderer) {

  const caps = renderer.capabilities;
  if (caps.isWebGL2) return THREE.HalfFloatType;
  if (caps.floatFragmentTextures && caps.floatBlend) return THREE.FloatType;
  return THREE.UnsignedByteType;

}

function createZeroHeightmap(size, type) {

  const count = size * size * 4;
  const data = type === THREE.UnsignedByteType
    ? new Uint8Array(count)
    : new Float32Array(count);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, type);
  tex.needsUpdate = true;
  return tex;

}

export default class RippleGen {

  constructor(renderer, ripplePos, gridSize = 32, rippleSize = 2.2) {

    this.renderChange = false;
    this.renderer = renderer;
    this.textureSize = gridSize;
    this.rtType = pickRenderTargetType(renderer);

    const rtOpts = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
      format: THREE.RGBAFormat,
      type: this.rtType,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    };

    this.rTarget1 = new THREE.WebGLRenderTarget(this.textureSize, this.textureSize, rtOpts);
    this.rTarget2 = new THREE.WebGLRenderTarget(this.textureSize, this.textureSize, rtOpts);

    this.zeroHeightmap = createZeroHeightmap(this.textureSize, this.rtType);

    this.gpScene = new THREE.Scene();
    this.gpCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.gpMat = new THREE.ShaderMaterial({
      uniforms: {
        ripplePos: { value: ripplePos },
        rippleSize: { value: rippleSize },
        rippleImpact: { value: 0.0 },
        viscosity: { value: 0.012 },
        heightmap: { value: this.zeroHeightmap },
        resolution: { value: new THREE.Vector2(gridSize, gridSize) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: RIPPLE_FRAG,
      depthWrite: false,
    });

    this.uniImpact = this.gpMat.uniforms.rippleImpact;
    this.gpMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.gpMat);
    this.gpScene.add(this.gpMesh);

    this.clearTargets();

    for (let i = 0; i < 6; i++) {
      this.update();
    }

  }

  clearTargets() {

    const prev = this.renderer.getRenderTarget();
    const autoClear = this.renderer.autoClear;

    this.renderer.autoClear = true;
    this.renderer.setRenderTarget(this.rTarget1);
    this.renderer.clear();
    this.renderer.setRenderTarget(this.rTarget2);
    this.renderer.clear();
    this.renderer.setRenderTarget(prev);
    this.renderer.autoClear = autoClear;

  }

  newRippleImpact(val) {

    this.uniImpact.value = Math.max(val, 0.04);

  }

  setRippleSize(size) {

    this.gpMat.uniforms.rippleSize.value = size;

  }

  update() {

    this.renderChange = !this.renderChange;
    const prev = this.renderer.getRenderTarget();
    const autoClear = this.renderer.autoClear;

    this.renderer.autoClear = true;

    if (this.renderChange) {
      this.gpMat.uniforms.heightmap.value = this.rTarget2.texture;
      this.renderer.setRenderTarget(this.rTarget1);
      this.renderer.render(this.gpScene, this.gpCam);
    } else {
      this.gpMat.uniforms.heightmap.value = this.rTarget1.texture;
      this.renderer.setRenderTarget(this.rTarget2);
      this.renderer.render(this.gpScene, this.gpCam);
    }

    this.renderer.setRenderTarget(prev);
    this.renderer.autoClear = autoClear;

    return this.renderChange ? this.rTarget1.texture : this.rTarget2.texture;

  }

  dispose() {

    this.rTarget1.dispose();
    this.rTarget2.dispose();
    this.zeroHeightmap.dispose();
    this.gpMat.dispose();
    this.gpMesh.geometry.dispose();

  }

}
