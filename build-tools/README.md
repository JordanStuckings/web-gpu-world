# Build Tools

## Custom Bundler

This project uses a custom, zero-dependency bundler (`bundle.js`) designed specifically for this WebGPU application.

### Features

- **ES6 Module Resolution**: Recursively resolves and bundles all imports
- **Dependency Graph**: Depth-first processing ensures correct load order
- **WGSL Shader Inlining**: Automatically inlines `.wgsl` shader files as template strings
- **Export Stripping**: Removes ES6 module syntax for standalone execution
- **Single File Output**: Everything bundled into one standalone HTML file

### How It Works

1. Starts from `src/main.js` entry point
2. Recursively processes all imports (depth-first)
3. Strips `import` and `export` statements
4. Inlines WGSL shaders by replacing `loadShader()` calls with inline template strings
5. Wraps everything in an IIFE (Immediately Invoked Function Expression)
6. Generates HTML from hardcoded template with `{{SCRIPT}}` placeholder
7. Replaces placeholder with bundled JavaScript

### Usage

```bash
# Run the build
npm run build

# Or directly with node
node build-tools/bundle.js
```

### Output

- Location: `dist/index.html`
- Size: ~25KB (unminified)
- Modules bundled: 10
- Features: Fully standalone, no network requests, works with file://

### Why Custom?

We built a custom bundler instead of using webpack/rollup/esbuild because:
- Zero dependencies (just Node.js stdlib)
- Simple, transparent process (~180 lines of code)
- Specifically tailored for this project's needs
- Easy to understand and modify
- No configuration files needed
- Template is self-contained (no dependency on `index.html`)

### Self-Contained Template

The HTML template is hardcoded directly in `bundle.js`, making the build process completely independent of external files. Even if `index.html` is deleted, the build will still work perfectly.
