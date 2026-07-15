import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import type {
  LeaderboardsData,
  LeaderboardEntry,
  LeaderboardGetResponse,
  PlayerProgressResponse,
  StreakResponse,
  WelcomeBonusData,
  WelcomeResponse,
} from '../../shared/api';

function getStreakMultiplier(streak: number): number {
  if (streak <= 1) return 1.0;
  if (streak === 2) return 1.1;
  if (streak === 3) return 1.2;
  if (streak === 4) return 1.4;
  if (streak === 5) return 1.6;
  if (streak === 6) return 1.8;
  return 2.0; // 7+
}

function getWelcomeBonusDescription(bonus: { type: string; value: number }): string {
  switch (bonus.type) {
    case 'score': return `+50 Starting Score`;
    case 'orbs': return `+1 Starting Orbs`;
    case 'hp': return `+20 Max HP`;
    case 'doubleKills': return `2x Kill Score (first 10)`;
    default: return '';
  }
}

export class MainMenu extends Scene {
  backgroundGraphics: Phaser.GameObjects.Graphics | null = null;
  
  // Progression fields
  playerProgress: PlayerProgressResponse | null = null;
  streakText: Phaser.GameObjects.Text | null = null;
  levelText: Phaser.GameObjects.Text | null = null;
  upgradesText: Phaser.GameObjects.Text | null = null;
  activeBonusText: Phaser.GameObjects.Text | null = null;
  dailyGlyphText: Phaser.GameObjects.Text | null = null;
  lastScoreText: Phaser.GameObjects.Text | null = null;

  // Welcome popup fields
  welcomePopupContainer: Phaser.GameObjects.Container | null = null;
  welcomePopupBg: Phaser.GameObjects.Graphics | null = null;
  welcomePopupTitle: Phaser.GameObjects.Text | null = null;
  welcomePopupDesc: Phaser.GameObjects.Text | null = null;
  welcomePopupClaimBtn: Phaser.GameObjects.Text | null = null;
  titleText: Phaser.GameObjects.Text | null = null;
  subtitleText: Phaser.GameObjects.Text | null = null;
  playButton: Phaser.GameObjects.Text | null = null;
  raidButton: Phaser.GameObjects.Text | null = null;
  upgradesRoadmapButton: Phaser.GameObjects.Text | null = null;
  howToPlayButton: Phaser.GameObjects.Text | null = null;
  leaderboardButton: Phaser.GameObjects.Text | null = null;

  // Leaderboard Overlay Container
  leaderboardContainer: Phaser.GameObjects.Container | null = null;
  howToPlayContainer: Phaser.GameObjects.Container | null = null;
  howToPlayBg: Phaser.GameObjects.Graphics | null = null;
  howToPlayTitle: Phaser.GameObjects.Text | null = null;
  howToPlayContent: Phaser.GameObjects.Text | null = null;
  howToPlayClose: Phaser.GameObjects.Text | null = null;
  overlayBgGraphics: Phaser.GameObjects.Graphics | null = null;
  overlayHeader: Phaser.GameObjects.Text | null = null;
  overlayCol1Title: Phaser.GameObjects.Text | null = null;
  overlayCol2Title: Phaser.GameObjects.Text | null = null;
  overlayCol3Title: Phaser.GameObjects.Text | null = null;
  overlayCol4Title: Phaser.GameObjects.Text | null = null;
  overlayCol5Title: Phaser.GameObjects.Text | null = null;
  overlayCol1List: Phaser.GameObjects.Text | null = null;
  overlayCol2List: Phaser.GameObjects.Text | null = null;
  overlayCol3List: Phaser.GameObjects.Text | null = null;
  overlayCol4List: Phaser.GameObjects.Text | null = null;
  overlayCol5List: Phaser.GameObjects.Text | null = null;
  overlayCloseButton: Phaser.GameObjects.Text | null = null;

  tabDepthBtn: Phaser.GameObjects.Text | null = null;
  tabTridentBtn: Phaser.GameObjects.Text | null = null;
  tabLightningBtn: Phaser.GameObjects.Text | null = null;
  tabNovaBtn: Phaser.GameObjects.Text | null = null;
  tabPoisonBtn: Phaser.GameObjects.Text | null = null;
  selectedTab: number = 0;
  leaderboardPage: number = 0;
  btnPrevPage: Phaser.GameObjects.Text | null = null;
  btnNextPage: Phaser.GameObjects.Text | null = null;

  leaderboardsData: LeaderboardsData | null = null;


