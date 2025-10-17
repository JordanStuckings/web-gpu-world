# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WebGPU-based 3D world renderer featuring third-person character controls, procedural ground rendering, and static scene props. The codebase uses a **modular ES6 architecture** for development and a **custom build system** that bundles everything into a single standalone HTML file for production.

## Development Commands

### Development Mode
```bash
# Start dev server with ES6 modules
npm run dev
# or
python -m http.server 8000

# For Replit environment (serves on port 80)
static-web-server -w ./.config/static-web-server.toml
```

Open http://localhost:8000 in a browser that supports WebGPU (Chrome/Edge 113+, Safari 18+).

### Production Build
```bash
npm run build
```

Creates `dist/index.html` - a standalone file with all JavaScript and WGSL shaders inlined. No server or network requests needed.

### Testing WebGPU Support
The application performs progressive fallback through multiple canvas format/alpha mode combinations if the preferred format fails. Check browser console for WebGPU availability.

## Code Architecture

### Project Structure
```
src/
├── shaders/           # WGSL shader files
│   ├── sky.wgsl      # Fullscreen sky rendering
│   └── lit.wgsl      # Lit geometry with procedural patterns
├── rendering/         # WebGPU rendering layer
│   ├── webgpu.js     # Device initialization and canvas setup
│   ├── pipelines.js  # Pipeline creation
│   ├── uniforms.js   # Uniform buffer management
│   └── camera.js     # Third-person camera system
├── geometry/          # Mesh generation
│   └── primitives.js # Plane and box primitives (interleaved P+N)
├── math/              # Matrix math utilities
│   └── matrix.js     # 4x4 matrix operations (no external libs)
├── input/             # Input handling
│   └── controls.js   # InputController class (keyboard + touch)
├── physics/           # Character physics
│   └── character.js  # CharacterPhysics class (arcade-style)
├── scene/             # Scene building
│   └── props.js      # Static prop creation and transforms
└── main.js           # Application entry point

build-tools/
└── bundle.js         # Custom zero-dependency bundler
```

### Rendering Pipeline
The application uses a **single-pass rendering architecture** with no depth buffer:
1. **Sky pass**: Fullscreen triangle with solid gradient color
2. **Lit geometry pass**: Painter's algorithm ordering (back-to-front)
   - Ground plane (procedural checker pattern)
   - Static props (huts, posts, rocks, trees)
   - Hero character (movable)

### Shader System
Two shader modules in WGSL (located in `src/shaders/`):
- **sky.wgsl**: Minimal fullscreen pass (currently solid color)
- **lit.wgsl**: Unified shader for all 3D geometry with two rendering modes:
  - `color.w == 0.0`: Procedural checker pattern using world-space XZ coordinates and `uvScale`
  - `color.w == 1.0`: Solid color from `color.xyz`

### Uniform Buffer Layout
- **Group 0 (Globals)**: `viewProj` matrix (mat4x4) + light direction (vec4)
- **Group 1 (Per-Object)**: `model` matrix (mat4x4) + `color` (vec4) + `uvScale` (vec2) + padding

### Geometry System
All meshes use **interleaved vertex format** (24 bytes/vertex):
- Position: `float32x3` at offset 0
- Normal: `float32x3` at offset 12

Primitive types (in `src/geometry/primitives.js`):
- `createPlane(device, size)`: Ground quad
- `createBox(device, w, h, d)`: Boxes for hero, buildings, props, tree trunks/tops

### Input Handling
`InputController` class (`src/input/controls.js`) implements **dual-system input** supporting desktop and mobile:
- **Desktop**: WASD/Arrow keys for movement, mouse drag for camera, Space to jump
- **Mobile**: Touch split-screen (left half = movement joystick, right half = camera look), double-tap to jump

State tracked per pointer ID (`leftId`, `rightId`) to support multi-touch.

### Physics & Movement
`CharacterPhysics` class (`src/physics/character.js`) - arcade-style with simplified physics:
- Ground speed: 5 units/sec, air speed: 3 units/sec
- Gravity: -18 units/sec²
- Jump velocity: 7.5 units/sec
- Ground detection: `y < 1.002` with near-zero vertical velocity

