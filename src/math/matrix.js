// Matrix math utilities - all operations use Float32Array for GPU compatibility

export function identity() {
  return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}

export function multiply(out, a, b) {
  const A = a, B = b;
  out[0] = A[0]*B[0] + A[4]*B[1] + A[8]*B[2] + A[12]*B[3];
  out[1] = A[1]*B[0] + A[5]*B[1] + A[9]*B[2] + A[13]*B[3];
  out[2] = A[2]*B[0] + A[6]*B[1] + A[10]*B[2] + A[14]*B[3];
  out[3] = A[3]*B[0] + A[7]*B[1] + A[11]*B[2] + A[15]*B[3];
  out[4] = A[0]*B[4] + A[4]*B[5] + A[8]*B[6] + A[12]*B[7];
  out[5] = A[1]*B[4] + A[5]*B[5] + A[9]*B[6] + A[13]*B[7];
  out[6] = A[2]*B[4] + A[6]*B[5] + A[10]*B[6] + A[14]*B[7];
  out[7] = A[3]*B[4] + A[7]*B[5] + A[11]*B[6] + A[15]*B[7];
  out[8] = A[0]*B[8] + A[4]*B[9] + A[8]*B[10] + A[12]*B[11];
  out[9] = A[1]*B[8] + A[5]*B[9] + A[9]*B[10] + A[13]*B[11];
  out[10] = A[2]*B[8] + A[6]*B[9] + A[10]*B[10] + A[14]*B[11];
  out[11] = A[3]*B[8] + A[7]*B[9] + A[11]*B[10] + A[15]*B[11];
  out[12] = A[0]*B[12] + A[4]*B[13] + A[8]*B[14] + A[12]*B[15];
  out[13] = A[1]*B[12] + A[5]*B[13] + A[9]*B[14] + A[13]*B[15];
  out[14] = A[2]*B[12] + A[6]*B[13] + A[10]*B[14] + A[14]*B[15];
  out[15] = A[3]*B[12] + A[7]*B[13] + A[11]*B[14] + A[15]*B[15];
  return out;
}

export function perspective(out, fovy, aspect, near, far) {
  const q = 1 / Math.tan(fovy / 2);
  out[0] = q/aspect; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = q; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = far/(near-far); out[11] = -1;
  out[12] = 0; out[13] = 0; out[14] = (far*near)/(near-far); out[15] = 0;
  return out;
}

export function lookAt(out, eye, center, up) {
  let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
  const zl = Math.hypot(zx, zy, zz) || 1;
  zx /= zl; zy /= zl; zz /= zl;

  let rx = up[1]*zz - up[2]*zy;
  let ry = up[2]*zx - up[0]*zz;
  let rz = up[0]*zy - up[1]*zx;
  const rl = Math.hypot(rx, ry, rz) || 1;
  rx /= rl; ry /= rl; rz /= rl;

  const ux = zy*rz - zz*ry;
  const uy = zz*rx - zx*rz;
  const uz = zx*ry - zy*rx;

  out[0] = rx; out[1] = ux; out[2] = zx; out[3] = 0;
  out[4] = ry; out[5] = uy; out[6] = zy; out[7] = 0;
  out[8] = rz; out[9] = uz; out[10] = zz; out[11] = 0;
  out[12] = -(rx*eye[0] + ry*eye[1] + rz*eye[2]);
  out[13] = -(ux*eye[0] + uy*eye[1] + uz*eye[2]);
  out[14] = -(zx*eye[0] + zy*eye[1] + zz*eye[2]);
  out[15] = 1;
  return out;
}

export function rotateY(out, radians) {
  const c = Math.cos(radians), s = Math.sin(radians);
  out[0] = c; out[1] = 0; out[2] = s; out[3] = 0;
  out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
  out[8] = -s; out[9] = 0; out[10] = c; out[11] = 0;
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
  return out;
}

export function translate(out, vec) {
  out.set([1,0,0,0, 0,1,0,0, 0,0,1,0, vec[0], vec[1], vec[2], 1]);
  return out;
}

export function scale(out, sx, sy, sz) {
  out.set([sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1]);
  return out;
}