  // Roadmap & Upgrades Overlay Container
  upgradesRoadmapContainer: Phaser.GameObjects.Container | null = null;
  roadmapBgGraphics: Phaser.GameObjects.Graphics | null = null;
  roadmapHeader: Phaser.GameObjects.Text | null = null;
  roadmapCloseButton: Phaser.GameObjects.Text | null = null;
  roadmapTexts: Phaser.GameObjects.Text[] = [];
  roadmapUpgradesTitleText: Phaser.GameObjects.Text | null = null;
  roadmapUpgradesContentText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('MainMenu');
  }

  /**
   * Reset cached GameObject references every time the scene starts.
   */
  init(): void {
    this.backgroundGraphics = null;
    this.titleText = null;
    this.subtitleText = null;
    this.playButton = null;
    this.raidButton = null;
    this.leaderboardButton = null;

    this.playerProgress = null;
    this.streakText = null;
    this.levelText = null;
    this.upgradesText = null;
    this.activeBonusText = null;
    this.dailyGlyphText = null;
    this.lastScoreText = null;
    this.welcomePopupContainer = null;
    this.welcomePopupBg = null;
    this.welcomePopupTitle = null;
    this.welcomePopupDesc = null;
    this.welcomePopupClaimBtn = null;

    this.leaderboardContainer = null;
    this.overlayBgGraphics = null;
    this.overlayHeader = null;
    this.tabDepthBtn = null;
    this.tabTridentBtn = null;
    this.tabLightningBtn = null;
    this.tabNovaBtn = null;
    this.tabPoisonBtn = null;
    this.selectedTab = 0;
    this.leaderboardPage = 0;
    this.btnPrevPage = null;
    this.btnNextPage = null;

    this.leaderboardsData = null;

    this.upgradesRoadmapContainer = null;
    this.roadmapBgGraphics = null;
    this.roadmapHeader = null;
    this.roadmapCloseButton = null;
    this.roadmapTexts = [];
    this.roadmapUpgradesTitleText = null;
    this.roadmapUpgradesContentText = null;
    this.overlayCol1Title = null;
    this.overlayCol2Title = null;
    this.overlayCol3Title = null;
    this.overlayCol4Title = null;
    this.overlayCol5Title = null;
    this.overlayCol1List = null;
    this.overlayCol2List = null;
    this.overlayCol3List = null;
    this.overlayCol4List = null;
    this.overlayCol5List = null;
    this.overlayCloseButton = null;
    this.leaderboardsData = null;
  }

  create() {
    // 1. Create background graphics FIRST at depth 0
    this.backgroundGraphics = this.add.graphics().setDepth(0);

    // 2. Title Text at depth 1
    this.titleText = this.add.text(0, 0, 'GLYPHBORNE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '52px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center',

    }).setOrigin(0.5).setDepth(1);

    // 3. Subtitle Text at depth 1
    this.subtitleText = this.add.text(0, 0, 'Abyssal Spellcasting Adventure', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#80d8ff',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5).setDepth(1);

    // 4. Play Button at depth 1
    this.playButton = this.add.text(0, 0, 'PLAY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#00ff66',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1);

    // Multi-player Boss
    this.raidButton = this.add.text(0, 0, 'MULTI-PLAYER BOSS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1);

    this.upgradesRoadmapButton = this.add.text(0, 0, 'UPGRADES', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1);

    this.howToPlayButton = this.add.text(0, 0, 'HOW TO PLAY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1);

    // 6. Leaderboards Button at depth 1
    this.leaderboardButton = this.add.text(0, 0, 'LEADERBOARDS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1);

    // Setup interactive events
    this.playButton.on('pointerover', () => this.playButton?.setColor('#ffffff'));
    this.playButton.on('pointerout', () => this.playButton?.setColor('#00ff66'));
    this.playButton.on('pointerdown', () => {
      // Check if we have an active welcome bonus (claimed but not yet consumed)
      if (this.playerProgress && this.playerProgress.welcomeBonus && this.playerProgress.welcomeBonus.claimed && this.playerProgress.welcomeBonus.value > 0) {
        this.registry.set('activeWelcomeBonus', this.playerProgress.welcomeBonus);
        fetch('/api/player/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'consume' }),
        }).catch((err) => console.error('Error consuming welcome bonus:', err));
      } else {
        this.registry.set('activeWelcomeBonus', null);
      }
      this.scene.start('Game', { mode: 'normal' });
    });

    this.raidButton.on('pointerover', () => this.raidButton?.setColor('#ffffff'));
    this.raidButton.on('pointerout', () => this.raidButton?.setColor('#ff4444'));
    this.raidButton.on('pointerdown', () => {
      if (this.playerProgress && this.playerProgress.welcomeBonus && this.playerProgress.welcomeBonus.claimed && this.playerProgress.welcomeBonus.value > 0) {
        this.registry.set('activeWelcomeBonus', this.playerProgress.welcomeBonus);
        fetch('/api/player/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'consume' }),
        }).catch((err) => console.error('Error consuming welcome bonus:', err));
      } else {
        this.registry.set('activeWelcomeBonus', null);
      }
      this.scene.start('Game', { mode: 'raid' });
    });

    this.upgradesRoadmapButton.on('pointerover', () => this.upgradesRoadmapButton?.setColor('#ffcc00'));
    this.upgradesRoadmapButton.on('pointerout', () => this.upgradesRoadmapButton?.setColor('#ffffff'));
    this.upgradesRoadmapButton.on('pointerdown', () => {
      this.showUpgradesRoadmapOverlay();
    });

    this.howToPlayButton.on('pointerover', () => this.howToPlayButton?.setColor('#4fc3f7'));
    this.howToPlayButton.on('pointerout', () => this.howToPlayButton?.setColor('#ffffff'));
    this.howToPlayButton.on('pointerdown', () => {
      this.showHowToPlayOverlay();
    });

    this.leaderboardButton.on('pointerover', () => this.leaderboardButton?.setColor('#4fc3f7'));
    this.leaderboardButton.on('pointerout', () => this.leaderboardButton?.setColor('#ffffff'));
    this.leaderboardButton.on('pointerdown', () => {
      this.showLeaderboardsOverlay();
    });

    // 6. Leaderboard Overlay Container at depth 2
    this.leaderboardContainer = this.add.container(0, 0).setDepth(2).setVisible(false);

    this.overlayBgGraphics = this.add.graphics();
    this.leaderboardContainer.add(this.overlayBgGraphics);

    this.overlayHeader = this.add.text(0, 0, 'GLOBAL LEADERBOARDS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 4.5,
      align: 'center',

    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayHeader);

    // Tab buttons
    this.tabDepthBtn = this.add.text(0, 0, 'SCORE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabDepthBtn);

    this.tabTridentBtn = this.add.text(0, 0, 'TRIDENT', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabTridentBtn);

    this.tabLightningBtn = this.add.text(0, 0, 'LIGHTNING', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabLightningBtn);

    this.tabNovaBtn = this.add.text(0, 0, 'NOVA', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabNovaBtn);

    this.tabPoisonBtn = this.add.text(0, 0, 'POISON', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabPoisonBtn);

    // Tab click handlers
    this.tabDepthBtn.on('pointerdown', () => { this.selectedTab = 0; this.refreshLayout(); });
    this.tabTridentBtn.on('pointerdown', () => { this.selectedTab = 1; this.refreshLayout(); });
    this.tabLightningBtn.on('pointerdown', () => { this.selectedTab = 2; this.refreshLayout(); });
    this.tabNovaBtn.on('pointerdown', () => { this.selectedTab = 3; this.refreshLayout(); });
    this.tabPoisonBtn.on('pointerdown', () => { this.selectedTab = 4; this.refreshLayout(); });

    // Columns title inside overlay
    this.overlayCol1Title = this.add.text(0, 0, 'TOP SCORE (DEPTH)', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#4fc3f7',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol1Title);

    this.overlayCol2Title = this.add.text(0, 0, 'TOP TRIDENT CHAIN', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#00e5ff',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol2Title);

    this.overlayCol3Title = this.add.text(0, 0, 'TOP LIGHTNING CHAIN', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol3Title);

    this.overlayCol4Title = this.add.text(0, 0, 'TOP NOVA CHAIN', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#e040fb',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol4Title);

    this.overlayCol5Title = this.add.text(0, 0, 'TOP POISON CHAIN', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#44ff44',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol5Title);

    const listStyle = {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2.2,
      align: 'left',
      lineSpacing: 6,

    };

    // Lists
    this.overlayCol1List = this.add.text(0, 0, 'Loading...', listStyle).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol1List);

    this.overlayCol2List = this.add.text(0, 0, 'Loading...', listStyle).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol2List);

    this.overlayCol3List = this.add.text(0, 0, 'Loading...', listStyle).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol3List);

    this.overlayCol4List = this.add.text(0, 0, 'Loading...', listStyle).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol4List);

    this.overlayCol5List = this.add.text(0, 0, 'Loading...', listStyle).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol5List);

    // Pagination buttons
    this.btnPrevPage = this.add.text(0, 0, '< PREV', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#01579b',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setPadding(8, 4, 8, 4);
    this.leaderboardContainer.add(this.btnPrevPage);
    this.btnPrevPage.on('pointerdown', () => {
      if (this.leaderboardPage > 0) {
        this.leaderboardPage--;
        this.populateOverlayLists();
        this.refreshLayout();
      }
    });

    this.btnNextPage = this.add.text(0, 0, 'NEXT >', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#01579b',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setPadding(8, 4, 8, 4);
    this.leaderboardContainer.add(this.btnNextPage);
    this.btnNextPage.on('pointerdown', () => {
      this.leaderboardPage++;
      this.populateOverlayLists();
      this.refreshLayout();
    });

    // Close button
    this.overlayCloseButton = this.add.text(0, 0, 'CLOSE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ff5252',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.overlayCloseButton);

    this.overlayCloseButton.on('pointerover', () => this.overlayCloseButton?.setColor('#ffffff'));
    this.overlayCloseButton.on('pointerout', () => this.overlayCloseButton?.setColor('#ff5252'));
    this.overlayCloseButton.on('pointerdown', () => {
      this.leaderboardContainer?.setVisible(false);
    });

    // Streak Text
    this.streakText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ff9100',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5).setDepth(1);

    // Level Text
    this.levelText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5).setDepth(1);

    // Upgrades Text
    this.upgradesText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#b3e5fc',
      stroke: '#000000',
      strokeThickness: 2.5,
      align: 'center',

    }).setOrigin(0.5).setDepth(1);

    // Active Bonus Text
    this.activeBonusText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#00ff66',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',

    }).setOrigin(0.5).setDepth(1);

    // Daily Glyph Text
    this.dailyGlyphText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3.5,
    }).setOrigin(0.5).setDepth(1);

    // Populate Daily Glyph
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const bonuses = [
      { text: '★ Yellow Spell Orbs ▲ (gives +20 Score instead of +10!)', color: '#ffdd00' },
      { text: '★ Green Spell Orbs ● (gives +20 Score instead of +10!)', color: '#00ff66' },
      { text: '★ Purple Spell Orbs ■ (gives +20 Score instead of +10!)', color: '#cc00ff' },
      { text: '★ BOSS SLAYER (Slaying bosses gives 2x XP!)', color: '#ff5252' },
      { text: '★ TITAN FALL (Slay 10 bosses -> 4x XP on death!)', color: '#ff9800' }
    ];
    const dailyBonus = bonuses[daysSinceEpoch % 5] || bonuses[0]!;
    
    if (this.dailyGlyphText) {
      this.dailyGlyphText.setText(dailyBonus.text);
      this.dailyGlyphText.setColor(dailyBonus.color);
    }

    // Last Score Text
    this.lastScoreText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(1);

    // Populate Last Score
    let lastScoreVal = 0;
    if (this.game && this.game.registry) {
      const regScore = this.game.registry.get('lastScore');
      if (typeof regScore === 'number') lastScoreVal = regScore;
    }
    if (!lastScoreVal && this.playerProgress && this.playerProgress.lastScore) {
      lastScoreVal = this.playerProgress.lastScore;
    }
    if (!lastScoreVal) {
      try {
        const lsStr = localStorage.getItem('glyphborne_lastScore');
        if (lsStr) lastScoreVal = parseInt(lsStr, 10);
      } catch(e) {}
    }

    if (this.lastScoreText && typeof lastScoreVal === 'number' && lastScoreVal > 0) {
      this.lastScoreText.setText(`Last run: ${lastScoreVal} pts`);
      this.lastScoreText.setVisible(true);
    } else if (this.lastScoreText) {
      this.lastScoreText.setVisible(false);
    }

    // Upgrades & Roadmap Overlay Container at depth 2
    this.upgradesRoadmapContainer = this.add.container(0, 0).setDepth(2).setVisible(false);

    this.roadmapBgGraphics = this.add.graphics();
    this.upgradesRoadmapContainer.add(this.roadmapBgGraphics);

    this.roadmapHeader = this.add.text(0, 0, 'ROADMAP & UPGRADES', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',

    }).setOrigin(0.5);
    this.upgradesRoadmapContainer.add(this.roadmapHeader);

    // Level bubble texts
    this.roadmapTexts = [];
    for (let k = 0; k < 6; k++) {
      const txt = this.add.text(0, 0, '', {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 0,

      }).setOrigin(0.5);
      this.upgradesRoadmapContainer.add(txt);
      this.roadmapTexts.push(txt);
    }

    // Upgrades Texts
    this.roadmapUpgradesTitleText = this.add.text(0, 0, 'PLAYER UPGRADES', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#4fc3f7',
      stroke: '#000000',
      strokeThickness: 1,
      align: 'center',

    }).setOrigin(0.5);
    this.upgradesRoadmapContainer.add(this.roadmapUpgradesTitleText);

    this.roadmapUpgradesContentText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 0,
      align: 'left',
      lineSpacing: 10,

    }).setOrigin(0, 0); // Left-aligned
    this.upgradesRoadmapContainer.add(this.roadmapUpgradesContentText);

    // Close button
    this.roadmapCloseButton = this.add.text(0, 0, 'CLOSE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#ff5252',
      strokeThickness: 4,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.upgradesRoadmapContainer.add(this.roadmapCloseButton);

    this.roadmapCloseButton.on('pointerover', () => this.roadmapCloseButton?.setColor('#ff5252'));
    this.roadmapCloseButton.on('pointerout', () => this.roadmapCloseButton?.setColor('#ffffff'));
    this.roadmapCloseButton.on('pointerdown', () => {
      this.upgradesRoadmapContainer?.setVisible(false);
    });

    this.setupHowToPlayOverlay();
    this.fetchStreakAndProgress();

    this.refreshLayout();

    // Re-calculate positions whenever the game canvas is resized.
    this.scale.on('resize', () => this.refreshLayout());
  }

  private showUpgradesRoadmapOverlay(): void {
    this.upgradesRoadmapContainer?.setVisible(true);
    this.refreshLayout();
  }

  private showLeaderboardsOverlay(): void {
    this.leaderboardContainer?.setVisible(true);

    // Add swipe to switch tabs
    let startX = 0;
    if (this.overlayBgGraphics) {
      const { width, height } = this.scale;
      this.overlayBgGraphics.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
      this.overlayBgGraphics.on('pointerdown', (p: Phaser.Input.Pointer) => { startX = p.x; });
      this.overlayBgGraphics.on('pointerup', (p: Phaser.Input.Pointer) => {
        const dx = p.x - startX;
        if (dx > 60) {
          this.selectedTab = Math.max(0, this.selectedTab - 1);
          this.leaderboardPage = 0;
          this.refreshLayout();
          this.populateOverlayLists();
        } else if (dx < -60) {
          this.selectedTab = Math.min(4, this.selectedTab + 1);
          this.leaderboardPage = 0;
          this.refreshLayout();
          this.populateOverlayLists();
        }
      });
    }

    if (this.overlayCol1List) this.overlayCol1List.setText('Loading...');
    if (this.overlayCol2List) this.overlayCol2List.setText('Loading...');
    if (this.overlayCol3List) this.overlayCol3List.setText('Loading...');
    if (this.overlayCol4List) this.overlayCol4List.setText('Loading...');
    if (this.overlayCol5List) this.overlayCol5List.setText('Loading...');

    fetch('/api/leaderboard')
      .then((res) => res.json() as Promise<LeaderboardGetResponse>)
      .then((data) => {
        if (data && data.status === 'success' && data.leaderboards) {
          this.leaderboardsData = data.leaderboards;
          this.populateOverlayLists();
        } else {
          this.displayOverlayError();
        }
      })
      .catch((err) => {
        console.error('Failed to get leaderboards:', err);
        this.displayOverlayError();
      });
  }

  private populateOverlayLists(): void {
    if (!this.leaderboardsData) return;

    const width = this.scale.width;
    const isMobile = width < 600;
    const maxNameLen = isMobile ? 5 : 12;
    const startIdx = this.leaderboardPage * 10;
    const endIdx = startIdx + 10;

    let scoreLines = '';
    const scoreData = this.leaderboardsData.score || [];
    scoreData.slice(startIdx, endIdx).forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      scoreLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol1List) this.overlayCol1List.setText(scoreLines || 'No entries yet');

    let tridentLines = '';
    const tridentData = this.leaderboardsData.trident || [];
    tridentData.slice(startIdx, endIdx).forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      tridentLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol2List) this.overlayCol2List.setText(tridentLines || 'No entries yet');

    let lightningLines = '';
    const lightData = this.leaderboardsData.lightning || [];
    lightData.slice(startIdx, endIdx).forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      lightningLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol3List) this.overlayCol3List.setText(lightningLines || 'No entries yet');

    let novaLines = '';
    const novaData = this.leaderboardsData.nova || [];
    novaData.slice(startIdx, endIdx).forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      novaLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol4List) this.overlayCol4List.setText(novaLines || 'No entries yet');

    let poisonLines = '';
    const poisonData = this.leaderboardsData.poison || [];
    poisonData.slice(startIdx, endIdx).forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      poisonLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol5List) this.overlayCol5List.setText(poisonLines || 'No entries yet');

    this.refreshLayout();
  }

  private displayOverlayError(): void {
    if (this.overlayCol1List) this.overlayCol1List.setText('Unavailable');
    if (this.overlayCol2List) this.overlayCol2List.setText('Unavailable');
    if (this.overlayCol3List) this.overlayCol3List.setText('Unavailable');
    if (this.overlayCol4List) this.overlayCol4List.setText('Unavailable');
    if (this.overlayCol5List) this.overlayCol5List.setText('Unavailable');
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera to new viewport to prevent black bars
    this.cameras.resize(width, height);

    // Procedural background – stretch to fill the whole canvas
    if (this.backgroundGraphics) {
      this.backgroundGraphics.clear();
      this.backgroundGraphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4fc3f7, 0x4fc3f7, 1.0, 1.0, 1.0, 1.0);
      this.backgroundGraphics.fillRect(0, 0, width, height);

      // Add cartoon bubbles
      this.backgroundGraphics.fillStyle(0xffffff, 0.15);
      this.backgroundGraphics.fillCircle(width * 0.15, height * 0.75, 20);
      this.backgroundGraphics.lineStyle(1.5, 0xffffff, 0.35);
      this.backgroundGraphics.strokeCircle(width * 0.15, height * 0.75, 20);

      this.backgroundGraphics.fillStyle(0xffffff, 0.15);
      this.backgroundGraphics.fillCircle(width * 0.85, height * 0.3, 30);
      this.backgroundGraphics.strokeCircle(width * 0.85, height * 0.3, 30);
    }

    const midX = Math.round(width / 2);

    // Title text — no scaling, fixed font size
    if (this.titleText) {
      this.titleText.setPosition(midX, Math.round(height * 0.32));
      this.titleText.setScale(1);
    }

    if (this.subtitleText) {
      this.subtitleText.setPosition(midX, Math.round(height * 0.40));
      this.subtitleText.setScale(1);
    }

    // Buttons
    if (this.playButton) {
      this.playButton.setPosition(midX, Math.round(height * 0.51));
      this.playButton.setScale(1);
    }

    if (this.raidButton) {
      this.raidButton.setPosition(midX, Math.round(height * 0.59));
      this.raidButton.setScale(1);
    }

    if (this.upgradesRoadmapButton) {
      this.upgradesRoadmapButton.setPosition(midX, Math.round(height * 0.67));
      this.upgradesRoadmapButton.setScale(1);
    }

    if (this.howToPlayButton) {
      this.howToPlayButton.setPosition(midX, Math.round(height * 0.75));
      this.howToPlayButton.setScale(1);
    }

    if (this.leaderboardButton) {
      this.leaderboardButton.setPosition(midX, Math.round(height * 0.83));
      this.leaderboardButton.setScale(1);
    }

    const isMobile = width < 600;
    const lbPanelW = Math.min(Math.max(320, width * 0.9), 700);
    const lbPanelH = height * 0.74;
    const lbPanelX = midX - lbPanelW / 2;
    const lbPanelY = height * 0.13;

    // Redraw Overlay Background (Leaderboards Overlay)
    if (this.overlayBgGraphics) {
      this.overlayBgGraphics.clear();
      // Fullscreen semi-transparent backdrop (sky blue)
      this.overlayBgGraphics.fillStyle(0x4fc3f7, 0.85);
      this.overlayBgGraphics.fillRect(0, 0, width, height);

      const lbW = Math.min(Math.max(340, width * 0.95), 800);
      const lbH = Math.min(600, height * 0.85);
      const lbX = midX - lbW / 2;
      const lbY = height / 2 - lbH / 2;

      // Panel for Leaderboards (deep blue)
      this.overlayBgGraphics.fillStyle(0x0288d1, 0.95);
      this.overlayBgGraphics.fillRoundedRect(lbX, lbY, lbW, lbH, 14);
      this.overlayBgGraphics.lineStyle(3, 0xffffff, 1.0); // White border
      this.overlayBgGraphics.strokeRoundedRect(lbX, lbY, lbW, lbH, 14);
    }

    // Connect levels with lines in a roadmap format & Draw Upgrades & Roadmap Graphics Overlay
    if (this.roadmapBgGraphics) {
      this.roadmapBgGraphics.clear();
      // Fullscreen semi-transparent backdrop
      this.roadmapBgGraphics.fillStyle(0x4fc3f7, 0.85);
      this.roadmapBgGraphics.fillRect(0, 0, width, height);

      // Panel for Roadmap & Upgrades
      this.roadmapBgGraphics.fillStyle(0x0288d1, 0.95);
      this.roadmapBgGraphics.fillRoundedRect(lbPanelX, lbPanelY, lbPanelW, lbPanelH, 14);
      this.roadmapBgGraphics.lineStyle(3, 0xffffff, 1.0);
      this.roadmapBgGraphics.strokeRoundedRect(lbPanelX, lbPanelY, lbPanelW, lbPanelH, 14);

      const currentLvl = this.playerProgress?.level || 1;
      const startLvl = Math.max(1, currentLvl - 2);

      const nodeX = lbPanelX + lbPanelW * (isMobile ? 0.25 : 0.28);
      const startY = lbPanelY + (isMobile ? 70 : 90);
      const endY = lbPanelY + lbPanelH - (isMobile ? 65 : 85);

      let prevX = nodeX;
      let prevY = startY;

      // Draw roadmap connector lines
      for (let k = 0; k < 6; k++) {
        const nodeY = Math.round(startY + k * ((endY - startY) / 5));
        if (k > 0) {
          this.roadmapBgGraphics.lineStyle(3, 0xffffff, 0.5);
          this.roadmapBgGraphics.lineBetween(prevX, prevY, nodeX, nodeY);
        }
        prevX = nodeX;
        prevY = nodeY;
      }

      // Draw rectangles instead of bubble circles
      const rectW = isMobile ? 74 : 90;
      const rectH = isMobile ? 26 : 32;

      for (let k = 0; k < 6; k++) {
        const levelNum = startLvl + k;
        const nodeY = Math.round(startY + k * ((endY - startY) / 5));

        const isCompleted = levelNum < currentLvl;
        const isCurrent = levelNum === currentLvl;
        
        const rectX = nodeX - rectW / 2;
        const rectY = nodeY - rectH / 2;

        if (isCompleted) {
          this.roadmapBgGraphics.fillStyle(0x00e676, 1.0); // Bright green
          this.roadmapBgGraphics.lineStyle(2.5, 0xffffff, 1.0);
          this.roadmapBgGraphics.fillRoundedRect(rectX, rectY, rectW, rectH, 6);
          this.roadmapBgGraphics.strokeRoundedRect(rectX, rectY, rectW, rectH, 6);
        } else if (isCurrent) {
          const pulse = 1.0 + 0.05 * Math.sin(Date.now() * 0.005);
          this.roadmapBgGraphics.fillStyle(0xffb74d, 1.0); // Glowing orange/yellow
          this.roadmapBgGraphics.lineStyle(3, 0xffffff, 1.0);
          const pW = rectW * pulse;
          const pH = rectH * pulse;
          this.roadmapBgGraphics.fillRoundedRect(nodeX - pW / 2, nodeY - pH / 2, pW, pH, 6);
          this.roadmapBgGraphics.strokeRoundedRect(nodeX - pW / 2, nodeY - pH / 2, pW, pH, 6);
        } else {
          this.roadmapBgGraphics.fillStyle(0x546e7a, 0.7); // Faded locked blue/gray
          this.roadmapBgGraphics.lineStyle(1.5, 0xffffff, 0.5);
          this.roadmapBgGraphics.fillRoundedRect(rectX, rectY, rectW, rectH, 6);
          this.roadmapBgGraphics.strokeRoundedRect(rectX, rectY, rectW, rectH, 6);
        }
      }
    }

    if (this.roadmapHeader) {
      this.roadmapHeader.setPosition(midX, height * 0.17);
      this.roadmapHeader.setFontSize(isMobile ? '20px' : '28px');
    }

    if (this.roadmapCloseButton) {
      this.roadmapCloseButton.setPosition(midX, Math.round(lbPanelY + lbPanelH - (isMobile ? 25 : 35)));
      this.roadmapCloseButton.setFontSize(isMobile ? '16px' : '22px');
    }

    // Add visual hint for swipe
    if (this.overlayCloseButton) {
      this.overlayCloseButton.setPosition(midX, height / 2 + Math.min(600, height * 0.85) / 2 - 30);
      this.overlayCloseButton.setFontSize(isMobile ? '22px' : '28px');
    }

    // Pagination buttons setup
    let maxItems = 0;
    if (this.leaderboardsData) {
      if (this.selectedTab === 0) maxItems = (this.leaderboardsData.score || []).length;
      else if (this.selectedTab === 1) maxItems = (this.leaderboardsData.trident || []).length;
      else if (this.selectedTab === 2) maxItems = (this.leaderboardsData.lightning || []).length;
      else if (this.selectedTab === 3) maxItems = (this.leaderboardsData.nova || []).length;
      else if (this.selectedTab === 4) maxItems = (this.leaderboardsData.poison || []).length;
    }
    const hasNext = (this.leaderboardPage * 10 + 10) < maxItems;
    const hasPrev = this.leaderboardPage > 0;

    const btnY = height / 2 + Math.min(600, height * 0.85) / 2 - 80;
    if (this.btnPrevPage) {
      this.btnPrevPage.setPosition(midX - 70, btnY);
      this.btnPrevPage.setVisible(hasPrev);
    }
    if (this.btnNextPage) {
      this.btnNextPage.setPosition(midX + 70, btnY);
      this.btnNextPage.setVisible(hasNext);
    }

    // Connect texts
    const currentLvl = this.playerProgress?.level || 1;
    const startLvl = Math.max(1, currentLvl - 2);
    if (this.roadmapTexts) {
      const startY = lbPanelY + (isMobile ? 70 : 90);
      const endY = lbPanelY + lbPanelH - (isMobile ? 65 : 85);
      const nodeX = lbPanelX + lbPanelW * (isMobile ? 0.25 : 0.28);

      for (let k = 0; k < 6; k++) {
        const levelNum = startLvl + k;
        const nodeY = Math.round(startY + k * ((endY - startY) / 5));
        const txt = this.roadmapTexts[k];
        if (txt) {
          if (levelNum === currentLvl) {
            txt.setText(`Lvl ${levelNum} ★`).setColor('#ffffff');
          } else if (levelNum < currentLvl) {
            txt.setText(`Lvl ${levelNum} ✓`).setColor('#ffffff');
          } else {
            txt.setText(`Lvl ${levelNum} 🔒`).setColor('#cfd8dc');
          }
          txt.setPosition(nodeX, nodeY);
          txt.setFontSize(isMobile ? '11px' : '13px');
        }
      }
    }

    // Set Upgrades text info
    if (this.roadmapUpgradesTitleText) {
      this.roadmapUpgradesTitleText.setPosition(lbPanelX + lbPanelW * (isMobile ? 0.68 : 0.7), lbPanelY + (isMobile ? 50 : 80));
      this.roadmapUpgradesTitleText.setFontSize(isMobile ? '14px' : '18px');
    }

    if (this.roadmapUpgradesContentText) {
      this.roadmapUpgradesContentText.setPosition(lbPanelX + lbPanelW * (isMobile ? 0.44 : 0.48), lbPanelY + (isMobile ? 80 : 120));
      this.roadmapUpgradesContentText.setFontSize(isMobile ? '11px' : '14px');
      this.roadmapUpgradesContentText.setLineSpacing(isMobile ? 5 : 8);

      if (this.playerProgress) {
        const u = this.playerProgress.upgrades;
        const speedPct = (u.speed * 5).toFixed(0);
        const damagePct = (u.damage * 10).toFixed(0);
        const hpVal = (u.hp * 10).toFixed(0);
        const pickupPct = (u.pickup * 5).toFixed(0);

        const speedText = `Swift Fin:   ${u.speed}/3 (+${speedPct}% Speed)`;
        const damageText = `Sharp Spines: ${u.damage}/3 (+${damagePct}% Dmg)`;
        const hpText = `Thick Hide:   ${u.hp}/3 (+${hpVal} Max HP)`;
        const pickupText = `Magnetic Aura: ${u.pickup}/3 (+${pickupPct}% Pick)`;

        const futureList: string[] = [];
        if (u.speed < 3) futureList.push(`• Swift Fin (+5% Speed)`);
        if (u.damage < 3) futureList.push(`• Sharp Spines (+10% Dmg)`);
        if (u.hp < 3) futureList.push(`• Thick Hide (+10 Max HP)`);
        if (u.pickup < 3) futureList.push(`• Magnetic Aura (+5% Pick Range)`);

        const futureText =
          futureList.length > 0 ? futureList.join('\n') : `• All Upgrades Maxed Out! ★`;

        this.roadmapUpgradesContentText.setText(
          `[ APPLIED UPGRADES ]\n` +
          `• ${speedText}\n` +
          `• ${damageText}\n` +
          `• ${hpText}\n` +
          `• ${pickupText}\n\n` +
          `[ FUTURE OPPORTUNITIES ]\n` +
          `${futureText}`
        );
      }
    }

    // Overlay Header — no scaling
    if (this.overlayHeader) {
      this.overlayHeader.setPosition(midX, height / 2 - Math.min(600, height * 0.85) / 2 + 30);
      this.overlayHeader.setFontSize(isMobile ? '24px' : '32px');
      this.overlayHeader.setScale(1);
    }

    // ── Tab buttons placement
    const tabY = height / 2 - Math.min(600, height * 0.85) / 2 + 80;
    const tabGap = isMobile ? 65 : 100;

    const setupTab = (btn: Phaser.GameObjects.Text | null, tabIdx: number, px: number) => {
      if (btn) {
        btn.setPosition(px, tabY);
        btn.setFontSize(isMobile ? '13px' : '16px');
        btn.setPadding(8, 4, 8, 4);
        btn.setBackgroundColor(this.selectedTab === tabIdx ? '#0277bd' : '#01579b');
        btn.setColor(this.selectedTab === tabIdx ? '#ffffff' : '#b3e5fc');
        btn.setStroke(this.selectedTab === tabIdx ? '#000000' : '#000000', 3);
      }
    };

    setupTab(this.tabDepthBtn, 0, midX - tabGap * 2);
    setupTab(this.tabTridentBtn, 1, midX - tabGap);
    setupTab(this.tabLightningBtn, 2, midX);
    setupTab(this.tabNovaBtn, 3, midX + tabGap);
    setupTab(this.tabPoisonBtn, 4, midX + tabGap * 2);

    // Centered columns title & list
    const lbTitleY = tabY + 40;
    const lbListY = lbTitleY + (isMobile ? 30 : 36);

    const titleSize = isMobile ? '16px' : '22px';
    const listSize = isMobile ? '15px' : '18px';
    const listSpacing = isMobile ? 8 : 12;

    // Col 1: Depth (selectedTab === 0)
    if (this.overlayCol1Title) {
      this.overlayCol1Title.setPosition(midX, lbTitleY);
      this.overlayCol1Title.setFontSize(titleSize);
      this.overlayCol1Title.setVisible(this.selectedTab === 0);
    }
    if (this.overlayCol1List) {
      this.overlayCol1List.setPosition(midX, lbListY);
      this.overlayCol1List.setFontSize(listSize);
      this.overlayCol1List.setLineSpacing(listSpacing);
      this.overlayCol1List.setVisible(this.selectedTab === 0);
    }

    // Col 2: Trident (selectedTab === 1)
    if (this.overlayCol2Title) {
      this.overlayCol2Title.setPosition(midX, lbTitleY);
      this.overlayCol2Title.setFontSize(titleSize);
      this.overlayCol2Title.setVisible(this.selectedTab === 1);
    }
    if (this.overlayCol2List) {
      this.overlayCol2List.setPosition(midX, lbListY);
      this.overlayCol2List.setFontSize(listSize);
      this.overlayCol2List.setLineSpacing(listSpacing);
      this.overlayCol2List.setVisible(this.selectedTab === 1);
    }

    // Col 3: Lightning (selectedTab === 2)
    if (this.overlayCol3Title) {
      this.overlayCol3Title.setPosition(midX, lbTitleY);
      this.overlayCol3Title.setFontSize(titleSize);
      this.overlayCol3Title.setVisible(this.selectedTab === 2);
    }
    if (this.overlayCol3List) {
      this.overlayCol3List.setPosition(midX, lbListY);
      this.overlayCol3List.setFontSize(listSize);
      this.overlayCol3List.setLineSpacing(listSpacing);
      this.overlayCol3List.setVisible(this.selectedTab === 2);
    }

    // Col 4: Nova (selectedTab === 3)
    if (this.overlayCol4Title) {
      this.overlayCol4Title.setPosition(midX, lbTitleY);
      this.overlayCol4Title.setFontSize(titleSize);
      this.overlayCol4Title.setVisible(this.selectedTab === 3);
    }
    if (this.overlayCol4List) {
      this.overlayCol4List.setPosition(midX, lbListY);
      this.overlayCol4List.setFontSize(listSize);
      this.overlayCol4List.setLineSpacing(listSpacing);
      this.overlayCol4List.setVisible(this.selectedTab === 3);
    }

    // Col 5: Poison (selectedTab === 4)
    if (this.overlayCol5Title) {
      this.overlayCol5Title.setPosition(midX, lbTitleY);
      this.overlayCol5Title.setFontSize(titleSize);
      this.overlayCol5Title.setVisible(this.selectedTab === 4);
    }
    if (this.overlayCol5List) {
      this.overlayCol5List.setPosition(midX, lbListY);
      this.overlayCol5List.setFontSize(listSize);
      this.overlayCol5List.setLineSpacing(listSpacing);
      this.overlayCol5List.setVisible(this.selectedTab === 4);
    }

    // Overlay Close Button
    if (this.overlayCloseButton) {
      this.overlayCloseButton.setPosition(midX, height * 0.83);
      this.overlayCloseButton.setFontSize(isMobile ? '16px' : '22px');
      this.overlayCloseButton.setScale(1);
    }

    // Progression UI Elements positioning
    if (this.streakText) {
      this.streakText.setPosition(midX, height * 0.05);
    }
    if (this.levelText) {
      this.levelText.setPosition(midX, height * 0.09);
    }
    if (this.dailyGlyphText) {
      this.dailyGlyphText.setPosition(midX, height * 0.14);
    }
    if (this.lastScoreText) {
      this.lastScoreText.setPosition(midX, height * 0.18);
    }
    if (this.activeBonusText) {
      this.activeBonusText.setPosition(midX, height * 0.90);
    }
    if (this.upgradesText) {
      this.upgradesText.setVisible(false);
    }

    // Responsive positioning of Welcome Popup components
    if (this.welcomePopupContainer) {
      if (this.welcomePopupBg) {
        this.welcomePopupBg.clear();
        this.welcomePopupBg.fillStyle(0x000000, 0.85);
        this.welcomePopupBg.fillRect(0, 0, width, height);

        const popupW = Math.min(360, width * 0.9);
        const popupH = 260;
        const popupX = midX - popupW / 2;
        const popupY = height / 2 - popupH / 2;

        this.welcomePopupBg.fillStyle(0x7f6ad8, 0.96); // cartoonish violet/purple theme
        this.welcomePopupBg.fillRoundedRect(popupX, popupY, popupW, popupH, 12);
        this.welcomePopupBg.lineStyle(3, 0xffd740, 1.0); // gold border
        this.welcomePopupBg.strokeRoundedRect(popupX, popupY, popupW, popupH, 12);
      }

      if (this.welcomePopupTitle) {
        this.welcomePopupTitle.setPosition(midX, height / 2 - 80);
        this.welcomePopupTitle.setFontSize(isMobile ? '22px' : '26px');
      }
      if (this.welcomePopupDesc) {
        this.welcomePopupDesc.setPosition(midX, height / 2 - 20);
        this.welcomePopupDesc.setFontSize(isMobile ? '13px' : '15px');
      }
      if (this.welcomePopupClaimBtn) {
        this.welcomePopupClaimBtn.setPosition(midX, height / 2 + 60);
        this.welcomePopupClaimBtn.setFontSize(isMobile ? '18px' : '22px');
      }
    }

    if (this.howToPlayContainer) {
      if (this.howToPlayBg) {
        this.howToPlayBg.clear();
        this.howToPlayBg.fillStyle(0x000000, 0.95);
        this.howToPlayBg.fillRect(0, 0, width, height);
      }
      if (this.howToPlayTitle) {
        this.howToPlayTitle.setPosition(midX, height * 0.15);
      }
      if (this.howToPlayContent) {
        this.howToPlayContent.setPosition(midX, height * 0.5);
      }
      if (this.howToPlayClose) {
        this.howToPlayClose.setPosition(midX, height * 0.85);
      }
    }
  }

  private fetchStreakAndProgress(): void {
    fetch('/api/player/streak', { method: 'POST' })
      .then((res) => res.json() as Promise<StreakResponse>)
      .then((streakData) => {
        if (streakData && streakData.streak !== undefined) {
          this.registry.set('streakBonusMultiplier', streakData.bonusMultiplier);
          this.registry.set('playerStreak', streakData.streak);
        }
        return fetch('/api/player/progress');
      })
      .then((res) => res.json() as Promise<PlayerProgressResponse>)
      .then((progress) => {
        if (progress && progress.username) {
          this.playerProgress = progress;
          this.registry.set('playerProgress', progress);
          this.registry.set('playerUpgrades', progress.upgrades);
          this.registry.set('playerLevel', progress.level);

          this.updateProgressTexts();

          if (progress.welcomeBonus && !progress.welcomeBonus.claimed && progress.welcomeBonus.value > 0) {
            this.showWelcomePopup(progress.welcomeBonus);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load player progress:', err);
      });
  }

  private updateProgressTexts(): void {
    if (!this.playerProgress) return;

    if (this.lastScoreText && this.playerProgress.lastScore) {
      this.lastScoreText.setText(`Last run: ${this.playerProgress.lastScore} pts`);
      this.lastScoreText.setVisible(true);
    }

    const streak = this.playerProgress.streak;
    const mult = getStreakMultiplier(streak);
    if (this.streakText) {
      this.streakText.setText(`🔥 Streak: ${streak} day${streak === 1 ? '' : 's'}`);
    }

    if (this.levelText) {
      const xpInLevel = this.playerProgress.xp % 50;
      this.levelText.setText(`Level ${this.playerProgress.level}  (${xpInLevel}/50 XP)`);
    }

    if (this.upgradesText) {
      const u = this.playerProgress.upgrades;
      const speedPct = (u.speed * 5).toFixed(0);
      const damagePct = (u.damage * 10).toFixed(0);
      const hpVal = (u.hp * 10).toFixed(0);
      const pickupPct = (u.pickup * 5).toFixed(0);

      const speedText = `Swift Fin: ${u.speed}/3 (+${speedPct}% Speed)`;
      const damageText = `Sharp Spines: ${u.damage}/3 (+${damagePct}% Dmg)`;
      const hpText = `Thick Hide: ${u.hp}/3 (+${hpVal} Max HP)`;
      const pickupText = `Magnetic Aura: ${u.pickup}/3 (+${pickupPct}% Pick)`;

      const futureList: string[] = [];
      if (u.speed < 3) futureList.push(`Swift Fin (+5% Speed)`);
      if (u.damage < 3) futureList.push(`Sharp Spines (+10% Dmg)`);
      if (u.hp < 3) futureList.push(`Thick Hide (+10 Max HP)`);
      if (u.pickup < 3) futureList.push(`Magnetic Aura (+5% Pick Range)`);

      const futureText =
        futureList.length > 0 ? `Next Choices: ${futureList.join(', ')}` : `All Upgrades Maxed Out! ★`;

      this.upgradesText.setText(
        `[ APPLIED UPGRADES ]\n` +
          `${speedText}   •   ${damageText}\n` +
          `${hpText}   •   ${pickupText}\n\n` +
          `[ FUTURE OPPORTUNITIES ]\n` +
          `${futureText}`
      );
    }

    if (this.activeBonusText) {
      const b = this.playerProgress.welcomeBonus;
      if (b && b.claimed && b.value > 0) {
        this.activeBonusText.setText(`Active Return Bonus: ${getWelcomeBonusDescription(b)}`);
      } else {
        this.activeBonusText.setText(
          mult > 1.0 ? `x${mult.toFixed(1)} Score Multiplier Active!` : 'Score Multiplier: x1.0'
        );
      }
    }
  }

  private showWelcomePopup(bonus: WelcomeBonusData): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const midX = width / 2;

    this.welcomePopupContainer = this.add.container(0, 0).setDepth(10);

    this.welcomePopupBg = this.add.graphics();
    this.welcomePopupContainer.add(this.welcomePopupBg);

    this.welcomePopupTitle = this.add.text(midX, height / 2 - 80, 'WELCOME BACK!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '26px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',

    }).setOrigin(0.5);
    this.welcomePopupContainer.add(this.welcomePopupTitle);

    const descMsg = `You haven't played in 24+ hours!\nClaim your return bonus for the next run:\n\n${getWelcomeBonusDescription(bonus)}`;
    this.welcomePopupDesc = this.add.text(midX, height / 2 - 20, descMsg, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',

    }).setOrigin(0.5);
    this.welcomePopupContainer.add(this.welcomePopupDesc);

    this.welcomePopupClaimBtn = this.add.text(midX, height / 2 + 60, 'CLAIM', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      color: '#00ff66',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',

    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.welcomePopupContainer.add(this.welcomePopupClaimBtn);

    this.welcomePopupClaimBtn.on('pointerover', () => this.welcomePopupClaimBtn?.setColor('#ffffff'));
    this.welcomePopupClaimBtn.on('pointerout', () => this.welcomePopupClaimBtn?.setColor('#00ff66'));
    this.welcomePopupClaimBtn.on('pointerdown', () => {
      fetch('/api/player/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim' }),
      })
        .then((res) => res.json() as Promise<WelcomeResponse>)
        .then((data) => {
          if (data && data.status === 'success') {
            if (this.playerProgress) {
              this.playerProgress.welcomeBonus.claimed = true;
              this.registry.set('playerProgress', this.playerProgress);
            }
            this.updateProgressTexts();
            this.welcomePopupContainer?.destroy();
            this.welcomePopupContainer = null;
          }
        })
        .catch((err) => {
          console.error('Failed to claim welcome bonus:', err);
          this.welcomePopupContainer?.destroy();
          this.welcomePopupContainer = null;
        });
    });

    this.refreshLayout();
  }

  setupHowToPlayOverlay(): void {
    if (this.howToPlayContainer) return;
    this.howToPlayContainer = this.add.container(0, 0).setDepth(20).setVisible(false);

    this.howToPlayBg = this.add.graphics();
    this.howToPlayBg.fillStyle(0x000000, 0.95);
    this.howToPlayBg.fillRect(0, 0, this.scale.width, this.scale.height);
    this.howToPlayContainer.add(this.howToPlayBg);

    this.howToPlayTitle = this.add.text(this.scale.width / 2, this.scale.height * 0.15, 'HOW TO PLAY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.howToPlayContainer.add(this.howToPlayTitle);

    const isMobile = this.scale.width < 800;
    const content = `
1. ${isMobile ? 'Drag the Joystick on the left to swim or move.' : 'Use WASD keys to swim or move.'}
2. Tap the spell panel (or press 1-4) to cast spells.
3. Collect spell orbs dropped by enemies:
   - YELLOW | GREEN | PURPLE
4. Cast devastating spells with the right orb recipes:
   - Spear (2 Purple, 1 Yellow)
   - Burst (2 Yellow, 1 Purple)
   - Lightning (2 Green, 1 Purple)
   - Poison (1 of each)
5. Kill 10 Bosses for Titan Fall Daily XP!
6. Survive the Abyssal Depths!
`;

    this.howToPlayContent = this.add.text(this.scale.width / 2, this.scale.height / 2, content, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      lineSpacing: 12,
      align: 'center',
      wordWrap: { width: Math.min(this.scale.width * 0.9, 450) }
    }).setOrigin(0.5);
    this.howToPlayContainer.add(this.howToPlayContent);

    this.howToPlayClose = this.add.text(this.scale.width / 2, this.scale.height * 0.85, 'CLOSE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ff5252',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.howToPlayContainer.add(this.howToPlayClose);

    this.howToPlayClose.on('pointerdown', () => {
      this.howToPlayContainer?.setVisible(false);
    });
  }

  showHowToPlayOverlay(): void {
    if (!this.howToPlayContainer) this.setupHowToPlayOverlay();
    this.howToPlayContainer?.setVisible(true);
  }
}
