#!/usr/bin/env node

/**
 * Watch mode for WebGPU World
 * - Watches src/ directory for changes
 * - Automatically rebuilds on file changes
 * - Opens the built file in browser on first run
 */

import { watch } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const srcDir = resolve(projectRoot, 'src');
const distFile = resolve(projectRoot, 'dist/index.html');

let buildTimeout = null;
let isBuilding = false;
let firstBuild = true;

/**
 * Run the build script
 */
function runBuild() {
  if (isBuilding) return;

  isBuilding = true;
  console.log('\n🔄 Change detected, rebuilding...');

  const buildProcess = spawn('node', ['build-tools/bundle.js'], {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  buildProcess.on('close', (code) => {
    isBuilding = false;

    if (code === 0) {
      console.log('✨ Rebuild complete!\n');

      // Open browser on first build
      if (firstBuild) {
        firstBuild = false;
        console.log('🌐 Opening in browser...\n');
        spawn('xdg-open', [distFile], { detached: true });
      }
    } else {
      console.error(`❌ Build failed with code ${code}\n`);
    }
  });
}

/**
 * Debounced build trigger
 */
function triggerBuild() {
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }

  buildTimeout = setTimeout(() => {
    runBuild();
  }, 100);
}

// Initial build
console.log('👀 Starting watch mode...\n');
runBuild();

// Watch for changes
const watcher = watch(srcDir, { recursive: true }, (eventType, filename) => {
  if (filename && (filename.endsWith('.js') || filename.endsWith('.wgsl'))) {
    console.log(`📝 ${filename} changed`);
    triggerBuild();
  }
});

console.log(`📂 Watching ${srcDir} for changes...`);
console.log('Press Ctrl+C to stop\n');

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watch mode...');
  watcher.close();
  process.exit(0);
});
