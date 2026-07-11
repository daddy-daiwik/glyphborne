import { Scene } from 'phaser';
import * as Phaser from 'phaser';

type Shape = 'triangle' | 'circle' | 'square';

type FXParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
  shape: Shape | 'star';
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
};

type FXRing = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: number;
  alpha: number;
  life: number;
  maxLife: number;
};

type EnemyKind = 'current' | 'zombie' | 'attacker' | 'buff';

type Enemy = {
  kind: EnemyKind;
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  hp: number;
  slowTimer: number;
  radius: number;
  speed: number;
  dirX?: number;
  dirY?: number;
  nextDirTimer?: number;
  movementMode?: 'wander' | 'zigzag' | 'chase';
  projectileTimer?: number;
  damageMin?: number;
  damageMax?: number;
  buffKind?: 'heal' | 'speed' | 'shield';
  shape?: Shape;
  hitFlashTime?: number;
  spawnSide?: 'top' | 'left' | 'right';
  curveType?: 'sine' | 'exponential' | 'logarithmic' | 'straight';
  spawnTime?: number;
  baseX?: number;
  baseY?: number;
};

type Projectile = {
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
};

type Token = {
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  radius: number;
  shape: Shape;
  bobOffset: number;
};

type SpellProjectile = {
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  spell: ComboId;
  damage: number;
  piercing: boolean;
  explosionRadius: number;
  slowFactor: number;
  slowDuration: number;
  hitEnemies: Set<Enemy>;
  lifetime: number;
  chainCount?: number;
  castId?: number;
};

// 4 spells only
type ComboId = 'trident' | 'nova' | 'lightning' | 'poison';

type LayoutMode = 'desktop' | 'mobileLandscape' | 'mobilePortrait';

type ComboDefinition = {
  id: ComboId;
  name: string;
  shortName: string;
  requires: { triangle: number; circle: number; square: number };
  icons: Shape[];
};

// ─── Constants ──────────────────────────────────────────────────────────────

const PLAYER_RADIUS = 13;
const SHIELD_RADIUS = 18;
const TOKEN_RADIUS = 7;
const TOKEN_BOB_AMPLITUDE = 4;
const TOKEN_BOB_SPEED = 0.003;
const PLAYER_SPEED = 300;
const SPAWN_INTERVAL = 1200;
const START_DELAY = 1500;
const SCORE_PER_SECOND = 10;
const PICKUP_RADIUS = PLAYER_RADIUS + TOKEN_RADIUS + 32;
const PROJECTILE_RADIUS = 4;
const PROJECTILE_SPEED = 200;
const MAX_HP = 100;
const ZOMBIE_DAMAGE = 20;
const ZOMBIE_RADIUS = 15;
const ATTACKER_RADIUS = 13;
const ATTACKER_DAMAGE_MIN = 6;
const ATTACKER_DAMAGE_MAX = 10;
const ATTACKER_PROJECTILE_INTERVAL_MIN = 2000;
const ATTACKER_PROJECTILE_INTERVAL_MAX = 3000;
const BUFF_RADIUS = 11;
const BUFF_HEAL = 20;
const BUFF_SPEED_DURATION = 5000;
const BUFF_SPEED_MULTIPLIER = 1.5;
const BUFF_REPEL_DISTANCE = 80;
const CURRENT_SPAWN_WEIGHT = 40;
const ZOMBIE_SPAWN_WEIGHT = 20;
const ATTACKER_SPAWN_WEIGHT = 25;

// HP bar — bottom-left
const HP_BAR_WIDTH = 220;
const HP_BAR_HEIGHT = 16;

// Right-column spell panel
const SPELL_SLOT_W = 90;
const SPELL_SLOT_H = 52;
const SPELL_SLOT_PAD = 4;
const SPELL_COL_MARGIN = 4; // from right edge

// Drag-to-move threshold (px) — below this = tap
const TAP_THRESHOLD = 10;

// Token / inventory palette
const TOKEN_TRIANGLE_COLOR = 0xffcc00;
const TOKEN_CIRCLE_COLOR = 0x00ff66;
const TOKEN_SQUARE_COLOR = 0xaa44ff;

// 4 spell definitions
const COMBOS: ComboDefinition[] = [
  {
    id: 'trident',
    name: 'Tidal Spear',
    shortName: 'SPEAR',
    requires: { triangle: 3, circle: 0, square: 0 },
    icons: ['triangle', 'triangle', 'triangle'],
  },
  {
    id: 'nova',
    name: 'Abyssal Burst',
    shortName: 'BURST',
    requires: { triangle: 0, circle: 3, square: 0 },
    icons: ['circle', 'circle', 'circle'],
  },
  {
    id: 'lightning',
    name: 'Chain Lightning',
    shortName: 'LIGHTNING',
    requires: { triangle: 0, circle: 2, square: 1 },
    icons: ['circle', 'circle', 'square'],
  },
  {
    id: 'poison',
    name: 'Poison Vomit',
    shortName: 'POISON',
    requires: { triangle: 1, circle: 1, square: 1 },
    icons: ['triangle', 'circle', 'square'],
  },
];

// ─── Spell constants ──────────────────────────────────────────────────────────

const TRIDENT_SPEED = 650;
const TRIDENT_DAMAGE = 35;
const NOVA_RADIUS = 150;
const NOVA_DAMAGE = 50;
const NOVA_DURATION = 450;
const LIGHTNING_DAMAGE = 40;
const POISON_RANGE = 300;
const POISON_CONE_HALF_ANGLE = Math.PI / 6; // 30 deg = 60 deg total
const POISON_DAMAGE_CLOSE = 60;
// POISON_DAMAGE_FAR removed — damage falloff computed inline via distRatio

const POISON_WAVES = 5;
const SPELL_LIFETIME = 3500;

const ENEMY_HP: Record<EnemyKind, number> = {
  current: 20,
  zombie: 30,
  attacker: 15,
  buff: 10,
};

const COMBO_WINDOW_MS = 2000;
const HEAT_THRESHOLD = 5;
const BLAZE_THRESHOLD = 10;
const KILL_SCORE_BASE = 10;

const SPELL_COLORS: Record<ComboId, number> = {
  trident: 0x00f0ff,
  nova: 0x44aaff,
  lightning: 0xffee44,
  poison: 0x44ff44,
};

