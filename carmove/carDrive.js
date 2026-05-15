import * as THREE from 'three';

// Physics ported from carmove/move.js (CarProps + FF91)

const FF91 = {
  Accel: 1.35,
  Decel: -6,
  MaxVel: (45 * 1610) / 3600,
  MaxTurn: Math.PI * 0.12,
  CoastDrag: 2.8,
  WheelBase: 3.2,
  WheelTrack: 1.72,
  WheelDiam: 0.78,
  WheelCirc: 0.78 * Math.PI,
};

function normalize(val, min, max) {
  return Math.max(0, Math.min(1, (val - min) / (max - min)));
}

function normalizeQuadIn(val, min, max) {
  return Math.pow(normalize(val, min, max), 2);
}

function zTween(val, target, ratio) {
  return val + (target - val) * Math.min(ratio, 1);
}

class CarProps {
  constructor() {
    this.delta = 0;
    this.velocity = new THREE.Vector2();
    this.speed = 0;
    this.accel = 0;
    this.pos = new THREE.Vector2();
    this.keys = [];
    this.braking = 0;
    this.omega = 0;
    this.theta = -Math.PI / 2;
    this.wAngleInner = 0;
    this.wAngleOuter = 0;
    this.wAngleTarg = 0;
    this.wAngleSign = 0;
    this.frameDist = 0;
    this.longitMomentum = 0;
    this.lateralMomentum = 0;
  }

  onKeyDown(evt) {
    const driveKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
    if (driveKeys.includes(evt.code)) {
      evt.preventDefault();
    }
    if (this.keys.indexOf(evt.code) === -1) {
      this.keys.push(evt.code);
    }
  }

  onKeyUp(evt) {
    const i = this.keys.indexOf(evt.code);
    if (i !== -1) this.keys.splice(i, 1);
  }

  readKeyboardInput() {
    for (let i = 0; i < this.keys.length; i++) {
      switch (this.keys[i]) {
        case 'ArrowUp':
        case 'KeyW':
          this.accel += FF91.Accel;
          this.accel *= normalizeQuadIn(this.speed, FF91.MaxVel, FF91.MaxVel - 10);
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.accel += FF91.Decel;
          this.braking = 1;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.wAngleTarg += FF91.MaxTurn;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.wAngleTarg -= FF91.MaxTurn;
          break;
        default:
          break;
      }
    }
  }

  update(delta) {

    if (delta <= 0) return false;

    this.delta = Math.min(delta, 0.05);

    this.accel = 0;
    this.braking = 0;
    this.wAngleTarg = 0;

    if (this.keys.length > 0) {
      this.readKeyboardInput();
    }

    this.accel *= this.delta;

    if (this.braking) {
      this.speed = Math.max(0, this.speed + this.accel);
    } else if (this.accel > 0) {
      this.speed += this.accel;
    }

    if (this.speed < 0) {
      this.speed = 0;
      this.accel = 0;
    }

    this.frameDist = this.speed * this.delta;
    this.wAngleTarg *= normalizeQuadIn(this.speed, FF91.MaxVel + 10, 3);
    this.wAngleInner = zTween(this.wAngleInner, this.wAngleTarg, this.delta * 2);
    this.wAngleSign = this.wAngleInner > 0.001 ? 1 : this.wAngleInner < -0.001 ? -1 : 0;

    this.omega = (this.wAngleInner * this.speed) / FF91.WheelBase;
    this.theta += this.omega * this.delta;

    this.velocity.set(
      Math.cos(this.theta) * this.frameDist,
      -Math.sin(this.theta) * this.frameDist
    );
    this.pos.add(this.velocity);

    this.longitMomentum = zTween(this.longitMomentum, this.accel / this.delta, this.delta * 6);
    this.lateralMomentum = this.omega * this.speed;

    if (this.wAngleSign) {
      this.radFrontIn = FF91.WheelBase / Math.sin(this.wAngleInner);
      this.radBackIn = FF91.WheelBase / Math.tan(this.wAngleInner);
      this.radBackOut = this.radBackIn + FF91.WheelTrack * this.wAngleSign;
      this.wAngleOuter = Math.atan(FF91.WheelBase / this.radBackOut);
      this.radFrontOut = FF91.WheelBase / Math.sin(this.wAngleOuter);
    } else {
      this.radFrontOut = 100;
      this.radBackOut = 100;
      this.radBackIn = 100;
      this.radFrontIn = 100;
      this.wAngleOuter = 0;
    }

    return true;
  }
}

export class CarDrive {
  constructor(carModel, options = {}) {
    this.carModel = carModel;
    this.props = new CarProps();
    this.unitScale = options.unitScale ?? 10;
    this.resetRadius = options.resetRadius ?? 1200;
    this.modelYawOffset = options.modelYawOffset ?? 0;
    this.floorY = options.floorY ?? 0;
    this.visualTreadmill = options.visualTreadmill ?? true;
    this.centerOffset = options.centerOffset?.clone() ?? new THREE.Vector3();

    const box = new THREE.Box3().setFromObject(carModel);
    this.groundY = this.floorY + (carModel.position.y - box.min.y);

    this.wheels = {
      fl: options.wheels?.fl ?? carModel.getObjectByName('wheel_fl'),
      fr: options.wheels?.fr ?? carModel.getObjectByName('wheel_fr'),
      rl: options.wheels?.rl ?? carModel.getObjectByName('wheel_rl'),
      rr: options.wheels?.rr ?? carModel.getObjectByName('wheel_rr'),
    };

    this._onKeyDown = (e) => this.props.onKeyDown(e);
    this._onKeyUp = (e) => this.props.onKeyUp(e);
    this._bound = false;
  }

