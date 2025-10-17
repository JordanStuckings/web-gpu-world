// WebGPU Setup Guide - Interactive guides for enabling WebGPU

export class WebGPUSetupGuide {
  constructor() {
    this.overlay = null;
    this.currentStep = 0;
    this.currentPlatform = null;
  }

  detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isMacOS = /macintosh|mac os x/.test(ua) && !isIOS;
    const isChrome = /chrome|chromium|crios/.test(ua) && !/edg/.test(ua);
    const isEdge = /edg/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|chromium|crios/.test(ua);

    if (isIOS && isSafari) return 'ios-safari';
    if (isMacOS && isSafari) return 'macos-safari';
    if (isChrome) return 'chrome';
    if (isEdge) return 'edge';
    return 'chrome'; // Default fallback
  }

  show() {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'webgpu-setup-guide-overlay';
    this.overlay.innerHTML = `
      <div class="setup-guide-modal">
        <div class="setup-guide-header">
          <h2>WebGPU Required</h2>
          <p>This experience uses WebGPU, a modern graphics technology that needs to be enabled in your browser.</p>
        </div>

        <div class="setup-guide-content" id="setup-guide-content">
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this._showPlatformSelector();
  }

  _showPlatformSelector() {
    const detected = this.detectPlatform();
    const content = this.overlay.querySelector('#setup-guide-content');

    content.innerHTML = `
      <div class="platform-selector">
        <p class="selector-label">Select your browser to see setup instructions:</p>
        <div class="platform-buttons">
          <button class="platform-btn ${detected === 'chrome' ? 'detected' : ''}" data-platform="chrome">
            <span class="platform-icon">🌐</span>
            <span class="platform-name">Chrome</span>
            ${detected === 'chrome' ? '<span class="detected-badge">Detected</span>' : ''}
          </button>
          <button class="platform-btn ${detected === 'edge' ? 'detected' : ''}" data-platform="edge">
            <span class="platform-icon">🌊</span>
            <span class="platform-name">Edge</span>
            ${detected === 'edge' ? '<span class="detected-badge">Detected</span>' : ''}
          </button>
          <button class="platform-btn ${detected === 'ios-safari' ? 'detected' : ''}" data-platform="ios-safari">
            <span class="platform-icon">📱</span>
            <span class="platform-name">iOS Safari</span>
            ${detected === 'ios-safari' ? '<span class="detected-badge">Detected</span>' : ''}
          </button>
          <button class="platform-btn ${detected === 'macos-safari' ? 'detected' : ''}" data-platform="macos-safari">
            <span class="platform-icon">🍎</span>
            <span class="platform-name">macOS Safari</span>
            ${detected === 'macos-safari' ? '<span class="detected-badge">Detected</span>' : ''}
          </button>
        </div>
      </div>
    `;

    this._attachPlatformListeners();
  }

  _attachPlatformListeners() {
    const buttons = this.overlay.querySelectorAll('.platform-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const platform = e.currentTarget.dataset.platform;
        this._showPlatformGuide(platform);
      });
    });
  }

  _showPlatformGuide(platform) {
    this.currentPlatform = platform;
    this.currentStep = 0;

    const content = this.overlay.querySelector('#setup-guide-content');
    const guide = this._getPlatformGuide(platform);

    content.innerHTML = `
      <div class="guide-container">
        <button class="back-btn" id="back-to-platforms">← Back to platforms</button>

        <div class="guide-header">
          <h3>${guide.title}</h3>
          <p class="guide-subtitle">${guide.subtitle}</p>
        </div>

        <div class="steps-container">
          ${guide.steps.map((step, idx) => `
            <div class="step ${idx === 0 ? 'active' : ''}" data-step="${idx}">
              <div class="step-number">${idx + 1}</div>
              <div class="step-content">
                <h4>${step.title}</h4>
                <p>${step.description}</p>
                ${step.visual ? `<div class="step-visual">${step.visual}</div>` : ''}
                ${step.note ? `<p class="step-note">${step.note}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="guide-footer">
          <button class="btn-secondary" id="prev-step" disabled>Previous</button>
          <div class="step-indicator">
            <span class="current-step">1</span> / <span class="total-steps">${guide.steps.length}</span>
          </div>
          <button class="btn-primary" id="next-step">Next</button>
        </div>
      </div>
    `;

    this._attachGuideListeners(guide);
  }

  _attachGuideListeners(guide) {
    const backBtn = this.overlay.querySelector('#back-to-platforms');
    const prevBtn = this.overlay.querySelector('#prev-step');
    const nextBtn = this.overlay.querySelector('#next-step');
    const steps = this.overlay.querySelectorAll('.step');

    backBtn.addEventListener('click', () => this._showPlatformSelector());

    prevBtn.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--;
        this._updateStepDisplay(steps, prevBtn, nextBtn, guide.steps.length);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (this.currentStep < guide.steps.length - 1) {
        this.currentStep++;
        this._updateStepDisplay(steps, prevBtn, nextBtn, guide.steps.length);
      } else {
        // Last step - reload page
        window.location.reload();
      }
    });
  }

  _updateStepDisplay(steps, prevBtn, nextBtn, totalSteps) {
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === this.currentStep);
      step.classList.toggle('completed', idx < this.currentStep);
    });

    prevBtn.disabled = this.currentStep === 0;
    nextBtn.textContent = this.currentStep === totalSteps - 1 ? 'Done - Reload Page' : 'Next';

    const currentStepEl = this.overlay.querySelector('.current-step');
    currentStepEl.textContent = this.currentStep + 1;

    // Scroll to active step
    const activeStep = this.overlay.querySelector('.step.active');
    if (activeStep) {
      activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  _getPlatformGuide(platform) {
    const guides = {
      'chrome': {
        title: 'Enable WebGPU in Chrome',
        subtitle: 'Follow these steps to enable WebGPU',
        steps: [
          {
            title: 'Open Chrome Flags',
            description: 'Type or paste this URL into your address bar and press Enter:',
            visual: '<code class="url-code">chrome://flags</code>'
          },
          {
            title: 'Search for "Unsafe WebGPU"',
            description: 'In the search box at the top, type: <strong>unsafe webgpu</strong>',
            visual: '<div class="search-example">🔍 unsafe webgpu</div>'
          },
          {
            title: 'Enable the flag',
            description: 'Find "Unsafe WebGPU Support" and change the dropdown from "Default" to "Enabled".',
            visual: '<div class="flag-visual"><div class="flag-name">Unsafe WebGPU Support</div><div class="flag-dropdown">Default → <strong>Enabled</strong></div></div>',
            note: 'The "unsafe" label is temporary while WebGPU is being finalized.'
          },
          {
            title: 'Relaunch Chrome',
            description: 'Click the "Relaunch" button that appears at the bottom of the page, or close and reopen Chrome manually.',
            visual: '<div class="relaunch-btn-visual">🔄 Relaunch</div>'
          }
        ]
      },
      'edge': {
        title: 'Enable WebGPU in Edge',
        subtitle: 'Follow these steps to enable WebGPU',
        steps: [
          {
            title: 'Open Edge Flags',
            description: 'Type or paste this URL into your address bar:',
            visual: '<code class="url-code">edge://flags</code>'
          },
          {
            title: 'Search for "Unsafe WebGPU"',
            description: 'Use the search box to find: <strong>unsafe webgpu</strong>',
            visual: '<div class="search-example">🔍 unsafe webgpu</div>'
          },
          {
            title: 'Enable the feature',
            description: 'Locate "Unsafe WebGPU Support" and set it to "Enabled".',
            visual: '<div class="flag-visual"><div class="flag-name">Unsafe WebGPU Support</div><div class="flag-dropdown">Default → <strong>Enabled</strong></div></div>'
          },
          {
            title: 'Restart Edge',
            description: 'Click "Restart" when prompted, or close and reopen Edge.',
            visual: '<div class="relaunch-btn-visual">🔄 Restart</div>'
          }
        ]
      },
      'ios-safari': {
        title: 'Enable WebGPU in iOS Safari',
        subtitle: 'Follow these steps to enable WebGPU',
        steps: [
          {
            title: 'Open Safari Settings',
            description: 'On your home screen, open the Settings app and scroll down to find Safari.',
            visual: '<div class="ios-icon">⚙️ Settings → 🧭 Safari</div>'
          },
          {
            title: 'Go to Advanced settings',
            description: 'Scroll to the bottom of Safari settings and tap "Advanced".',
            visual: '<div class="ios-menu-item">Advanced ›</div>'
          },
          {
            title: 'Enable Feature Flags',
            description: 'In Advanced settings, tap "Feature Flags" (you may need to scroll).',
            visual: '<div class="ios-menu-item">Feature Flags ›</div>'
          },
          {
            title: 'Find and enable WebGPU',
            description: 'Scroll through the feature flags list and find "WebGPU". Toggle it ON (green).',
            visual: '<div class="ios-toggle">WebGPU <span class="toggle-on">ON</span></div>',
            note: 'The toggle should be green when enabled.'
          },
          {
            title: 'Close Safari completely',
            description: 'Swipe up from the bottom (or double-click home button) and swipe Safari away to close it completely, then reopen.',
            visual: '<div class="ios-gesture">↑ Swipe up on Safari preview</div>'
          }
        ]
      },
      'macos-safari': {
        title: 'Enable WebGPU in macOS Safari',
        subtitle: 'Follow these steps to enable WebGPU',
        steps: [
          {
            title: 'Open Safari Settings',
            description: 'In Safari, click the Safari menu in the top-left, then click "Settings" (or press ⌘,).',
            visual: '<code class="keyboard-shortcut">⌘ + ,</code>'
          },
          {
            title: 'Go to Advanced tab',
            description: 'Click the "Advanced" tab at the far right of the Settings window.',
            visual: '<div class="tab-visual">Advanced</div>'
          },
          {
            title: 'Enable Feature Flags',
            description: 'At the bottom of Advanced settings, check the box "Show features for web developers", then click "Feature Flags" button.',
            visual: '<div class="checkbox-visual">☑ Show features for web developers</div>'
          },
          {
            title: 'Enable WebGPU',
            description: 'In the Feature Flags window, search for "WebGPU" and enable it.',
            visual: '<div class="macos-toggle">WebGPU: <select><option>Enabled</option></select></div>',
            note: 'You may need to restart Safari after enabling.'
          },
          {
            title: 'Restart Safari',
            description: 'Quit Safari completely (⌘Q) and reopen it for changes to take effect.',
            visual: '<code class="keyboard-shortcut">⌘ + Q</code>'
          }
        ]
      }
    };

    return guides[platform] || guides.chrome;
  }

  hide() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

// Create and inject CSS styles
export function injectSetupGuideStyles() {
  if (document.getElementById('webgpu-setup-guide-styles')) return;

  const style = document.createElement('style');
  style.id = 'webgpu-setup-guide-styles';
  style.textContent = `
    .webgpu-setup-guide-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      overflow-y: auto;
    }

    .setup-guide-modal {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 20px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
    }

    .setup-guide-header {
      padding: 32px 32px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
    }

    .setup-guide-header h2 {
      margin: 0 0 12px 0;
      color: #fff;
      font-size: 28px;
      font-weight: 600;
    }

    .setup-guide-header p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      line-height: 1.5;
    }

    .setup-guide-content {
      padding: 32px;
      overflow-y: auto;
      flex: 1;
    }

    .platform-selector {
      text-align: center;
    }

    .selector-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      margin: 0 0 24px 0;
    }

    .platform-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 16px;
    }

    .platform-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px 16px;
      color: #fff;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
      font-size: 14px;
    }

    .platform-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(88, 166, 255, 0.5);
      transform: translateY(-2px);
    }

    .platform-btn.detected {
      border-color: rgba(88, 166, 255, 0.8);
      background: rgba(88, 166, 255, 0.15);
    }

    .platform-icon {
      font-size: 32px;
      line-height: 1;
    }

    .platform-name {
      font-weight: 500;
      font-size: 14px;
    }

    .detected-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #58a6ff;
      color: #000;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .guide-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .back-btn {
      background: transparent;
      border: none;
      color: #58a6ff;
      cursor: pointer;
      font-size: 14px;
      padding: 8px 0;
      text-align: left;
      transition: opacity 0.2s;
    }

    .back-btn:hover {
      opacity: 0.8;
    }

    .guide-header h3 {
      margin: 0 0 8px 0;
      color: #fff;
      font-size: 22px;
      font-weight: 600;
    }

    .guide-subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }

    .steps-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-height: 400px;
      overflow-y: auto;
      padding: 4px;
    }

    .step {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.05);
      opacity: 0.4;
      transition: all 0.3s ease;
    }

    .step.active {
      opacity: 1;
      border-color: #58a6ff;
      background: rgba(88, 166, 255, 0.1);
    }

    .step.completed {
      opacity: 0.6;
    }

    .step.completed .step-number {
      background: #28a745;
    }

    .step-number {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .step.active .step-number {
      background: #58a6ff;
      color: #000;
    }

    .step-content {
      flex: 1;
    }

    .step-content h4 {
      margin: 0 0 8px 0;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }

    .step-content p {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      line-height: 1.5;
    }

    .step-visual {
      margin-top: 12px;
      padding: 16px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .url-code, .keyboard-shortcut {
      display: inline-block;
      background: rgba(0, 0, 0, 0.4);
      color: #58a6ff;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      border: 1px solid rgba(88, 166, 255, 0.3);
    }

    .search-example {
      background: rgba(255, 255, 255, 0.05);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 16px;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .flag-visual {
      background: rgba(255, 255, 255, 0.05);
      padding: 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .flag-name {
      color: #fff;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .flag-dropdown {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }

    .relaunch-btn-visual {
      background: #58a6ff;
      color: #000;
      padding: 12px 24px;
      border-radius: 6px;
      text-align: center;
      font-weight: 600;
      display: inline-block;
    }

    .ios-icon, .ios-menu-item, .ios-toggle, .ios-gesture {
      background: rgba(255, 255, 255, 0.05);
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 16px;
    }

    .toggle-on {
      background: #28a745;
      color: #fff;
      padding: 2px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      float: right;
    }

    .tab-visual, .checkbox-visual, .macos-toggle {
      background: rgba(255, 255, 255, 0.05);
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .step-note {
      margin-top: 12px !important;
      padding: 12px;
      background: rgba(255, 193, 7, 0.1);
      border-left: 3px solid #ffc107;
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.9) !important;
      font-size: 13px !important;
    }

    .guide-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.2);
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-primary {
      background: #58a6ff;
      color: #000;
    }

    .btn-primary:hover {
      background: #79b8ff;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }

    .btn-secondary:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .step-indicator {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }

    .current-step {
      color: #58a6ff;
      font-weight: 600;
    }

    @media (max-width: 640px) {
      .setup-guide-modal {
        border-radius: 0;
        max-height: 100vh;
      }

      .setup-guide-header {
        padding: 24px 20px 20px;
      }

      .setup-guide-header h2 {
        font-size: 24px;
      }

      .setup-guide-content {
        padding: 20px;
      }

      .guide-footer {
        padding: 16px 20px;
      }

      .platform-buttons {
        grid-template-columns: repeat(2, 1fr);
      }

      .steps-container {
        max-height: 300px;
      }
    }
  `;

  document.head.appendChild(style);
}