`Camera` class (`src/rendering/camera.js`) - third-person orbiting camera:
- Orbits character at fixed distance (6 units)
- Yaw/pitch controlled by input

### Scene Structure
Static scene elements are pre-generated as `props[]` array with baked transformation matrices (see `buildSceneProps()` in `src/scene/props.js`). The hero character's transformation is computed per-frame based on `charPos`, `charYaw`, and camera input.

## Key Implementation Details

### Canvas Configuration
The application tests multiple format/alpha combinations due to inconsistent WebGPU support across devices:
```javascript
combos = [
  {fmt: getPreferredCanvasFormat(), alpha:'opaque'},
  {fmt: 'bgra8unorm', alpha:'opaque'},
  {fmt: 'rgba8unorm', alpha:'opaque'},
  // ... + premultiplied variants
]
```

### Matrix Math
All matrix operations are inline implementations in `src/math/matrix.js` (no external libraries):
- `multiply(out, a, b)`: 4x4 matrix multiplication
- `perspective(out, fovy, aspect, near, far)`: Perspective projection
- `lookAt(out, eye, center, up)`: View matrix
- `rotateY(out, radians)`: Y-axis rotation
- `translate(out, vec3)`: Translation matrix
- `scale(out, sx, sy, sz)`: Scale matrix

### Frame Loop
1. Compute delta time (clamped to 50ms)
2. Process input (keyboard/touch)
3. Update physics (velocity, position, ground collision)
4. Update character yaw (smooth rotation toward movement direction)
5. Compute camera matrices and write globals uniform
6. Write hero object uniform with current transform
7. Encode single render pass (sky → ground → props → hero)
8. Submit and request next frame

## Build System

### Custom Bundler
The project uses a **custom zero-dependency bundler** (`build-tools/bundle.js`):
- Recursively resolves ES6 module imports
- Builds dependency graph (depth-first processing)
- Strips `import`/`export` statements
- Inlines WGSL shaders by replacing `loadShader()` calls
- Outputs standalone HTML with hardcoded template (no dependency on `index.html`)

### How It Works
1. Starts from `src/main.js` entry point
2. Processes all module dependencies
3. Inlines shader files from `src/shaders/`
4. Wraps bundled code in async IIFE
5. Generates `dist/index.html` (~25KB unminified)

### Why Custom?
- Zero dependencies (just Node.js stdlib)
- Transparent, easy to understand
- Tailored for this project's needs
- No configuration required
- Template is self-contained in build script

## Important Constraints

- **No depth buffer**: Objects must be drawn in correct painter's order
- **No textures**: All materials use either procedural patterns or solid colors
- **Modular in dev, single file in prod**: ES6 modules for development, bundled for production
- **Mobile-first input**: Touch controls are primary; keyboard is supplementary

## Common Modifications

### Adding New Props
In `src/scene/props.js`:
1. Create geometry using `createBox()` or `createPlane()` from `src/geometry/primitives.js`
2. Build transformation matrix with `makeTransform()` or `makeTransformScale()`
3. Choose RGB color
4. Add to `props[]` in `buildSceneProps()` using `createSolidProp(device, pipeline, mesh, matrix, colorRGB)`

### Adjusting Physics
Key constants in `src/physics/character.js` (CharacterPhysics constructor):
- `gravity`: Vertical acceleration (-18)
- `runSpeed`: Ground movement speed (5)
- `jumpVelocity`: Initial jump velocity (7.5)
- `groundY`: Ground plane height (1)

Camera distance in `src/rendering/camera.js` (Camera constructor):
- `distance`: Camera orbit radius (6)
- `heightOffset`: Camera focus offset (0.9)

### Modifying Procedural Ground
Checker pattern logic in `checker()` function (`src/shaders/lit.wgsl`). Adjust `uvScale` in `createGroundObject()` (`src/scene/props.js`, line ~604) to change tile density.

### Working with Demos
Historical milestone builds are archived in `demos/`:
- `demos/v1-working-baseline.html`: Original single-file version before refactoring
- See `demos/README.md` for version details
