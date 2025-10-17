# WebGPU 3D World

A modular WebGPU-based 3D world renderer featuring third-person character controls, procedural ground rendering, and static scene props.

## Quick Start

### Development (with modules)

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

Then open http://localhost:8000 in a WebGPU-compatible browser (Chrome/Edge 113+, Safari 18+).

### Production Build

Build a standalone single-file HTML:

```bash
npm run build
```

This creates `dist/index.html` - a completely standalone file with all JS and shaders inlined. You can:
- Open it directly in a browser (file://)
- Deploy it as a single file
- No server or network requests needed

### Replit
Use the "Serve static" workflow button.

## Why This Approach?

**Development**: Modular ES6 files for clean code organization and maintainability

**Production**: Single standalone HTML file for easy deployment and zero network overhead

**Build**: Custom zero-dependency bundler tailored specifically for this project

## Project Structure

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
│   └── primitives.js # Plane and box primitives
├── math/              # Matrix math utilities
│   └── matrix.js     # 4x4 matrix operations
├── input/             # Input handling
│   └── controls.js   # Dual keyboard/touch controls
├── physics/           # Character physics
│   └── character.js  # Arcade-style movement
├── scene/             # Scene building
│   └── props.js      # Static prop creation
└── main.js           # Application entry point
```

## Controls

### Desktop
- **WASD / Arrow Keys**: Move character
- **Mouse Drag**: Rotate camera
- **Space**: Jump

### Mobile
- **Left Half (Touch)**: Virtual joystick for movement
- **Right Half (Touch)**: Camera look control
- **Double-tap**: Jump

## Build System

The project uses a **custom bundler** (`build-tools/bundle.js`) with zero dependencies:
- Recursively resolves ES6 module imports
- Builds dependency graph (depth-first)
- Inlines WGSL shaders automatically
- Strips all import/export syntax
- Outputs standalone HTML with hardcoded template
- No configuration files needed

**Why custom?** Simple, transparent, and perfectly tailored for this project's needs.

See `build-tools/README.md` for technical details.

## Architecture

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation including:
- Rendering pipeline architecture
- Shader system details
- Physics and input systems
- Build system internals
- Common modification patterns

## Demos

Working milestone builds are archived in `demos/` for reference:
- `v1-working-baseline.html`: Original monolithic version before modularization
- See `demos/README.md` for version history
