import { Scene } from 'phaser';
import * as Phaser from 'phaser';

type Shape = 'yellow' | 'green' | 'purple';

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
  isFilled?: boolean;
};

type EnemyKind = 'current' | 'zombie' | 'attacker' | 'buff' | 'boss';

type BossParticle = {
  offsetX: number;
  offsetY: number;
  speed: number;
  angle: number;
  color: number;
  size: number;
};

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
  spawnSide?: 'top' | 'left' | 'right' | 'bottom';
  curveType?: 'sine' | 'exponential' | 'logarithmic' | 'straight';
  spawnTime?: number;
  baseX?: number;
  baseY?: number;
  color?: number;
  maxHp?: number;
  state?: 'spawning' | 'idle' | 'minions' | 'spread' | 'charge_windup' | 'charge' | 'shockwave' | 'cooldown';
  stateTimer?: number;
  attackCycle?: number;
  particles?: BossParticle[];
  pulseTimer?: number;
  essenceTimer?: number;
  chargeDirX?: number;
  chargeDirY?: number;
  isMinion?: boolean;
  colorSecondary?: number;
  slowFactor?: number; // 0.0–1.0 speed multiplier while slowed (e.g. 0.4 = 40% speed)
};

type Projectile = {
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isRedCircle?: boolean;
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
  requires: { yellow: number; green: number; purple: number };
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
const ATTACKER_DAMAGE_MIN = 1;
const ATTACKER_DAMAGE_MAX = 3;
const ATTACKER_PROJECTILE_INTERVAL_MIN = 2000;
const ATTACKER_PROJECTILE_INTERVAL_MAX = 3000;
const BUFF_RADIUS = 11;
const BUFF_HEAL = 20;
const BUFF_SPEED_DURATION = 5000;
const BUFF_SPEED_MULTIPLIER = 1.5;
const BUFF_REPEL_DISTANCE = 80;
const CURRENT_SPAWN_WEIGHT = 35;
const ZOMBIE_SPAWN_WEIGHT = 18;
const ATTACKER_SPAWN_WEIGHT = 22;

const ENEMY_COLORS = [
  0xff1744, // Bright Red
  0xf50057, // Bright Pink
  0xd500f9, // Bright Purple
  0x651fff, // Bright Violet
  0x3d5afe, // Bright Indigo
  0x2979ff, // Bright Blue
  0x00e5ff, // Bright Cyan
  0x1de9b6, // Bright Teal
  0x00e676, // Bright Green
  0xffea00, // Bright Yellow
  0xff9100, // Bright Orange
];

// HP bar — bottom-left
const HP_BAR_WIDTH = 220;
const HP_BAR_HEIGHT = 16;

// Right-column spell panel
// Spell layout constants removed

// Drag-to-move threshold (px) — below this = tap
// TAP_THRESHOLD removed

// Token / inventory palette
const TOKEN_YELLOW_COLOR = 0xffcc00;
const TOKEN_GREEN_COLOR = 0x00ff66;
const TOKEN_PURPLE_COLOR = 0xaa44ff;

// 4 spell definitions
const COMBOS: ComboDefinition[] = [
  {
    id: 'trident',
    name: 'Tidal Spear',
    shortName: 'SPEAR',
    requires: { yellow: 3, green: 0, purple: 0 },
    icons: ['yellow', 'yellow', 'yellow'],
  },
  {
    id: 'nova',
    name: 'Abyssal Burst',
    shortName: 'BURST',
    requires: { yellow: 0, green: 3, purple: 0 },
    icons: ['green', 'green', 'green'],
  },
  {
    id: 'lightning',
    name: 'Chain Lightning',
    shortName: 'LIGHTNING',
    requires: { yellow: 0, green: 2, purple: 1 },
    icons: ['green', 'green', 'purple'],
  },
  {
    id: 'poison',
    name: 'Poison Vomit',
    shortName: 'POISON',
    requires: { yellow: 1, green: 1, purple: 1 },
    icons: ['yellow', 'green', 'purple'],
  },
];

// ─── Spell constants ──────────────────────────────────────────────────────────

const TRIDENT_SPEED = 650;
const TRIDENT_DAMAGE = 35;
const NOVA_RADIUS = 160;
const NOVA_DAMAGE = 300;
const NOVA_DURATION = 450;
const LIGHTNING_DAMAGE = 40;
const POISON_RANGE = 200;
const POISON_CONE_HALF_ANGLE = Math.PI / 6; // 30 deg = 60 deg total opening
const POISON_DAMAGE_CLOSE = 100;
// POISON_DAMAGE_FAR removed — damage falloff computed inline via distRatio

const POISON_WAVES = 5;
const SPELL_LIFETIME = 3500;

const BOSS_COLOR_SCHEMES = [
  { main: 0x7B1FA2, secondary: 0xD32F2F }, // Purple/Red
  { main: 0x005691, secondary: 0x00E5FF }, // Blue/Teal
  { main: 0x9E0000, secondary: 0xFF5500 }, // Red/Orange
  { main: 0x0A5C36, secondary: 0x39FF14 }, // Green/Lime
  { main: 0x8C7300, secondary: 0xFFD700 }, // Gold/Yellow
  { main: 0xD81B60, secondary: 0xFF4081 }, // Pink/Magenta
];

const ENEMY_HP: Record<EnemyKind, number> = {
  current: 20,
  zombie: 30,
  attacker: 15,
  buff: 10,
  boss: 100,
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
  invYellowText: Phaser.GameObjects.Text;
  invGreenText: Phaser.GameObjects.Text;
  invPurpleText: Phaser.GameObjects.Text;
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
  inventory: { yellow: number; green: number; purple: number } = { yellow: 0, green: 0, purple: 0 };
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

  // Virtual Joystick
  joystickActive: boolean = false;
  joystickPointerID: number = -1;
  joystickBaseX: number = 0;
  joystickBaseY: number = 0;
  joystickThumbX: number = 0;
  joystickThumbY: number = 0;
  joystickGraphics: Phaser.GameObjects.Graphics | null = null;
  readonly JOYSTICK_MAX_RADIUS: number = 50;

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
  dailyGlyph: Shape = 'yellow';
  dailyGlyphText: Phaser.GameObjects.Text | null = null;
  xpEarnedText: Phaser.GameObjects.Text | null = null;
  totalKillsCount: number = 0;
  difficultySpeedMultiplier: number = 1.0;
  ambientGraphics: Phaser.GameObjects.Graphics | null = null;
  ambientParticles: Array<{ x: number; y: number; speed: number; size: number; alpha: number; angle: number; color?: number }> = [];
  lastDamageTime: number = 0;

  // Progression fields
  streakMultiplier: number = 1.0;
  damageMultiplier: number = 1.0;
  pickupRadius: number = PICKUP_RADIUS;
  playerSpeed: number = PLAYER_SPEED;
  maxHp: number = MAX_HP;
  welcomeBonusKillsLeft: number = 0;
  xpEarned: number = 0;

  // Boss Fight system fields
  isBossFight: boolean = false;
  isBossSpawning: boolean = false;
  boss: Enemy | null = null;
  bossOverlay: Phaser.GameObjects.Graphics | null = null;
  bossHpBarGraphics: Phaser.GameObjects.Graphics | null = null;
  bossHpText: Phaser.GameObjects.Text | null = null;
  bossShockwaveRing: { x: number; y: number; currentRadius: number; maxRadius: number; speed: number; active: boolean; hasHitPlayer: boolean } | null = null;
  bossTimer: number = 20;
  bossSpawnCount: number = 0;
  lastBossSchemeIndex: number | undefined = undefined;

  // Depth meter
  depthMeterGraphics: Phaser.GameObjects.Graphics | null = null;
  bossTimerMax: number = 20;

  // Boss HP phase tracking
  bossPhaseTriggered: Set<number> = new Set();

  // Player death / idle state
  playerDead: boolean = false;
  playerIdleBobOffset: number = 0;

  // Sound engine
  audioCtx: AudioContext | null = null;

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
    const upgrades = this.registry.get('playerUpgrades') || { speed: 0, damage: 0, hp: 0, pickup: 0 };
    const welcomeBonus = this.registry.get('activeWelcomeBonus');

    this.streakMultiplier = this.registry.get('streakBonusMultiplier') ?? 1.0;
    this.damageMultiplier = 1.0 + 0.10 * (upgrades.damage || 0);
    this.pickupRadius = PICKUP_RADIUS * (1 + 0.05 * (upgrades.pickup || 0));
    this.playerSpeed = PLAYER_SPEED * (1 + 0.05 * (upgrades.speed || 0));

    this.maxHp = MAX_HP + 10 * (upgrades.hp || 0);
    let startingScore = 0;
    let startingOrbs = 3; // default starting orbs
    this.welcomeBonusKillsLeft = 0;

    if (welcomeBonus) {
      if (welcomeBonus.type === 'hp') {
        this.maxHp += welcomeBonus.value;
      } else if (welcomeBonus.type === 'score') {
        startingScore = welcomeBonus.value;
      } else if (welcomeBonus.type === 'orbs') {
        startingOrbs += welcomeBonus.value;
      } else if (welcomeBonus.type === 'doubleKills') {
        this.welcomeBonusKillsLeft = welcomeBonus.value;
      }
    }

    this.inventory = { yellow: startingOrbs, green: startingOrbs, purple: startingOrbs };
    this.score = startingScore;
    this.hp = this.maxHp;
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
    this.joystickActive = false;
    this.joystickPointerID = -1;
    this.joystickBaseX = 0;
    this.joystickBaseY = 0;
    this.joystickThumbX = 0;
    this.joystickThumbY = 0;
    this.joystickGraphics = null;
    this.spellProjectiles = [];
    this.killTimestamps = [];
    this.playerDead = false;
    this.bossPhaseTriggered = new Set();
    this.bossTimerMax = 20;
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
    const shapes = ['yellow', 'green', 'purple'] as const;
    this.dailyGlyph = shapes[daysSinceEpoch % 3]!;
    this.dailyGlyphText = null;
    this.xpEarnedText = null;
    this.totalKillsCount = 0;
    this.difficultySpeedMultiplier = 1.0;
    this.ambientGraphics = null;
    this.ambientParticles = [];
    this.lastDamageTime = 0;

    this.isBossFight = false;
    this.isBossSpawning = false;
    this.boss = null;
    this.bossOverlay = null;
    this.bossHpBarGraphics = null;
    this.bossHpText = null;
    this.bossShockwaveRing = null;
    this.bossTimer = 20;
    this.bossSpawnCount = 0;
    this.lastBossSchemeIndex = undefined;
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x0a0a2a);

    // Ensure multi-touch is fully supported
    this.input.addPointer(2);

    this.backgroundGraphics = this.add.graphics().setDepth(1);
    this.joystickGraphics = this.add.graphics().setDepth(100).setScrollFactor(0);

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
      .text(12, 12, `Score: ${Math.floor(this.score)} (x${this.streakMultiplier.toFixed(1)})`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3.5,

      })
      .setScrollFactor(0)
      .setDepth(10);

    // ── Daily Glyph — top-left below score
    const glyphCol =
      this.dailyGlyph === 'yellow' ? '#ffcc00'
      : this.dailyGlyph === 'green' ? '#00ff66'
      : '#aa44ff';
    this.dailyGlyphText = this.add
      .text(12, 40, `★ DAILY BONUS: ${this.dailyGlyph.toUpperCase()} (+20 SCORE)`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: glyphCol,
        stroke: '#000000',
        strokeThickness: 2.5,

      })
      .setScrollFactor(0)
      .setDepth(10);

    this.xpEarnedText = this.add
      .text(12, 64, `XP Gained: 0`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#ffd740',
        stroke: '#000000',
        strokeThickness: 2.5,

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

    } as const;

    // Will be repositioned in refreshHudLayout
    this.invYellowText = this.add.text(0, 0, '0', countStyle).setScrollFactor(0).setDepth(10);
    this.invGreenText = this.add.text(0, 0, '0', countStyle).setScrollFactor(0).setDepth(10);
    this.invPurpleText = this.add.text(0, 0, '0', countStyle).setScrollFactor(0).setDepth(10);

    // ── HP bar — bottom-left
    this.hpBar = this.add.graphics().setScrollFactor(0).setDepth(10);
    this.hpText = this.add
      .text(8, 0, 'HP', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2.5,

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

      })
      .setScrollFactor(0)
      .setDepth(10);

    this.shieldGraphics = this.add.graphics().setDepth(9);

    this.buildPlayerConstruct();

    // Blaze border + combo counter
    this.blazeGraphics = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.depthMeterGraphics = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.fxGraphics = this.add.graphics().setDepth(14);
    this.comboCountText = this.add
      .text(0, 0, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#ffdd44',
        stroke: '#000000',
        strokeThickness: 3.5,

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

      // 3. Mobile touch: start joystick tracking or cast
      if (!this.joystickActive) {
        this.joystickPointerID = pointer.id;
        this.joystickActive = true;
        this.joystickBaseX = pointer.x;
        this.joystickBaseY = pointer.y;
        this.joystickThumbX = pointer.x;
        this.joystickThumbY = pointer.y;
      } else {
        // Multi-touch: secondary finger is used to cast/shoot immediately on tap
        this.castSpell(pointer.worldX, pointer.worldY);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (!this.joystickActive || pointer.id !== this.joystickPointerID) return;

      const dx = pointer.x - this.joystickBaseX;
      const dy = pointer.y - this.joystickBaseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > this.JOYSTICK_MAX_RADIUS) {
        this.joystickThumbX = this.joystickBaseX + (dx / dist) * this.JOYSTICK_MAX_RADIUS;
        this.joystickThumbY = this.joystickBaseY + (dy / dist) * this.JOYSTICK_MAX_RADIUS;
      } else {
        this.joystickThumbX = pointer.x;
        this.joystickThumbY = pointer.y;
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      let hitSlot = false;
      const px = pointer.x;
      const py = pointer.y;
      for (const zone of this.spellTouchZones) {
        if (px >= zone.x && px <= zone.x + zone.w && py >= zone.y && py <= zone.y + zone.h) {
          hitSlot = true;
          break;
        }
      }

      if (pointer.id !== this.joystickPointerID) {
        if (!hitSlot && !this.isGameOver) {
          this.castSpell(pointer.worldX, pointer.worldY);
        }
        return;
      }

      // If it was just a quick tap (joystick barely moved), cast a spell
      const dx = this.joystickThumbX - this.joystickBaseX;
      const dy = this.joystickThumbY - this.joystickBaseY;
      if (!hitSlot && dx * dx + dy * dy < 100 && !this.isGameOver) {
        this.castSpell(pointer.worldX, pointer.worldY);
      }

      this.joystickActive = false;
      this.joystickPointerID = -1;
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
          this.score += (SCORE_PER_SECOND / 10) * this.streakMultiplier;
          this.scoreText.setText(`Score: ${Math.floor(this.score)} (x${this.streakMultiplier.toFixed(1)})`);
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

    this.checkBossTrigger(dt);

    if (this.isBossSpawning) {
      this.updateBackground(time);
      if (this.boss) {
        this.redrawEnemy(this.boss);
      }
      return;
    }

    this.updateBackground(time);
    this.updatePlayerMovement(dt);
    this.updateShieldVisual();
    this.updateSpeedBoost(delta);
    this.updateEnemies(this.gameTime, dt);
    this.updateProjectiles(dt);
    this.updateSpellProjectiles(dt);
    this.updateTokens(this.gameTime);
    this.updateComboDisplay(this.gameTime);
    this.drawDepthMeter();
    this.updateFX(dt);
    this.drawJoystick();
  }

  drawJoystick(): void {
    if (!this.joystickGraphics) return;
    this.joystickGraphics.clear();
    
    if (this.joystickActive) {
      // Draw outer circle
      this.joystickGraphics.lineStyle(3, 0xffffff, 0.4);
      this.joystickGraphics.strokeCircle(this.joystickBaseX, this.joystickBaseY, this.JOYSTICK_MAX_RADIUS);
      
      // Draw thumb stick
      this.joystickGraphics.fillStyle(0xffffff, 0.7);
      this.joystickGraphics.fillCircle(this.joystickThumbX, this.joystickThumbY, 20);
    }
  }

  // ─── HUD layout ─────────────────────────────────────────────────────────────

  refreshHudLayout(): void {
    const { width, height } = this.scale;

    // Inventory icons top-right
    const invBaseX = Math.round(width - 14);
    const invY = 14;
    const invStep = 32;

    // Square is rightmost
    if (this.invPurpleText) this.invPurpleText.setPosition(Math.round(invBaseX - 6), invY + 22).setOrigin(1, 0);
    if (this.invGreenText) this.invGreenText.setPosition(Math.round(invBaseX - 6 - invStep), invY + 22).setOrigin(1, 0);
    if (this.invYellowText) this.invYellowText.setPosition(Math.round(invBaseX - 6 - invStep * 2), invY + 22).setOrigin(1, 0);

    // HP bar bottom-left, shifted up above combo slots
    const hpBarY = Math.round(height - 86);
    if (this.hpText) this.hpText.setPosition(8, hpBarY - 18);
    if (this.boosterText) this.boosterText.setPosition(8, hpBarY + 14);

    this.drawHpBar();
    this.redrawInventoryHud();

    // Redraw boss HUD elements
    if (this.isBossFight) {
      if (this.bossOverlay) {
        this.bossOverlay.clear();
        this.bossOverlay.fillStyle(0xd32f2f, 0.3);
        this.bossOverlay.fillRect(0, 0, width, height);
      }
      this.drawBossHpBar();
    }
  }

  // ─── Player ─────────────────────────────────────────────────────────────────

  buildPlayerConstruct(): void {
    if (this.playerGraphics) this.playerGraphics.destroy();
    this.playerGraphics = this.add.graphics().setDepth(8);
    this.drawPlayer();
  }

  drawPlayer(): void {
    if (!this.playerGraphics) return;
    if (this.playerDead) return;
    const g = this.playerGraphics;
    g.clear();

    // Idle bob — only when not moving
    const isMoving = this.joystickActive || (this.keys && (this.keys.W.isDown || this.keys.S.isDown || this.keys.A.isDown || this.keys.D.isDown));
    this.playerIdleBobOffset = isMoving ? 0 : Math.sin(this.gameTime * 0.002) * 3;
    this.playerGraphics.setY(this.playerY + this.playerIdleBobOffset);

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
    // Symmetric pairs of spots on the body
    g.fillCircle(-rx * 0.2, -ry * 0.25, 2.5);
    g.fillCircle(-rx * 0.2, ry * 0.25, 2.5);
    g.fillCircle(-rx * 0.42, -ry * 0.3, 1.5);
    g.fillCircle(-rx * 0.42, ry * 0.3, 1.5);

    // Symmetric side fins (left and right / top and bottom)
    g.fillStyle(0x005577, 1);
    g.lineStyle(1.5, 0x001a20, 1);
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

    // Symmetric teeth: 3 pointing up from the center, 3 pointing down from the center
    g.fillStyle(0xeefff5, 1);
    g.lineStyle(1, 0x001a20, 1);
    for (let fi = 0; fi < 3; fi++) {
      const fx = rx * 0.40 + fi * rx * 0.08;
      g.beginPath();
      g.moveTo(fx, 0);
      g.lineTo(fx + rx * 0.04, -ry * 0.14);
      g.lineTo(fx + rx * 0.08, 0);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }
    for (let fi = 0; fi < 3; fi++) {
      const fx = rx * 0.40 + fi * rx * 0.08;
      g.beginPath();
      g.moveTo(fx, 0);
      g.lineTo(fx + rx * 0.04, ry * 0.14);
      g.lineTo(fx + rx * 0.08, 0);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }

    // Centered Lure Antenna starting at exactly y = 0
    const antStartX = rx * 0.55;
    const antAngle = Math.sin(t * 0.007) * 0.7;
    const antLen = 32;
    const lureX = antStartX + Math.cos(antAngle) * antLen;
    const lureY = Math.sin(antAngle) * antLen;

    g.lineStyle(2.5, 0x001a20, 1);
    g.lineBetween(antStartX, 0, lureX, lureY);
    g.lineStyle(1.2, 0x00eecc, 0.7);
    g.lineBetween(antStartX, 0, lureX, lureY);

    // Lure glow — skip if dead
    if (!this.playerDead) {
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
  }

  // ─── Sound Engine ─────────────────────────────────────────────────────────────
  getAudioCtx(): AudioContext | null {
    try {
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      return this.audioCtx;
    } catch { return null; }
  }

  playSound(type: 'cast_trident'|'cast_nova'|'cast_lightning'|'cast_poison'|'kill'|'hit'|'boss_spawn'|'boss_die'|'token'|'heal'): void {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    switch (type) {
      case 'cast_trident':
        osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15); break;
      case 'cast_nova':
        osc.type = 'sine'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
        gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now); osc.stop(now + 0.25); break;
      case 'cast_lightning':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.05); osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
        gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15); break;
      case 'cast_poison':
        osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(180, now + 0.2);
        gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.2); break;
      case 'kill':
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.1); break;
      case 'hit':
        osc.type = 'square'; osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now); osc.stop(now + 0.12); break;
      case 'boss_spawn': {
        const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain();
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(60, now); gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.type = 'sine'; osc2.frequency.setValueAtTime(900, now + 0.1); osc2.frequency.exponentialRampToValueAtTime(400, now + 0.6);
        gain2.gain.setValueAtTime(0.0, now); gain2.gain.setValueAtTime(0.2, now + 0.1); gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now); osc.stop(now + 0.6); osc2.start(now + 0.1); osc2.stop(now + 0.6); break;
      }
      case 'boss_die': {
        const freqs = [523, 659, 784, 1047];
        freqs.forEach((f, i) => {
          const o = ctx.createOscillator(); const gn = ctx.createGain();
          o.connect(gn); gn.connect(ctx.destination);
          o.type = 'sine'; o.frequency.value = f;
          gn.gain.setValueAtTime(0, now + i * 0.08); gn.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.05);
          gn.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
          o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.35);
        }); break;
      }
      case 'token':
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(1600, now + 0.06);
        gain.gain.setValueAtTime(0.07, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08); break;
      case 'heal':
        osc.type = 'sine'; osc.frequency.setValueAtTime(660, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15); break;
    }
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

    // Joystick movement
    if (this.joystickActive) {
      const jx = this.joystickThumbX - this.joystickBaseX;
      const jy = this.joystickThumbY - this.joystickBaseY;
      const len = Math.sqrt(jx * jx + jy * jy);
      if (len > 0) {
        const magnitude = len / this.JOYSTICK_MAX_RADIUS; // 0 to 1
        dx += (jx / len) * magnitude;
        dy += (jy / len) * magnitude;
      }
    }

    const speedMult = this.speedBoostTimer > 0 ? BUFF_SPEED_MULTIPLIER : 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        const move = this.playerSpeed * dt * speedMult;
        const actualLen = Math.min(len, 1.0); // Allow partial speed for joystick tilt
        dx = (dx / len) * move * actualLen;
        dy = (dy / len) * move * actualLen;
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

      // Bug fix: apply slow factor to movement speed if enemy is slowed
      const speedMult = (e.slowTimer && e.slowTimer > 0) ? (e.slowFactor ?? 1.0) : 1.0;

      switch (e.kind) {
        case 'current': this.updateCurrentEnemy(e, dt, i, speedMult); break;
        case 'zombie': this.updateZombieEnemy(e, dt, speedMult); break;
        case 'attacker': this.updateAttackerEnemy(e, _time, dt, speedMult); break;
        case 'buff': this.updateBuffEnemy(e, dt, speedMult); break;
        case 'boss': this.updateBoss(e, dt); break;
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
    if (this.isBossFight) {
      e.graphics.destroy();
      this.enemies.splice(i, 1);
      return;
    }

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

    if (e.kind === 'boss') {
      this.drawBoss(e);
      return;
    }

    switch (e.kind) {
      case 'current': this.drawCurrentEnemy(e.graphics, 0, 0, e.radius, e.shape!, e.color || 0xff6600); break;
      case 'zombie': this.drawZombieEnemy(e.graphics, e.radius, e.color || 0x00ff66); break;
      case 'attacker': this.drawAttackerEnemy(e.graphics, e.radius, e.color || 0xff4422); break;
      case 'buff': this.drawBuffEnemy(e.graphics, e.radius, e.color || 0xffd740); break;
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
        if (this.hasShield) { this.killEnemy(e, i, 'yellow'); }
        else {
          this.takeDamage(ZOMBIE_DAMAGE);
          e.graphics.destroy();
          this.enemies.splice(i, 1);
        }
        break;
      case 'attacker':
        if (this.hasShield) { this.killEnemy(e, i, 'green'); }
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
      case 'boss':
        if (this.hasShield) {
          this.hasShield = false;
        } else {
          const dmg = e.state === 'charge' ? 20 : 15;
          this.takeDamage(dmg);
        }
        break;
    }
  }

  killEnemy(e: Enemy, i: number, tokenShape: Shape): void {
    this.killEnemyWithFX(e, i, tokenShape);
  }

  damageEnemy(e: Enemy, i: number, amount: number, spellId?: ComboId): void {
    if (e.kind === 'buff') return;
    const scaledAmount = amount * this.damageMultiplier;
    e.hp -= scaledAmount;
    e.hitFlashTime = this.gameTime + 100;
    this.redrawEnemy(e);

    // Polish: floating damage number on enemy hit
    if (e.kind !== 'boss' || scaledAmount >= 20) {
      const dmgTxt = this.add
        .text(e.x + (Math.random() - 0.5) * 20, e.y - 15, `-${Math.floor(scaledAmount)}`, {
          fontFamily: 'Arial Black',
          fontSize: e.kind === 'boss' ? '16px' : '13px',
          color: e.kind === 'boss' ? '#ff4444' : '#ffaaaa',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(16);
      this.tweens.add({
        targets: dmgTxt,
        y: dmgTxt.y - 35,
        alpha: 0,
        duration: 650,
        onComplete: () => dmgTxt.destroy(),
      });
    }

    if (e.hp <= 0) {
      if (e.kind === 'boss') {
        this.defeatBoss(e);
        return;
      }
      const dropMap: Record<Exclude<EnemyKind, 'boss'>, Shape> = {
        current: e.shape || 'yellow',
        zombie: 'yellow',
        attacker: 'green',
        buff: 'purple',
      };
      this.killEnemyWithFX(e, i, dropMap[e.kind], spellId);
    }
  }

  killEnemyWithFX(e: Enemy, i: number, tokenShape: Shape, spellId?: ComboId): void {
    this.dropToken(e.x, e.y, tokenShape);
    this.hasShield = false;
    e.graphics.destroy();
    this.enemies.splice(i, 1);

    for (const p of this.projectiles) p.graphics.destroy();
    this.projectiles = [];

    this.cameras.main.shake(50, 0.02);
    this.playSound('kill');

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

    let killScore = KILL_SCORE_BASE * this.streakMultiplier;
    if (this.welcomeBonusKillsLeft > 0) {
      killScore *= 2;
      this.welcomeBonusKillsLeft--;
    }

    const txt = this.add
      .text(e.x, e.y - 10, `+${Math.floor(killScore)}`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,

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
    this.score += killScore;
    this.scoreText.setText(`Score: ${Math.floor(this.score)} (x${this.streakMultiplier.toFixed(1)})`);

    let xpAmount = 1;
    if (e.kind === 'zombie' || e.kind === 'attacker') {
      xpAmount = 2;
    }
    this.addXp(xpAmount, e.x, e.y);

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
    const shapes: Array<Shape | 'star'> = ['yellow', 'green', 'purple', 'star'];
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

    // Polish: camera shake on player hit
    this.cameras.main.shake(150, 0.018);
    this.playSound('hit');

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
    // Always heal the player when picking up a buff orb
    this.hp = Math.min(this.maxHp, this.hp + BUFF_HEAL);
    this.drawHpBar();
    this.playSound('heal');

    // Sometimes grant an extra bonus buff
    const roll = Math.random();
    if (roll < 0.25) {
      this.speedBoostTimer = BUFF_SPEED_DURATION;
    } else if (roll < 0.5) {
      this.hasShield = true;
    }

    this.addXp(1, e.x, e.y);
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
    
    if (this.isBossFight) {
      // Allow only health orbs during boss fight, and spawn them more frequently
      if (Math.random() < 0.4) {
        this.buildBuffEnemy();
      }
      return;
    }
    
    switch (this.pickEnemyKind()) {
      case 'current': this.buildCurrentEnemy(); break;
      case 'zombie': this.buildZombieEnemy(); break;
      case 'attacker': this.buildAttackerEnemy(); break;
      case 'buff': this.buildBuffEnemy(); break;
    }
  }

  buildCurrentEnemy(): void {
    const shapes = ['yellow', 'green', 'purple'] as const;
    const shape = shapes[Math.floor(Math.random() * shapes.length)]!;
    const radius = 9 + Math.random() * 10;
    const speed = (60 + Math.random() * 80) * this.difficultySpeedMultiplier;

    const sides = ['top', 'bottom', 'left', 'right'] as const;
    const spawnSide = sides[Math.floor(Math.random() * sides.length)]!;

    // Randomly select curve: sine, exponential, logarithmic, straight
    const curves = ['sine', 'exponential', 'logarithmic', 'straight'] as const;
    const curveType = curves[Math.floor(Math.random() * curves.length)]!;

    const { width, height } = this.scale;
    let x: number;
    let y: number;
    let dirX: number;
    let dirY: number;

    if (spawnSide === 'top') {
      x = radius + Math.random() * (width - radius * 2);
      y = -radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = 1;
    } else if (spawnSide === 'bottom') {
      x = radius + Math.random() * (width - radius * 2);
      y = height + radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = -1;
    } else if (spawnSide === 'left') {
      x = -radius;
      y = radius + Math.random() * (height - radius * 2);
      dirX = 1;
      dirY = (Math.random() - 0.5) * 0.6;
    } else {
      x = width + radius;
      y = radius + Math.random() * (height - radius * 2);
      dirX = -1;
      dirY = (Math.random() - 0.5) * 0.6;
    }

    // Normalize dirX and dirY
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    dirX /= len;
    dirY /= len;

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
      color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)] || 0xff6600,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  buildZombieEnemy(): void {
    const radius = ZOMBIE_RADIUS;
    const speed = (30 + Math.random() * 10) * this.difficultySpeedMultiplier;
    const side = Math.floor(Math.random() * 4);
    let x: number;
    let y: number;
    let dirX: number;
    let dirY: number;
    const { width, height } = this.scale;
    if (side === 0) {
      // Top edge
      x = radius + Math.random() * (width - radius * 2);
      y = -radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = 1;
    } else if (side === 1) {
      // Bottom edge
      x = radius + Math.random() * (width - radius * 2);
      y = height + radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = -1;
    } else if (side === 2) {
      // Left edge
      x = -radius;
      y = radius + Math.random() * (height - radius * 2);
      dirX = 1;
      dirY = (Math.random() - 0.5) * 0.6;
    } else {
      // Right edge
      x = width + radius;
      y = radius + Math.random() * (height - radius * 2);
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
      color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)] || 0x00ff66,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  buildAttackerEnemy(): void {
    const radius = ATTACKER_RADIUS;
    const speed = (40 + Math.random() * 20) * this.difficultySpeedMultiplier;
    const side = Math.floor(Math.random() * 4);
    let x: number;
    let y: number;
    let dirX: number;
    let dirY: number;
    const { width, height } = this.scale;
    if (side === 0) {
      // Top edge
      x = radius + Math.random() * (width - radius * 2);
      y = -radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = 1;
    } else if (side === 1) {
      // Bottom edge
      x = radius + Math.random() * (width - radius * 2);
      y = height + radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = -1;
    } else if (side === 2) {
      // Left edge
      x = -radius;
      y = radius + Math.random() * (height - radius * 2);
      dirX = 1;
      dirY = (Math.random() - 0.5) * 0.6;
    } else {
      // Right edge
      x = width + radius;
      y = radius + Math.random() * (height - radius * 2);
      dirX = -1;
      dirY = (Math.random() - 0.5) * 0.6;
    }
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    dirX /= len; dirY /= len;

    const modes: Array<'wander' | 'zigzag' | 'chase'> = ['wander', 'zigzag', 'chase'];
    const movementMode = modes[Math.floor(Math.random() * modes.length)]!;
    const graphics = this.add.graphics().setDepth(5);
    const enemy: Enemy = {
      kind: 'attacker', graphics, x, y, radius, speed,
      hp: ENEMY_HP.attacker, slowTimer: 0,
      dirX, dirY,
      nextDirTimer: 2000, movementMode,
      projectileTimer: ATTACKER_PROJECTILE_INTERVAL_MIN + Math.random() * (ATTACKER_PROJECTILE_INTERVAL_MAX - ATTACKER_PROJECTILE_INTERVAL_MIN),
      damageMin: ATTACKER_DAMAGE_MIN, damageMax: ATTACKER_DAMAGE_MAX,
      color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)] || 0xff4422,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  buildBuffEnemy(): void {
    const radius = BUFF_RADIUS;
    const speed = (20 + Math.random() * 15) * this.difficultySpeedMultiplier;
    const side = Math.floor(Math.random() * 4);
    let x: number;
    let y: number;
    let dirX: number;
    let dirY: number;
    const { width, height } = this.scale;
    if (side === 0) {
      // Top edge
      x = radius + Math.random() * (width - radius * 2);
      y = -radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = 1;
    } else if (side === 1) {
      // Bottom edge
      x = radius + Math.random() * (width - radius * 2);
      y = height + radius;
      dirX = (Math.random() - 0.5) * 0.6;
      dirY = -1;
    } else if (side === 2) {
      // Left edge
      x = -radius;
      y = radius + Math.random() * (height - radius * 2);
      dirX = 1;
      dirY = (Math.random() - 0.5) * 0.6;
    } else {
      // Right edge
      x = width + radius;
      y = radius + Math.random() * (height - radius * 2);
      dirX = -1;
      dirY = (Math.random() - 0.5) * 0.6;
    }
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    dirX /= len; dirY /= len;

    const buffKinds: Array<'heal' | 'speed' | 'shield'> = ['heal', 'heal', 'speed', 'shield'];
    const buffKind = buffKinds[Math.floor(Math.random() * buffKinds.length)]!;
    const graphics = this.add.graphics().setDepth(5);
    const enemy: Enemy = {
      kind: 'buff', graphics, x, y, radius, speed,
      hp: ENEMY_HP.buff, slowTimer: 0,
      dirX, dirY,
      nextDirTimer: 1500, buffKind,
      color: 0xffd740,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  // ─── Enemy draw functions ────────────────────────────────────────────────────

  drawCurrentEnemy(g: Phaser.GameObjects.Graphics, cx: number, cy: number, radius: number, shape: Shape, bodyColor: number): void {
    const heading = Math.PI / 2;
    switch (shape) {
      case 'yellow': this.drawSmallFish(g, cx, cy, radius, bodyColor, 0xffffff, heading); break;
      case 'green': this.drawSmallFish(g, cx, cy, radius, bodyColor, 0xffee58, heading); break;
      case 'purple': this.drawSmallFish(g, cx, cy, radius, bodyColor, 0xfff176, heading); break;
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

  drawZombieEnemy(g: Phaser.GameObjects.Graphics, r: number, bodyColor: number): void {
    // Soft neon green glow
    g.fillStyle(bodyColor, 0.15);
    g.fillCircle(0, 0, r + 6);

    // Dark green octagon/diamond body with custom color outline
    g.fillStyle(0x111111, 1);
    g.lineStyle(2, bodyColor, 1);
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
    g.fillStyle(bodyColor, 0.7);
    g.fillCircle(0, 0, r * 0.42);

    // Neon eye dots (facing right / positive X)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(r * 0.35, -r * 0.22, 2.5);
    g.fillCircle(r * 0.35, r * 0.22, 2.5);
    g.fillStyle(0xff0000, 1); // red pupils
    g.fillCircle(r * 0.4, -r * 0.22, 1.2);
    g.fillCircle(r * 0.4, r * 0.22, 1.2);
  }

  drawAttackerEnemy(g: Phaser.GameObjects.Graphics, r: number, bodyColor: number): void {
    // Soft neon red/orange glow
    g.fillStyle(bodyColor, 0.15);
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

  drawBuffEnemy(g: Phaser.GameObjects.Graphics, r: number, bodyColor: number): void {
    // Golden glow
    g.fillStyle(bodyColor, 0.2);
    g.fillCircle(0, 0, r + 8);

    // Outer golden hexagon
    g.fillStyle(0x111111, 1);
    g.lineStyle(2.5, bodyColor, 1);
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
    if (p.isRedCircle) {
      p.graphics.fillStyle(0xff1744, 1.0);
      p.graphics.fillCircle(p.x, p.y, p.radius);
      p.graphics.lineStyle(1.5, 0xffffff, 1.0);
      p.graphics.strokeCircle(p.x, p.y, p.radius);
      return;
    }
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

      // Orb magnet pull — smoothly attract tokens within 1.8x pickupRadius
      const pullRadius = this.pickupRadius * 1.8;
      if (dist < pullRadius && dist >= this.pickupRadius) {
        const pullSpeed = 180 * (1 - dist / pullRadius); // faster when closer
        const angle = Math.atan2(this.playerY - t.y, this.playerX - t.x);
        t.x += Math.cos(angle) * pullSpeed * (1 / 60);
        t.y += Math.sin(angle) * pullSpeed * (1 / 60);
      }

      if (dist < this.pickupRadius) {
        this.playSound('token');
        this.inventory[t.shape]++;

        const isDaily = t.shape === this.dailyGlyph;
        const scoreGain = (isDaily ? 20 : 10) * this.streakMultiplier;
        this.score += scoreGain;
        this.scoreText.setText(`Score: ${Math.floor(this.score)} (x${this.streakMultiplier.toFixed(1)})`);

        const txt = this.add
          .text(t.x, vibeY - 10, isDaily ? `+${Math.floor(scoreGain)} DAILY! ★` : `+${Math.floor(scoreGain)}`, {
            fontFamily: 'Arial Black',
            fontSize: '12px',
            color: isDaily ? '#ffcc00' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 2.5,
    
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
    const shapes = ['yellow', 'green', 'purple'] as const;
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
      t.shape === 'yellow' ? TOKEN_YELLOW_COLOR
      : t.shape === 'green' ? TOKEN_GREEN_COLOR
      : TOKEN_PURPLE_COLOR;

    t.graphics.fillStyle(color, 0.3);
    t.graphics.fillCircle(x, y, t.radius + 6);

    t.graphics.fillStyle(color, 0.65);
    t.graphics.lineStyle(1.8, 0xffffff, 0.85);
    t.graphics.fillCircle(x, y, t.radius);
    t.graphics.strokeCircle(x, y, t.radius);

    t.graphics.fillStyle(0xffffff, 0.85);
    t.graphics.lineStyle(1.0, color, 1.0);
    t.graphics.fillCircle(x, y, t.radius * 0.45);
    t.graphics.strokeCircle(x, y, t.radius * 0.45);

    t.graphics.fillStyle(0xffffff, 0.95);
    t.graphics.fillCircle(x - t.radius * 0.35, y - t.radius * 0.35, 1.8);
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────────

  drawHpBar(): void {
    if (!this.hpBar) return;
    this.hpBar.clear();
    const { height } = this.scale;
    const barY = height - 90; // shifted up above combo slots
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
    const fillWidth = (this.hp / this.maxHp) * HP_BAR_WIDTH;
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
      { shape: 'yellow', color: TOKEN_YELLOW_COLOR },
      { shape: 'green', color: TOKEN_GREEN_COLOR },
      { shape: 'purple', color: TOKEN_PURPLE_COLOR },
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
      this.inventoryGraphics.fillCircle(iconX, y, 10);
      this.inventoryGraphics.strokeCircle(iconX, y, 10);
    }

    // Reposition count texts
    const purpleX = baseX - 20;
    const greenX = baseX - 20 - step;
    const yellowX = baseX - 20 - step * 2;

    if (this.invPurpleText) {
      this.invPurpleText.setText(`${this.inventory.purple}`);
      this.invPurpleText.setPosition(purpleX + 14, y + 10).setOrigin(1, 0);
    }
    if (this.invGreenText) {
      this.invGreenText.setText(`${this.inventory.green}`);
      this.invGreenText.setPosition(greenX + 14, y + 10).setOrigin(1, 0);
    }
    if (this.invYellowText) {
      this.invYellowText.setText(`${this.inventory.yellow}`);
      this.invYellowText.setPosition(yellowX + 14, y + 10).setOrigin(1, 0);
    }
  }

  // ─── Primitive helpers ───────────────────────────────────────────────────────



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
      this.inventory.yellow >= combo.requires.yellow &&
      this.inventory.green >= combo.requires.green &&
      this.inventory.purple >= combo.requires.purple
    );
  }

  castSpell(mouseX: number, mouseY: number): void {
    if (this.isGameOver) return;
    const combo = COMBOS[this.selectedCombo]!;
    if (!this.isAffordable(combo)) return;

    this.inventory.yellow -= combo.requires.yellow;
    this.inventory.green -= combo.requires.green;
    this.inventory.purple -= combo.requires.purple;

    this.redrawInventoryHud();
    this.redrawComboBar();
    // Sound on spell cast
    const soundMap: Record<string, 'cast_trident'|'cast_nova'|'cast_lightning'|'cast_poison'> = {
      trident: 'cast_trident', nova: 'cast_nova', lightning: 'cast_lightning', poison: 'cast_poison',
    };
    this.playSound(soundMap[combo.id] ?? 'cast_trident');
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
        // Vibrate/shake camera on explosion
        this.cameras.main.shake(250, 0.015);

        // Visual effects: 2 expanding rings + 1 semi-transparent filled frost circle
        this.fxRings.push({
          x: mx, y: my,
          radius: 10, maxRadius: NOVA_RADIUS,
          color: 0xffffff, // Inner bright core ring
          alpha: 1.0, life: 0, maxLife: NOVA_DURATION,
        });
        this.fxRings.push({
          x: mx, y: my,
          radius: 20, maxRadius: NOVA_RADIUS + 20,
          color: SPELL_COLORS.nova, // Outer frost ring
          alpha: 0.8, life: 0, maxLife: NOVA_DURATION + 100,
        });
        this.fxRings.push({
          x: mx, y: my,
          radius: 5, maxRadius: NOVA_RADIUS,
          color: SPELL_COLORS.nova,
          alpha: 0.25, life: 0, maxLife: NOVA_DURATION,
          isFilled: true, // Semi-transparent filled frost region!
        });

        // Spawn 25 expanding frost particles from the click center
        for (let p = 0; p < 25; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 80 + Math.random() * 120;
          this.fxParticles.push({
            x: mx,
            y: my,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: p % 2 === 0 ? 0xffffff : 0x88ccff,
            shape: Math.random() < 0.5 ? 'green' : 'star',
            alpha: 0.9,
            size: 2 + Math.random() * 5,
            life: 0,
            maxLife: 400 + Math.random() * 300,
          });
        }

        // Damage all enemies inside the circular region centered at (mx, my)
        const list = [...this.enemies];
        let hitCount = 0;
        for (let i = list.length - 1; i >= 0; i--) {
          const e = list[i]!;
          if (e.kind === 'buff') continue;
          const d = Phaser.Math.Distance.Between(mx, my, e.x, e.y);
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
            if (e.kind === 'buff') continue;
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
              shape: 'green',
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
              shape: 'green',
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
          if (e.kind === 'buff') continue;
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

          const damage = dist <= 100
            ? POISON_DAMAGE_CLOSE
            : POISON_DAMAGE_CLOSE * (1 - (dist - 100) / (POISON_RANGE - 100));

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
          shape: 'green',
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
        if (e.kind === 'buff') continue;
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
    
    // Always use bottom row horizontally centered
    const slotW = Math.min(100, Math.floor((width - 8) / COMBOS.length) - 4);
    const slotH = 52;
    const slotPad = 4;
    const totalW = COMBOS.length * slotW + (COMBOS.length - 1) * slotPad;
    const startX = (width - totalW) / 2;
    const startY = height - slotH - 8;

    for (let i = 0; i < COMBOS.length; i++) {
      const combo = COMBOS[i]!;
      const slotX = startX + i * (slotW + slotPad);
      const canCast = this.isAffordable(combo);
      const isSel = i === this.selectedCombo;
      this.drawComboSlot(slotX, startY, slotW, slotH, i, combo, canCast, isSel, true);
      this.spellTouchZones.push({ x: slotX, y: startY, w: slotW, h: slotH, comboIndex: i });
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
    g.fillStyle(0x0a0a1e, 0.85);
    g.fillRoundedRect(slotX, slotY, sw, sh, 5);

    // Disabled overlay
    if (!canCast) {
      g.fillStyle(0x000000, 0.35);
      g.fillRoundedRect(slotX, slotY, sw, sh, 5);
    }

    // Border
    const borderColor =
      isSel && canCast ? 0x00ffcc
      : isSel          ? 0x555577
      : canCast        ? 0x00cc55
      :                  0x252545;
    const borderAlpha = isSel && canCast ? 1 : canCast ? 0.85 : 0.3;
    const lineW = isSel ? 2 : canCast ? 1.5 : 1;

    // Selected + affordable: animated pulsing outer glow
    if (isSel && canCast) {
      const pulse = 0.12 + Math.sin(this.gameTime * 0.01) * 0.07;
      g.lineStyle(8, 0x00ffcc, pulse);
      g.strokeRoundedRect(slotX - 3, slotY - 3, sw + 6, sh + 6, 8);
      g.lineStyle(4, 0x00ffcc, pulse * 1.8);
      g.strokeRoundedRect(slotX - 1, slotY - 1, sw + 2, sh + 2, 6);
    } else if (isSel) {
      g.lineStyle(4, 0x555577, 0.4);
      g.strokeRoundedRect(slotX - 1, slotY - 1, sw + 2, sh + 2, 6);
    } else if (canCast) {
      g.lineStyle(4, 0x00cc55, 0.15);
      g.strokeRoundedRect(slotX - 1, slotY - 1, sw + 2, sh + 2, 6);
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
    const iconAlpha = canCast ? 1 : 0.25;

    for (let j = 0; j < combo.icons.length; j++) {
      const shape = combo.icons[j]!;
      const ix = iconStartX + j * iconStep;
      const col =
        shape === 'yellow' ? TOKEN_YELLOW_COLOR
        : shape === 'green' ? TOKEN_GREEN_COLOR
        : TOKEN_PURPLE_COLOR;
      g.fillStyle(col, iconAlpha);
      g.lineStyle(1, 0xffffff, iconAlpha * 0.65);
      this.drawShapeIcon(g, ix, iconRowY, ir, shape);
    }

    // Spell name text
    const txt = this.comboNameTexts[comboIndex]!;
    txt.setPosition(cx, slotY + sh * 0.72);
    txt.setColor(isSel && canCast ? '#00ffcc' : canCast ? '#ccffcc' : '#333355');
    txt.setText(combo.shortName);
    txt.setFontSize('11px');
    txt.setScrollFactor(0);

    // Selected fill tint
    if (isSel && canCast) {
      g.fillStyle(0x00ffcc, 0.10);
      g.fillRoundedRect(slotX, slotY, sw, sh, 5);
    }
  }

  drawShapeIcon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, _shape: Shape): void {
    g.fillCircle(cx, cy, r);
    g.strokeCircle(cx, cy, r);
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

    // Draw boss shockwave ring
    if (this.bossShockwaveRing && this.bossShockwaveRing.active) {
      const ring = this.bossShockwaveRing;
      const alpha = 1.0 - (ring.currentRadius / ring.maxRadius);
      this.fxGraphics.lineStyle(4, 0x7B1FA2, alpha);
      this.fxGraphics.strokeCircle(ring.x, ring.y, ring.currentRadius);

      const particleCount = 16;
      this.fxGraphics.fillStyle(0x7B1FA2, alpha);
      for (let j = 0; j < particleCount; j++) {
        const pAngle = (j * Math.PI * 2) / particleCount;
        const px = ring.x + Math.cos(pAngle) * ring.currentRadius;
        const py = ring.y + Math.sin(pAngle) * ring.currentRadius;
        this.fxGraphics.fillCircle(px, py, 3);
      }
    }

    const dtMs = dt * 1000;

    for (let i = this.fxRings.length - 1; i >= 0; i--) {
      const r = this.fxRings[i]!;
      r.life += dtMs;
      if (r.life >= r.maxLife) { this.fxRings.splice(i, 1); continue; }
      const t = Math.min(1.0, r.life / r.maxLife);
      const currentRadius = r.radius + (r.maxRadius - r.radius) * t;
      const alpha = r.alpha * (1.0 - t);
      if (r.isFilled) {
        this.fxGraphics.fillStyle(r.color, alpha);
        this.fxGraphics.fillCircle(r.x, r.y, currentRadius);
      } else {
        this.fxGraphics.lineStyle(2.5, r.color, alpha);
        this.fxGraphics.strokeCircle(r.x, r.y, currentRadius);
      }
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
    if (shape === 'star') {
      this.drawStar(g, x, y, size);
    } else {
      g.fillCircle(x, y, size);
      g.strokeCircle(x, y, size);
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
          this.comboCountText.setAlpha(1);
          this.tweens.killTweensOf(this.comboCountText);
          this.comboCountText.setScale(1.6);
          this.tweens.add({
            targets: this.comboCountText,
            scaleX: 1.0, scaleY: 1.0,
            duration: 250, ease: 'Back.easeOut',
          });
          const colors = ['#ffd740', '#ffaa00', '#ff0033', '#e040fb'];
          const colIndex = Math.min(colors.length - 1, Math.floor((combo - 2) / 3));
          this.comboCountText.setColor(colors[colIndex]!);
        }
        this.comboCountText.setPosition(this.playerX, this.playerY - PLAYER_RADIUS - 22);

        // Combo timeout warning: flash when oldest kill > 1500ms old
        if (this.killTimestamps.length > 0) {
          const oldest = this.killTimestamps[0]!;
          const age = time - oldest;
          if (age > 1500) {
            // Rapid alpha flicker
            const flicker = Math.sin(time * 0.04) > 0 ? 1 : 0.2;
            this.comboCountText.setAlpha(flicker);
          } else {
            this.comboCountText.setAlpha(1);
          }
        } else {
          this.comboCountText.setAlpha(1);
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

  drawDepthMeter(): void {
    if (!this.depthMeterGraphics || this.isGameOver) return;
    const g = this.depthMeterGraphics;
    g.clear();
    const { width, height } = this.scale;
    const meterH = height * 0.35;
    const meterW = 8;
    const meterX = width - meterW - 6;
    const meterY = height * 0.32;

    // Timer progress (1 = full / boss far, 0 = empty / boss imminent)
    const maxT = this.isBossFight ? this.bossTimerMax : this.bossTimerMax;
    const progress = this.isBossFight ? 0 : Math.max(0, Math.min(1, this.bossTimer / maxT));

    // Color: blue(safe) → amber → red(danger)
    const danger = 1 - progress;
    const r = Math.floor(30 + danger * 225);
    const gv = Math.floor(180 - danger * 160);
    const b = Math.floor(255 - danger * 250);
    const barColor = (r << 16) | (gv << 8) | b;

    // Track bg
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(meterX, meterY, meterW, meterH, 4);

    // Fill (top to bottom as danger fills)
    const fillH = meterH * danger;
    if (fillH > 0) {
      const pulse = this.isBossFight ? 1 : (danger > 0.8 ? 0.7 + Math.sin(this.gameTime * 0.015) * 0.3 : 0.85);
      g.fillStyle(barColor, pulse);
      g.fillRoundedRect(meterX, meterY, meterW, fillH, 4);
    }

    // Border
    g.lineStyle(1, 0xffffff, 0.25);
    g.strokeRoundedRect(meterX, meterY, meterW, meterH, 4);

    // Label
    g.fillStyle(0xffffff, 0.4);
    g.fillRect(meterX - 1, meterY - 10, meterW + 2, 2);
  }

  addXp(amount: number, x: number, y: number): void {
    this.xpEarned += amount;
    if (this.xpEarnedText) {
      this.xpEarnedText.setText(`XP Gained: ${this.xpEarned}`);
    }

    const txt = this.add.text(x, y - 25, `+${amount} XP`, {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 3,

    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: txt,
      y: y - 60,
      alpha: 0,
      duration: 800,
      onComplete: () => txt.destroy(),
    });
  }

  endGame(): void {
    this.isGameOver = true;
    this.playerDead = true;
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
    if (this.xpEarnedText) this.xpEarnedText.destroy();
    if (this.ambientGraphics) this.ambientGraphics.destroy();

    // Player death animation: bubble burst + spin-shrink
    if (this.playerGraphics) {
      // Spawn rising bubbles
      for (let b = 0; b < 14; b++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const speed = 40 + Math.random() * 80;
        this.fxParticles.push({
          x: this.playerX + (Math.random() - 0.5) * 10,
          y: this.playerY,
          vx: Math.cos(angle) * speed * 0.4,
          vy: Math.sin(angle) * speed,
          color: 0xaaddff,
          shape: 'yellow', // drawn as circle via fxParticles
          alpha: 0.8,
          size: 3 + Math.random() * 5,
          life: 0,
          maxLife: 800 + Math.random() * 400,
        });
      }
      // Spin and shrink
      this.tweens.add({
        targets: this.playerGraphics,
        angle: 720,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 600,
        ease: 'Cubic.easeIn',
      });
    }

    this.time.delayedCall(800, () => {
      const bossPercent = (this.isBossFight && this.boss) 
        ? Math.max(0, Math.min(100, Math.floor((1 - this.boss.hp / this.boss.maxHp!) * 100))) 
        : undefined;

      // Clean up boss overlay and HP bar elements just in case
      if (this.bossOverlay) this.bossOverlay.destroy();
      if (this.bossHpBarGraphics) this.bossHpBarGraphics.destroy();
      if (this.bossHpText) this.bossHpText.destroy();

      this.scene.start('GameOver', {
        score: Math.floor(this.score),
        bestTridentChain: this.bestTridentChain,
        bestLightningChain: this.bestLightningChain,
        bestNovaChain: this.bestNovaChain,
        bestPoisonChain: this.bestPoisonChain,
        xpEarned: this.xpEarned,
        bossPercentReached: bossPercent,
      });
    });
  }

  // ─── Boss Fight System ───────────────────────────────────────────────────────

  checkBossTrigger(dt: number): void {
    if (this.isBossFight || this.isGameOver) return;
    this.bossTimer -= dt;
    if (this.bossTimer <= 0) {
      this.triggerBossFight();
    }
  }

  triggerBossFight(): void {
    if (this.isBossFight) return;
    this.isBossFight = true;
    this.isBossSpawning = true;

    // Camera flash and shake
    this.cameras.main.flash(500, 255, 255, 255);
    this.cameras.main.shake(400, 0.05);
    this.playSound('boss_spawn');

    // Polish: dramatic "LEVIATHAN AWAKENS" announcement
    const awakensText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'LEVIATHAN\nAWAKENS', {
        fontFamily: 'Arial Black',
        fontSize: '42px',
        color: '#ff2222',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setScale(0.1)
      .setAlpha(0);
    this.tweens.add({
      targets: awakensText,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: awakensText,
          alpha: 0,
          delay: 1200,
          duration: 400,
          onComplete: () => awakensText.destroy(),
        });
      },
    });

    // Clear all normal enemies from screen
    for (let k = this.enemies.length - 1; k >= 0; k--) {
      const e = this.enemies[k];
      if (e && e.kind !== 'buff') {
        e.graphics.destroy();
        this.enemies.splice(k, 1);
      }
    }

    // Red overlay background
    if (this.bossOverlay) this.bossOverlay.destroy();
    this.bossOverlay = this.add.graphics().setDepth(3);
    this.bossOverlay.fillStyle(0xd32f2f, 0.3);
    this.bossOverlay.fillRect(0, 0, this.scale.width, this.scale.height);

    const { width } = this.scale;
    const bossX = width / 2;
    const bossY = 120;
    const bossRadius = 80;
    const bossMaxHp = (350 + Math.floor(this.score / 4)) * 4;

    const graphics = this.add.graphics().setDepth(5);
    graphics.setScale(0);

    // Pick a color scheme different from the last one (if possible)
    let schemeIndex = Math.floor(Math.random() * BOSS_COLOR_SCHEMES.length);
    if (this.lastBossSchemeIndex !== undefined && BOSS_COLOR_SCHEMES.length > 1) {
      while (schemeIndex === this.lastBossSchemeIndex) {
        schemeIndex = Math.floor(Math.random() * BOSS_COLOR_SCHEMES.length);
      }
    }
    this.lastBossSchemeIndex = schemeIndex;
    const scheme = BOSS_COLOR_SCHEMES[schemeIndex]!;

    const bossEnemy: Enemy = {
      kind: 'boss',
      graphics,
      x: bossX,
      y: bossY,
      hp: bossMaxHp,
      maxHp: bossMaxHp,
      radius: bossRadius,
      speed: 35,
      slowTimer: 0,
      state: 'spawning',
      stateTimer: 0.5,
      attackCycle: 0,
      pulseTimer: 0,
      essenceTimer: 3.0,
      color: scheme.main,
      colorSecondary: scheme.secondary,
      dirX: 0,
      dirY: 1,
    };

    this.boss = bossEnemy;
    this.enemies.push(bossEnemy);

    // Scale-in tween
    this.tweens.add({
      targets: graphics,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.isBossSpawning = false;
        if (this.boss) {
          this.boss.state = 'minions';
          this.boss.stateTimer = 3.5;
          
          // Spawn initial minions
          const count = 3 + Math.floor(Math.random() * 3);
          for (let k = 0; k < count; k++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 120 + Math.random() * 40;
            const mx = this.boss.x + Math.cos(angle) * dist;
            const my = this.boss.y + Math.sin(angle) * dist;
            this.spawnMinion(mx, my);
          }
        }
      },
    });

    this.drawBossHpBar();
  }

  updateBoss(e: Enemy, dt: number): void {
    if (e.state === 'spawning') return;

    // Prevent player from sitting exactly at the boss's center (prevents rapid rotation flipping)
    const pdx = this.playerX - e.x;
    const pdy = this.playerY - e.y;
    const plen = Math.sqrt(pdx * pdx + pdy * pdy);
    const minCenterDist = 45; // Hard boundary radius
    if (plen < minCenterDist && plen > 0.01) {
      this.playerX = e.x + (pdx / plen) * minCenterDist;
      this.playerY = e.y + (pdy / plen) * minCenterDist;
      this.playerX = Phaser.Math.Clamp(this.playerX, PLAYER_RADIUS, this.scale.width - PLAYER_RADIUS);
      this.playerY = Phaser.Math.Clamp(this.playerY, PLAYER_RADIUS, this.scale.height - PLAYER_RADIUS);
    }

    // Essence refilling
    if (e.essenceTimer !== undefined) {
      e.essenceTimer -= dt;
      if (e.essenceTimer <= 0) {
        e.essenceTimer = 3.0;
        const shapes = ['yellow', 'green', 'purple'] as const;
        for (let k = 0; k < 3; k++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 40 + Math.random() * 50;
          const rx = e.x + Math.cos(angle) * dist;
          const ry = e.y + Math.sin(angle) * dist;
          const shape = shapes[Math.floor(Math.random() * shapes.length)]!;
          this.dropToken(rx, ry, shape);
        }
        this.showEssenceText();
      }
    }

    if (e.stateTimer !== undefined) {
      e.stateTimer -= dt;
    }

    // Shockwave ring update
    if (this.bossShockwaveRing && this.bossShockwaveRing.active) {
      this.bossShockwaveRing.currentRadius += this.bossShockwaveRing.speed * dt;
      if (this.bossShockwaveRing.currentRadius >= this.bossShockwaveRing.maxRadius) {
        this.bossShockwaveRing.active = false;
      } else if (!this.bossShockwaveRing.hasHitPlayer) {
        const d = Phaser.Math.Distance.Between(this.bossShockwaveRing.x, this.bossShockwaveRing.y, this.playerX, this.playerY);
        if (d < this.bossShockwaveRing.currentRadius) {
          this.bossShockwaveRing.hasHitPlayer = true;
          if (this.hasShield) {
            this.hasShield = false;
          } else {
            this.takeDamage(10);
          }
          // Knockback
          const dx = this.playerX - this.bossShockwaveRing.x;
          const dy = this.playerY - this.bossShockwaveRing.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) {
            this.playerX += (dx / len) * 80;
            this.playerY += (dy / len) * 80;
            this.playerX = Phaser.Math.Clamp(this.playerX, PLAYER_RADIUS, this.scale.width - PLAYER_RADIUS);
            this.playerY = Phaser.Math.Clamp(this.playerY, PLAYER_RADIUS, this.scale.height - PLAYER_RADIUS);
          }
        }
      }
    }

    // Boss state transitions and movement
    if (e.state === 'cooldown') {
      const dx = this.playerX - e.x;
      const dy = this.playerY - e.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        e.dirX = dx / len;
        e.dirY = dy / len;
        e.x += e.dirX * e.speed * dt;
        e.y += e.dirY * e.speed * dt;
      }

      if (e.stateTimer !== undefined && e.stateTimer <= 0) {
        e.attackCycle = ((e.attackCycle || 0) + 1) % 4;
        this.enterBossAttackState(e);
      }
    } else {
      if (e.state === 'minions') {
        const dx = this.playerX - e.x;
        const dy = this.playerY - e.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          e.dirX = dx / len;
          e.dirY = dy / len;
          e.x += e.dirX * e.speed * dt;
          e.y += e.dirY * e.speed * dt;
        }
      } else if (e.state === 'spread') {
        const dx = this.playerX - e.x;
        const dy = this.playerY - e.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          e.dirX = dx / len;
          e.dirY = dy / len;
          e.x += e.dirX * e.speed * dt;
          e.y += e.dirY * e.speed * dt;
        }

        e.projectileTimer = (e.projectileTimer || 0) - dt;
        if (e.projectileTimer <= 0) {
          e.projectileTimer = 0.6; // Fires twice as fast
          const baseAngle = Phaser.Math.Angle.Between(e.x, e.y, this.playerX, this.playerY);
          const angles = [baseAngle - 0.4, baseAngle - 0.2, baseAngle, baseAngle + 0.2, baseAngle + 0.4];
          angles.forEach((angle) => {
            const vx = Math.cos(angle) * 220; // Faster bullets
            const vy = Math.sin(angle) * 220;
            const graphics = this.add.graphics().setDepth(6);
            const proj: Projectile = {
              graphics,
              x: e.x,
              y: e.y,
              vx,
              vy,
              radius: 8,
              damage: 10,
              isRedCircle: true,
            };
            this.projectiles.push(proj);
            this.drawProjectile(proj);
          });
        }
      } else if (e.state === 'charge_windup') {
        const dx = this.playerX - e.x;
        const dy = this.playerY - e.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          e.dirX = dx / len;
          e.dirY = dy / len;
        }
        if (e.stateTimer !== undefined && e.stateTimer <= 0) {
          e.state = 'charge';
          e.stateTimer = 1.5;
          const angle = Phaser.Math.Angle.Between(e.x, e.y, this.playerX, this.playerY);
          e.chargeDirX = Math.cos(angle);
          e.chargeDirY = Math.sin(angle);
        }
      } else if (e.state === 'charge') {
        e.dirX = e.chargeDirX!;
        e.dirY = e.chargeDirY!;
        e.x += e.chargeDirX! * 450 * dt; // Faster charge speed
        e.y += e.chargeDirY! * 450 * dt;

        e.x = Phaser.Math.Clamp(e.x, e.radius, this.scale.width - e.radius);
        e.y = Phaser.Math.Clamp(e.y, e.radius, this.scale.height - e.radius);

        if (Math.random() < 0.8) {
          this.fxParticles.push({
            x: e.x + (Math.random() - 0.5) * 30,
            y: e.y + (Math.random() - 0.5) * 30,
            vx: -e.chargeDirX! * 40 + (Math.random() - 0.5) * 20,
            vy: -e.chargeDirY! * 40 + (Math.random() - 0.5) * 20,
            color: e.colorSecondary || 0x7B1FA2,
            shape: 'green',
            alpha: 0.85,
            size: 3 + Math.random() * 4,
            life: 0,
            maxLife: 400 + Math.random() * 200,
          });
        }
      } else if (e.state === 'shockwave') {
        const dx = this.playerX - e.x;
        const dy = this.playerY - e.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          e.dirX = dx / len;
          e.dirY = dy / len;
          e.x += e.dirX * e.speed * dt;
          e.y += e.dirY * e.speed * dt;
        }
      }

      if (e.state !== 'charge_windup' && e.stateTimer !== undefined && e.stateTimer <= 0) {
        e.state = 'cooldown';
        e.stateTimer = 1.5;
        if (this.bossShockwaveRing) {
          this.bossShockwaveRing.active = false;
        }
      }
    }

    e.x = Phaser.Math.Clamp(e.x, e.radius, this.scale.width - e.radius);
    e.y = Phaser.Math.Clamp(e.y, e.radius, this.scale.height - e.radius);

    this.drawBossHpBar();
  }

  enterBossAttackState(e: Enemy): void {
    const cycle = e.attackCycle || 0;
    if (cycle === 0) {
      e.state = 'spread';
      e.stateTimer = 3.5;
      e.projectileTimer = 0;
    } else if (cycle === 1) {
      e.state = 'spread';
      e.stateTimer = 3.5;
      e.projectileTimer = 0;
    } else if (cycle === 2) {
      e.state = 'charge_windup';
      e.stateTimer = 0.5;
    } else if (cycle === 3) {
      e.state = 'shockwave';
      e.stateTimer = 3.5;
      this.bossShockwaveRing = {
        x: e.x,
        y: e.y,
        currentRadius: 0,
        maxRadius: 260, // Larger shockwave radius
        speed: 220, // Faster shockwave expansion
        active: true,
        hasHitPlayer: false,
      };
    }
  }

  spawnMinion(x: number, y: number): void {
    const graphics = this.add.graphics().setDepth(5);
    const radius = ZOMBIE_RADIUS;
    const speed = (30 + Math.random() * 10) * this.difficultySpeedMultiplier;
    // Bug fix: initialise dirX/dirY and nextDirTimer so updateZombieEnemy doesn't produce NaN
    const spawnAngle = Math.random() * Math.PI * 2;
    const enemy: Enemy = {
      kind: 'zombie',
      graphics,
      x,
      y,
      radius,
      speed,
      hp: ENEMY_HP.zombie,
      slowTimer: 0,
      dirX: Math.cos(spawnAngle),
      dirY: Math.sin(spawnAngle),
      nextDirTimer: 1000 + Math.random() * 2000,
      isMinion: true,
    };
    this.enemies.push(enemy);
    this.redrawEnemy(enemy);
  }

  drawBoss(e: Enemy): void {
    const g = e.graphics;
    g.clear();

    const isHitFlashing = this.gameTime < (e.hitFlashTime || 0);
    const pulseFactor = 1.0 + 0.1 * Math.sin(this.gameTime * 0.008);
    
    // Dynamically adjust scale based on how many times the boss has spawned
    const spawnIdx = this.bossSpawnCount || 0;
    const lengthMult = 1.0 + (spawnIdx % 4) * 0.05; // Subtle length variation
    const widthMult = 1.0 + ((spawnIdx + 2) % 4) * 0.05; // Subtle width variation
    const overallScaleMult = 1.0 + Math.min(spawnIdx * 0.05, 0.15); // Cap overall growth at +15%
    
    const r = e.radius * pulseFactor * overallScaleMult;

    // Soft colored glow around the fish
    const mainColor = e.color || 0x7B1FA2;
    const secondaryColor = e.colorSecondary || 0xD32F2F;
    g.fillStyle(secondaryColor, 0.15);
    g.fillCircle(0, 0, r * 1.35 * Math.max(lengthMult, widthMult));

    // 1. Sleek symmetric closed body
    g.fillStyle(mainColor, 1);
    g.lineStyle(2.5, 0xffffff, 1);
    g.beginPath();
    g.moveTo(r * lengthMult, 0); // Nose tip
    g.lineTo(r * 0.3 * lengthMult, -r * 0.5 * widthMult); // Upper cheek
    g.lineTo(-r * 0.5 * lengthMult, -r * 0.3 * widthMult); // Upper body bulge
    g.lineTo(-r * 1.1 * lengthMult, 0); // Tail base center
    g.lineTo(-r * 0.5 * lengthMult, r * 0.3 * widthMult); // Lower body bulge
    g.lineTo(r * 0.3 * lengthMult, r * 0.5 * widthMult); // Lower cheek
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Intricate geometric inner markings (enhancing visual appearance)
    g.fillStyle(secondaryColor, 0.7);
    g.fillCircle(0, 0, r * 0.2);
    g.fillCircle(-r * 0.35 * lengthMult, 0, r * 0.15);
    g.fillCircle(-r * 0.7 * lengthMult, 0, r * 0.1);
    
    // Chevrons pointing forward
    g.beginPath();
    g.moveTo(r * 0.4 * lengthMult, 0);
    g.lineTo(r * 0.1 * lengthMult, -r * 0.15 * widthMult);
    g.lineTo(r * 0.2 * lengthMult, 0);
    g.lineTo(r * 0.1 * lengthMult, r * 0.15 * widthMult);
    g.closePath();
    g.fillPath();

    // 2. Large symmetric spiky side wings/fins
    g.fillStyle(secondaryColor, 0.85);
    g.lineStyle(1.8, 0xffffff, 1);
    
    // Top wing
    g.beginPath();
    g.moveTo(-r * 0.1 * lengthMult, -r * 0.4 * widthMult);
    g.lineTo(-r * 0.5 * lengthMult, -r * 1.2 * widthMult); // Wing tip
    g.lineTo(-r * 0.3 * lengthMult, -r * 0.3 * widthMult);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Bottom wing
    g.beginPath();
    g.moveTo(-r * 0.1 * lengthMult, r * 0.4 * widthMult);
    g.lineTo(-r * 0.5 * lengthMult, r * 1.2 * widthMult); // Wing tip
    g.lineTo(-r * 0.3 * lengthMult, r * 0.3 * widthMult);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // 3. Crescent forked tail fin
    g.fillStyle(secondaryColor, 0.8);
    g.beginPath();
    g.moveTo(-r * 1.1 * lengthMult, 0);
    g.lineTo(-r * 1.65 * lengthMult, -r * 0.55 * widthMult); // Upper tail tip
    g.lineTo(-r * 1.35 * lengthMult, 0); // Inner tail center
    g.lineTo(-r * 1.65 * lengthMult, r * 0.55 * widthMult); // Lower tail tip
    g.closePath();
    g.fillPath();
    g.strokePath();

    // 4. Large glowing eyes facing right (symmetric on top/bottom)
    const eyeRadius = 9 * pulseFactor * overallScaleMult;
    if (isHitFlashing) {
      g.fillStyle(0xffffff, 1.0);
      g.fillCircle(r * 0.4 * lengthMult, -r * 0.2 * widthMult, eyeRadius);
      g.fillCircle(r * 0.4 * lengthMult, r * 0.2 * widthMult, eyeRadius);
    } else {
      g.fillStyle(0xFF0000, 1.0);
      g.fillCircle(r * 0.4 * lengthMult, -r * 0.2 * widthMult, eyeRadius);
      g.fillCircle(r * 0.4 * lengthMult, r * 0.2 * widthMult, eyeRadius);
      g.fillStyle(0xFFFF00, 1.0);
      g.fillCircle(r * 0.45 * lengthMult, -r * 0.2 * widthMult, eyeRadius * 0.35);
      g.fillCircle(r * 0.45 * lengthMult, r * 0.2 * widthMult, eyeRadius * 0.35);
    }

    // 5. Hit flash overlay
    if (isHitFlashing) {
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(0, 0, r * Math.max(lengthMult, widthMult) * 0.8);
    }

    g.setPosition(e.x, e.y);
  }

  drawBossHpBar(): void {
    if (!this.boss || !this.isBossFight) {
      if (this.bossHpBarGraphics) this.bossHpBarGraphics.clear();
      if (this.bossHpText) this.bossHpText.setVisible(false);
      return;
    }

    const { width } = this.scale;
    const barW = 300;
    const barH = 20;
    const barX = width / 2 - barW / 2;
    const barY = 42;

    if (!this.bossHpBarGraphics) {
      this.bossHpBarGraphics = this.add.graphics().setScrollFactor(0).setDepth(11);
    }
    if (!this.bossHpText) {
      this.bossHpText = this.add.text(width / 2, barY - 14, 'ABYSSAL LEVIATHAN', {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: '#FF1744',
        stroke: '#000000',
        strokeThickness: 3.5,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(11);
    } else {
      this.bossHpText.setPosition(width / 2, barY - 14).setVisible(true);
    }

    const g = this.bossHpBarGraphics;
    g.clear();
    g.setVisible(true);

    g.fillStyle(0x4A0000, 1.0);
    g.fillRoundedRect(barX, barY, barW, barH, 4);

    const ratio = Math.max(0, Math.min(1, this.boss.hp / this.boss.maxHp!));
    if (ratio > 0) {
      // Color shift: red → orange at low HP
      const hpColor = ratio > 0.5 ? 0xFF1744 : ratio > 0.25 ? 0xFF6600 : 0xFF9900;
      g.fillStyle(hpColor, 1.0);
      g.fillRoundedRect(barX, barY, barW * ratio, barH, 4);
    }

    g.lineStyle(1.5, 0xffffff, 0.95);
    g.strokeRoundedRect(barX, barY, barW, barH, 4);

    // Phase marker tick marks at 75%, 50%, 25%
    const phases = [0.75, 0.5, 0.25];
    for (const p of phases) {
      const tickX = barX + barW * p;
      g.lineStyle(2, 0xffffff, 0.7);
      g.lineBetween(tickX, barY - 3, tickX, barY + barH + 3);
    }

    // Phase shift announcement when crossing thresholds
    const phaseThresholds = [75, 50, 25];
    for (const thresh of phaseThresholds) {
      if (!this.bossPhaseTriggered.has(thresh) && ratio <= thresh / 100) {
        this.bossPhaseTriggered.add(thresh);
        this.cameras.main.shake(250, 0.025);
        const phaseText = this.add.text(width / 2, this.scale.height / 2 - 60,
          `⚡ PHASE SHIFT — ${thresh}%`, {
            fontFamily: 'Arial Black', fontSize: '22px',
            color: '#ff6600', stroke: '#000000', strokeThickness: 6,
          }).setOrigin(0.5).setDepth(18).setAlpha(0);
        this.tweens.add({
          targets: phaseText, alpha: 1, scaleX: 1.1, scaleY: 1.1,
          duration: 200, yoyo: true, repeat: 1,
          onComplete: () => {
            this.tweens.add({ targets: phaseText, alpha: 0, delay: 600, duration: 300, onComplete: () => phaseText.destroy() });
          },
        });
      }
    }
  }

  showEssenceText(): void {
    if (!this.boss) return;
    const txt = this.add.text(this.boss.x, this.boss.y - 85, 'The Leviathan drops essence!', {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 3,

    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: txt,
      y: this.boss.y - 125,
      alpha: 0,
      duration: 1200,
      onComplete: () => txt.destroy(),
    });
  }

  defeatBoss(e: Enemy): void {
    if (this.bossShockwaveRing) {
      this.bossShockwaveRing.active = false;
      this.bossShockwaveRing = null;
    }
    
    // Clear all projectiles on boss death
    for (const p of this.projectiles) p.graphics.destroy();
    this.projectiles = [];

    this.cameras.main.flash(200, 255, 255, 255);
    this.playSound('boss_die');

    const colors = [0x7B1FA2, 0xD32F2F];
    const shapes: Array<Shape | 'star'> = ['yellow', 'green', 'purple', 'star'];
    for (let k = 0; k < 100; k++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 300;
      const color = colors[Math.floor(Math.random() * colors.length)]!;
      this.fxParticles.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        shape: shapes[Math.floor(Math.random() * shapes.length)]!,
        alpha: 1.0,
        size: 2.0 + Math.random() * 3.0,
        life: 0,
        maxLife: 600 + Math.random() * 600,
      });
    }

    const bonus = 50 + Math.floor(this.score / 10);
    this.score += bonus;
    this.scoreText.setText(`Score: ${Math.floor(this.score)} (x${this.streakMultiplier.toFixed(1)})`);

    // Bug fix: award XP for killing the boss
    this.addXp(10, e.x, e.y);

    const txt = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, `LEVIATHAN SLAIN! +${bonus} BONUS!`, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 5,

    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: txt,
      y: this.scale.height / 2 - 100,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => txt.destroy(),
    });

    // Clear minions and spawn normal tokens
    for (let k = this.enemies.length - 1; k >= 0; k--) {
      const other = this.enemies[k];
      if (other && other.isMinion) {
        const shapesList = ['yellow', 'green', 'purple'] as const;
        const shape = shapesList[Math.floor(Math.random() * shapesList.length)]!;
        this.dropToken(other.x, other.y, shape);

        other.graphics.destroy();
        this.enemies.splice(k, 1);
      }
    }

    this.isBossFight = false;
    this.boss = null;
    this.bossPhaseTriggered = new Set();

    this.bossSpawnCount++;
    if (this.bossSpawnCount % 2 === 1) {
      // After odd number of bosses (1st, 3rd, 5th...), next interval is 20-25 secs
      this.bossTimer = 20 + Math.random() * 5;
    } else {
      // After even number of bosses (2nd, 4th, 6th...), next interval is 30-35 secs
      this.bossTimer = 30 + Math.random() * 5;
    }

    e.graphics.destroy();
    if (this.bossOverlay) {
      this.bossOverlay.destroy();
      this.bossOverlay = null;
    }
    if (this.bossHpBarGraphics) {
      this.bossHpBarGraphics.destroy();
      this.bossHpBarGraphics = null;
    }
    if (this.bossHpText) {
      this.bossHpText.destroy();
      this.bossHpText = null;
    }

    const idx = this.enemies.indexOf(e);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
    }
  }
}