  bindKeys() {
    if (this._bound) return;
    window.addEventListener('keydown', this._onKeyDown, true);
    window.addEventListener('keyup', this._onKeyUp, true);
    this._bound = true;
  }

  unbindKeys() {
    if (!this._bound) return;
    window.removeEventListener('keydown', this._onKeyDown, true);
    window.removeEventListener('keyup', this._onKeyUp, true);
    this.props.keys.length = 0;
    this._bound = false;
  }

  reset() {
    this.props.pos.set(0, 0);
    this.props.speed = 0;
    this.props.theta = -Math.PI / 2;
    this.props.wAngleInner = 0;
    this.props.wAngleOuter = 0;
    this.applyToModel();
  }

  applyToModel() {
    const p = this.props;
    const s = this.unitScale;

    if (this.visualTreadmill) {
      this.carModel.position.set(
        -this.centerOffset.x,
        this.groundY,
        -this.centerOffset.z
      );
    } else {
      this.carModel.position.set(
        p.pos.x * s - this.centerOffset.x,
        this.groundY,
        -p.pos.y * s - this.centerOffset.z
      );
    }

    this.carModel.rotation.y = p.theta + this.modelYawOffset;
    this.carModel.rotation.x = 0;
    this.carModel.rotation.z = 0;

    this.updateWheels(p);
  }

  getFocusPoint(target) {

    target.set(
      this.carModel.position.x + this.centerOffset.x,
      this.groundY + 38,
      this.carModel.position.z + this.centerOffset.z
    );
    return target;

  }

  updateWheels(p) {
    const roll = -(p.frameDist / FF91.WheelCirc) * Math.PI * 2 * this.unitScale;
    const maxTurn = Math.PI / 9.69;

    const baseRoll = Math.max(roll, -maxTurn);
    let rotFL = baseRoll;
    let rotFR = baseRoll;
    let rotRL = baseRoll;
    let rotRR = baseRoll;

    if (p.wAngleSign !== 0) {
      const ratioFO = p.radFrontOut / p.radBackIn;
      const ratioBO = p.radBackOut / p.radBackIn;
      const ratioFI = p.radFrontIn / p.radBackIn;
      const ratioBI = 1;

      if (p.wAngleSign === 1) {
        rotFL = roll * ratioFI;
        rotRL = roll * ratioBI;
        rotFR = roll * ratioFO;
        rotRR = roll * ratioBO;
        this.setWheelSteer(this.wheels.fl, p.wAngleInner);
        this.setWheelSteer(this.wheels.fr, p.wAngleOuter);
      } else {
        rotFL = roll * ratioFO;
        rotRL = roll * ratioBO;
        rotFR = roll * ratioFI;
        rotRR = roll * ratioBI;
        this.setWheelSteer(this.wheels.fl, p.wAngleOuter);
        this.setWheelSteer(this.wheels.fr, p.wAngleInner);
      }
    } else {
      this.setWheelSteer(this.wheels.fl, 0);
      this.setWheelSteer(this.wheels.fr, 0);
    }

    this.spinWheel(this.wheels.fl, rotFL);
    this.spinWheel(this.wheels.fr, rotFR);
    this.spinWheel(this.wheels.rl, rotRL);
    this.spinWheel(this.wheels.rr, rotRR);
  }

  setWheelSteer(wheel, angle) {
    if (wheel) wheel.rotation.y = angle;
  }

  spinWheel(wheel, delta) {
    if (wheel) wheel.rotation.x += delta;
  }

  update(delta) {

    if (this.props.update(delta) === false) return;

    this.applyToModel();

    const distFromStart = this.visualTreadmill
      ? Math.hypot(this.props.pos.x, this.props.pos.y) * this.unitScale
      : Math.hypot(this.carModel.position.x, this.carModel.position.z);
    if (distFromStart > this.resetRadius) {
      this.reset();
    }

  }

  getHeadingRadians() {
    return this.props.theta + this.modelYawOffset;
  }

  getDriveForwardXZ(target) {

    target.set(0, 0, -1);
    target.applyQuaternion(this.carModel.quaternion);
    target.y = 0;
    if (target.lengthSq() < 1e-8) {
      target.set(0, 0, -1);
    } else {
      target.normalize();
    }
    return target;

  }

  getTravelWorldPosition(target) {

    const s = this.unitScale;
    if (this.visualTreadmill) {
      target.set(this.props.pos.x * s, this.groundY, -this.props.pos.y * s);
    } else {
      target.copy(this.carModel.position);
    }
    return target;

  }

  getSpeedKmh() {
    return this.props.speed * 3.6;
  }
}
