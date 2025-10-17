// Main application - orchestrates all modules

import { initWebGPU, loadShader } from './rendering/webgpu.js';
import { createSkyPipeline, createLitPipeline } from './rendering/pipelines.js';
import { createGlobalsBuffer, writeGlobals, createObjectBuffer, writeObjectUniforms } from './rendering/uniforms.js';
import { createPlane, createBox } from './geometry/primitives.js';
import { InputController } from './input/controls.js';
import { CharacterPhysics } from './physics/character.js';
import { Camera } from './rendering/camera.js';
import { buildSceneProps, createGroundObject } from './scene/props.js';
import { identity, rotateY, translate, multiply } from './math/matrix.js';

export async function main() {
  const hud = document.getElementById('status');
  const canvas = document.getElementById('gfx');
  canvas.tabIndex = 0;
  canvas.focus();

  const log = (s) => hud.textContent = s;

  try {
    // Initialize WebGPU
    const { device, context, getAspect, getFormat } = await initWebGPU(canvas);
    log('WebGPU initialized');

    // Load shaders
    const [skyWGSL, litWGSL] = await Promise.all([
      loadShader('src/shaders/sky.wgsl'),
      loadShader('src/shaders/lit.wgsl')
    ]);

    // Create pipelines
    const format = getFormat().fmt;
    const skyPipeline = createSkyPipeline(device, format, skyWGSL);
    const litPipeline = createLitPipeline(device, format, litWGSL);

    // Create geometry
    const meshes = {
      ground: createPlane(device, 300),
      hero: createBox(device, 1, 2, 1),
      hutBase: createBox(device, 3, 1.4, 3),
      hutRoof: createBox(device, 3.2, 0.8, 3.2),
      post: createBox(device, 0.2, 1.2, 0.2),
      rock1: createBox(device, 1.2, 0.7, 0.9),
      rock2: createBox(device, 0.9, 0.5, 1.1),
      treeTrunk: createBox(device, 0.4, 1.6, 0.4),
      treeTop: createBox(device, 1.6, 1.0, 1.6)
    };

    // Create uniform buffers
    const globals = createGlobalsBuffer(device, litPipeline);
    const groundObj = createGroundObject(device, litPipeline, meshes.ground);
    const heroObj = createObjectBuffer(device, litPipeline);
    const sceneProps = buildSceneProps(device, litPipeline, meshes);

    // Initialize systems
    const input = new InputController(canvas);
    const character = new CharacterPhysics();
    const camera = new Camera();

    // Connect jump input to physics
    input.onJump = () => character.tryJump();

    // Game loop
    let lastTime = performance.now();
    let frames = 0, fps = 0, fpsTime = 0;

    function loop() {
      const now = performance.now();
      let dt = (now - lastTime) / 1000;
      if (dt > 0.05) dt = 0.05;
      lastTime = now;

      // FPS counter
      frames++;
      fpsTime += dt;
      if (fpsTime >= 0.5) {
        fps = Math.round(frames / fpsTime);
        frames = 0;
        fpsTime = 0;
      }

      // Process input
      input.updateFromKeyboard();
      const movement = input.getMovement();
      const cam = input.getCamera();

      // Update physics
      character.update(dt, movement, cam.yaw);

      // Update camera
      camera.update(getAspect(), character.getPosition(), cam.yaw, cam.pitch);
      writeGlobals(device, globals.buffer, camera.getViewProj());

      // Update hero object matrix
      const R = identity();
      const T = identity();
      const M = identity();
      rotateY(R, character.getYaw());
      translate(T, character.getPosition());
      multiply(M, T, R);
      writeObjectUniforms(device, heroObj.buffer, M, [0.85, 0.70, 0.25, 1], [1, 1]);

      // Render
      const view = context.getCurrentTexture().createView();
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view,
          loadOp: 'clear',
          clearValue: { r: 0.58, g: 0.72, b: 0.92, a: 1 },
          storeOp: 'store'
        }]
      });

      // Sky pass
      pass.setPipeline(skyPipeline);
      pass.draw(3);

      // Lit geometry (painter's order)
      pass.setPipeline(litPipeline);
      pass.setBindGroup(0, globals.bindGroup);

      // Ground
      pass.setBindGroup(1, groundObj.bindGroup);
      drawMesh(pass, meshes.ground);

      // Props
      for (const prop of sceneProps) {
        pass.setBindGroup(1, prop.bindGroup);
        drawMesh(pass, prop.mesh);
      }

      // Hero
      pass.setBindGroup(1, heroObj.bindGroup);
      drawMesh(pass, meshes.hero);

      pass.end();
      device.queue.submit([encoder.finish()]);

      // Update HUD
      log(`swap: ${getFormat().fmt} • ${canvas.width}×${canvas.height} • FPS ${fps}`);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

  } catch (err) {
    log(err.message);
  }
}

function drawMesh(pass, mesh) {
  pass.setVertexBuffer(0, mesh.vb);
  pass.setIndexBuffer(mesh.ib, 'uint16');
  pass.drawIndexed(mesh.count);
}
