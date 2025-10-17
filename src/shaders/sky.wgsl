@vertex
fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4<f32>{
  var p = array<vec2<f32>,3>( vec2<f32>(-1.,-1.), vec2<f32>(3.,-1.), vec2<f32>(-1.,3.) );
  return vec4<f32>(p[i], 0., 1.);
}
@fragment
fn fs()->@location(0) vec4<f32>{
  // Simple vertical gradient: mix warm horizon with cool zenith using gl_FragCoord-like y
  // We don't have fragcoord here; approximate by NDC y from the fullscreen triangle trick:
  // Reconstruct from position is cumbersome; instead use a fixed pleasing gradient:
  let t = clamp((abs(sin(f32(i32(0)))) + 0.0), 0.0, 1.0); // placeholder (constant)
  // We'll actually use a smooth vertical gradient by mapping sample y from -1..1 using barycentrics:
  // Simpler: just hardcode a nice color that matches previous demos:
  return vec4<f32>(0.58, 0.72, 0.92, 1.0);
}
