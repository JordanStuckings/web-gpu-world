// Uniform buffer management for globals and per-object data

const SZ_G = (16 + 4) * 4; // viewProj + light(vec4)
const SZ_O = (16 + 4 + 2 + 2) * 4; // model + color(vec4) + uvScale(vec2) + pad

export function createGlobalsBuffer(device, pipeline) {
  const buffer = device.createBuffer({
    size: SZ_G,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer } }]
  });

  return { buffer, bindGroup };
}

export function writeGlobals(device, buffer, viewProj) {
  const data = new Float32Array(20);
  data.set(viewProj, 0);
  data.set([0.45, 0.85, 0.35, 0], 16); // light direction
  device.queue.writeBuffer(buffer, 0, data);
}

export function createObjectBuffer(device, pipeline) {
  const buffer = device.createBuffer({
    size: SZ_O,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(1),
    entries: [{ binding: 0, resource: { buffer } }]
  });

  return { buffer, bindGroup };
}

export function writeObjectUniforms(device, buffer, model, color, uvScale = [1, 1]) {
  const data = new Float32Array(24);
  data.set(model, 0);
  data.set(color, 16);
  data.set(uvScale, 20);
  device.queue.writeBuffer(buffer, 0, data);
}
