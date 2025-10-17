// Camera system - third-person orbiting camera

import { identity, perspective, lookAt, multiply } from '../math/matrix.js';

export class Camera {
  constructor() {
    this.distance = 6;
    this.heightOffset = 0.9;

    this.proj = identity();
    this.view = identity();
    this.viewProj = identity();
  }

  update(aspect, charPos, yaw, pitch) {
    // Projection matrix
    perspective(this.proj, 50 * Math.PI / 180, aspect, 0.05, 500);

    // Camera position orbiting character
    const cx = charPos[0];
    const cy = charPos[1] + this.heightOffset;
    const cz = charPos[2];

    const ex = cx + this.distance * Math.cos(pitch) * Math.sin(yaw);
    const ey = cy + this.distance * Math.sin(pitch);
    const ez = cz + this.distance * Math.cos(pitch) * Math.cos(yaw);

    // View matrix
    lookAt(this.view, [ex, ey, ez], [cx, cy, cz], [0, 1, 0]);

    // Combined view-projection
    multiply(this.viewProj, this.proj, this.view);
  }

  getViewProj() {
    return this.viewProj;
  }
}
