import * as THREE from 'three';

/**
 * Drive grid / ripple / physics scale derived from the loaded car model bounds.
 * Tuned so a ~380-unit-long car matches the previous hard-coded unitScale of 38.
 */
export function computeDriveMetrics(carModel) {

  const box = new THREE.Box3().setFromObject(carModel);
  const size = new THREE.Vector3();
  box.getSize(size);

  const carLength = Math.max(size.x, size.z);
  const carWidth = Math.min(size.x, size.z);
  const carHeight = size.y;

  const refLength = 380;
  const unitScale = Math.max(12, carLength / 10);
  const tileSize = unitScale;
  const gridCells = 32;
  const waveAmp = tileSize * 0.42;
  const pointScale = THREE.MathUtils.clamp(72 * (carLength / refLength), 55, 150);
  const resetRadius = Math.max(4000, carLength * 22);
  const groundRadius = Math.max(12000, carLength * 36);
  const rippleSize = THREE.MathUtils.clamp(2.0 + carLength / 450, 2.0, 3.6);

  return {
    carLength,
    carWidth,
    carHeight,
    unitScale,
    tileSize,
    gridCells,
    waveAmp,
    pointScale,
    resetRadius,
    groundRadius,
    rippleSize,
  };

}
