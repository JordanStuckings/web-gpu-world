// WebGPU initialization and canvas configuration

export async function initWebGPU(canvas) {
  if (!('gpu' in navigator)) {
    throw new Error('No WebGPU');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No adapter');
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu');

  // Progressive format fallback
  const combos = [
    { fmt: navigator.gpu.getPreferredCanvasFormat(), alpha: 'opaque' },
    { fmt: 'bgra8unorm', alpha: 'opaque' },
    { fmt: 'rgba8unorm', alpha: 'opaque' },
    { fmt: navigator.gpu.getPreferredCanvasFormat(), alpha: 'premultiplied' },
    { fmt: 'bgra8unorm', alpha: 'premultiplied' },
    { fmt: 'rgba8unorm', alpha: 'premultiplied' },
  ];

  let chosen = combos[0];
  let aspect = 1;

  function configure() {
    context.configure({ device, format: chosen.fmt, alphaMode: chosen.alpha });
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, (canvas.clientWidth * dpr) | 0);
    canvas.height = Math.max(1, (canvas.clientHeight * dpr) | 0);
    aspect = canvas.width / canvas.height;

    try {
      configure();
    } catch (e) {
      for (const c of combos) {
        try {
          context.configure({ device, format: c.fmt, alphaMode: c.alpha });
          chosen = c;
          break;
        } catch (_) {}
      }
    }
  }

  new ResizeObserver(resize).observe(canvas);
  resize();

  return { device, context, getAspect: () => aspect, getFormat: () => chosen };
}

export async function loadShader(url) {
  const response = await fetch(url);
  return await response.text();
}