// ─── Scene ──────────────────────────────────────────────────────────────────

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  backgroundGraphics: Phaser.GameObjects.Graphics | null = null;
  scoreText: Phaser.GameObjects.Text;
  inventoryGraphics: Phaser.GameObjects.Graphics;
  invTriangleText: Phaser.GameObjects.Text;
  invCircleText: Phaser.GameObjects.Text;
  invSquareText: Phaser.GameObjects.Text;
  hpBar: Phaser.GameObjects.Graphics;
  hpText: Phaser.GameObjects.Text;
  shieldGraphics: Phaser.GameObjects.Graphics;
  boosterText: Phaser.GameObjects.Text;

  playerGraphics: Phaser.GameObjects.Graphics | null = null;
  playerX: number = 512;
  playerY: number = 384;

  enemies: Enemy[] = [];
  tokens: Token[] = [];
  projectiles: Projectile[] = [];
  inventory: { triangle: number; circle: number; square: number } = { triangle: 0, circle: 0, square: 0 };
  score: number = 0;
  hp: number = MAX_HP;
  hasShield: boolean = false;
  speedBoostTimer: number = 0;
  isGameOver: boolean = false;
  bestLightningChain: number = 0;
  bestNovaChain: number = 0;
  keys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  } | null = null;
  spawnTimer: Phaser.Time.TimerEvent | null = null;
  scoreTimer: Phaser.Time.TimerEvent | null = null;

  // Combo bar (right column)
  selectedCombo: number = 0;
  comboBarGraphics: Phaser.GameObjects.Graphics | null = null;
  comboNameTexts: Phaser.GameObjects.Text[] = [];
  layoutMode: LayoutMode = 'desktop';
  spellTouchZones: Array<{ x: number; y: number; w: number; h: number; comboIndex: number }> = [];

  // Drag-to-move (replaces joystick)
  dragActive: boolean = false;
  dragPointerID: number = -1;
  dragStartX: number = 0;
  dragStartY: number = 0;
  dragLastX: number = 0;
  dragLastY: number = 0;
  dragMoveDX: number = 0;
  dragMoveDY: number = 0;
  // Tap detection
  tapMoved: boolean = false;

  // Spell FX / combo streak
  spellProjectiles: SpellProjectile[] = [];
  killTimestamps: number[] = [];
  killComboCount: number = 0;
  lastComboCount: number = 0;
  heatMode: boolean = false;
  blazeMode: boolean = false;
  blazeGraphics: Phaser.GameObjects.Graphics | null = null;
  comboCountText: Phaser.GameObjects.Text | null = null;
  gameTime: number = 0;

  // Spell Tracking
  bestTridentChain: number = 0;
  bestPoisonChain: number = 0;
  lastCastId: number = 0;
  tridentHits: Map<number, Set<Enemy>> = new Map();

  // FX engine
  fxParticles: FXParticle[] = [];
  fxRings: FXRing[] = [];
  fxGraphics: Phaser.GameObjects.Graphics | null = null;

  // Phase 6 — daily glyph, progression, ambient
  dailyGlyph: Shape = 'triangle';
  dailyGlyphText: Phaser.GameObjects.Text | null = null;
  totalKillsCount: number = 0;
  difficultySpeedMultiplier: number = 1.0;
  ambientGraphics: Phaser.GameObjects.Graphics | null = null;
  ambientParticles: Array<{ x: number; y: number; speed: number; size: number; alpha: number; angle: number; color?: number }> = [];
  lastDamageTime: number = 0;

  constructor() {
    super('Game');
  }

  init(): void {
    this.playerGraphics = null;
    this.playerX = 512;
    this.playerY = 384;
    this.enemies = [];
    this.tokens = [];
    this.projectiles = [];
    this.inventory = { triangle: 3, circle: 3, square: 3 };
    this.score = 0;
    this.hp = MAX_HP;
    this.hasShield = false;
    this.speedBoostTimer = 0;
    this.isGameOver = false;
    this.bestLightningChain = 0;
    this.bestNovaChain = 0;
    this.keys = null;
    this.spawnTimer = null;
    this.scoreTimer = null;
    this.selectedCombo = 0;
    this.comboBarGraphics = null;
    this.comboNameTexts = [];
    this.layoutMode = 'desktop';
    this.spellTouchZones = [];
    this.dragActive = false;
    this.dragPointerID = -1;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragLastX = 0;
    this.dragLastY = 0;
    this.dragMoveDX = 0;
    this.dragMoveDY = 0;
    this.tapMoved = false;
    this.spellProjectiles = [];
    this.killTimestamps = [];
    this.killComboCount = 0;
    this.lastComboCount = 0;
    this.heatMode = false;
    this.blazeMode = false;
    this.blazeGraphics = null;
    this.comboCountText = null;
    this.gameTime = 0;
    this.fxParticles = [];
    this.fxRings = [];
    this.fxGraphics = null;
    this.bestTridentChain = 0;
    this.bestPoisonChain = 0;
    this.lastCastId = 0;
    this.tridentHits.clear();

    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const shapes = ['triangle', 'circle', 'square'] as const;
    this.dailyGlyph = shapes[daysSinceEpoch % 3]!;
    this.dailyGlyphText = null;
    this.totalKillsCount = 0;
    this.difficultySpeedMultiplier = 1.0;
    this.ambientGraphics = null;
    this.ambientParticles = [];
    this.lastDamageTime = 0;
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x0a0a2a);

    this.backgroundGraphics = this.add.graphics().setDepth(1);

    // Ambient background particles
    this.ambientGraphics = this.add.graphics().setDepth(2);
    for (let i = 0; i < 55; i++) {
      this.ambientParticles.push({
        x: Math.random() * this.scale.width,
        y: Math.random() * this.scale.height,
        speed: 8 + Math.random() * 18,
        size: 1.0 + Math.random() * 2.5,
        alpha: 0.12 + Math.random() * 0.38,
        angle: Math.random() * Math.PI * 2,
        color: Math.random() < 0.5 ? 0xffffff : 0x00ffcc,
      });
    }

    this.keys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // ── Score — top-left, fixed size, high-DPI
    this.scoreText = this.add
      .text(12, 12, 'Score: 0', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3.5,
        resolution: 2,
      })
      .setScrollFactor(0)
      .setDepth(10);

    // ── Daily Glyph — top-left below score
    const glyphCol =
      this.dailyGlyph === 'triangle' ? '#ffcc00'
      : this.dailyGlyph === 'circle' ? '#00ff66'
      : '#aa44ff';
    this.dailyGlyphText = this.add
      .text(12, 40, `★ DAILY: ${this.dailyGlyph.toUpperCase()} (2X)`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: glyphCol,
        stroke: '#000000',
        strokeThickness: 2.5,
        resolution: 2,
      })
      .setScrollFactor(0)
      .setDepth(10);

    // ── Inventory — top-right
    this.inventoryGraphics = this.add.graphics().setScrollFactor(0).setDepth(10);

    const countStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 3,
      resolution: 2,
    } as const;

    // Will be repositioned in refreshHudLayout
    this.invTriangleText = this.add.text(0, 0, '0', countStyle).setScrollFactor(0).setDepth(10);
    this.invCircleText = this.add.text(0, 0, '0', countStyle).setScrollFactor(0).setDepth(10);
    this.invSquareText = this.add.text(0, 0, '0', countStyle).setScrollFactor(0).setDepth(10);

    // ── HP bar — bottom-left
    this.hpBar = this.add.graphics().setScrollFactor(0).setDepth(10);
    this.hpText = this.add
      .text(8, 0, 'HP', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2.5,
        resolution: 2,
      })
      .setScrollFactor(0)
      .setDepth(10);

    // ── Speed booster text
    this.boosterText = this.add
      .text(8, 0, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#00ff88',
        stroke: '#000000',
        strokeThickness: 2.5,
        resolution: 2,
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.shieldGraphics = this.add.graphics().setDepth(9);

    this.buildPlayerConstruct();

    // Blaze border + combo counter
    this.blazeGraphics = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.fxGraphics = this.add.graphics().setDepth(14);
    this.comboCountText = this.add
      .text(0, 0, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#ffdd44',
        stroke: '#000000',
        strokeThickness: 3.5,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(15)
      .setAlpha(0);

    // ── Combo bar (right column)
    this.comboBarGraphics = this.add.graphics().setScrollFactor(0).setDepth(11);
    this.comboNameTexts = COMBOS.map((combo) =>
      this.add
        .text(0, 0, combo.shortName, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2.2,
          resolution: 2,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(12),
    );

    this.refreshHudLayout();
    this.redrawComboBar();

    this.time.addEvent({
      delay: 4500,
      callback: this.spawnAmbientPotionOrb,
      callbackScope: this,
      loop: true,
    });

    // ── Scroll wheel cycles spells — only selects affordable ones
    this.input.on(
      'wheel',
      (_ptr: Phaser.Input.Pointer, _gos: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
        if (this.isGameOver) return;
        this.cycleToAffordableSpell(dy > 0 ? 1 : -1);
      },
    );

    // ── Number keys 1-4 — only selects if affordable
    [
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE,
      Phaser.Input.Keyboard.KeyCodes.FOUR,
    ].forEach((code, idx) => {
      this.input.keyboard!.addKey(code).on('down', () => {
        if (this.isGameOver) return;
        if (this.isAffordable(COMBOS[idx]!)) {
          this.selectedCombo = idx;
          this.redrawComboBar();
        }
      });
    });

    // ── Drag-to-move + tap-to-shoot input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;

      const px = pointer.x;
      const py = pointer.y;

      // 1. Check spell slot touch zones first
      let hitSlot = false;
      for (const zone of this.spellTouchZones) {
        if (px >= zone.x && px <= zone.x + zone.w && py >= zone.y && py <= zone.y + zone.h) {
          this.selectedCombo = zone.comboIndex;
          this.redrawComboBar();
          hitSlot = true;
          break;
        }
      }
      if (hitSlot) return;

      // 2. Desktop LMB → cast
      if (!pointer.wasTouch) {
        if (pointer.leftButtonDown()) this.castSpell(pointer.worldX, pointer.worldY);
        return;
      }

      // 3. Mobile touch: start drag tracking
      if (this.dragPointerID === -1) {
        this.dragPointerID = pointer.id;
        this.dragActive = true;
        this.dragStartX = px;
        this.dragStartY = py;
        this.dragLastX = px;
        this.dragLastY = py;
        this.dragMoveDX = 0;
        this.dragMoveDY = 0;
        this.tapMoved = false;
      } else {
        // Multi-touch: secondary finger is used to cast/shoot immediately on tap
        this.castSpell(pointer.worldX, pointer.worldY);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (!this.dragActive || pointer.id !== this.dragPointerID) return;

      const ddx = pointer.x - this.dragStartX;
      const ddy = pointer.y - this.dragStartY;
      const dist = Math.sqrt(ddx * ddx + ddy * ddy);

      if (dist > TAP_THRESHOLD) {
        this.tapMoved = true;
      }

      // Delta from last frame position → direct movement
      this.dragMoveDX = pointer.x - this.dragLastX;
      this.dragMoveDY = pointer.y - this.dragLastY;
      this.dragLastX = pointer.x;
      this.dragLastY = pointer.y;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.dragPointerID) return;

      if (!this.tapMoved && !this.isGameOver) {
        // It was a tap — cast spell toward tap position
        this.castSpell(pointer.worldX, pointer.worldY);
      }

      this.dragActive = false;
      this.dragPointerID = -1;
      this.dragMoveDX = 0;
      this.dragMoveDY = 0;
      this.tapMoved = false;
    });

    this.spawnTimer = this.time.addEvent({
      delay: SPAWN_INTERVAL,
      callback: this.spawnEnemy,
      callbackScope: this,
      startAt: START_DELAY,
      loop: true,
    });

    this.scoreTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.isGameOver) {
          this.score += SCORE_PER_SECOND / 10;
          this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const { width, height } = gameSize;
      this.cameras.resize(width, height);
      this.refreshHudLayout();
      this.refreshComboBarLayout();
    });

    this.redrawInventoryHud();
    this.drawHpBar();
  }

  override update(time: number, delta: number) {
    if (this.isGameOver) return;

    this.gameTime = time;
    const dt = delta / 1000;

    this.updateBackground(time);
    this.updatePlayerMovement(dt);
    this.updateShieldVisual();
    this.updateSpeedBoost(delta);
    this.updateEnemies(time, dt);
    this.updateProjectiles(dt);
    this.updateSpellProjectiles(dt);
    this.updateTokens(time);
    this.updateComboDisplay(time);
    this.updateFX(dt);
  }

  // ─── HUD layout ─────────────────────────────────────────────────────────────

  refreshHudLayout(): void {
    const { width, height } = this.scale;

    // Inventory icons top-right
    const invBaseX = width - 14;
    const invY = 14;
    const invStep = 32;

    // Square is rightmost
    if (this.invSquareText) this.invSquareText.setPosition(invBaseX - 6, invY + 22).setOrigin(1, 0);
    if (this.invCircleText) this.invCircleText.setPosition(invBaseX - 6 - invStep, invY + 22).setOrigin(1, 0);
    if (this.invTriangleText) this.invTriangleText.setPosition(invBaseX - 6 - invStep * 2, invY + 22).setOrigin(1, 0);

    // HP bar bottom-left
    const hpBarY = height - 28;
    if (this.hpText) this.hpText.setPosition(8, hpBarY - 18);
    if (this.boosterText) this.boosterText.setPosition(8, hpBarY + 14);

    this.drawHpBar();
    this.redrawInventoryHud();
  }

  // ─── Player ─────────────────────────────────────────────────────────────────

  buildPlayerConstruct(): void {
    if (this.playerGraphics) this.playerGraphics.destroy();
    this.playerGraphics = this.add.graphics().setDepth(8);
    this.drawPlayer();
  }

  drawPlayer(): void {
    if (!this.playerGraphics) return;
    const g = this.playerGraphics;
    g.clear();

    const isInvulnerable = this.gameTime < this.lastDamageTime + 1000;
    if (isInvulnerable && Math.floor(this.gameTime / 60) % 2 === 0) return;

    const pointer = this.input.activePointer;
    const mouseX = pointer.worldX ?? (this.playerX + 100);
    const mouseY = pointer.worldY ?? this.playerY;
    const bodyAngle = Phaser.Math.Angle.Between(this.playerX, this.playerY, mouseX, mouseY);

    this.playerGraphics.setPosition(this.playerX, this.playerY);
    this.playerGraphics.setRotation(bodyAngle);

    const rx = PLAYER_RADIUS * 1.45;
    const ry = PLAYER_RADIUS * 1.2;
    const t = this.gameTime;

    g.fillStyle(0x00e5ff, 0.06);
    g.fillEllipse(0, 0, rx * 2.8, ry * 2.8);
    g.fillStyle(0x00e5ff, 0.1);
    g.fillEllipse(0, 0, rx * 2.1, ry * 2.1);

    g.fillStyle(0x001a20, 1);
    g.fillEllipse(2, 2, rx + 4, ry + 4);

    g.fillStyle(0x005577, 1);
    g.lineStyle(1.5, 0x001a20, 1);
    g.beginPath();
    g.moveTo(-rx * 0.55, -ry * 0.62);
    g.lineTo(-rx * 1.55, 0);
    g.lineTo(-rx * 0.55, ry * 0.62);
    g.closePath();
    g.fillPath();
    g.strokePath();

    g.fillStyle(0x0099bb, 1);
    g.beginPath();
    g.moveTo(-rx * 1.55, 0);
    g.lineTo(-rx * 2.1, -ry * 0.45);
    g.lineTo(-rx * 1.75, -ry * 0.1);
    g.closePath();
    g.fillPath();
    g.strokePath();

    g.beginPath();
    g.moveTo(-rx * 1.55, 0);
    g.lineTo(-rx * 2.1, ry * 0.45);
    g.lineTo(-rx * 1.75, ry * 0.1);
    g.closePath();
    g.fillPath();
    g.strokePath();

    g.fillStyle(0x003344, 1);
    g.fillEllipse(0, 0, rx, ry);

    g.fillStyle(0x007799, 0.55);
    g.fillEllipse(-rx * 0.12, -ry * 0.22, rx * 0.7, ry * 0.5);

    const spotT = Math.sin(t * 0.006);
    g.fillStyle(0x00ffdd, 0.5 + spotT * 0.2);
    g.fillCircle(-rx * 0.2, -ry * 0.25, 2.5);
    g.fillCircle(-rx * 0.05, ry * 0.28, 2.0);
    g.fillCircle(-rx * 0.38, ry * 0.1, 1.8);
    g.fillCircle(-rx * 0.42, -ry * 0.3, 1.5);

    g.fillStyle(0x005577, 1);
    g.lineStyle(1.5, 0x001a20, 1);
    g.beginPath();
    g.moveTo(-rx * 0.3, -ry);
    g.lineTo(-rx * 0.55, -ry - 12);
    g.lineTo(-rx * 0.1, -ry - 7);
    g.lineTo(rx * 0.1, -ry - 14);
    g.lineTo(rx * 0.28, -ry - 4);
    g.lineTo(rx * 0.35, -ry);
    g.closePath();
    g.fillPath();
    g.strokePath();

    g.fillStyle(0x005577, 1);
    g.beginPath();
    g.moveTo(-rx * 0.1, -ry * 0.7);
    g.lineTo(-rx * 0.6, -ry - 7);
    g.lineTo(rx * 0.05, -ry * 0.88);
    g.closePath();
    g.fillPath();
    g.strokePath();

    g.beginPath();
    g.moveTo(-rx * 0.1, ry * 0.7);
    g.lineTo(-rx * 0.6, ry + 7);
    g.lineTo(rx * 0.05, ry * 0.88);
    g.closePath();
    g.fillPath();
    g.strokePath();

    g.fillStyle(0xffffff, 1);
    g.fillCircle(rx * 0.22, -ry * 0.38, 6.5);
    g.fillCircle(rx * 0.22, ry * 0.38, 6.5);

    g.fillStyle(0x000000, 1);
    g.fillCircle(rx * 0.28, -ry * 0.38, 3.5);
    g.fillCircle(rx * 0.28, ry * 0.38, 3.5);

    g.fillStyle(0x00ffee, 0.7);
    g.fillCircle(rx * 0.25, -ry * 0.4, 2.0);
    g.fillCircle(rx * 0.25, ry * 0.4, 2.0);

    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(rx * 0.22, -ry * 0.42, 1.2);
    g.fillCircle(rx * 0.22, ry * 0.42, 1.2);

    g.fillStyle(0x001a0a, 1);
    g.fillEllipse(rx * 0.48, 0, rx * 0.38, ry * 0.45);

    g.fillStyle(0xeefff5, 1);
    g.lineStyle(1, 0x001a20, 1);
    for (let fi = 0; fi < 3; fi++) {
      const fx = rx * 0.42 + fi * rx * 0.08;
      g.beginPath();
      g.moveTo(fx, -ry * 0.04);
      g.lineTo(fx + rx * 0.04, ry * 0.14);
      g.lineTo(fx + rx * 0.08, -ry * 0.04);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }
    for (let fi = 0; fi < 2; fi++) {
      const fx = rx * 0.46 + fi * rx * 0.1;
      g.beginPath();
      g.moveTo(fx, ry * 0.04);
      g.lineTo(fx + rx * 0.04, -ry * 0.14);
      g.lineTo(fx + rx * 0.08, ry * 0.04);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }

    const antStartX = rx * 0.55;
    const antAngle = Math.sin(t * 0.007) * 0.7;
    const antLen = 32;
    const lureX = antStartX + Math.cos(antAngle) * antLen;
    const lureY = Math.sin(antAngle) * antLen;

    g.lineStyle(2.5, 0x001a20, 1);
    g.lineBetween(antStartX, -ry * 0.1, lureX, lureY);
    g.lineStyle(1.2, 0x00eecc, 0.7);
    g.lineBetween(antStartX, -ry * 0.1, lureX, lureY);

    const pulse = 4 + Math.sin(t * 0.013) * 2;
    g.fillStyle(0x00ffcc, 0.12);
    g.fillCircle(lureX, lureY, pulse + 14);
    g.fillStyle(0x00ffcc, 0.25);
    g.fillCircle(lureX, lureY, pulse + 9);
    g.fillStyle(0x00ffcc, 0.5);
    g.fillCircle(lureX, lureY, pulse + 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(lureX, lureY, pulse);
  }

  updatePlayerMovement(dt: number): void {
    let dx = 0;
    let dy = 0;

    // Keyboard (WASD) — desktop
    if (this.keys) {
      if (this.keys.W.isDown) dy -= 1;
      if (this.keys.S.isDown) dy += 1;
      if (this.keys.A.isDown) dx -= 1;
      if (this.keys.D.isDown) dx += 1;
    }

    // Drag-to-move: apply delta movement from last frame
    if (this.dragActive && this.tapMoved) {
      // Scale drag delta to match player speed feel
      dx += this.dragMoveDX;
      dy += this.dragMoveDY;
      // Reset per-frame delta after consuming
      this.dragMoveDX = 0;
      this.dragMoveDY = 0;
    }

    const speedMult = this.speedBoostTimer > 0 ? BUFF_SPEED_MULTIPLIER : 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        // For WASD use normal speed, for drag use pixel delta directly (already in pixels)
        if (this.dragActive && this.tapMoved) {
          // Drag: direct pixel movement, capped at PLAYER_SPEED * dt * speedMult
          const maxMove = PLAYER_SPEED * dt * speedMult;
          const dragLen = Math.min(len, maxMove * 3);
          dx = (dx / len) * Math.min(dragLen, maxMove * 3);
          dy = (dy / len) * Math.min(dragLen, maxMove * 3);
        } else {
          const move = PLAYER_SPEED * dt * speedMult;
          dx = (dx / len) * move;
          dy = (dy / len) * move;
        }
      }
    }

    this.playerX = Phaser.Math.Clamp(
      this.playerX + dx,
      PLAYER_RADIUS,
      this.scale.width - PLAYER_RADIUS,
    );
    this.playerY = Phaser.Math.Clamp(
      this.playerY + dy,
      PLAYER_RADIUS,
      this.scale.height - PLAYER_RADIUS,
    );

    this.drawPlayer();
  }

  // ─── Shield ──────────────────────────────────────────────────────────────────

  updateShieldVisual(): void {
    this.shieldGraphics.clear();
    if (this.hasShield) {
      this.shieldGraphics.lineStyle(6, 0x4fc3f7, 0.15);
      this.shieldGraphics.strokeCircle(this.playerX, this.playerY, SHIELD_RADIUS + 6);
      this.shieldGraphics.lineStyle(3, 0x4fc3f7, 0.4);
      this.shieldGraphics.strokeCircle(this.playerX, this.playerY, SHIELD_RADIUS + 2);
      this.shieldGraphics.lineStyle(1.5, 0x7fffff, 0.95);
      this.shieldGraphics.strokeCircle(this.playerX, this.playerY, SHIELD_RADIUS);
      this.shieldGraphics.fillStyle(0x4fc3f7, 0.05);
      this.shieldGraphics.fillCircle(this.playerX, this.playerY, SHIELD_RADIUS);
    }
  }

  // ─── Speed boost ─────────────────────────────────────────────────────────────

  updateSpeedBoost(delta: number): void {
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= delta;
      const remaining = Math.ceil(this.speedBoostTimer / 1000);
      this.boosterText.setText(`SPEED +${remaining}s`);
    } else {
      this.boosterText.setText('');
    }
  }

  // ─── Enemies ─────────────────────────────────────────────────────────────────

  updateEnemies(_time: number, dt: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.isGameOver) return;
      const e = this.enemies[i];
      if (!e) continue;

      if (e.slowTimer > 0) {
        e.slowTimer -= dt * 1000;
        if (e.slowTimer < 0) e.slowTimer = 0;
      }

      const speedMult = 1.0;

      switch (e.kind) {
        case 'current': this.updateCurrentEnemy(e, dt, i, speedMult); break;
        case 'zombie': this.updateZombieEnemy(e, dt, speedMult); break;
        case 'attacker': this.updateAttackerEnemy(e, _time, dt, speedMult); break;
        case 'buff': this.updateBuffEnemy(e, dt, speedMult); break;
      }

      if (this.enemies.includes(e)) {
        this.redrawEnemy(e);
      }

      const dist = Phaser.Math.Distance.Between(this.playerX, this.playerY, e.x, e.y);
      const collisionRange = e.kind === 'buff' ? (PLAYER_RADIUS + e.radius + 35) : (PLAYER_RADIUS + e.radius);
      if (dist < collisionRange && this.enemies.includes(e)) {
        this.handleEnemyCollision(e, this.enemies.indexOf(e));
      }
    }
  }

  updateCurrentEnemy(e: Enemy, dt: number, i: number, speedMult: number): void {
    if (e.spawnTime === undefined) {
      e.spawnTime = this.gameTime;
      e.baseX = e.x;
      e.baseY = e.y;
    }

    const elapsed = (this.gameTime - e.spawnTime) / 1000; // in seconds
    const currentSpeed = e.speed * speedMult;

    // Move the base position along its main direction
    if (e.spawnSide === 'top') {
      if (e.curveType === 'exponential') {
        e.baseY! += currentSpeed * Math.exp(elapsed * 0.4) * dt;
      } else {
        e.baseY! += currentSpeed * dt;
      }
    } else if (e.spawnSide === 'left') {
      if (e.curveType === 'exponential') {
        e.baseX! += currentSpeed * Math.exp(elapsed * 0.4) * dt;
      } else {
        e.baseX! += currentSpeed * dt;
      }
    } else {
      if (e.curveType === 'exponential') {
        e.baseX! -= currentSpeed * Math.exp(elapsed * 0.4) * dt;
      } else {
        e.baseX! -= currentSpeed * dt;
      }
    }

    // Apply curve offsets to x and y
    let curX = e.baseX!;
    let curY = e.baseY!;

    const amp = 45; // amplitude of perpendicular oscillation
    if (e.spawnSide === 'top') {
      if (e.curveType === 'sine') {
        curX = e.baseX! + Math.sin(elapsed * 4.5) * amp;
      } else if (e.curveType === 'logarithmic') {
        curX = e.baseX! + Math.log(1 + elapsed * 3) * amp * (e.dirX || 1);
      }
    } else {
      if (e.curveType === 'sine') {
        curY = e.baseY! + Math.sin(elapsed * 4.5) * amp;
      } else if (e.curveType === 'logarithmic') {
        curY = e.baseY! + Math.log(1 + elapsed * 3) * amp * (e.dirY || 1);
      }
    }

    e.x = curX;
    e.y = curY;

    // Check offscreen cleanup
    const offscreen =
      (e.spawnSide === 'top' && e.y > this.scale.height + e.radius) ||
      (e.spawnSide === 'left' && e.x > this.scale.width + e.radius) ||
      (e.spawnSide === 'right' && e.x < -e.radius) ||
      (e.y < -e.radius * 3) || (e.y > this.scale.height + e.radius * 3) ||
      (e.x < -e.radius * 3) || (e.x > this.scale.width + e.radius * 3);

    if (offscreen) {
      e.graphics.destroy();
      this.enemies.splice(i, 1);
    }
  }

  updateZombieEnemy(e: Enemy, dt: number, speedMult: number): void {
    e.nextDirTimer! -= dt * 1000;
    if (e.nextDirTimer! <= 0) {
      const angle = Math.random() * Math.PI * 2;
      e.dirX = Math.cos(angle);
      e.dirY = Math.sin(angle);
      e.nextDirTimer = 2000 + Math.random() * 2000;
    }

    e.x += e.dirX! * e.speed * speedMult * dt;
    e.y += e.dirY! * e.speed * speedMult * dt;

    if (e.x < e.radius) { e.x = e.radius; e.dirX = Math.abs(e.dirX!); }
    if (e.x > this.scale.width - e.radius) { e.x = this.scale.width - e.radius; e.dirX = -Math.abs(e.dirX!); }
    if (e.y < e.radius) { e.y = e.radius; e.dirY = Math.abs(e.dirY!); }
    if (e.y > this.scale.height - e.radius) { e.y = this.scale.height - e.radius; e.dirY = -Math.abs(e.dirY!); }

    if (e.y > this.scale.height + e.radius) {
      e.graphics.destroy();
      this.enemies.splice(this.enemies.indexOf(e), 1);
    }
  }

  updateAttackerEnemy(e: Enemy, _time: number, dt: number, speedMult: number): void {
    e.projectileTimer! -= dt * 1000;
    if (e.projectileTimer! <= 0) {
      this.spawnAttackerProjectile(e);
      e.projectileTimer =
        ATTACKER_PROJECTILE_INTERVAL_MIN +
        Math.random() * (ATTACKER_PROJECTILE_INTERVAL_MAX - ATTACKER_PROJECTILE_INTERVAL_MIN);
    }

    const startX = e.x;
    const startY = e.y;

    switch (e.movementMode) {
      case 'wander':
        this.updateZombieEnemy(e, dt, speedMult);
        break;
      case 'zigzag':
        this.updateZombieEnemy(e, dt, speedMult);
        e.y += Math.sin(_time * 0.003) * 30 * speedMult * dt;
        e.y = Phaser.Math.Clamp(e.y, e.radius, this.scale.height - e.radius);
        break;
      case 'chase': {
        const toPlayerX = this.playerX - e.x;
        const toPlayerY = this.playerY - e.y;
        const chaseLen = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
        if (chaseLen > 0) {
          e.dirX = toPlayerX / chaseLen;
          e.dirY = toPlayerY / chaseLen;
        }
        e.x += e.dirX! * e.speed * speedMult * dt;
        e.y += e.dirY! * e.speed * speedMult * dt;
        e.x = Phaser.Math.Clamp(e.x, e.radius, this.scale.width - e.radius);
        e.y = Phaser.Math.Clamp(e.y, e.radius, this.scale.height - e.radius);
        break;
      }
    }

    const dx = e.x - startX;
    const dy = e.y - startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0.05) {
      e.dirX = dx / len;
      e.dirY = dy / len;
    }

    if (e.y > this.scale.height + e.radius || e.x < -e.radius || e.x > this.scale.width + e.radius) {
      e.graphics.destroy();
      this.enemies.splice(this.enemies.indexOf(e), 1);
    }
  }

  updateBuffEnemy(e: Enemy, dt: number, speedMult: number): void {
    e.nextDirTimer! -= dt * 1000;
    if (e.nextDirTimer! <= 0) {
      const angle = Math.random() * Math.PI * 2;
      e.dirX = Math.cos(angle);
      e.dirY = Math.sin(angle);
      e.nextDirTimer = 1500 + Math.random() * 1500;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.playerX, this.playerY, e.x, e.y);
    if (distToPlayer < BUFF_REPEL_DISTANCE) {
      const awayX = e.x - this.playerX;
      const awayY = e.y - this.playerY;
      const awayLen = Math.sqrt(awayX * awayX + awayY * awayY);
      if (awayLen > 0) {
        e.dirX = awayX / awayLen;
        e.dirY = awayY / awayLen;
      }
    }

    e.x += e.dirX! * e.speed * speedMult * dt;
    e.y += e.dirY! * e.speed * speedMult * dt;

    e.x = Phaser.Math.Clamp(e.x, e.radius, this.scale.width - e.radius);
    e.y = Phaser.Math.Clamp(e.y, e.radius, this.scale.height - e.radius);

    if (e.y > this.scale.height + e.radius) {
      e.graphics.destroy();
      this.enemies.splice(this.enemies.indexOf(e), 1);
    }
  }

  redrawEnemy(e: Enemy): void {
    e.graphics.clear();
    e.graphics.setPosition(e.x, e.y);

    let heading: number;
    if (e.kind === 'current') {
      if (e.spawnSide === 'top') {
        heading = Math.PI / 2; // facing down
        if (e.curveType === 'sine' && e.spawnTime !== undefined) {
          const elapsed = (this.gameTime - e.spawnTime) / 1000;
          heading += Math.cos(elapsed * 4.5) * 0.35; // sine slope derivative
        }
      } else if (e.spawnSide === 'left') {
        heading = 0; // facing right
        if (e.curveType === 'sine' && e.spawnTime !== undefined) {
          const elapsed = (this.gameTime - e.spawnTime) / 1000;
          heading += Math.cos(elapsed * 4.5) * 0.35;
        }
      } else {
        heading = Math.PI; // facing left
        if (e.curveType === 'sine' && e.spawnTime !== undefined) {
          const elapsed = (this.gameTime - e.spawnTime) / 1000;
          heading -= Math.cos(elapsed * 4.5) * 0.35; // opposite wobble direction
        }
      }
    } else {
      heading = Math.atan2(e.dirY || 1, e.dirX || 0);
    }

    e.graphics.setRotation(heading);

    switch (e.kind) {
      case 'current': this.drawCurrentEnemy(e.graphics, 0, 0, e.radius, e.shape!); break;
      case 'zombie': this.drawZombieEnemy(e.graphics, e.radius); break;
      case 'attacker': this.drawAttackerEnemy(e.graphics, e.radius); break;
      case 'buff': this.drawBuffEnemy(e.graphics, e.radius); break;
    }

    const isFlashing = this.gameTime < (e.hitFlashTime || 0);
    if (isFlashing) {
      e.graphics.fillStyle(0xffffff, 0.9);
      e.graphics.fillCircle(0, 0, e.radius);
    }
  }

  handleEnemyCollision(e: Enemy, i: number): void {
    switch (e.kind) {
      case 'current':
        if (this.hasShield) { this.hasShield = false; }
        else { this.takeDamage(10); }
        e.graphics.destroy();
        this.enemies.splice(i, 1);
        break;
      case 'zombie':
        if (this.hasShield) { this.killEnemy(e, i, 'triangle'); }
        else {
          this.takeDamage(ZOMBIE_DAMAGE);
          e.graphics.destroy();
          this.enemies.splice(i, 1);
        }
        break;
      case 'attacker':
        if (this.hasShield) { this.killEnemy(e, i, 'circle'); }
        else {
          const dmg = ATTACKER_DAMAGE_MIN + Math.floor(Math.random() * (ATTACKER_DAMAGE_MAX - ATTACKER_DAMAGE_MIN + 1));
          this.takeDamage(dmg);
          e.graphics.destroy();
          this.enemies.splice(i, 1);
        }
        break;
      case 'buff':
        this.pickUpBuff(e, i);
        break;
    }
  }

  killEnemy(e: Enemy, i: number, tokenShape: Shape): void {
    this.killEnemyWithFX(e, i, tokenShape);
  }

  damageEnemy(e: Enemy, i: number, amount: number, spellId?: ComboId): void {
    e.hp -= amount;
    e.hitFlashTime = this.gameTime + 100;
    this.redrawEnemy(e);

    if (e.hp <= 0) {
      const dropMap: Record<EnemyKind, Shape> = {
        current: e.shape || 'triangle',
        zombie: 'triangle',
        attacker: 'circle',
        buff: 'square',
      };
      this.killEnemyWithFX(e, i, dropMap[e.kind], spellId);
    }
  }

  killEnemyWithFX(e: Enemy, i: number, tokenShape: Shape, spellId?: ComboId): void {
    this.dropToken(e.x, e.y, tokenShape);
    this.hasShield = false;
    e.graphics.destroy();
    this.enemies.splice(i, 1);

    this.cameras.main.shake(50, 0.02);

    const col = spellId ? SPELL_COLORS[spellId] : 0xff5533;
    const r = (col >> 16) & 0xff;
    const gb = (col >> 8) & 0xff;
    const b = col & 0xff;
    this.cameras.main.flash(60, r, gb, b, true);

    this.spawnGeometricExplosion(e.x, e.y, col);

    this.fxRings.push({
      x: e.x,
      y: e.y,
      radius: e.radius,
      maxRadius: e.radius * 3.5,
      color: col,
      alpha: 1.0,
      life: 0,
      maxLife: 350,
    });

    const txt = this.add
      .text(e.x, e.y - 10, '+10', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setDepth(15);
    this.tweens.add({
      targets: txt,
      y: e.y - 45,
      alpha: 0,
      duration: 800,
      onComplete: () => txt.destroy(),
    });

    this.killTimestamps.push(this.gameTime);
    this.score += KILL_SCORE_BASE;
    this.scoreText.setText(`Score: ${Math.floor(this.score)}`);

    this.totalKillsCount++;
    if (this.totalKillsCount % 10 === 0) {
      this.applyProgressionDifficulty();
    }
  }

  applyProgressionDifficulty(): void {
    const level = Math.floor(this.totalKillsCount / 10);
    const newDelay = Math.max(400, SPAWN_INTERVAL * Math.pow(0.9, level));
    if (this.spawnTimer) this.spawnTimer.destroy();
    this.spawnTimer = this.time.addEvent({
      delay: newDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.difficultySpeedMultiplier = Math.pow(1.05, level);

    const banner = this.add
      .text(this.scale.width / 2, this.scale.height * 0.3, `DIFFICULTY INCREASED!\nSPEED +5% | SPAWNS +10%`, {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: '#ff3366',
        stroke: '#000000',
        strokeThickness: 6,
        resolution: 2,
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(15)
      .setScale(0.2)
      .setAlpha(0);

    // elastic pop-in
    this.tweens.add({
      targets: banner,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        // subtle pulse wobble
        this.tweens.add({
          targets: banner,
          scaleX: 1.06,
          scaleY: 1.06,
          duration: 300,
          yoyo: true,
          repeat: 2,
        });
      }
    });

    // slide and fade out
    this.tweens.add({
      targets: banner,
      y: this.scale.height * 0.24,
      alpha: 0,
      delay: 1400,
      duration: 500,
      onComplete: () => banner.destroy(),
    });
  }

  spawnGeometricExplosion(x: number, y: number, color: number): void {
    // Camera shake for heavy impact feel
    this.cameras.main.shake(120, 0.012);

    // Expanding shockwave rings (bloom effect)
    for (let r = 0; r < 2; r++) {
      this.fxRings.push({
        x,
        y,
        radius: 5,
        maxRadius: 40 + r * 22,
        color,
        alpha: 0.9,
        life: 0,
        maxLife: 200 + r * 100,
      });
    }

    // High density spray of tiny particles
    const shapes: Array<Shape | 'star'> = ['triangle', 'circle', 'square', 'star'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 220;
      this.fxParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        shape: shapes[Math.floor(Math.random() * shapes.length)]!,
        alpha: 1.0,
        size: 1.2 + Math.random() * 2.3,
        life: 0,
        maxLife: 350 + Math.random() * 450,
      });
    }
  }

  takeDamage(amount: number): void {
    if (this.isGameOver) return;
    if (this.gameTime < this.lastDamageTime + 1000) return;

    this.lastDamageTime = this.gameTime;
    this.hp = Math.max(0, this.hp - amount);
    this.drawHpBar();

    this.fxRings.push({
      x: this.playerX,
      y: this.playerY,
      radius: PLAYER_RADIUS,
      maxRadius: PLAYER_RADIUS + 30,
      color: 0xff3333,
      alpha: 1.0,
      life: 0,
      maxLife: 350,
    });

    if (this.hp <= 0) this.endGame();
  }

  pickUpBuff(e: Enemy, i: number): void {
    const roll = Math.random();
    if (roll < 0.34) {
      this.hp = Math.min(MAX_HP, this.hp + BUFF_HEAL);
      this.drawHpBar();
    } else if (roll < 0.67) {
      this.speedBoostTimer = BUFF_SPEED_DURATION;
    } else {
      this.hasShield = true;
    }
    e.graphics.destroy();
    this.enemies.splice(i, 1);
  }

  // ─── Enemy builders ──────────────────────────────────────────────────────────

  pickEnemyKind(): EnemyKind {
    const roll = Math.random() * 100;
    if (roll < CURRENT_SPAWN_WEIGHT) return 'current';
    if (roll < CURRENT_SPAWN_WEIGHT + ZOMBIE_SPAWN_WEIGHT) return 'zombie';
    if (roll < CURRENT_SPAWN_WEIGHT + ZOMBIE_SPAWN_WEIGHT + ATTACKER_SPAWN_WEIGHT) return 'attacker';
    return 'buff';
  }

  spawnEnemy(): void {
    if (this.isGameOver) return;
    switch (this.pickEnemyKind()) {
      case 'current': this.buildCurrentEnemy(); break;
      case 'zombie': this.buildZombieEnemy(); break;
      case 'attacker': this.buildAttackerEnemy(); break;
      case 'buff': this.buildBuffEnemy(); break;
    }
  }

  buildCurrentEnemy(): void {
    const shapes = ['triangle', 'circle', 'square'] as const;
    const shape = shapes[Math.floor(Math.random() * shapes.length)]!;
    const radius = 9 + Math.random() * 10;
    const speed = (60 + Math.random() * 80) * this.difficultySpeedMultiplier;

    // Randomly select spawn side: top, left, right
    const sides = ['top', 'left', 'right'] as const;
    const spawnSide = sides[Math.floor(Math.random() * sides.length)]!;

    // Randomly select curve: sine, exponential, logarithmic, straight
    const curves = ['sine', 'exponential', 'logarithmic', 'straight'] as const;
    const curveType = curves[Math.floor(Math.random() * curves.length)]!;

    const { width, height } = this.scale;
    let x: number;
    let y: number;
    const dirX = Math.random() < 0.5 ? -1 : 1;
    const dirY = Math.random() < 0.5 ? -1 : 1;

    if (spawnSide === 'top') {
      x = radius + Math.random() * (width - radius * 2);
      y = -radius;
    } else if (spawnSide === 'left') {
      x = -radius;
      y = radius + Math.random() * (height * 0.6); // spawn in upper 60%
    } else {
      x = width + radius;
      y = radius + Math.random() * (height * 0.6);
    }

    const graphics = this.add.graphics().setDepth(5);
    const enemy: Enemy = {
      kind: 'current',
      graphics,
      x,
      y,
      radius,
      speed,
      shape,
      hp: ENEMY_HP.current,
      slowTimer: 0,
      spawnSide,
      curveType,
      dirX,
      dirY,
      spawnTime: this.gameTime,
      baseX: x,
      baseY: y,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  buildZombieEnemy(): void {
    const radius = ZOMBIE_RADIUS;
    const speed = (30 + Math.random() * 10) * this.difficultySpeedMultiplier;
    // Spawn from top edge or left/right edges only — never inside the screen
    const { width } = this.scale;
    const side = Math.random();
    let x: number;
    let y: number;
    let dirX: number;
    let dirY: number;
    if (side < 0.6) {
      // Top edge
      x = radius + Math.random() * (width - radius * 2);
      y = -radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = 1;
    } else if (side < 0.8) {
      // Left edge
      x = -radius;
      y = Math.random() * (this.scale.height * 0.6);
      dirX = 1;
      dirY = (Math.random() - 0.5) * 0.6;
    } else {
      // Right edge
      x = width + radius;
      y = Math.random() * (this.scale.height * 0.6);
      dirX = -1;
      dirY = (Math.random() - 0.5) * 0.6;
    }
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    dirX /= len; dirY /= len;
    const graphics = this.add.graphics().setDepth(5);
    const enemy: Enemy = {
      kind: 'zombie', graphics, x, y, radius, speed,
      hp: ENEMY_HP.zombie, slowTimer: 0,
      dirX, dirY, nextDirTimer: 2500,
      damageMin: ZOMBIE_DAMAGE, damageMax: ZOMBIE_DAMAGE,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  buildAttackerEnemy(): void {
    const radius = ATTACKER_RADIUS;
    const speed = (40 + Math.random() * 20) * this.difficultySpeedMultiplier;
    // Always spawn from top edge
    const x = radius + Math.random() * (this.scale.width - radius * 2);
    const y = -radius;
    const modes: Array<'wander' | 'zigzag' | 'chase'> = ['wander', 'zigzag', 'chase'];
    const movementMode = modes[Math.floor(Math.random() * modes.length)]!;
    const graphics = this.add.graphics().setDepth(5);
    const enemy: Enemy = {
      kind: 'attacker', graphics, x, y, radius, speed,
      hp: ENEMY_HP.attacker, slowTimer: 0,
      dirX: (Math.random() - 0.5) * 0.4,
      dirY: 1,
      nextDirTimer: 2000, movementMode,
      projectileTimer: ATTACKER_PROJECTILE_INTERVAL_MIN + Math.random() * (ATTACKER_PROJECTILE_INTERVAL_MAX - ATTACKER_PROJECTILE_INTERVAL_MIN),
      damageMin: ATTACKER_DAMAGE_MIN, damageMax: ATTACKER_DAMAGE_MAX,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  buildBuffEnemy(): void {
    const radius = BUFF_RADIUS;
    const speed = (20 + Math.random() * 15) * this.difficultySpeedMultiplier;
    // Spawn from top edge
    const x = radius + Math.random() * (this.scale.width - radius * 2);
    const y = -radius;
    const buffKinds: Array<'heal' | 'speed' | 'shield'> = ['heal', 'speed', 'shield'];
    const buffKind = buffKinds[Math.floor(Math.random() * buffKinds.length)]!;
    const graphics = this.add.graphics().setDepth(5);
    const enemy: Enemy = {
      kind: 'buff', graphics, x, y, radius, speed,
      hp: ENEMY_HP.buff, slowTimer: 0,
      dirX: (Math.random() - 0.5) * 0.4,
      dirY: 1,
      nextDirTimer: 1500, buffKind,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  // ─── Enemy draw functions ────────────────────────────────────────────────────

  drawCurrentEnemy(g: Phaser.GameObjects.Graphics, cx: number, cy: number, radius: number, shape: Shape): void {
    const heading = Math.PI / 2;
    switch (shape) {
      case 'triangle': this.drawSmallFish(g, cx, cy, radius, 0xff6600, 0xffffff, heading); break;
      case 'circle': this.drawSmallFish(g, cx, cy, radius, 0x1565c0, 0xffee58, heading); break;
      case 'square': this.drawSmallFish(g, cx, cy, radius, 0xab47bc, 0xfff176, heading); break;
    }
  }

  private drawSmallFish(
    g: Phaser.GameObjects.Graphics,
    cx: number, cy: number, r: number,
    bodyColor: number, accentColor: number, _heading: number,
  ): void {
    // Top-down view facing Right (0 radians). Symmetrical teardrop/ellipse body, tail on left, eyes on right.
    const rw = r * 1.25;  // body horizontal radius
    const rh = r * 0.72;  // body vertical radius

    // Soft glow
    g.fillStyle(bodyColor, 0.18);
    g.fillCircle(cx, cy, r + 6);

    // Tail fin (at left)
    g.fillStyle(bodyColor, 0.85);
    g.lineStyle(1.5, 0x000000, 0.95);
    g.beginPath();
    g.moveTo(cx - rw * 0.8, cy);                   // base of tail
    g.lineTo(cx - rw * 1.5, cy - rh * 1.0);       // upper tip
    g.lineTo(cx - rw * 1.2, cy);                   // notch center
    g.lineTo(cx - rw * 1.5, cy + rh * 1.0);       // lower tip
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Symmetrical Pectoral fins (top and bottom sides)
    g.fillStyle(bodyColor, 0.7);
    g.fillEllipse(cx - rw * 0.25, cy - rh - 2, rw * 0.4, rh * 0.7);
    g.strokeEllipse(cx - rw * 0.25, cy - rh - 2, rw * 0.4, rh * 0.7);
    g.fillEllipse(cx - rw * 0.25, cy + rh + 2, rw * 0.4, rh * 0.7);
    g.strokeEllipse(cx - rw * 0.25, cy + rh + 2, rw * 0.4, rh * 0.7);

    // Body base outline + fill
    g.fillStyle(0x000000, 1);
    g.fillEllipse(cx, cy, rw * 2 + 2.5, rh * 2 + 2.5);
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(cx, cy, rw * 2, rh * 2);
    g.strokeEllipse(cx, cy, rw * 2, rh * 2);

    // Geometric bone-ridge/spine down the center (accent color)
    g.lineStyle(1.8, accentColor, 0.85);
    g.lineBetween(cx - rw * 0.6, cy, cx + rw * 0.3, cy);
    for (let sx = cx - rw * 0.4; sx <= cx + rw * 0.1; sx += rw * 0.3) {
      g.lineBetween(sx, cy, sx - rw * 0.15, cy - rh * 0.35);
      g.lineBetween(sx, cy, sx - rw * 0.15, cy + rh * 0.35);
    }

    // Two big glowing eyes (symmetric on top and bottom of head)
    const eyeX = cx + rw * 0.5;
    const eyeYOffset = rh * 0.42;

    // Eye 1 (top)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(eyeX, cy - eyeYOffset, 3.8);
    g.fillStyle(0x000000, 1);
    g.fillCircle(eyeX + 0.8, cy - eyeYOffset, 2.0);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(eyeX - 0.4, cy - eyeYOffset - 0.4, 0.8);

    // Eye 2 (bottom)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(eyeX, cy + eyeYOffset, 3.8);
    g.fillStyle(0x000000, 1);
    g.fillCircle(eyeX + 0.8, cy + eyeYOffset, 2.0);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(eyeX - 0.4, cy + eyeYOffset + 0.4, 0.8);
  }


  drawZombieEnemy(g: Phaser.GameObjects.Graphics, r: number): void {
    // Soft neon green glow
    g.fillStyle(0x00ff66, 0.15);
    g.fillCircle(0, 0, r + 6);

    // Dark green octagon/diamond body with neon green outline
    g.fillStyle(0x1a4a2a, 1);
    g.lineStyle(2, 0x00ff66, 1);
    g.beginPath();
    g.moveTo(0, -r);
    g.lineTo(r * 0.8, -r * 0.4);
    g.lineTo(r, 0);
    g.lineTo(r * 0.8, r * 0.4);
    g.lineTo(0, r);
    g.lineTo(-r * 0.8, r * 0.4);
    g.lineTo(-r, 0);
    g.lineTo(-r * 0.8, -r * 0.4);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Inner glowing core
    g.fillStyle(0x00ff66, 0.7);
    g.fillCircle(0, 0, r * 0.42);

    // Neon eye dots (facing right / positive X)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(r * 0.35, -r * 0.22, 2.5);
    g.fillCircle(r * 0.35, r * 0.22, 2.5);
    g.fillStyle(0xff0000, 1); // red pupils
    g.fillCircle(r * 0.4, -r * 0.22, 1.2);
    g.fillCircle(r * 0.4, r * 0.22, 1.2);
  }

  drawAttackerEnemy(g: Phaser.GameObjects.Graphics, r: number): void {
    // Soft neon red/orange glow
    g.fillStyle(0xff4422, 0.15);
    g.fillCircle(0, 0, r + 6);

    // Spiky spikestar/arrowhead pointing right (positive X)
    g.fillStyle(0x3e1108, 1);
    g.lineStyle(2.2, 0xff4422, 1);
    g.beginPath();
    g.moveTo(r * 1.35, 0);
    g.lineTo(-r * 0.8, -r * 0.75);
    g.lineTo(-r * 0.35, 0);
    g.lineTo(-r * 0.8, r * 0.75);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Inner core
    g.fillStyle(0xff9900, 0.85);
    g.fillCircle(0, 0, r * 0.38);

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(r * 0.3, -r * 0.2, 2.2);
    g.fillCircle(r * 0.3, r * 0.2, 2.2);
  }

  drawBuffEnemy(g: Phaser.GameObjects.Graphics, r: number): void {
    // Golden glow
    g.fillStyle(0xffd740, 0.2);
    g.fillCircle(0, 0, r + 8);

    // Outer golden hexagon
    g.fillStyle(0x3e3208, 1);
    g.lineStyle(2.5, 0xffd740, 1);
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      g.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Inner glowing ring
    g.lineStyle(1.5, 0xffffff, 0.85);
    g.strokeCircle(0, 0, r * 0.65);

    // Plus symbol (+) in the center
    g.lineStyle(2, 0xffffff, 1.0);
    g.lineBetween(-r * 0.3, 0, r * 0.3, 0);
    g.lineBetween(0, -r * 0.3, 0, r * 0.3);
  }

  // ─── Projectiles ─────────────────────────────────────────────────────────────

  spawnAttackerProjectile(e: Enemy): void {
    const toX = this.playerX - e.x;
    const toY = this.playerY - e.y;
    const len = Math.sqrt(toX * toX + toY * toY);
    if (len === 0) return;
    const vx = (toX / len) * PROJECTILE_SPEED;
    const vy = (toY / len) * PROJECTILE_SPEED;
    const damage = ATTACKER_DAMAGE_MIN + Math.floor(Math.random() * (ATTACKER_DAMAGE_MAX - ATTACKER_DAMAGE_MIN + 1));
    const graphics = this.add.graphics().setDepth(6);
    const proj: Projectile = { graphics, x: e.x, y: e.y, vx, vy, radius: PROJECTILE_RADIUS, damage };
    this.projectiles.push(proj);
    this.drawProjectile(proj);
  }

  updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      if (this.isGameOver) return;
      const p = this.projectiles[i];
      if (!p) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0 || p.x > this.scale.width || p.y < 0 || p.y > this.scale.height) {
        p.graphics.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      this.drawProjectile(p);

      const dist = Phaser.Math.Distance.Between(this.playerX, this.playerY, p.x, p.y);
      if (dist < PLAYER_RADIUS + p.radius) {
        if (this.hasShield) { this.hasShield = false; }
        else { this.takeDamage(p.damage); }
        p.graphics.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  drawProjectile(p: Projectile): void {
    p.graphics.clear();
    const heading = Math.atan2(p.vy, p.vx);
    const cos = Math.cos(heading);
    const sin = Math.sin(heading);

    p.graphics.lineStyle(1.2, 0x888899, 0.45);
    p.graphics.lineBetween(p.x, p.y, p.x - cos * 25, p.y - sin * 25);

    p.graphics.lineStyle(2, 0xff5533, 1.0);
    p.graphics.beginPath();
    const sx = p.x - cos * 6;
    const sy = p.y - sin * 6;
    p.graphics.moveTo(sx, sy);
    p.graphics.lineTo(p.x, p.y);
    const bx1 = p.x + cos * 3 - sin * 4;
    const by1 = p.y + sin * 3 + cos * 4;
    const bx2 = p.x - cos * 1 - sin * 6;
    const by2 = p.y - sin * 1 + cos * 6;
    p.graphics.lineTo(bx1, by1);
    p.graphics.lineTo(bx2, by2);
    p.graphics.strokePath();
    p.graphics.fillStyle(0xffffff, 1);
    p.graphics.fillCircle(bx2, by2, 1.2);
  }

  // ─── Tokens ──────────────────────────────────────────────────────────────────

  updateTokens(_time: number): void {
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      if (this.isGameOver) return;
      const t = this.tokens[i];
      if (!t) continue;

      // Jitter/vibration offset + vertical bobbing
      const vibeX = t.x + Math.sin(_time * 0.045 + t.bobOffset * 15) * 1.4;
      const vibeY = t.y + Math.cos(_time * 0.045 + t.bobOffset * 15) * 1.4 + Math.sin((_time * TOKEN_BOB_SPEED + t.bobOffset) * Math.PI * 2) * TOKEN_BOB_AMPLITUDE;

      this.drawToken(t, vibeY, vibeX);

      const dist = Phaser.Math.Distance.Between(this.playerX, this.playerY, t.x, t.y);
      if (dist < PICKUP_RADIUS) {
        this.inventory[t.shape]++;

        const isDaily = t.shape === this.dailyGlyph;
        const scoreGain = isDaily ? 20 : 10;
        this.score += scoreGain;
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`);

        const txt = this.add
          .text(t.x, vibeY - 10, isDaily ? '+20 DAILY! ★' : '+10', {
            fontFamily: 'Arial Black',
            fontSize: '12px',
            color: isDaily ? '#ffcc00' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 2.5,
            resolution: 2,
          })
          .setOrigin(0.5)
          .setDepth(15);
        this.tweens.add({
          targets: txt,
          y: vibeY - 40,
          alpha: 0,
          duration: 700,
          onComplete: () => txt.destroy(),
        });

        this.redrawInventoryHud();
        this.redrawComboBar();
        t.graphics.destroy();
        this.tokens.splice(i, 1);
      }
    }
  }

  dropToken(x: number, y: number, shape: Shape): void {
    const graphics = this.add.graphics().setDepth(4);
    const token: Token = { graphics, x, y, radius: TOKEN_RADIUS, shape, bobOffset: Math.random() };
    this.tokens.push(token);
    this.drawToken(token, y, x);
  }

  spawnAmbientPotionOrb(): void {
    if (this.isGameOver) return;
    const shapes = ['triangle', 'circle', 'square'] as const;
    const shape = shapes[Math.floor(Math.random() * shapes.length)]!;

    // Spawn at random location leaving screen margins
    const margin = 50;
    const rx = margin + Math.random() * (this.scale.width - margin * 2);
    const ry = margin + Math.random() * (this.scale.height - margin * 2);

    this.dropToken(rx, ry, shape);
  }

  drawToken(t: Token, y: number, x: number): void {
    t.graphics.clear();

    const color =
      t.shape === 'triangle' ? TOKEN_TRIANGLE_COLOR
      : t.shape === 'circle' ? TOKEN_CIRCLE_COLOR
      : TOKEN_SQUARE_COLOR;

    t.graphics.fillStyle(color, 0.3);
    t.graphics.fillCircle(x, y, t.radius + 6);

    t.graphics.fillStyle(color, 0.65);
    t.graphics.lineStyle(1.8, 0xffffff, 0.85);
    t.graphics.fillCircle(x, y, t.radius);
    t.graphics.strokeCircle(x, y, t.radius);

    t.graphics.fillStyle(0xffffff, 0.85);
    t.graphics.lineStyle(1.0, color, 1.0);
    switch (t.shape) {
      case 'triangle': this.drawTriangle(t.graphics, x, y, t.radius * 0.45); break;
      case 'circle':
        t.graphics.fillCircle(x, y, t.radius * 0.4);
        t.graphics.strokeCircle(x, y, t.radius * 0.4);
        break;
      case 'square': {
        const h = t.radius * 0.35;
        t.graphics.fillRect(x - h, y - h, h * 2, h * 2);
        t.graphics.strokeRect(x - h, y - h, h * 2, h * 2);
        break;
      }
    }

    t.graphics.fillStyle(0xffffff, 0.95);
    t.graphics.fillCircle(x - t.radius * 0.35, y - t.radius * 0.35, 1.8);
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────────

  drawHpBar(): void {
    if (!this.hpBar) return;
    this.hpBar.clear();
    const { height } = this.scale;
    const barY = height - 32; // adjusted slightly upward to match larger height
    const barX = 8;

    // Glowing outline if low health (<= 30%)
    if (this.hp <= 30) {
      const glowAlpha = 0.3 + Math.sin(this.gameTime * 0.012) * 0.2;
      this.hpBar.fillStyle(0xff0000, glowAlpha);
      this.hpBar.fillRect(barX - 4, barY - 4, HP_BAR_WIDTH + 8, HP_BAR_HEIGHT + 8);
    }

    // Background bar
    this.hpBar.fillStyle(0x222222, 0.8);
    this.hpBar.fillRect(barX, barY, HP_BAR_WIDTH, HP_BAR_HEIGHT);

    // HP Fill
    const fillWidth = (this.hp / MAX_HP) * HP_BAR_WIDTH;
    const fillColor = this.hp > 50 ? 0x44ff44 : this.hp > 30 ? 0xffaa00 : 0xff0000;
    this.hpBar.fillStyle(fillColor, 1);
    this.hpBar.fillRect(barX, barY, fillWidth, HP_BAR_HEIGHT);

    // Bevel highlight
    this.hpBar.fillStyle(0xffffff, 0.12);
    this.hpBar.fillRect(barX, barY, fillWidth, HP_BAR_HEIGHT / 3);

    if (this.hpText) this.hpText.setPosition(barX, barY - 18);
    if (this.boosterText) this.boosterText.setPosition(barX, barY + HP_BAR_HEIGHT + 4);
  }

  redrawInventoryHud(): void {
    if (!this.inventoryGraphics) return;
    const { width } = this.scale;
    const icons: { shape: Shape; color: number }[] = [
      { shape: 'triangle', color: TOKEN_TRIANGLE_COLOR },
      { shape: 'circle', color: TOKEN_CIRCLE_COLOR },
      { shape: 'square', color: TOKEN_SQUARE_COLOR },
    ];
    const y = 18;
    const step = 32;
    // Right-align: square at right edge, then circle, then triangle
    const baseX = width - 14;

    this.inventoryGraphics.clear();
    for (let idx = 0; idx < icons.length; idx++) {
      const icon = icons[icons.length - 1 - idx]!;
      const iconX = baseX - 20 - idx * step;

      this.inventoryGraphics.fillStyle(icon.color, 0.18);
      this.inventoryGraphics.fillCircle(iconX, y, 13);

      this.inventoryGraphics.fillStyle(icon.color, 1);
      this.inventoryGraphics.lineStyle(1.5, 0xffffff, 0.8);
      switch (icon.shape) {
        case 'triangle': this.drawTriangle(this.inventoryGraphics, iconX, y, 10); break;
        case 'circle':
          this.inventoryGraphics.fillCircle(iconX, y, 10);
          this.inventoryGraphics.strokeCircle(iconX, y, 10);
          break;
        case 'square':
          this.inventoryGraphics.fillRect(iconX - 10, y - 10, 20, 20);
          this.inventoryGraphics.strokeRect(iconX - 10, y - 10, 20, 20);
          break;
      }
    }

    // Reposition count texts
    const squareX = baseX - 20;
    const circleX = baseX - 20 - step;
    const triangleX = baseX - 20 - step * 2;

    if (this.invSquareText) {
      this.invSquareText.setText(`${this.inventory.square}`);
      this.invSquareText.setPosition(squareX + 14, y + 10).setOrigin(1, 0);
    }
    if (this.invCircleText) {
      this.invCircleText.setText(`${this.inventory.circle}`);
      this.invCircleText.setPosition(circleX + 14, y + 10).setOrigin(1, 0);
    }
    if (this.invTriangleText) {
      this.invTriangleText.setText(`${this.inventory.triangle}`);
      this.invTriangleText.setPosition(triangleX + 14, y + 10).setOrigin(1, 0);
    }
  }

  // ─── Primitive helpers ───────────────────────────────────────────────────────

  drawTriangle(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
    const a = Math.PI / 2;
    const x1 = cx + r * Math.cos(a);
    const y1 = cy - r * Math.sin(a);
    const x2 = cx + r * Math.cos(a + (2 * Math.PI) / 3);
    const y2 = cy - r * Math.sin(a + (2 * Math.PI) / 3);
    const x3 = cx + r * Math.cos(a + (4 * Math.PI) / 3);
    const y3 = cy - r * Math.sin(a + (4 * Math.PI) / 3);

    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.lineTo(x3, y3);
    g.closePath();
    g.fillPath();
    g.strokePath();
  }

  drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
    g.fillStyle(0xfff0aa, 1);
    g.lineStyle(1, 0xffffff, 0.55);
    const points = 5;
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.42;
      const sx = cx + Math.cos(angle) * rr;
      const sy = cy + Math.sin(angle) * rr;
      if (i === 0) g.moveTo(sx, sy);
      else g.lineTo(sx, sy);
    }
    g.closePath();
    g.fillPath();
    g.strokePath();
  }

  // ─── Combo system ────────────────────────────────────────────────────────────

  isAffordable(combo: ComboDefinition): boolean {
    return (
      this.inventory.triangle >= combo.requires.triangle &&
      this.inventory.circle >= combo.requires.circle &&
      this.inventory.square >= combo.requires.square
    );
  }

  castSpell(mouseX: number, mouseY: number): void {
    if (this.isGameOver) return;
    const combo = COMBOS[this.selectedCombo]!;
    if (!this.isAffordable(combo)) return;

    this.inventory.triangle -= combo.requires.triangle;
    this.inventory.circle -= combo.requires.circle;
    this.inventory.square -= combo.requires.square;

    this.redrawInventoryHud();
    this.redrawComboBar();
    this.triggerSpellEffect(combo.id, mouseX, mouseY);
  }

  triggerSpellEffect(id: ComboId, mx: number, my: number): void {
    if (this.isGameOver) return;

    this.cameras.main.shake(100, 0.008);

    let dx = mx - this.playerX;
    let dy = my - this.playerY;
    let len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) { dx = 0; dy = -1; len = 1; }
    const ux = dx / len;
    const uy = dy / len;

    switch (id) {
      case 'trident': {
        this.lastCastId++;
        const castId = this.lastCastId;
        this.tridentHits.set(castId, new Set<Enemy>());

        const coneAngles = [-0.18, 0, 0.18]; // coned region offsets in radians (~10 degrees left/right)
        const baseAngle = Math.atan2(uy, ux);
        
        coneAngles.forEach((offset) => {
          const angle = baseAngle + offset;
          const tvx = Math.cos(angle) * TRIDENT_SPEED;
          const tvy = Math.sin(angle) * TRIDENT_SPEED;
          const graphics = this.add.graphics().setDepth(7);
          
          this.spellProjectiles.push({
            graphics,
            x: this.playerX, y: this.playerY,
            vx: tvx, vy: tvy,
            spell: 'trident',
            damage: TRIDENT_DAMAGE,
            piercing: true,
            explosionRadius: 0,
            slowFactor: 1.0,
            slowDuration: 0,
            hitEnemies: new Set(),
            lifetime: SPELL_LIFETIME,
            chainCount: 0,
            castId,
          });
        });
        break;
      }
      case 'nova': {
        this.fxRings.push({
          x: this.playerX, y: this.playerY,
          radius: 10, maxRadius: NOVA_RADIUS,
          color: SPELL_COLORS.nova,
          alpha: 1.0, life: 0, maxLife: NOVA_DURATION,
        });

        const list = [...this.enemies];
        let hitCount = 0;
        for (let i = list.length - 1; i >= 0; i--) {
          const e = list[i]!;
          const d = Phaser.Math.Distance.Between(this.playerX, this.playerY, e.x, e.y);
          if (d <= NOVA_RADIUS) {
            const idx = this.enemies.indexOf(e);
            if (idx !== -1) {
              this.damageEnemy(e, idx, NOVA_DAMAGE, 'nova');
              hitCount++;
            }
          }
        }
        this.bestNovaChain = Math.max(this.bestNovaChain, hitCount);
        break;
      }
      case 'lightning': {
        let currentSourceX = this.playerX;
        let currentSourceY = this.playerY;
        const hitSet = new Set<Enemy>();
        const pathPoints: Array<{ m1x: number; m1y: number; m2x: number; m2y: number; tx: number; ty: number }> = [];

        let chainCount = 0;
        let currentDamage = LIGHTNING_DAMAGE;
        const range = 200;

        while (true) {
          let closestEnemy: Enemy | null = null;
          let closestDist = range;

          for (const e of this.enemies) {
            if (hitSet.has(e)) continue;
            const d = Phaser.Math.Distance.Between(currentSourceX, currentSourceY, e.x, e.y);
            if (d < closestDist) { closestDist = d; closestEnemy = e; }
          }

          if (!closestEnemy) break;

          hitSet.add(closestEnemy);
          chainCount++;

          const midX1 = currentSourceX + (closestEnemy.x - currentSourceX) * 0.33 + (Math.random() * 20 - 10);
          const midY1 = currentSourceY + (closestEnemy.y - currentSourceY) * 0.33 + (Math.random() * 20 - 10);
          const midX2 = currentSourceX + (closestEnemy.x - currentSourceX) * 0.66 + (Math.random() * 20 - 10);
          const midY2 = currentSourceY + (closestEnemy.y - currentSourceY) * 0.66 + (Math.random() * 20 - 10);

          pathPoints.push({ m1x: midX1, m1y: midY1, m2x: midX2, m2y: midY2, tx: closestEnemy.x, ty: closestEnemy.y });

          const idx = this.enemies.indexOf(closestEnemy);
          if (idx !== -1) this.damageEnemy(closestEnemy, idx, currentDamage, 'lightning');

          const chainText = this.add.text(closestEnemy.x, closestEnemy.y - closestEnemy.radius - 12, `#${chainCount}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#ffdd44',
            stroke: '#000000',
            strokeThickness: 5,
            resolution: 2,
          }).setOrigin(0.5).setDepth(15);

          this.tweens.add({
            targets: chainText,
            y: chainText.y - 25,
            alpha: 0,
            duration: 800,
            onComplete: () => chainText.destroy(),
          });

          currentDamage = Math.max(1, currentDamage * 0.95);
          currentSourceX = closestEnemy.x;
          currentSourceY = closestEnemy.y;
        }

        if (pathPoints.length > 0) {
          const lGraphics = this.add.graphics().setDepth(13);

          lGraphics.lineStyle(3, 0xffffff, 1.0);
          lGraphics.beginPath();
          lGraphics.moveTo(this.playerX, this.playerY);
          for (const pt of pathPoints) {
            lGraphics.lineTo(pt.m1x, pt.m1y);
            lGraphics.lineTo(pt.m2x, pt.m2y);
            lGraphics.lineTo(pt.tx, pt.ty);
          }
          lGraphics.strokePath();

          lGraphics.lineStyle(6, SPELL_COLORS.lightning, 0.45);
          lGraphics.beginPath();
          lGraphics.moveTo(this.playerX, this.playerY);
          for (const pt of pathPoints) {
            lGraphics.lineTo(pt.m1x, pt.m1y);
            lGraphics.lineTo(pt.m2x, pt.m2y);
            lGraphics.lineTo(pt.tx, pt.ty);
          }
          lGraphics.strokePath();

          this.tweens.add({
            targets: lGraphics,
            alpha: 0,
            duration: 150,
            onComplete: () => lGraphics.destroy(),
          });
        }

        this.bestLightningChain = Math.max(this.bestLightningChain, chainCount);
        break;
      }
      case 'poison': {
        // Poison Vomit: cone of toxic damage forward
        const coneAngle = Math.atan2(uy, ux);

        // Spawn green particles in cone
        for (let wave = 0; wave < POISON_WAVES; wave++) {
          for (let p = 0; p < 8; p++) {
            const spread = (Math.random() * 2 - 1) * POISON_CONE_HALF_ANGLE;
            const pAngle = coneAngle + spread;
            const speed = 120 + Math.random() * 80 + wave * 30;
            this.fxParticles.push({
              x: this.playerX,
              y: this.playerY,
              vx: Math.cos(pAngle) * speed,
              vy: Math.sin(pAngle) * speed,
              color: 0x44ff44,
              shape: 'circle',
              alpha: 0.85,
              size: 3 + Math.random() * 5,
              life: wave * 60,
              maxLife: 600 + wave * 80,
            });
            // Bubble particles
            this.fxParticles.push({
              x: this.playerX + Math.cos(pAngle) * wave * 20,
              y: this.playerY + Math.sin(pAngle) * wave * 20,
              vx: Math.cos(pAngle) * speed * 0.6 + (Math.random() - 0.5) * 40,
              vy: Math.sin(pAngle) * speed * 0.6 + (Math.random() - 0.5) * 40,
              color: 0xaaff44,
              shape: 'circle',
              alpha: 0.6,
              size: 2 + Math.random() * 3,
              life: wave * 60,
              maxLife: 400 + wave * 60,
            });
          }
        }

        // Damage enemies in cone
        const list = [...this.enemies];
        let poisonHits = 0;
        for (let i = list.length - 1; i >= 0; i--) {
          const e = list[i]!;
          const edx = e.x - this.playerX;
          const edy = e.y - this.playerY;
          const dist = Math.sqrt(edx * edx + edy * edy);
          if (dist > POISON_RANGE) continue;

          // Check cone angle
          const enemyAngle = Math.atan2(edy, edx);
          let angleDiff = enemyAngle - coneAngle;
          // Normalize to [-π, π]
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          if (Math.abs(angleDiff) > POISON_CONE_HALF_ANGLE) continue;

          // Damage falloff: 100% at 0, 50% at max range
          const distRatio = dist / POISON_RANGE;
          const damage = POISON_DAMAGE_CLOSE * (1 - distRatio * 0.5);

          const idx = this.enemies.indexOf(e);
          if (idx !== -1) {
            this.damageEnemy(e, idx, damage, 'poison');
            poisonHits++;
          }
        }

        this.bestPoisonChain = Math.max(this.bestPoisonChain, poisonHits);

        // Screen tint flash green
        this.cameras.main.flash(80, 0, 180, 0, true);
        break;
      }
    }
  }

  updateSpellProjectiles(dt: number): void {
    for (let i = this.spellProjectiles.length - 1; i >= 0; i--) {
      if (this.isGameOver) return;
      const p = this.spellProjectiles[i];
      if (!p) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime -= dt * 1000;

      if (
        p.lifetime <= 0 ||
        p.x < -50 || p.x > this.scale.width + 50 ||
        p.y < -50 || p.y > this.scale.height + 50
      ) {
        p.graphics.destroy();
        this.spellProjectiles.splice(i, 1);
        continue;
      }

      // Projectile particle trail
      if (Math.random() < 0.45) {
        const col = SPELL_COLORS[p.spell];
        this.fxParticles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 40 - p.vx * 0.12,
          vy: (Math.random() - 0.5) * 40 - p.vy * 0.12,
          color: col,
          shape: 'circle',
          alpha: 0.85,
          size: 1.2 + Math.random() * 1.8,
          life: 0,
          maxLife: 200 + Math.random() * 200,
        });
      }

      this.drawSpellProjectile(p);

      const list = [...this.enemies];
      let collided = false;
      for (let j = list.length - 1; j >= 0; j--) {
        const e = list[j]!;
        if (p.hitEnemies.has(e)) continue;
        const d = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y);
        if (d < e.radius + 6) {
          p.hitEnemies.add(e);
          const idx = this.enemies.indexOf(e);
          if (idx !== -1) {
            this.damageEnemy(e, idx, p.damage, p.spell);

            // Record unique hit enemies for this trident cast tree
            if (p.spell === 'trident' && p.castId !== undefined) {
              let hitSet = this.tridentHits.get(p.castId);
              if (!hitSet) {
                hitSet = new Set<Enemy>();
                this.tridentHits.set(p.castId, hitSet);
              }
              hitSet.add(e);
              this.bestTridentChain = Math.max(this.bestTridentChain, hitSet.size);
            }

            // Chain reactions: Trident spawns 3 child spears
            if (p.spell === 'trident' && (p.chainCount || 0) < 3) {
              const baseAngle = Math.atan2(p.vy, p.vx);
              const nextChain = (p.chainCount || 0) + 1;
              const chainOffsets = [-0.32, 0, 0.32]; // Spread cone for child spears

              chainOffsets.forEach((offset) => {
                const angle = baseAngle + offset;
                const tvx = Math.cos(angle) * TRIDENT_SPEED;
                const tvy = Math.sin(angle) * TRIDENT_SPEED;
                const graphics = this.add.graphics().setDepth(7);

                const proj: SpellProjectile = {
                  graphics,
                  x: e.x,
                  y: e.y,
                  vx: tvx,
                  vy: tvy,
                  spell: 'trident',
                  damage: p.damage * 0.75, // Reduced damage per chain bounce
                  piercing: true,
                  explosionRadius: 0,
                  slowFactor: 1.0,
                  slowDuration: 0,
                  hitEnemies: new Set([e]), // Ignore the parent hit enemy
                  lifetime: SPELL_LIFETIME * 0.8, // Shorter lifetime
                  chainCount: nextChain,
                };
                if (p.castId !== undefined) {
                  proj.castId = p.castId;
                }
                this.spellProjectiles.push(proj);
              });
            }
          }
          if (!p.piercing) { collided = true; break; }
        }
      }

      if (collided) {
        p.graphics.destroy();
        this.spellProjectiles.splice(i, 1);
      }
    }
  }

  drawSpellProjectile(p: SpellProjectile): void {
    p.graphics.clear();
    const col = SPELL_COLORS[p.spell];

    switch (p.spell) {
      case 'trident':
        p.graphics.lineStyle(3, col, 1.0);
        p.graphics.lineBetween(p.x, p.y, p.x - p.vx * 0.05, p.y - p.vy * 0.05);
        p.graphics.fillStyle(0xffffff, 1);
        p.graphics.fillCircle(p.x, p.y, 2.5);
        break;
    }
  }

  // ─── Layout helpers ──────────────────────────────────────────────────────────

  getLayoutMode(): LayoutMode {
    const { width, height } = this.scale;
    if (width > 768) return 'desktop';
    if (width > height) return 'mobileLandscape';
    return 'mobilePortrait';
  }

  refreshComboBarLayout(): void {
    this.layoutMode = this.getLayoutMode();
    this.redrawComboBar();
  }

  /**
   * Cycle to the next/prev affordable spell.
   * If no affordable spell exists, stay on current.
   */
  cycleToAffordableSpell(direction: 1 | -1): void {
    const start = this.selectedCombo;
    let next = (start + direction + COMBOS.length) % COMBOS.length;
    // Walk up to COMBOS.length steps to find an affordable one
    for (let attempt = 0; attempt < COMBOS.length; attempt++) {
      if (this.isAffordable(COMBOS[next]!)) {
        this.selectedCombo = next;
        this.redrawComboBar();
        return;
      }
      next = (next + direction + COMBOS.length) % COMBOS.length;
    }
    // No affordable spell found — keep current selection but redraw
    this.redrawComboBar();
  }

  // ─── Combo bar: right column on desktop, bottom row on mobile ────────────────

  redrawComboBar(): void {
    if (!this.comboBarGraphics) return;
    this.comboBarGraphics.clear();
    this.spellTouchZones = [];

    const { width, height } = this.scale;
    const mode = this.layoutMode;

    if (mode === 'desktop') {
      // Right column — vertically centered
      const slotW = SPELL_SLOT_W;
      const slotH = SPELL_SLOT_H;
      const slotPad = SPELL_SLOT_PAD;
      const totalH = COMBOS.length * slotH + (COMBOS.length - 1) * slotPad;
      const startY = (height - totalH) / 2;
      const startX = width - slotW - SPELL_COL_MARGIN;

      for (let i = 0; i < COMBOS.length; i++) {
        const combo = COMBOS[i]!;
        const slotY = startY + i * (slotH + slotPad);
        const canCast = this.isAffordable(combo);
        const isSel = i === this.selectedCombo;
        this.drawComboSlot(startX, slotY, slotW, slotH, i, combo, canCast, isSel, false);
        this.spellTouchZones.push({ x: startX, y: slotY, w: slotW, h: slotH, comboIndex: i });
      }
    } else {
      // Mobile: bottom row — horizontally centered
      const isLandscape = mode === 'mobileLandscape';
      const slotW = isLandscape ? 78 : Math.floor((width - 8) / COMBOS.length) - 4;
      const slotH = isLandscape ? 46 : 52;
      const slotPad = 4;
      const totalW = COMBOS.length * slotW + (COMBOS.length - 1) * slotPad;
      const startX = (width - totalW) / 2;
      const startY = height - slotH - 2;

      for (let i = 0; i < COMBOS.length; i++) {
        const combo = COMBOS[i]!;
        const slotX = startX + i * (slotW + slotPad);
        const canCast = this.isAffordable(combo);
        const isSel = i === this.selectedCombo;
        this.drawComboSlot(slotX, startY, slotW, slotH, i, combo, canCast, isSel, true);
        this.spellTouchZones.push({ x: slotX, y: startY, w: slotW, h: slotH, comboIndex: i });
      }
    }
  }

  private drawComboSlot(
    slotX: number, slotY: number,
    sw: number, sh: number,
    comboIndex: number,
    combo: ComboDefinition,
    canCast: boolean,
    isSel: boolean,
    horizontal: boolean,
  ): void {
    void horizontal; // layout direction hint (unused in slot draw itself)
    const g = this.comboBarGraphics!;

    // Background
    g.fillStyle(0x0a0a1e, 0.82);
    g.fillRoundedRect(slotX, slotY, sw, sh, 5);

    // Border
    const borderColor =
      isSel && canCast ? 0x00ffcc
      : isSel          ? 0x00f0ff
      : canCast        ? 0x00cc55
      :                  0x2a2a5a;
    const borderAlpha = isSel || canCast ? 1 : 0.35;
    const lineW = isSel || canCast ? 2 : 1;

    if (isSel || canCast) {
      g.lineStyle(6, borderColor, 0.12);
      g.strokeRoundedRect(slotX - 2, slotY - 2, sw + 4, sh + 4, 7);
    }
    g.lineStyle(lineW, borderColor, borderAlpha);
    g.strokeRoundedRect(slotX, slotY, sw, sh, 5);

    // Icons row — top half
    const ir = 5;
    const iconStep = ir * 2 + 3;
    const iconRowY = slotY + sh * 0.3;
    const cx = slotX + sw / 2;
    const totalIconW = iconStep * (combo.icons.length - 1);
    const iconStartX = cx - totalIconW / 2;
    const iconAlpha = canCast ? 1 : 0.3;

    for (let j = 0; j < combo.icons.length; j++) {
      const shape = combo.icons[j]!;
      const ix = iconStartX + j * iconStep;
      const col =
        shape === 'triangle' ? TOKEN_TRIANGLE_COLOR
        : shape === 'circle' ? TOKEN_CIRCLE_COLOR
        : TOKEN_SQUARE_COLOR;
      g.fillStyle(col, iconAlpha);
      g.lineStyle(1, 0xffffff, iconAlpha * 0.65);
      this.drawShapeIcon(g, ix, iconRowY, ir, shape);
    }

    // Spell name text
    const txt = this.comboNameTexts[comboIndex]!;
    txt.setPosition(cx, slotY + sh * 0.72);
    txt.setColor(canCast ? '#ffffff' : '#444466');
    txt.setText(combo.shortName);
    txt.setFontSize('11px');
    txt.setScrollFactor(0);

    // Sel indicator: number key hint
    if (isSel) {
      g.fillStyle(0x00ffcc, 0.18);
      g.fillRoundedRect(slotX, slotY, sw, sh, 5);
    }
  }

  drawShapeIcon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, shape: Shape): void {
    switch (shape) {
      case 'triangle': this.drawTriangle(g, cx, cy, r); break;
      case 'circle':
        g.fillCircle(cx, cy, r);
        g.strokeCircle(cx, cy, r);
        break;
      case 'square': {
        const h = r * 0.85;
        g.fillRect(cx - h, cy - h, h * 2, h * 2);
        g.strokeRect(cx - h, cy - h, h * 2, h * 2);
        break;
      }
    }
  }

  // ─── End game & visual FX ────────────────────────────────────────────────────

  updateFX(dt: number): void {
    if (this.ambientGraphics) {
      this.ambientGraphics.clear();
      for (const star of this.ambientParticles) {
        star.y -= star.speed * dt;
        star.angle += 2.0 * dt;
        const swayX = Math.sin(star.angle) * 0.35;
        star.x += swayX;

        if (star.y < -30) {
          star.y = this.scale.height + 30;
          star.x = Math.random() * this.scale.width;
        }

        const bAlpha = star.alpha * 0.45;
        this.ambientGraphics.fillStyle(0xffffff, bAlpha);
        this.ambientGraphics.fillCircle(star.x, star.y, star.size + 4);
        this.ambientGraphics.lineStyle(1.2, 0xffffff, bAlpha * 1.8);
        this.ambientGraphics.strokeCircle(star.x, star.y, star.size + 4);
        this.ambientGraphics.fillStyle(0xffffff, bAlpha * 2.2);
        this.ambientGraphics.fillCircle(star.x - (star.size + 4) * 0.35, star.y - (star.size + 4) * 0.35, 1.2);
      }
    }

    if (!this.fxGraphics) return;
    this.fxGraphics.clear();

    const dtMs = dt * 1000;

    for (let i = this.fxRings.length - 1; i >= 0; i--) {
      const r = this.fxRings[i]!;
      r.life += dtMs;
      if (r.life >= r.maxLife) { this.fxRings.splice(i, 1); continue; }
      const t = Math.min(1.0, r.life / r.maxLife);
      const currentRadius = r.radius + (r.maxRadius - r.radius) * t;
      const alpha = r.alpha * (1.0 - t);
      this.fxGraphics.lineStyle(2.5, r.color, alpha);
      this.fxGraphics.strokeCircle(r.x, r.y, currentRadius);
    }

    for (let i = this.fxParticles.length - 1; i >= 0; i--) {
      const p = this.fxParticles[i]!;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dtMs;

      if (p.life >= p.maxLife) { this.fxParticles.splice(i, 1); continue; }

      const t = Math.min(1.0, p.life / p.maxLife);
      const alpha = p.alpha * (1.0 - t);

      this.fxGraphics.fillStyle(p.color, alpha);
      this.fxGraphics.lineStyle(1, 0xffffff, alpha * 0.5);
      this.drawFXParticle(this.fxGraphics, p.x, p.y, p.size, p.shape);
    }
  }

  drawFXParticle(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, shape: Shape | 'star'): void {
    switch (shape) {
      case 'triangle': this.drawTriangle(g, x, y, size); break;
      case 'circle':
        g.fillCircle(x, y, size);
        g.strokeCircle(x, y, size);
        break;
      case 'square':
        g.fillRect(x - size, y - size, size * 2, size * 2);
        g.strokeRect(x - size, y - size, size * 2, size * 2);
        break;
      case 'star': this.drawStar(g, x, y, size); break;
    }
  }

  updateComboDisplay(time: number): void {
    const cutOff = time - COMBO_WINDOW_MS;
    this.killTimestamps = this.killTimestamps.filter((ts) => ts >= cutOff);

    const combo = this.killTimestamps.length;
    this.killComboCount = combo;

    this.heatMode = combo >= HEAT_THRESHOLD;
    this.blazeMode = combo >= BLAZE_THRESHOLD;

    if (this.comboCountText) {
      if (combo > 1) {
        if (combo !== this.lastComboCount) {
          this.comboCountText.setText(`x${combo} COMBO!`);
          this.comboCountText.setPosition(this.playerX, this.playerY - PLAYER_RADIUS - 22);
          this.comboCountText.setAlpha(1);

          // Pop size and snap back
          this.tweens.killTweensOf(this.comboCountText);
          this.comboCountText.setScale(1.6);
          this.tweens.add({
            targets: this.comboCountText,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 250,
            ease: 'Back.easeOut',
          });

          // Intense glow/color shift
          const colors = ['#ffd740', '#ffaa00', '#ff0033', '#e040fb'];
          const colIndex = Math.min(colors.length - 1, Math.floor((combo - 2) / 3));
          this.comboCountText.setColor(colors[colIndex]!);
        } else {
          // Keep it positioned above player
          this.comboCountText.setPosition(this.playerX, this.playerY - PLAYER_RADIUS - 22);
        }
      } else {
        this.comboCountText.setAlpha(0);
      }
    }

    this.lastComboCount = combo;

    if (this.blazeGraphics) {
      this.blazeGraphics.clear();
      if (this.blazeMode) {
        const pulse = 0.55 + Math.sin(time * 0.009) * 0.25;
        this.blazeGraphics.lineStyle(10, 0xffbb00, pulse);
        this.blazeGraphics.strokeRect(0, 0, this.scale.width, this.scale.height);
      }
    }

    if (this.heatMode && Math.random() < 0.18) {
      const angle = Math.random() * Math.PI * 2;
      const dist = PLAYER_RADIUS + 4 + Math.random() * 12;
      this.fxParticles.push({
        x: this.playerX + Math.cos(angle) * dist,
        y: this.playerY + Math.sin(angle) * dist,
        vx: Math.cos(angle) * 15,
        vy: Math.sin(angle) * 15,
        color: 0xffdd44,
        shape: 'star',
        alpha: 0.9,
        size: 3 + Math.random() * 4,
        life: 0,
        maxLife: 600 + Math.random() * 400,
      });
    }
  }

  updateBackground(time: number): void {
    if (!this.backgroundGraphics) return;
    const g = this.backgroundGraphics;
    g.clear();

    const width = this.scale.width;
    const height = this.scale.height;

    g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4fc3f7, 0x4fc3f7, 1.0, 1.0, 1.0, 1.0);
    g.fillRect(0, 0, width, height);

    g.fillStyle(0xffffff, 0.09 + Math.sin(time * 0.0008) * 0.03);
    for (let i = 0; i < 4; i++) {
      const xOffset = i * (width / 3.2) + Math.sin(time * 0.0005 + i * 1.5) * 35 - 150;
      g.beginPath();
      g.moveTo(xOffset, 0);
      g.lineTo(xOffset + 35, 0);
      g.lineTo(xOffset + 240 + 160, height);
      g.lineTo(xOffset + 240, height);
      g.closePath();
      g.fillPath();
    }
  }

  endGame(): void {
    this.isGameOver = true;
    if (this.spawnTimer) this.spawnTimer.destroy();
    if (this.scoreTimer) this.scoreTimer.destroy();

    for (const p of this.projectiles) p.graphics.destroy();
    this.projectiles = [];

    for (const sp of this.spellProjectiles) sp.graphics.destroy();
    this.spellProjectiles = [];

    for (const t of this.comboNameTexts) t.destroy();
    this.comboNameTexts = [];

    if (this.comboCountText) this.comboCountText.destroy();
    if (this.blazeGraphics) this.blazeGraphics.destroy();
    if (this.fxGraphics) this.fxGraphics.destroy();
    if (this.dailyGlyphText) this.dailyGlyphText.destroy();
    if (this.ambientGraphics) this.ambientGraphics.destroy();

    if (this.playerGraphics) {
      this.tweens.add({
        targets: this.playerGraphics,
        alpha: 0,
        duration: 300,
        repeat: 2,
        yoyo: true,
      });
    }

    this.time.delayedCall(800, () => {
      this.scene.start('GameOver', {
        score: Math.floor(this.score),
        bestLightningChain: this.bestLightningChain,
        bestNovaChain: this.bestNovaChain,
      });
    });
  }
}