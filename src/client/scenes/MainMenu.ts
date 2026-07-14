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

  // Welcome popup fields
  welcomePopupContainer: Phaser.GameObjects.Container | null = null;
  welcomePopupBg: Phaser.GameObjects.Graphics | null = null;
  welcomePopupTitle: Phaser.GameObjects.Text | null = null;
  welcomePopupDesc: Phaser.GameObjects.Text | null = null;
  welcomePopupClaimBtn: Phaser.GameObjects.Text | null = null;
  titleText: Phaser.GameObjects.Text | null = null;
  subtitleText: Phaser.GameObjects.Text | null = null;
  playButton: Phaser.GameObjects.Text | null = null;
  leaderboardButton: Phaser.GameObjects.Text | null = null;

  // Leaderboard Overlay Container
  leaderboardContainer: Phaser.GameObjects.Container | null = null;
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

  leaderboardsData: LeaderboardsData | null = null;
  upgradesRoadmapButton: Phaser.GameObjects.Text | null = null;

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
    this.leaderboardButton = null;

    this.playerProgress = null;
    this.streakText = null;
    this.levelText = null;
    this.upgradesText = null;
    this.activeBonusText = null;
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

    // 5. Upgrades & Roadmap Button at depth 1
    this.upgradesRoadmapButton = this.add.text(0, 0, 'ROADMAP & UPGRADES', {
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
      this.scene.start('Game');
    });

    this.upgradesRoadmapButton.on('pointerover', () => this.upgradesRoadmapButton?.setColor('#4fc3f7'));
    this.upgradesRoadmapButton.on('pointerout', () => this.upgradesRoadmapButton?.setColor('#ffffff'));
    this.upgradesRoadmapButton.on('pointerdown', () => {
      this.showUpgradesRoadmapOverlay();
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

    let scoreLines = '';
    this.leaderboardsData.score.forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      scoreLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol1List) this.overlayCol1List.setText(scoreLines || 'No entries yet');

    let tridentLines = '';
    const tridentData = this.leaderboardsData.trident || [];
    tridentData.forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      tridentLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol2List) this.overlayCol2List.setText(tridentLines || 'No entries yet');

    let lightningLines = '';
    this.leaderboardsData.lightning.forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      lightningLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol3List) this.overlayCol3List.setText(lightningLines || 'No entries yet');

    let novaLines = '';
    this.leaderboardsData.nova.forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      novaLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol4List) this.overlayCol4List.setText(novaLines || 'No entries yet');

    let poisonLines = '';
    const poisonData = this.leaderboardsData.poison || [];
    poisonData.forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      poisonLines += `#${i + 1} ${name} ${entry.score}\n`;
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
      this.titleText.setPosition(midX, Math.round(height * 0.26));
      this.titleText.setScale(1);
    }

    if (this.subtitleText) {
      this.subtitleText.setPosition(midX, Math.round(height * 0.36));
      this.subtitleText.setScale(1);
    }

    // Buttons
    if (this.playButton) {
      this.playButton.setPosition(midX, Math.round(height * 0.53));
      this.playButton.setScale(1);
    }

    if (this.upgradesRoadmapButton) {
      this.upgradesRoadmapButton.setPosition(midX, Math.round(height * 0.61));
      this.upgradesRoadmapButton.setScale(1);
    }

    if (this.leaderboardButton) {
      this.leaderboardButton.setPosition(midX, Math.round(height * 0.69));
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

      // Panel for Leaderboards (deep blue)
      this.overlayBgGraphics.fillStyle(0x0288d1, 0.95);
      this.overlayBgGraphics.fillRoundedRect(lbPanelX, lbPanelY, lbPanelW, lbPanelH, 14);
      this.overlayBgGraphics.lineStyle(3, 0xffffff, 1.0); // White border
      this.overlayBgGraphics.strokeRoundedRect(lbPanelX, lbPanelY, lbPanelW, lbPanelH, 14);
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
      this.overlayHeader.setPosition(midX, height * 0.17);
      this.overlayHeader.setFontSize(isMobile ? '20px' : '28px');
      this.overlayHeader.setScale(1);
    }

    // ── Tab buttons placement
    const tabY = height * 0.23;
    const tabGap = isMobile ? 55 : 85;

    if (this.tabDepthBtn) {
      this.tabDepthBtn.setPosition(midX - tabGap * 2, tabY);
      this.tabDepthBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabDepthBtn.setColor(this.selectedTab === 0 ? '#ffffff' : '#b3e5fc');
      this.tabDepthBtn.setStroke(this.selectedTab === 0 ? '#0288d1' : '#000000', this.selectedTab === 0 ? 4 : 2);
    }
    if (this.tabTridentBtn) {
      this.tabTridentBtn.setPosition(midX - tabGap, tabY);
      this.tabTridentBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabTridentBtn.setColor(this.selectedTab === 1 ? '#ffffff' : '#b3e5fc');
      this.tabTridentBtn.setStroke(this.selectedTab === 1 ? '#0288d1' : '#000000', this.selectedTab === 1 ? 4 : 2);
    }
    if (this.tabLightningBtn) {
      this.tabLightningBtn.setPosition(midX, tabY);
      this.tabLightningBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabLightningBtn.setColor(this.selectedTab === 2 ? '#ffffff' : '#b3e5fc');
      this.tabLightningBtn.setStroke(this.selectedTab === 2 ? '#0288d1' : '#000000', this.selectedTab === 2 ? 4 : 2);
    }
    if (this.tabNovaBtn) {
      this.tabNovaBtn.setPosition(midX + tabGap, tabY);
      this.tabNovaBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabNovaBtn.setColor(this.selectedTab === 3 ? '#ffffff' : '#b3e5fc');
      this.tabNovaBtn.setStroke(this.selectedTab === 3 ? '#0288d1' : '#000000', this.selectedTab === 3 ? 4 : 2);
    }
    if (this.tabPoisonBtn) {
      this.tabPoisonBtn.setPosition(midX + tabGap * 2, tabY);
      this.tabPoisonBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabPoisonBtn.setColor(this.selectedTab === 4 ? '#ffffff' : '#b3e5fc');
      this.tabPoisonBtn.setStroke(this.selectedTab === 4 ? '#0288d1' : '#000000', this.selectedTab === 4 ? 4 : 2);
    }

    // Centered columns title & list
    const lbTitleY = height * 0.31;
    const lbListY = lbTitleY + 24;

    const titleSize = isMobile ? '12px' : '16px';
    const listSize = isMobile ? '11px' : '14px';
    const listSpacing = isMobile ? 5 : 7;

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
      this.streakText.setPosition(midX, height * 0.07);
    }
    if (this.levelText) {
      this.levelText.setPosition(midX, height * 0.12);
    }
    if (this.activeBonusText) {
      this.activeBonusText.setPosition(midX, height * 0.46);
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
}

