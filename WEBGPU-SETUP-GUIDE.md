# WebGPU Setup Guide

This project includes an interactive setup guide that automatically helps users enable WebGPU in their browser when it's not detected.

## Features

### 🎯 Automatic Detection
- Detects when WebGPU is unavailable
- Shows friendly, non-technical error message
- Automatically identifies the user's browser and platform

### 🔍 Platform Detection
The setup guide automatically detects:
- **Chrome** (desktop)
- **Microsoft Edge** (desktop)
- **Safari on iOS** (iPhone/iPad)
- **Safari on macOS** (desktop)

### 📱 Interactive Step-by-Step Guides
Each platform has a customized guide with:
- Clear, numbered steps
- Visual examples (code snippets, UI mockups)
- Platform-specific instructions
- Version requirements
- Progress tracking

### ✨ User Experience
- Beautiful dark-themed modal interface
- Responsive design (works on mobile and desktop)
- Platform selection with "Detected" badge for current browser
- Step-by-step navigation with Previous/Next buttons
- Visual progress indicator
- Smooth animations and transitions
- Mobile-optimized layout

## How It Works

### For Users

When visiting the site without WebGPU enabled:

1. **Initial Screen**: A modal appears explaining that WebGPU is required
2. **Platform Selection**: Choose your browser (detected browser is highlighted)
3. **Step-by-Step Guide**: Follow the numbered steps to enable WebGPU
4. **Completion**: Click "Done - Reload Page" to refresh and start using the app

### For Developers

The setup guide is automatically integrated into the error handling:

```javascript
// In src/main.js
try {
  const { device, context, getAspect, getFormat } = await initWebGPU(canvas);
  // ... app continues
} catch (err) {
  // Show setup guide if WebGPU is not available
  if (err.message.includes('WebGPU') || err.message.includes('adapter')) {
    const setupGuide = new WebGPUSetupGuide();
    setupGuide.show();
  }
}
```

### Testing Production Build

```bash
npm run build
# Open dist/index.html in a browser without WebGPU enabled
```

## Platform-Specific Instructions

### Chrome / Edge
1. Check browser version (113+)
2. Navigate to `chrome://flags` or `edge://flags`
3. Search for "unsafe webgpu"
4. Enable "Unsafe WebGPU Support"
5. Relaunch browser

### iOS Safari
1. Requires iOS 18+
2. Settings → Safari → Advanced → Feature Flags
3. Enable "WebGPU"
4. Close Safari completely and reopen

### macOS Safari
1. Requires macOS Sonoma (14.0)+ and Safari 18+
2. Safari → Settings → Advanced
3. Enable "Show features for web developers"
4. Click "Feature Flags"
5. Enable "WebGPU"
6. Restart Safari

## Architecture

### Module Structure
```
src/ui/setup-guide.js
├── WebGPUSetupGuide class
│   ├── detectPlatform() - Auto-detects browser/OS
│   ├── show() - Displays platform selection screen
│   ├── _showPlatformGuide() - Shows step-by-step guide
│   └── _getPlatformGuide() - Returns platform-specific steps
└── injectSetupGuideStyles() - Injects CSS into page
```

### Integration Points
- **src/main.js**: Imports setup guide and handles WebGPU errors
- **build-tools/bundle.js**: Automatically includes setup guide in build
- **dist/index.html**: Bundled output includes setup guide (~45KB total)

### Styling
- All styles are injected programmatically via JavaScript
- No external CSS dependencies
- Uses modern CSS (flexbox, grid, gradients)
- Mobile-responsive with media queries

## Customization

### Adding a New Platform

Edit `src/ui/setup-guide.js` and add to the `guides` object in `_getPlatformGuide()`:

```javascript
'new-browser': {
  title: 'Enable WebGPU in New Browser',
  subtitle: 'Available in version X+',
  steps: [
    {
      title: 'Step 1 Title',
      description: 'Step description with <strong>HTML</strong> support',
      visual: '<code class="url-code">new-browser://flags</code>',
      note: 'Optional note text'
    },
    // ... more steps
  ]
}
```

### Customizing Styles

Modify the CSS in `injectSetupGuideStyles()` in `src/ui/setup-guide.js`. Key CSS classes:
- `.webgpu-setup-guide-overlay` - Full-screen backdrop
- `.setup-guide-modal` - Main modal container
- `.platform-btn` - Platform selection buttons
- `.step` - Individual step container
- `.step.active` - Currently active step

### Changing Detection Logic

Update `detectPlatform()` method in `src/ui/setup-guide.js`:

```javascript
detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  // Add custom detection logic
  return 'platform-name';
}
```

## Browser Compatibility

The setup guide itself uses standard JavaScript and CSS that works in older browsers, so users can see the instructions even without WebGPU support.

**Setup Guide UI works in:**
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Internet Explorer 11+ (with minor CSS degradation)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements:
- [ ] Add video demonstrations for each platform
- [ ] Support for Firefox WebGPU flag instructions
- [ ] Localization/translation support
- [ ] Remember user's platform choice in localStorage
- [ ] Add troubleshooting section for common issues
- [ ] WebGPU feature detection (warn if partially supported)

## Credits

Created for the WebGPU World project to improve onboarding and reduce support requests from users unfamiliar with enabling experimental browser features.
