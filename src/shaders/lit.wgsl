struct Globals { viewProj: mat4x4<f32>, light: vec4<f32> };
struct ObjectU { model: mat4x4<f32>, color: vec4<f32>, uvScale: vec2<f32>, _pad: vec2<f32> };

@group(0) @binding(0) var<uniform> G: Globals;
@group(1) @binding(0) var<uniform> O: ObjectU;

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) N: vec3<f32>,
  @location(1) wPos: vec3<f32>,
};

@vertex
fn vs(@location(0) P: vec3<f32>, @location(1) N: vec3<f32>) -> VSOut {
  var o: VSOut;
  let wp = O.model * vec4<f32>(P, 1.0);
  o.pos = G.viewProj * wp;
  o.N = normalize((O.model * vec4<f32>(N, 0.0)).xyz);
  o.wPos = wp.xyz;
  return o;
}

fn checker(cw: f32, cz: f32) -> vec3<f32> {
  // Procedural 2-tone checker using world XZ, tiled by uvScale
  let sx = floor(cw);
  let sz = floor(cz);
  let k = i32(sx + sz) & 1;
  let a = vec3<f32>(0.31, 0.78, 0.53);
  let b = vec3<f32>(0.23, 0.60, 0.42);
  return select(a, b, k == 1);
}

@fragment
fn fs(@location(0) N: vec3<f32>, @location(1) wPos: vec3<f32>) -> @location(0) vec4<f32> {
  let n = normalize(N);
  let l = normalize(-G.light.xyz);
  let diff = max(dot(n,l), 0.1);

  // If color.w == 0 → procedural checker (ground); else solid color (props/hero)
  var base = O.color.xyz;
  if (O.color.w == 0.0) {
    let uvx = wPos.x * O.uvScale.x;
    let uvz = wPos.z * O.uvScale.y;
    base = checker(uvx, uvz);
  }
  return vec4<f32>(base * diff, 1.0);
}
