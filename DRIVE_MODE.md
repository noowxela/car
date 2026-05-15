# Drive Mode

Drive mode is an outdoor test-ride view inspired by the [FF 91 VR](https://vr.ff.com/us/) experience. You drive the loaded GLB car on an infinite scrolling LED grid with GPU ripple waves, while Inspect mode keeps the indoor showroom.

## Switching modes

Use the bottom bar in `index.html`:

| Control | Action |
|---------|--------|
| **Inspect** | Showroom: turntable, paint presets, lil-gui, orbit camera |
| **Drive** | Outdoor scene: keyboard driving, follow camera, ripple ground |

When you enter Drive:

- The showroom (`carEnvironment`) is hidden.
- The outdoor scene (`driveEnvironment`) is shown.
- Orbit controls are disabled; the follow camera takes over.
- Keyboard input is bound for driving.
- The car resets to the start position.
- Ground ripples are primed (`wakeRipple()`).

When you return to Inspect:

- Drive keys are unbound.
- Car position and camera are restored to the saved inspect state.
- The lil-gui panel is shown again.

## On-screen UI (Drive)

While in Drive, the bottom bar shows:

- **Mode switch** — `Inspect` / `Drive` buttons
- **Hint** — `WASD / arrows to drive · scroll zoom · drag to orbit`
- **Screenshot** — captures the current frame

Inspect-only controls (paint preset, rotate car, main screenshot) are hidden.

## Controls

### Driving

| Input | Action |
|-------|--------|
| **W** or **↑** | Accelerate |
| **S** or **↓** | Brake / reverse decel |
| **A** or **←** | Steer left |
| **D** or **→** | Steer right |

Physics is ported from `carmove/move.js` (`CarProps` + FF91 constants) in `carmove/carDrive.js`. Speed, steering, and wheel spin are updated each frame from `clock.getDelta()`.

### Camera

| Input | Action |
|-------|--------|
| **Mouse drag** (left button) | Orbit around the car (yaw only) |
| **Scroll** | Zoom in/out (`driveCameraZoom`, clamped 0.35–2.5) |

The camera stays behind the car:

- Focus point — car center on the road (`carDrive.getFocusPoint()`)
- Offset — up and back (`DRIVE_CAMERA_UP`, `DRIVE_CAMERA_BACK`), scaled by zoom
- Look-ahead — slightly ahead of the car in its forward direction
- Smoothing — focus and position are lerped for stable motion

Initial zoom is scaled from the car’s bounding box length after load (reference length ~380 units).

## What you see

### Scene

| Element | Description |
|---------|-------------|
| **Sky** | Gradient dome, warm sun, soft fog |
| **Mountains** | Two-layer 2D backdrop (far light grey, near dark grey) |
| **Clouds** | Billboard sprites |
| **Ground** | `#393534` base plane + LED point grid |
| **Lighting** | Hemisphere + ambient + directional sun with shadows |

Fog and background colors come from `DRIVE_SCENE_COLORS` in `carmove/driveEnvironment.js`.

### Ground grid and ripples

The ground mimics the FF VR grid in `carmove/move.js`:

1. **LED point grid** (`carmove/driveGround.js`) — 32×32 diagonal dashes, infinite treadmill wrapping under the car.
2. **Ripple simulation** (`carmove/rippleGen.js`) — GPU heightmap pass; waves push grid points up and affect opacity.
3. **Car-linked updates** — each drive frame, `groundSystem.update(carDrive.props)` moves the grid origin and injects ripples when `speed` or `frameDist` is non-zero.

Ripple strength scales with speed and movement. The grid is rebuilt when the GLB loads so tile size, wave height, and point size match the car.

### Scaling from your GLB

On load, `computeDriveMetrics(carModel)` (`carmove/driveMetrics.js`) measures the model bounding box and sets:

| Metric | Rule (summary) |
|--------|----------------|
| `unitScale` | `carLength / 10` |
| `tileSize` | Same as `unitScale` |
| `waveAmp` | `tileSize × 0.42` |
| `pointScale` | Clamped from car length vs 380 ref |
| `groundRadius` | `max(12000, carLength × 36)` |
| `resetRadius` | `max(4000, carLength × 22)` |
| `rippleSize` | Clamped from car length |

These values are passed to `CarDrive` and `rebuildDriveGround()`.

## Architecture

```
index.html          Bottom bar: mode switch, drive hints
car_main.js         Mode logic, camera, render loop
├── MODE.INSPECT    Showroom + OrbitControls + GUI
└── MODE.DRIVE      carDrive + driveEnvironment + follow camera

carmove/
├── carDrive.js         Keyboard → physics → car transform
├── driveEnvironment.js Sky, mountains, clouds, sun, ground hookup
├── driveGround.js      Point grid shaders + ripple hookup
├── driveMetrics.js     GLB bounds → scale metrics
├── rippleGen.js        GPU ripple heightmap
└── move.js             Original FF VR bundle (reference only)
```

### Render loop (Drive)

Each frame in `render()` when `appMode === MODE.DRIVE`:

1. `carDrive.update(delta)` — physics, position, wheels
2. `updateDriveCamera()` — follow + orbit + zoom
3. `driveEnvironment.groundSystem.update(props)` — grid scroll + ripples
4. `renderer.render(scene, camera)`

## File map

| File | Role in Drive mode |
|------|---------------------|
| `car_main.js` | Mode switching, camera, input, main loop |
| `index.html` | Drive UI and hints |
| `carmove/carDrive.js` | Driving physics and wheel animation |
| `carmove/driveEnvironment.js` | Outdoor scene assembly |
| `carmove/driveGround.js` | FF-style grid + base plane |
| `carmove/rippleGen.js` | Ripple render targets |
| `carmove/driveMetrics.js` | Car-size-based tuning |
| `models/mer55_test1.gltf` | Default car model |

## Tips

- Click the canvas after switching to Drive so keyboard focus is on the page.
- If the car drifts far from the origin, it auto-resets (`resetRadius` from metrics).
- Paint presets and material GUI only apply in Inspect mode.
- To tune drive feel, edit `FF91` constants in `carmove/carDrive.js`.
- To tune ground look, edit colors in `driveGround.js` and `DRIVE_SCENE_COLORS` in `driveEnvironment.js`.

## Inspect vs Drive (quick comparison)

| | Inspect | Drive |
|---|---------|-------|
| Environment | Indoor showroom | Outdoor sky + mountains |
| Camera | Orbit (mouse) | Follow car |
| Car motion | Optional turntable | WASD / arrows |
| Ground | Studio floor | LED grid + ripples |
| GUI | lil-gui + paint preset | Hidden |
| Ground color | Warm studio | `#393534` |
