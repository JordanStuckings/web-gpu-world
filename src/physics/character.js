// Character physics - arcade-style movement with gravity

export class CharacterPhysics {
  constructor() {
    this.position = new Float32Array([0, 1, 0]);
    this.velocity = new Float32Array([0, 0, 0]);
    this.yaw = 0;

    // Physics constants
    this.gravity = -18;
    this.runSpeed = 5;
    this.jumpVelocity = 7.5;
    this.groundY = 1;
  }

  update(dt, moveDir, camYaw) {
    // Check if on ground
    const onGround = Math.abs(this.position[1] - this.groundY) < 0.002 || this.position[1] < this.groundY + 1e-3;

    // Only update horizontal velocity when on ground (WoW-style momentum lock)
    if (onGround) {
      // Calculate movement direction in world space
      const fwd = [-Math.sin(camYaw), 0, -Math.cos(camYaw)];
      const rgt = [Math.cos(camYaw), 0, -Math.sin(camYaw)];

      let desired = [
        rgt[0] * moveDir.x + fwd[0] * moveDir.y,
        0,
        rgt[2] * moveDir.x + fwd[2] * moveDir.y
      ];

      const len = Math.hypot(desired[0], desired[2]);
      if (len > 0) {
        desired[0] /= len;
        desired[2] /= len;
      }

      // Apply movement speed - only on ground
      this.velocity[0] = desired[0] * this.runSpeed;
      this.velocity[2] = desired[2] * this.runSpeed;
    }
    // When airborne, horizontal velocity is locked and doesn't change

    // Apply gravity
    this.velocity[1] += this.gravity * dt;

    // Update position
    this.position[0] += this.velocity[0] * dt;
    this.position[1] += this.velocity[1] * dt;
    this.position[2] += this.velocity[2] * dt;

    // Ground collision
    if (this.position[1] < this.groundY) {
      this.position[1] = this.groundY;
      this.velocity[1] = 0;
    }

    // Rotate character to face movement direction (only when moving)
    const horizontalSpeed = Math.hypot(this.velocity[0], this.velocity[2]);
    if (horizontalSpeed > 0.001) {
      const target = Math.atan2(this.velocity[0], this.velocity[2]);
      const diff = ((target - this.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      this.yaw += diff * Math.min(12 * dt, 1);
    }
  }

  tryJump() {
    const grounded = Math.abs(this.position[1] - this.groundY) < 0.002 && Math.abs(this.velocity[1]) < 0.05;
    if (grounded) {
      this.velocity[1] = this.jumpVelocity;
    }
  }

  getPosition() {
    return this.position;
  }

  getYaw() {
    return this.yaw;
  }
}
