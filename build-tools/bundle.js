#!/usr/bin/env node

/**
 * Simple custom bundler for WebGPU World
 * - Resolves ES6 module imports
 * - Bundles all JS into a single file
 * - Inlines WGSL shaders
 * - Outputs standalone index.html
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Track processed modules to avoid duplicates
const processedModules = new Set();
const moduleContents = [];

/**
 * Resolve import path to absolute file path
 */
function resolveImport(fromFile, importPath) {
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const fromDir = dirname(fromFile);
    return resolve(fromDir, importPath);
  }
  // For absolute paths from project root
  return resolve(projectRoot, importPath);
}

/**
 * Extract imports from a JS file
 */
function extractImports(content) {
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      specifiers: match[1].trim(),
      path: match[2]
    });
  }

  return imports;
}

/**
 * Process a JavaScript module recursively
 */
function processModule(filePath) {
  if (processedModules.has(filePath)) {
    return;
  }

  processedModules.add(filePath);

  let content = readFileSync(filePath, 'utf-8');
  const imports = extractImports(content);

  // Process dependencies first (depth-first)
  for (const imp of imports) {
    const depPath = resolveImport(filePath, imp.path);
    processModule(depPath);
  }

  // Remove import statements
  content = content.replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\s*/g, '');
  content = content.replace(/import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"];?\s*/g, '');

  // Remove all export keywords - everything becomes globally available
  content = content.replace(/export\s+async\s+function\s+/g, 'async function ');
  content = content.replace(/export\s+function\s+/g, 'function ');
  content = content.replace(/export\s+class\s+/g, 'class ');
  content = content.replace(/export\s+const\s+/g, 'const ');
  content = content.replace(/export\s+{[^}]+}\s*;?\s*/g, '');

  moduleContents.push({
    path: filePath,
    content: content.trim()
  });
}

/**
 * Inline WGSL shader files
 */
function inlineShaders(bundledJS) {
  const shaderRegex = /loadShader\(['"]([^'"]+)['"]\)/g;
  const shaders = new Map();

  // Extract shader paths
  let match;
  while ((match = shaderRegex.exec(bundledJS)) !== null) {
    const shaderPath = match[1];
    const fullPath = resolve(projectRoot, shaderPath);

    if (existsSync(fullPath)) {
      const shaderContent = readFileSync(fullPath, 'utf-8');
      shaders.set(shaderPath, shaderContent);
    }
  }

  // Replace loadShader calls with inline strings
  let result = bundledJS;
  for (const [path, content] of shaders) {
    const escaped = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    result = result.replace(
      new RegExp(`loadShader\\(['"]${path.replace(/\//g, '\\/')}['"]\\)`, 'g'),
      `Promise.resolve(\`${escaped}\`)`
    );
  }

  return result;
}

/**
 * HTML template (hardcoded to avoid dependency on index.html)
 */
const HTML_TEMPLATE = `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>WebGPU 3rd-Person (Safe Sky + Procedural Ground + Props)</title>
<style>
  html,body{margin:0;height:100svh;width:100vw;overflow:hidden;background:#000;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
  canvas{position:fixed;inset:0;width:100%;height:100%;display:block;touch-action:none}
  #hud{position:fixed;left:8px;top:calc(8px + env(safe-area-inset-top));right:8px;pointer-events:none}
  #status{font:12px/1.35 system-ui;white-space:pre-wrap;background:rgba(0,0,0,.55);color:#e6eefb;border-radius:10px;padding:10px}
</style>
<canvas id="gfx"></canvas>
<div id="hud">
  <div id="status">boot…</div>
</div>
{{SCRIPT}}
`;

/**
 * Main build function
 */
function build() {
  console.log('🔨 Building WebGPU World...\n');

  // Start from main.js
  const mainPath = resolve(projectRoot, 'src/main.js');
  console.log('📦 Bundling modules...');
  processModule(mainPath);

  // Combine all modules
  let bundledJS = moduleContents.map(m => m.content).join('\n\n');

  // Inline shaders
  console.log('🎨 Inlining WGSL shaders...');
  bundledJS = inlineShaders(bundledJS);

  // Remove the loadShader function since we've inlined everything
  bundledJS = bundledJS.replace(/export\s+async\s+function\s+loadShader[^}]+}\s*/g, '');

  // Generate HTML from template
  const scriptTag = `<script>\n(async()=>{\n${bundledJS}\n\nawait main();\n})();\n</script>`;
  const html = HTML_TEMPLATE.replace('{{SCRIPT}}', scriptTag);

  // Write output
  const distDir = resolve(projectRoot, 'dist');
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  const outputPath = join(distDir, 'index.html');
  writeFileSync(outputPath, html, 'utf-8');

  console.log(`✅ Build complete: ${outputPath}`);
  console.log(`📊 Bundled ${processedModules.size} modules`);
  console.log(`📄 Output size: ${(html.length / 1024).toFixed(2)} KB`);
}

// Run build
build();
