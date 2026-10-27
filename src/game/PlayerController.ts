// Third-person Player Controller with smooth kinematics, coyote time, and mobile support
import * as THREE from 'three';
import { PlayerMeshGroup } from './proceduralAssets';
import { PhysicsEngine } from './physics';
import { soundManager } from '../audio/SoundSynth';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  pulse: boolean;
  virtualStick: { x: number; y: number }; // -1 to 1 from mobile touch joystick
}

export class PlayerController {
  public position = new THREE.Vector3(0, 1.3, 8);
  public velocity = new THREE.Vector3(0, 0, 0);
  public isGrounded = true;
  public rotationY = 0;

  // Abilities
  public pulseCooldown = 0; // seconds remaining
  public readonly maxPulseCooldown = 4.0;
  public isPulsing = false;
  public pulseProgress = 0; // 0 to 1 during expansion

  // Movement Tuning
  public readonly moveSpeed = 9.5; // m/s
  public readonly acceleration = 38.0;
  public readonly airAcceleration = 16.0;
  public readonly friction = 20.0;
  public readonly jumpForce = 11.2; // m/s

  // Feel & Responsiveness
  private coyoteTimer = 0;
  private readonly coyoteTime = 0.14; // seconds after leaving ground to allow jump
  private jumpBufferTimer = 0;
  private readonly jumpBuffer = 0.12;

  // Animation phase
  private walkPhase = 0;
  private landingSquash = 1.0;

  // Camera Orbit state
  public cameraYaw = 0;
  public cameraPitch = 0.28; // radians up
  public cameraDistance = 6.2;
  private readonly minPitch = -0.3;
  private readonly maxPitch = 1.1;

  // Reusable math objects (Zero GC in loop)
  private readonly _moveDir = new THREE.Vector3();
  private readonly _camOffset = new THREE.Vector3();
  private readonly _lookTarget = new THREE.Vector3();

  constructor(
    public mesh: PlayerMeshGroup,
    private physics: PhysicsEngine
  ) {
    this.position.copy(physics.defaultSpawn);
    this.mesh.position.copy(this.position);
  }

