// Geometry primitives - creates interleaved vertex buffers with Position + Normal

function interleavePN(device, P, N, I) {
  const verts = new Float32Array((P.length / 3) * 6);
  for (let i = 0; i < P.length / 3; i++) {
    verts.set(P.subarray(i * 3, i * 3 + 3), i * 6);
    verts.set(N.subarray(i * 3, i * 3 + 3), i * 6 + 3);
  }

  const vb = device.createBuffer({
    size: verts.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(vb, 0, verts);

  const ib = device.createBuffer({
    size: I.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(ib, 0, I);

  return { vb, ib, count: I.length };
}

export function createPlane(device, size = 300) {
  const s = size / 2;
  const P = new Float32Array([-s,0,-s, s,0,-s, s,0,s, -s,0,s]);
  const N = new Float32Array([0,1,0, 0,1,0, 0,1,0, 0,1,0]);
  const I = new Uint16Array([0,1,2, 0,2,3]);
  return interleavePN(device, P, N, I);
}

export function createBox(device, w = 1, h = 2, d = 1) {
  const x = w/2, y = h/2, z = d/2;
  const p = [], n = [], idx = [];

  const faces = [
    [1,0,0,  x,-y,-z, x,y,-z, x,y,z, x,-y,z],
    [-1,0,0, -x,-y,z, -x,y,z, -x,y,-z, -x,-y,-z],
    [0,1,0,  -x,y,z, x,y,z, x,y,-z, -x,y,-z],
    [0,-1,0, -x,-y,-z, x,-y,-z, x,-y,z, -x,-y,z],
    [0,0,1,  -x,-y,z, x,-y,z, x,y,z, -x,y,z],
    [0,0,-1, x,-y,-z, -x,-y,-z, -x,y,-z, x,y,-z]
  ];

  for (let f = 0; f < 6; f++) {
    const base = p.length / 3;
    const [nx, ny, nz, ...v] = faces[f];

    for (let i = 0; i < 4; i++) {
      p.push(v[i*3], v[i*3+1], v[i*3+2]);
      n.push(nx, ny, nz);
    }

    idx.push(base, base+1, base+2, base, base+2, base+3);
  }

  return interleavePN(device, new Float32Array(p), new Float32Array(n), new Uint16Array(idx));
}
