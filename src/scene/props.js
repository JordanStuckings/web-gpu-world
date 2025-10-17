// Scene prop creation and management

import { identity, translate, scale, multiply } from '../math/matrix.js';
import { createObjectBuffer, writeObjectUniforms } from '../rendering/uniforms.js';

function makeTransform(x, y, z) {
  const t = identity();
  return translate(t, [x, y, z]);
}

function makeTransformScale(x, y, z, sx, sy, sz) {
  const T = identity();
  const S = identity();
  const M = identity();
  translate(T, [x, y, z]);
  scale(S, sx, sy, sz);
  return multiply(M, T, S);
}

export function createSolidProp(device, pipeline, mesh, model, colorRGB) {
  const { buffer, bindGroup } = createObjectBuffer(device, pipeline);
  const color = [colorRGB[0], colorRGB[1], colorRGB[2], 1];
  writeObjectUniforms(device, buffer, model, color, [1, 1]);

  return { mesh, buffer, bindGroup };
}

export function createGroundObject(device, pipeline, mesh) {
  const { buffer, bindGroup } = createObjectBuffer(device, pipeline);
  const model = identity();
  const color = [0, 0, 0, 0]; // w=0 triggers procedural checker
  const uvScale = [0.5, 0.5]; // tile density
  writeObjectUniforms(device, buffer, model, color, uvScale);

  return { mesh, buffer, bindGroup };
}

export function buildSceneProps(device, pipeline, meshes) {
  const props = [];

  // Hut
  props.push(createSolidProp(device, pipeline, meshes.hutBase, makeTransform(6, 0.7, -6), [0.55, 0.40, 0.30]));
  props.push(createSolidProp(device, pipeline, meshes.hutRoof, makeTransform(6, 2.1, -6), [0.45, 0.15, 0.10]));

  // Fence posts
  for (let i = 0; i < 6; i++) {
    props.push(createSolidProp(device, pipeline, meshes.post, makeTransform(-8 + i * 1.6, 0.6, 5), [0.55, 0.45, 0.35]));
  }

  // Rocks
  props.push(createSolidProp(device, pipeline, meshes.rock1, makeTransform(-4, 0.35, -2), [0.50, 0.50, 0.55]));
  props.push(createSolidProp(device, pipeline, meshes.rock2, makeTransform(-5, 0.25, -3.5), [0.45, 0.45, 0.50]));

  // Trees
  const addTree = (x, z) => {
    props.push(createSolidProp(device, pipeline, meshes.treeTrunk, makeTransform(x, 0.8, z), [0.45, 0.28, 0.16]));
    props.push(createSolidProp(device, pipeline, meshes.treeTop, makeTransform(x, 1.8, z), [0.10, 0.55, 0.22]));
  };

  addTree(10, 4);
  addTree(12, -3);
  addTree(-10, -6);
  addTree(-12, 5);

  return props;
}