  public update(dt: number, input: InputState, camera: THREE.Camera) {
    // Ability cooldowns
    if (this.pulseCooldown > 0) {
      this.pulseCooldown = Math.max(0, this.pulseCooldown - dt);
    }
    if (this.isPulsing) {
      this.pulseProgress += dt * 2.2;
      if (this.pulseProgress >= 1.0) {
        this.isPulsing = false;
        this.pulseProgress = 0;
      }
    }

    // Trigger Pulse
    if (input.pulse && this.pulseCooldown <= 0) {
      this.pulseCooldown = this.maxPulseCooldown;
      this.isPulsing = true;
      this.pulseProgress = 0;
      soundManager.playPulse();
    }

    // Ground check via physics engine
    const groundInfo = this.physics.getGroundHeightAt(this.position.x, this.position.z);
    const wasGrounded = this.isGrounded;

    if (groundInfo.onGround && this.position.y <= groundInfo.groundY + 0.15 && this.velocity.y <= 0) {
      this.isGrounded = true;
      this.position.y = groundInfo.groundY;
      this.velocity.y = 0;
      this.coyoteTimer = this.coyoteTime;

      // Landing impact feedback
      if (!wasGrounded) {
        soundManager.playLanding();
        this.landingSquash = 0.82;
      }
    } else {
      this.isGrounded = false;
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
      // Apply gravity
      this.velocity.y += this.physics.gravity * dt;
    }

    // Jump buffering & coyote jump
    if (input.jump) {
      this.jumpBufferTimer = this.jumpBuffer;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      soundManager.playJump();
    }

    // Horizontal Movement relative to camera angle
    let inputX = (input.right ? 1 : 0) - (input.left ? 1 : 0) + input.virtualStick.x;
    let inputZ = (input.forward ? -1 : 0) + (input.backward ? 1 : 0) + input.virtualStick.y;

    // Clamp input vector length to 1
    const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
    if (len > 1) {
      inputX /= len;
      inputZ /= len;
    }

    const hasInput = len > 0.05;

    if (hasInput) {
      // Calculate world direction based on camera yaw
      const forwardX = -Math.sin(this.cameraYaw);
      const forwardZ = -Math.cos(this.cameraYaw);
      const rightX = -Math.sin(this.cameraYaw - Math.PI / 2);
      const rightZ = -Math.cos(this.cameraYaw - Math.PI / 2);

      const targetDirX = rightX * inputX - forwardX * inputZ;
      const targetDirZ = rightZ * inputX - forwardZ * inputZ;

      const targetAngle = Math.atan2(targetDirX, targetDirZ);
      // Smooth character rotation
      let diff = targetAngle - this.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotationY += diff * Math.min(1.0, dt * 14.0);

      const accel = this.isGrounded ? this.acceleration : this.airAcceleration;
      this.velocity.x += targetDirX * accel * dt;
      this.velocity.z += targetDirZ * accel * dt;

      // Clamp horizontal speed
      const hSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
      if (hSpeed > this.moveSpeed) {
        const factor = this.moveSpeed / hSpeed;
        this.velocity.x *= factor;
        this.velocity.z *= factor;
      }
    } else if (this.isGrounded) {
      // Apply ground friction
      const frictionStep = this.friction * dt;
      const hSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
      if (hSpeed > 0) {
        const newSpeed = Math.max(0, hSpeed - frictionStep);
        const factor = newSpeed / hSpeed;
        this.velocity.x *= factor;
        this.velocity.z *= factor;
      }
    }

    // Apply Velocity to Position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;

    // Void Check / Fall Respawn
    if (this.position.y < this.physics.voidThreshold) {
      this.respawn();
    }

    // Landing squash recovery
    this.landingSquash = THREE.MathUtils.damp(this.landingSquash, 1.0, 10.0, dt);

    // Update 3D Character Mesh
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;
    this.mesh.scale.set(
      1.0 + (1.0 - this.landingSquash) * 0.4,
      this.landingSquash,
      1.0 + (1.0 - this.landingSquash) * 0.4
    );

    // Animate Limbs
    const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    if (this.isGrounded && currentSpeed > 0.4) {
      this.walkPhase += dt * currentSpeed * 2.8;
      const swing = Math.sin(this.walkPhase) * 0.55;

      this.mesh.userData.leftLeg.rotation.x = swing;
      this.mesh.userData.rightLeg.rotation.x = -swing;
      this.mesh.userData.leftArm.rotation.x = -swing * 0.8;
      this.mesh.userData.rightArm.rotation.x = swing * 0.8;
    } else if (!this.isGrounded) {
      // Air pose: slight bend
      this.mesh.userData.leftLeg.rotation.x = 0.35;
      this.mesh.userData.rightLeg.rotation.x = -0.2;
      this.mesh.userData.leftArm.rotation.x = -0.4;
      this.mesh.userData.rightArm.rotation.x = -0.4;
    } else {
      // Idle breathing pose
      const idleWave = Math.sin(performance.now() * 0.003) * 0.06;
      this.mesh.userData.leftLeg.rotation.x = 0;
      this.mesh.userData.rightLeg.rotation.x = 0;
      this.mesh.userData.leftArm.rotation.x = idleWave;
      this.mesh.userData.rightArm.rotation.x = -idleWave;
    }

    // Smooth Camera Follow
    this.updateCamera(dt, camera);
  }

  public rotateCamera(deltaYaw: number, deltaPitch: number) {
    this.cameraYaw -= deltaYaw;
    this.cameraPitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.cameraPitch - deltaPitch));
  }

  private updateCamera(dt: number, camera: THREE.Camera) {
    // Calculate ideal camera position
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const sinYaw = Math.sin(this.cameraYaw);
    const cosYaw = Math.cos(this.cameraYaw);

    this._camOffset.set(
      sinYaw * cosPitch * this.cameraDistance,
      sinPitch * this.cameraDistance + 1.2,
      cosYaw * cosPitch * this.cameraDistance
    );

    const targetCamPos = this._moveDir.copy(this.position).add(this._camOffset);

    // Smooth exponential damp for camera
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 14.0, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 14.0, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 14.0, dt);

    this._lookTarget.set(this.position.x, this.position.y + 1.4, this.position.z);
    camera.lookAt(this._lookTarget);
  }

  public respawn() {
    this.position.copy(this.physics.lastCheckpoint);
    this.velocity.set(0, 0, 0);
    this.isGrounded = true;
    soundManager.playLanding();
  }
}
