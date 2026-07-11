import { Scene } from 'phaser';
import * as Phaser from 'phaser';

type SplashBubble = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleScale: number;
  phase: number;
};

type SplashParticle = {
  x: number;
  y: number;
  speed: number;
  radius: number;
  alpha: number;
};

export class SplashScene extends Scene {
  backgroundGraphics: Phaser.GameObjects.Graphics | null = null;
  fishGraphics: Phaser.GameObjects.Graphics | null = null;
  fxGraphics: Phaser.GameObjects.Graphics | null = null;
  loadingGraphics: Phaser.GameObjects.Graphics | null = null;

  titleText: Phaser.GameObjects.Text | null = null;
  subtitleText: Phaser.GameObjects.Text | null = null;

  bubbles: SplashBubble[] = [];
  particles: SplashParticle[] = [];

  constructor() {
    super('SplashScene');
  }

  init() {
    this.backgroundGraphics = null;
    this.fishGraphics = null;
    this.fxGraphics = null;
    this.loadingGraphics = null;
    this.titleText = null;
    this.subtitleText = null;
    this.bubbles = [];
    this.particles = [];
  }

  create() {
    const { width, height } = this.scale;

    // Create Graphics layers
    this.backgroundGraphics = this.add.graphics().setDepth(0).setScrollFactor(0);
    this.fxGraphics = this.add.graphics().setDepth(1).setScrollFactor(0);
    this.fishGraphics = this.add.graphics().setDepth(2).setScrollFactor(0);
    this.loadingGraphics = this.add.graphics().setDepth(3).setScrollFactor(0);

    // Initial background elements
    for (let i = 0; i < 15; i++) {
      this.bubbles.push(this.createBubble(Math.random() * width, Math.random() * height + 100));
    }
    for (let i = 0; i < 25; i++) {
      this.particles.push(this.createParticle(Math.random() * width, Math.random() * height));
    }

    // Title Text - large, responsive base sizes
    const titleStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '52px',
      color: '#00E5FF',
      stroke: '#001a33',
      strokeThickness: 8,
      align: 'center',
      resolution: 2,
    };
    this.titleText = this.add.text(width / 2, height * 0.68, 'GLYPHBORNE', titleStyle)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setShadow(3, 3, '#001122', 8, true, true);

