# Demo Archive

This folder contains milestone builds and working demos at key development stages.

## Versions

### v1-working-baseline.html
- **Date**: 2025-10-18
- **Description**: Original working demo with WebGPU 3rd-person character controls
- **Features**:
  - Single-file HTML implementation
  - WebGPU rendering with procedural ground checker pattern
  - Third-person camera with mobile touch controls
  - Arcade-style physics with jump mechanics
  - Static scene props (huts, posts, rocks, trees)
  - Painter's algorithm rendering (no depth buffer)
- **Status**: ✅ Tested and working
- **Purpose**: Baseline reference before major refactoring

---

## Usage

To view any demo, simply open the HTML file in a WebGPU-compatible browser:
- Chrome/Edge 113+
- Safari 18+

Or serve via HTTP:
```bash
python -m http.server 8000
# Then navigate to http://localhost:8000/demos/v1-working-baseline.html
```

## Adding New Milestones

When creating a new milestone demo:
1. Copy the working build to `demos/vX-description.html`
2. Update this README with the version details
3. Include date, features, and purpose for future reference
