// Input handling - dual system for desktop (keyboard/mouse) and mobile (touch)

export class InputController {
  constructor(canvas) {
    this.canvas = canvas;

    // Touch/pointer state
    this.leftId = null;
    this.rightId = null;
    this.joyCenter = [0, 0];
    this.moveX = 0;
    this.moveY = 0;
    this.lastLook = [0, 0];
    this.lastTap = 0;

    // Keyboard state
    this.keys = new Set();

    // Camera control
    this.camYaw = 0;
    this.camPitch = 0.35;

    // Jump callback
    this.onJump = null;

    this._setupEventListeners();
  }

  _toXY(e) {
    const r = this.canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  _updateJoy(x, y) {
    const max = Math.max(48, Math.min(96, this.canvas.clientWidth * 0.08));
    const dx = x - this.joyCenter[0];
    const dy = y - this.joyCenter[1];
    let m = Math.hypot(dx, dy);
    let ux = dx, uy = dy;

    if (m > max) {
      ux *= max / m;
      uy *= max / m;
      m = max;
    }

    this.moveX = ux / max;
    this.moveY = -uy / max;
  }

  _tryJump() {
    if (this.onJump) {
      this.onJump();
    }
  }

  _setupEventListeners() {
    // Touch/pointer events
    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.canvas.setPointerCapture?.(e.pointerId);

      const [x] = this._toXY(e);
      const half = this.canvas.clientWidth / 2;
      const now = performance.now();

      // Double-tap to jump
      if (now - this.lastTap < 300) this._tryJump();
      this.lastTap = now;

      if (x < half && this.leftId === null) {
        this.leftId = e.pointerId;
        const p = this._toXY(e);
        this.joyCenter = p;
        this._updateJoy(p[0], p[1]);
      } else if (this.rightId === null) {
        this.rightId = e.pointerId;
        this.lastLook = this._toXY(e);
      } else if (this.leftId === null) {
        this.leftId = e.pointerId;
        const p = this._toXY(e);
        this.joyCenter = p;
        this._updateJoy(p[0], p[1]);
      }
    }, { passive: false });

    this.canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.leftId && e.pointerId !== this.rightId) return;

      const [x, y] = this._toXY(e);

      if (e.pointerId === this.leftId) {
        this._updateJoy(x, y);
      } else {
        const dx = x - this.lastLook[0];
        const dy = y - this.lastLook[1];
        this.lastLook = [x, y];

        const s = 0.006;
        this.camYaw -= dx * s;
        this.camPitch -= dy * s;
        this.camPitch = Math.max(-1.2, Math.min(1.2, this.camPitch));
      }
    });

    this.canvas.addEventListener('pointerup', (e) => {
      if (e.pointerId === this.leftId) {
        this.leftId = null;
        this.moveX = this.moveY = 0;
      }
      if (e.pointerId === this.rightId) {
        this.rightId = null;
      }
      this.canvas.releasePointerCapture?.(e.pointerId);
    });

    // Keyboard events
    addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) {
        e.preventDefault();
        this.keys.add(k);
      }
    }, { passive: false });

    addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  updateFromKeyboard() {
    let x = 0, y = 0;

    if (this.keys.has('w') || this.keys.has('arrowup')) y += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y -= 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;

    const L = Math.hypot(x, y) || 1;
    x /= L;
    y /= L;

    if (this.leftId === null) {
      this.moveX = x;
      this.moveY = y;
    }

    if (this.keys.has(' ')) {
      this._tryJump();
    }
  }

  getMovement() {
    return { x: this.moveX, y: this.moveY };
  }

  getCamera() {
    return { yaw: this.camYaw, pitch: this.camPitch };
  }
}