    // Subtitle Text
    const subtitleStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      resolution: 2,
    };
    this.subtitleText = this.add.text(width / 2, height * 0.76, 'Abyssal Depths', subtitleStyle)
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.updateLayout(width, height);

    // Transitions
    this.cameras.main.fadeIn(1000);

    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(1000);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenu');
      });
    });

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.updateLayout(gameSize.width, gameSize.height);
    });
  }

  override update(time: number) {
    const { width, height } = this.scale;

    // 1. Move and wobble bubbles/particles
    this.fxGraphics?.clear();

    // Small particles drifting upward
    this.fxGraphics?.fillStyle(0x00E5FF, 0.45);
    this.particles.forEach((p) => {
      p.y -= p.speed;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      this.fxGraphics?.fillCircle(p.x, p.y, p.radius);
    });

    // Bubbles rising with wobble
    this.fxGraphics?.lineStyle(1.0, 0xffffff, 0.35);
    this.fxGraphics?.fillStyle(0xffffff, 0.08);
    this.bubbles.forEach((b) => {
      b.y -= b.speed;
      b.phase += b.wobbleSpeed;
      const wobbleX = b.x + Math.sin(b.phase) * b.wobbleScale;
      if (b.y < -20) {
        b.y = height + 20;
        b.x = Math.random() * width;
      }
      this.fxGraphics?.fillCircle(wobbleX, b.y, b.radius);
      this.fxGraphics?.strokeCircle(wobbleX, b.y, b.radius);
    });

    // 2. Draw Anglerfish with pulsing lure
    if (this.fishGraphics) {
      this.fishGraphics.clear();
      const cx = width / 2;
      const cy = height * 0.38;
      const size = Math.min(width, height) * 0.15; // responsive size

      // Anglerfish body glow
      this.fishGraphics.fillStyle(0x00E5FF, 0.1);
      this.fishGraphics.fillCircle(cx, cy, size + 15);

      // Anglerfish body outline (facing right)
      this.fishGraphics.fillStyle(0x001122, 1);
      this.fishGraphics.lineStyle(2.5, 0x00E5FF, 1);

      // Draw tail fin
      this.fishGraphics.beginPath();
      this.fishGraphics.moveTo(cx - size * 0.8, cy);
      this.fishGraphics.lineTo(cx - size * 1.5, cy - size * 0.6);
      this.fishGraphics.lineTo(cx - size * 1.2, cy);
      this.fishGraphics.lineTo(cx - size * 1.5, cy + size * 0.6);
      this.fishGraphics.closePath();
      this.fishGraphics.fillPath();
      this.fishGraphics.strokePath();

      // Draw dorsal fin (top)
      this.fishGraphics.beginPath();
      this.fishGraphics.moveTo(cx - size * 0.3, cy - size * 0.85);
      this.fishGraphics.lineTo(cx - size * 0.7, cy - size * 1.35);
      this.fishGraphics.lineTo(cx - size * 0.8, cy - size * 0.7);
      this.fishGraphics.closePath();
      this.fishGraphics.fillPath();
      this.fishGraphics.strokePath();

      // Main body circle
      this.fishGraphics.fillCircle(cx, cy, size);
      this.fishGraphics.strokeCircle(cx, cy, size);

      // Draw 2 glowing cyan eyes (angled looking forward/right)
      this.fishGraphics.fillStyle(0xffffff, 1);
      this.fishGraphics.fillCircle(cx + size * 0.35, cy - size * 0.28, size * 0.18);
      this.fishGraphics.fillCircle(cx + size * 0.58, cy - size * 0.16, size * 0.14);

      // Pupils
      this.fishGraphics.fillStyle(0x000000, 1);
      this.fishGraphics.fillCircle(cx + size * 0.39, cy - size * 0.28, size * 0.08);
      this.fishGraphics.fillCircle(cx + size * 0.6, cy - size * 0.16, size * 0.06);

      // Lure antenna (Multi-segment geometric lines for neon theme)
      this.fishGraphics.lineStyle(2.5, 0x00E5FF, 1);
      this.fishGraphics.beginPath();
      // Starts from head going up and curving forward/down
      this.fishGraphics.moveTo(cx + size * 0.1, cy - size * 0.95);
      const mid1X = cx + size * 0.4;
      const mid1Y = cy - size * 1.55;
      const mid2X = cx + size * 0.9;
      const mid2Y = cy - size * 1.35;
      const endX = cx + size * 1.35;
      const endY = cy - size * 0.65;
      this.fishGraphics.lineTo(mid1X, mid1Y);
      this.fishGraphics.lineTo(mid2X, mid2Y);
      this.fishGraphics.lineTo(endX, endY);
      this.fishGraphics.strokePath();

      // Pulsing Lure glow
      const pulse = 0.5 + Math.sin(time * 0.006) * 0.35;
      const lureColor = 0x00E5FF;
      this.fishGraphics.fillStyle(lureColor, pulse * 0.3);
      this.fishGraphics.fillCircle(endX, endY, size * 0.35);

      this.fishGraphics.fillStyle(lureColor, pulse * 0.6);
      this.fishGraphics.fillCircle(endX, endY, size * 0.22);

      // Central core
      this.fishGraphics.fillStyle(0xffffff, 0.95);
      this.fishGraphics.fillCircle(endX, endY, size * 0.1);
    }

    // 3. Draw sequential pulsing loading dots at bottom
    if (this.loadingGraphics) {
      this.loadingGraphics.clear();
      const dotX = width / 2;
      const dotY = height * 0.88;
      const dotRadius = 4.5;
      const spacing = 18;

      this.loadingGraphics.fillStyle(0x00E5FF, 1);
      for (let di = 0; di < 3; di++) {
        // Pulse offset based on time and dot index
        const dotPulse = 0.3 + Math.max(0, Math.sin(time * 0.005 - di * 1.3)) * 0.7;
        const xPos = dotX + (di - 1) * spacing;
        this.loadingGraphics.fillStyle(0x00E5FF, dotPulse);
        this.loadingGraphics.fillCircle(xPos, dotY, dotRadius * (1.0 + dotPulse * 0.4));
      }
    }
  }

  private createBubble(x: number, y: number): SplashBubble {
    return {
      x,
      y,
      radius: 2 + Math.random() * 6,
      speed: 0.3 + Math.random() * 0.6,
      wobbleSpeed: 0.015 + Math.random() * 0.02,
      wobbleScale: 4 + Math.random() * 6,
      phase: Math.random() * 10,
    };
  }

  private createParticle(x: number, y: number): SplashParticle {
    return {
      x,
      y,
      speed: 0.2 + Math.random() * 0.4,
      radius: 1.0 + Math.random() * 1.8,
      alpha: 0.2 + Math.random() * 0.6,
    };
  }

  private updateLayout(width: number, height: number): void {
    this.cameras.resize(width, height);

    // Background gradient sky blue to dark abyssal blue
    if (this.backgroundGraphics) {
      this.backgroundGraphics.clear();
      // Top color: light blue (#4FC3F7), Bottom color: dark ocean blue (#0a1628)
      this.backgroundGraphics.fillGradientStyle(0x4fc3f7, 0x4fc3f7, 0x0a1628, 0x0a1628, 1.0, 1.0, 1.0, 1.0);
      this.backgroundGraphics.fillRect(0, 0, width, height);

      // Draw light rays originating from top center
      this.backgroundGraphics.lineStyle(width * 0.04, 0xffffff, 0.03);
      const topCenterX = width / 2;
      for (let r = 0; r < 7; r++) {
        const angle = (-15 + r * 5) * (Math.PI / 180); // slight angles
        const rayLength = height * 1.1;
        const targetX = topCenterX + Math.sin(angle) * rayLength;
        const targetY = Math.cos(angle) * rayLength;
        this.backgroundGraphics.lineBetween(topCenterX, 0, targetX, targetY);
      }
    }

    const isMobile = width < 600;

    // Reposition Text
    if (this.titleText) {
      this.titleText.setPosition(width / 2, height * 0.68);
      this.titleText.setFontSize(isMobile ? '36px' : '52px');
    }

    if (this.subtitleText) {
      this.subtitleText.setPosition(width / 2, height * 0.76);
      this.subtitleText.setFontSize(isMobile ? '16px' : '20px');
    }
  }
}
