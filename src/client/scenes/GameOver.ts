import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import type { LeaderboardsData, LeaderboardPostResponse, XpResponse } from '../../shared/api';

type GameOverData = {
  score: number;
  bestTridentChain?: number;
  bestLightningChain?: number;
  bestNovaChain?: number;
  bestPoisonChain?: number;
  xpEarned?: number;
  bossPercentReached?: number;
};

// Helper: fixed text style factory
const txt = (fontSize: string, color: string, strokeThickness = 6) => ({
  fontFamily: 'Arial, sans-serif',
  fontSize,
  color,
  stroke: '#000000',
  strokeThickness,
  align: 'center' as const,
});

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  backgroundGraphics: Phaser.GameObjects.Graphics | null = null;
  panelGraphics: Phaser.GameObjects.Graphics | null = null;

  gameover_text: Phaser.GameObjects.Text | null = null;
  scoreText: Phaser.GameObjects.Text | null = null;

  // Stats display rows
  panelTitleText: Phaser.GameObjects.Text | null = null;
  rowScoreText: Phaser.GameObjects.Text | null = null;
  rowTridentText: Phaser.GameObjects.Text | null = null;
  rowLightningText: Phaser.GameObjects.Text | null = null;
  rowNovaText: Phaser.GameObjects.Text | null = null;
  rowPoisonText: Phaser.GameObjects.Text | null = null;

  // Progression & Level Up fields
  xpEarned: number = 0;
  totalXp: number = 0;
  currentLevel: number = 1;
  leveledUp: boolean = false;
  availableUpgrades: string[] = [];
  bossPercentReached: number | undefined = undefined;
  bossProgressText: Phaser.GameObjects.Text | null = null;

  xpProgressBg: Phaser.GameObjects.Graphics | null = null;
  xpProgressBar: Phaser.GameObjects.Graphics | null = null;
  levelProgressText: Phaser.GameObjects.Text | null = null;
  xpGainText: Phaser.GameObjects.Text | null = null;

  upgradeContainer: Phaser.GameObjects.Container | null = null;
  upgradeBgGraphics: Phaser.GameObjects.Graphics | null = null;
  upgradeTitleText: Phaser.GameObjects.Text | null = null;
  upgradeButtons: Phaser.GameObjects.Text[] = [];

  // Buttons
  viewLeaderboardsButton: Phaser.GameObjects.Text | null = null;
  playAgainButton: Phaser.GameObjects.Text | null = null;

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
  leaderboardPage: number = 0;
  btnPrevPage: Phaser.GameObjects.Text | null = null;
  btnNextPage: Phaser.GameObjects.Text | null = null;

  // Data
  finalScore: number = 0;
  bestTridentChain: number = 0;
  bestLightningChain: number = 0;
  bestNovaChain: number = 0;
  bestPoisonChain: number = 0;
  leaderboardsData: LeaderboardsData | null = null;

  constructor() {
    super('GameOver');
  }

  init(data: GameOverData): void {
    this.finalScore = data.score ?? 0;
    this.bestTridentChain = data.bestTridentChain ?? 0;
    this.bestLightningChain = data.bestLightningChain ?? 0;
    this.bestNovaChain = data.bestNovaChain ?? 0;
    this.bestPoisonChain = data.bestPoisonChain ?? 0;
    this.xpEarned = data.xpEarned ?? 0;
    this.bossPercentReached = data.bossPercentReached;
    this.bossProgressText = null;
    this.leaderboardsData = null;

    this.gameover_text = null;
    this.scoreText = null;
    this.panelTitleText = null;
    this.rowScoreText = null;
    this.rowTridentText = null;
    this.rowLightningText = null;
    this.rowNovaText = null;
    this.rowPoisonText = null;

    this.xpProgressBg = null;
    this.xpProgressBar = null;
    this.levelProgressText = null;
    this.xpGainText = null;
    this.upgradeContainer = null;
    this.upgradeBgGraphics = null;
    this.upgradeTitleText = null;
    this.upgradeButtons = [];

    this.viewLeaderboardsButton = null;
    this.playAgainButton = null;
    this.leaderboardContainer = null;
    this.overlayBgGraphics = null;
    
    if (this.game && this.game.registry) {
      this.game.registry.set('lastScore', this.finalScore);
    }
    
    this.tabDepthBtn = null;
    this.tabTridentBtn = null;
    this.tabLightningBtn = null;
    this.tabNovaBtn = null;
    this.tabPoisonBtn = null;
    this.selectedTab = 0;
    this.leaderboardPage = 0;
    this.btnPrevPage = null;
    this.btnNextPage = null;
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x87ceeb);

    this.backgroundGraphics = this.add.graphics();
    this.panelGraphics = this.add.graphics();

    // ── Game Over title
    this.gameover_text = this.add
      .text(0, 0, 'GAME OVER', txt('44px', '#ff5252', 8))
      .setOrigin(0.5);

    // ── Score text below title
    this.scoreText = this.add
      .text(0, 0, `SCORE: ${this.finalScore}`, txt('26px', '#ffffff', 6))
      .setOrigin(0.5);

    // ── Boss progress text (if applicable)
    if (this.bossPercentReached !== undefined && this.bossPercentReached !== null) {
      this.bossProgressText = this.add
        .text(0, 0, `You reached ${this.bossPercentReached}% of the boss's HP!`, txt('15px', '#ff1744', 4))
        .setOrigin(0.5);
    }

    // ── Stats panel header
    this.panelTitleText = this.add
      .text(0, 0, 'RUN STATISTICS', txt('18px', '#ffffff', 6))
      .setOrigin(0.5);

    // ── Stats Rows (Horizontal representation)
    const statsStr = `Total Score: ${this.finalScore}   •   Trident: ${this.bestTridentChain}   •   Lightning: ${this.bestLightningChain}   •   Nova: ${this.bestNovaChain}   •   Poison: ${this.bestPoisonChain}`;
    this.rowScoreText = this.add
      .text(0, 0, statsStr, txt('13px', '#ffffff', 4))
      .setOrigin(0.5);

    // Keep other row texts invisible/empty to avoid visual clutter
    this.rowTridentText = this.add.text(0, 0, '', {}).setVisible(false);
    this.rowLightningText = this.add.text(0, 0, '', {}).setVisible(false);
    this.rowNovaText = this.add.text(0, 0, '', {}).setVisible(false);
    this.rowPoisonText = this.add.text(0, 0, '', {}).setVisible(false);

    // ── Progression / XP UI Elements
    this.xpProgressBg = this.add.graphics();
    this.xpProgressBar = this.add.graphics();

    this.levelProgressText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',

    }).setOrigin(0.5);

    this.xpGainText = this.add.text(0, 0, 'Loading XP Progress...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2.5,
      align: 'center',

    }).setOrigin(0.5);

    this.submitXpAndCheckLevelUp();

    // ── Buttons
    this.viewLeaderboardsButton = this.add
      .text(0, 0, 'VIEW LEADERBOARDS', txt('20px', '#ffd740', 6))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.playAgainButton = this.add
      .text(0, 0, 'PLAY AGAIN', txt('20px', '#ffffff', 6))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Button events
    this.viewLeaderboardsButton.on('pointerover', () => this.viewLeaderboardsButton?.setColor('#ffffff'));
    this.viewLeaderboardsButton.on('pointerout', () => this.viewLeaderboardsButton?.setColor('#ffd740'));
    this.viewLeaderboardsButton.on('pointerdown', () => { this.leaderboardContainer?.setVisible(true); });

    this.playAgainButton.on('pointerover', () => this.playAgainButton?.setColor('#ffd740'));
    this.playAgainButton.on('pointerout', () => this.playAgainButton?.setColor('#ffffff'));
    this.playAgainButton.on('pointerdown', () => { this.scene.start('MainMenu'); });

    // ── Leaderboard Overlay Container
    this.leaderboardContainer = this.add.container(0, 0).setDepth(100).setVisible(false);

    this.overlayBgGraphics = this.add.graphics();
    this.leaderboardContainer.add(this.overlayBgGraphics);

    this.overlayHeader = this.add
      .text(0, 0, 'GLOBAL LEADERBOARDS', txt('24px', '#ffd740', 7))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayHeader);

    // Tab buttons
    this.tabDepthBtn = this.add.text(0, 0, 'SCORE', txt('15px', '#ffd740', 4))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabDepthBtn);

    this.tabTridentBtn = this.add.text(0, 0, 'TRIDENT', txt('15px', '#ffffff', 3))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabTridentBtn);

    this.tabLightningBtn = this.add.text(0, 0, 'LIGHTNING', txt('15px', '#ffffff', 3))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabLightningBtn);

    this.tabNovaBtn = this.add.text(0, 0, 'NOVA', txt('15px', '#ffffff', 3))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabNovaBtn);

    this.tabPoisonBtn = this.add.text(0, 0, 'POISON', txt('15px', '#ffffff', 3))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabPoisonBtn);

    // Tab click handlers
    this.tabDepthBtn.on('pointerdown', () => {
      this.selectedTab = 0;
      this.updateLayout(this.scale.width, this.scale.height);
    });
    this.tabTridentBtn.on('pointerdown', () => {
      this.selectedTab = 1;
      this.updateLayout(this.scale.width, this.scale.height);
    });
    this.tabLightningBtn.on('pointerdown', () => {
      this.selectedTab = 2;
      this.updateLayout(this.scale.width, this.scale.height);
    });
    this.tabNovaBtn.on('pointerdown', () => {
      this.selectedTab = 3;
      this.updateLayout(this.scale.width, this.scale.height);
    });
    this.tabPoisonBtn.on('pointerdown', () => {
      this.selectedTab = 4;
      this.updateLayout(this.scale.width, this.scale.height);
    });

    this.overlayCol1Title = this.add
      .text(0, 0, 'TOP DEPTH', txt('15px', '#4fc3f7', 5))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol1Title);

    this.overlayCol2Title = this.add
      .text(0, 0, 'TOP TRIDENT', txt('15px', '#ffd740', 5))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol2Title);

    this.overlayCol3Title = this.add
      .text(0, 0, 'TOP LIGHTNING', txt('15px', '#ff9100', 5))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol3Title);

    this.overlayCol4Title = this.add
      .text(0, 0, 'TOP NOVA', txt('15px', '#e040fb', 5))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol4Title);

    this.overlayCol5Title = this.add
      .text(0, 0, 'TOP POISON', txt('15px', '#00e676', 5))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol5Title);

    const listStyle = {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2.2,
      align: 'left' as const,
      lineSpacing: 5,

    };

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
        this.updateLayout(this.scale.width, this.scale.height);
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
      this.updateLayout(this.scale.width, this.scale.height);
    });

    this.overlayCloseButton = this.add
      .text(0, 0, 'CLOSE', txt('20px', '#ff5252', 6))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.overlayCloseButton);

    this.overlayCloseButton.on('pointerover', () => this.overlayCloseButton?.setColor('#ffffff'));
    this.overlayCloseButton.on('pointerout', () => this.overlayCloseButton?.setColor('#ff5252'));
    this.overlayCloseButton.on('pointerdown', () => { this.leaderboardContainer?.setVisible(false); });

    this.updateLayout(this.scale.width, this.scale.height);

    // API POST
    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: this.finalScore,
        tridentChain: this.bestTridentChain,
        lightningChain: this.bestLightningChain,
        novaChain: this.bestNovaChain,
        poisonChain: this.bestPoisonChain,
      }),
    })
      .then((res) => res.json() as Promise<LeaderboardPostResponse>)
      .then((data) => {
        if (data && data.status === 'success' && data.leaderboards) {
          this.leaderboardsData = data.leaderboards;
          this.displayLeaderboardData();
        } else {
          this.displayErrorState();
        }
      })
      .catch((err) => {
        console.error('Failed to post leaderboard:', err);
        this.displayErrorState();
      });

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.updateLayout(gameSize.width, gameSize.height);
    });
  }

  private displayLeaderboardData(): void {
    if (!this.leaderboardsData) return;

    const topScore = this.leaderboardsData.score[0]?.score ?? 0;
    const topTrident = this.leaderboardsData.trident[0]?.score ?? 0;
    const topLightning = this.leaderboardsData.lightning[0]?.score ?? 0;
    const topNova = this.leaderboardsData.nova[0]?.score ?? 0;
    const topPoison = this.leaderboardsData.poison[0]?.score ?? 0;

    const isNewScore = this.finalScore >= topScore && this.finalScore > 0;
    const isNewTrident = this.bestTridentChain >= topTrident && this.bestTridentChain > 0;
    const isNewLightning = this.bestLightningChain >= topLightning && this.bestLightningChain > 0;
    const isNewNova = this.bestNovaChain >= topNova && this.bestNovaChain > 0;
    const isNewPoison = this.bestPoisonChain >= topPoison && this.bestPoisonChain > 0;

    if (this.rowScoreText) {
      this.rowScoreText.setText(`TOTAL SCORE: ${this.finalScore}  (Top: ${topScore})${isNewScore ? '  🏆 NEW RECORD!' : ''}`);
    }
    if (this.rowTridentText) {
      this.rowTridentText.setText(`TRIDENT CHAIN: ${this.bestTridentChain}  (Top: ${topTrident})${isNewTrident ? '  🏆 NEW RECORD!' : ''}`);
    }
    if (this.rowLightningText) {
      this.rowLightningText.setText(`LIGHTNING CHAIN: ${this.bestLightningChain}  (Top: ${topLightning})${isNewLightning ? '  🏆 NEW RECORD!' : ''}`);
    }
    if (this.rowNovaText) {
      this.rowNovaText.setText(`NOVA HITS: ${this.bestNovaChain}  (Top: ${topNova})${isNewNova ? '  🏆 NEW RECORD!' : ''}`);
    }
    if (this.rowPoisonText) {
      this.rowPoisonText.setText(`POISON CHAIN: ${this.bestPoisonChain}  (Top: ${topPoison})${isNewPoison ? '  🏆 NEW RECORD!' : ''}`);
    }

    this.populateOverlayLists();
    this.updateLayout(this.scale.width, this.scale.height);
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
    scoreData.slice(startIdx, endIdx).forEach((entry: any, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      scoreLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol1List) this.overlayCol1List.setText(scoreLines || 'No entries yet');

    let tridentLines = '';
    const tridentData = this.leaderboardsData.trident || [];
    tridentData.slice(startIdx, endIdx).forEach((entry: any, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      tridentLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol2List) this.overlayCol2List.setText(tridentLines || 'No entries yet');

    let lightningLines = '';
    const lightData = this.leaderboardsData.lightning || [];
    lightData.slice(startIdx, endIdx).forEach((entry: any, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      lightningLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol3List) this.overlayCol3List.setText(lightningLines || 'No entries yet');

    let novaLines = '';
    const novaData = this.leaderboardsData.nova || [];
    novaData.slice(startIdx, endIdx).forEach((entry: any, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      novaLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol4List) this.overlayCol4List.setText(novaLines || 'No entries yet');

    let poisonLines = '';
    const poisonData = this.leaderboardsData.poison || [];
    poisonData.slice(startIdx, endIdx).forEach((entry: any, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      poisonLines += `#${startIdx + i + 1} ${name} ${Math.floor(entry.score)}\n`;
    });
    if (this.overlayCol5List) this.overlayCol5List.setText(poisonLines || 'No entries yet');
  }

  private displayErrorState(): void {
    if (this.rowScoreText) this.rowScoreText.setText(`TOTAL SCORE: ${this.finalScore}  (Top: N/A)`);
    if (this.rowTridentText) this.rowTridentText.setText(`TRIDENT CHAIN: ${this.bestTridentChain}  (Top: N/A)`);
    if (this.rowLightningText) this.rowLightningText.setText(`LIGHTNING CHAIN: ${this.bestLightningChain}  (Top: N/A)`);
    if (this.rowNovaText) this.rowNovaText.setText(`NOVA HITS: ${this.bestNovaChain}  (Top: N/A)`);
    if (this.rowPoisonText) this.rowPoisonText.setText(`POISON CHAIN: ${this.bestPoisonChain}  (Top: N/A)`);
  }

  private updateLayout(width: number, height: number): void {
    this.cameras.resize(width, height);

    // Sky background
    if (this.backgroundGraphics) {
      this.backgroundGraphics.clear();
      this.backgroundGraphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4fc3f7, 0x4fc3f7, 1.0, 1.0, 1.0, 1.0);
      this.backgroundGraphics.fillRect(0, 0, width, height);
      this.backgroundGraphics.fillStyle(0xffffff, 0.15);
      this.backgroundGraphics.fillCircle(width * 0.15, height * 0.82, 28);
      this.backgroundGraphics.lineStyle(1.5, 0xffffff, 0.3);
      this.backgroundGraphics.strokeCircle(width * 0.15, height * 0.82, 28);
      this.backgroundGraphics.fillStyle(0xffffff, 0.12);
      this.backgroundGraphics.fillCircle(width * 0.82, height * 0.22, 38);
      this.backgroundGraphics.strokeCircle(width * 0.82, height * 0.22, 38);
    }

    const midX = width / 2;

    // Game Over title
    if (this.gameover_text) {
      this.gameover_text.setPosition(midX, height * 0.08);
      this.gameover_text.setScale(1);
    }

    if (this.scoreText) {
      this.scoreText.setPosition(midX, height * 0.14);
      this.scoreText.setScale(1);
    }

    const hasBossProgress = this.bossPercentReached !== undefined && this.bossPercentReached !== null;
    if (this.bossProgressText) {
      this.bossProgressText.setPosition(midX, height * 0.185);
      this.bossProgressText.setVisible(hasBossProgress);
    }

    // Main Stats Panel
    const panelW = Math.min(Math.max(300, width * 0.95), 680);
    const panelH = Math.min(height * 0.44, 250);
    const panelX = midX - panelW / 2;
    const panelY = height * (hasBossProgress ? 0.23 : 0.20);

    if (this.panelGraphics) {
      this.panelGraphics.clear();
      this.panelGraphics.fillStyle(0x001a33, 0.82);
      this.panelGraphics.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
      this.panelGraphics.lineStyle(2.5, 0x4fc3f7, 0.95);
      this.panelGraphics.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    }

    if (this.panelTitleText) {
      this.panelTitleText.setPosition(midX, panelY + 22);
      this.panelTitleText.setScale(1);
    }

    // Spaced vertically inside panel, centered horizontally
    const setPos = (t: Phaser.GameObjects.Text | null, x: number, y: number) => {
      if (t) { t.setPosition(x, y); t.setScale(1); }
    };

    const isMobile = width < 600;
    if (this.rowScoreText) {
      this.rowScoreText.setPosition(midX, panelY + 50);
      this.rowScoreText.setFontSize(isMobile ? '10px' : '13px');
    }
    if (this.rowTridentText) this.rowTridentText.setVisible(false);
    if (this.rowLightningText) this.rowLightningText.setVisible(false);
    if (this.rowNovaText) this.rowNovaText.setVisible(false);
    if (this.rowPoisonText) this.rowPoisonText.setVisible(false);

    // Refresh XP Progress UI positioning and drawing
    this.updateXpProgressUI();

    // Buttons below panel
    const isMobilePortrait = width < height && width < 600;
    const btnY = panelY + panelH + (isMobilePortrait ? 24 : 36);
    const btnGap = Math.min(140, panelW * 0.28);

    if (isMobilePortrait) {
      if (this.viewLeaderboardsButton) {
        this.viewLeaderboardsButton.setPosition(midX, btnY);
        this.viewLeaderboardsButton.setFontSize('18px');
        this.viewLeaderboardsButton.setScale(1);
      }
      if (this.playAgainButton) {
        this.playAgainButton.setPosition(midX, btnY + 36);
        this.playAgainButton.setFontSize('18px');
        this.playAgainButton.setScale(1);
      }
    } else {
      if (this.viewLeaderboardsButton) {
        this.viewLeaderboardsButton.setPosition(midX - btnGap, btnY);
        this.viewLeaderboardsButton.setFontSize('20px');
        this.viewLeaderboardsButton.setScale(1);
      }
      if (this.playAgainButton) {
        this.playAgainButton.setPosition(midX + btnGap, btnY);
        this.playAgainButton.setFontSize('20px');
        this.playAgainButton.setScale(1);
      }
    }



    // ── Leaderboard Overlay
    if (this.overlayBgGraphics) {
      this.overlayBgGraphics.clear();
      // Fullscreen semi-transparent backdrop (sky blue)
      this.overlayBgGraphics.fillStyle(0x4fc3f7, 0.85);
      this.overlayBgGraphics.fillRect(0, 0, width, height);

      // Setup swipe interactions on overlay background
      let startX = 0;
      this.overlayBgGraphics.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
      this.overlayBgGraphics.on('pointerdown', (p: Phaser.Input.Pointer) => { startX = p.x; });
      this.overlayBgGraphics.on('pointerup', (p: Phaser.Input.Pointer) => {
        const dx = p.x - startX;
        if (dx > 60) {
          this.selectedTab = Math.max(0, this.selectedTab - 1);
          this.leaderboardPage = 0;
          this.updateLayout(this.scale.width, this.scale.height);
          this.populateOverlayLists();
        } else if (dx < -60) {
          this.selectedTab = Math.min(4, this.selectedTab + 1);
          this.leaderboardPage = 0;
          this.updateLayout(this.scale.width, this.scale.height);
          this.populateOverlayLists();
        }
      });

      const lbW = Math.min(Math.max(340, width * 0.95), 800);
      const lbH = Math.min(600, height * 0.85);
      const lbX = midX - lbW / 2;
      const lbY = height / 2 - lbH / 2;
      this.overlayBgGraphics.fillStyle(0x0288d1, 0.95); // Deep blue panel
      this.overlayBgGraphics.fillRoundedRect(lbX, lbY, lbW, lbH, 14);
      this.overlayBgGraphics.lineStyle(3, 0xffffff, 1.0); // White border
      this.overlayBgGraphics.strokeRoundedRect(lbX, lbY, lbW, lbH, 14);
    }

    setPos(this.overlayHeader, midX, height / 2 - Math.min(600, height * 0.85) / 2 + 30);
    if (this.overlayHeader) this.overlayHeader.setFontSize(isMobile ? '24px' : '32px');

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
    setPos(this.overlayCol1Title, midX, lbTitleY);
    if (this.overlayCol1Title) {
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
    setPos(this.overlayCol2Title, midX, lbTitleY);
    if (this.overlayCol2Title) {
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
    setPos(this.overlayCol3Title, midX, lbTitleY);
    if (this.overlayCol3Title) {
      this.overlayCol3Title.setVisible(this.selectedTab === 2);
    }
    if (this.overlayCol3List) {
      this.overlayCol3List.setPosition(midX, lbListY);
      this.overlayCol3List.setFontSize(listSize);
      this.overlayCol3List.setLineSpacing(listSpacing);
      this.overlayCol3List.setVisible(this.selectedTab === 2);
    }

    // Col 4: Nova (selectedTab === 3)
    setPos(this.overlayCol4Title, midX, lbTitleY);
    if (this.overlayCol4Title) {
      this.overlayCol4Title.setVisible(this.selectedTab === 3);
    }
    if (this.overlayCol4List) {
      this.overlayCol4List.setPosition(midX, lbListY);
      this.overlayCol4List.setFontSize(listSize);
      this.overlayCol4List.setLineSpacing(listSpacing);
      this.overlayCol4List.setVisible(this.selectedTab === 3);
    }

    // Col 5: Poison (selectedTab === 4)
    setPos(this.overlayCol5Title, midX, lbTitleY);
    if (this.overlayCol5Title) {
      this.overlayCol5Title.setVisible(this.selectedTab === 4);
    }
    if (this.overlayCol5List) {
      this.overlayCol5List.setPosition(midX, lbListY);
      this.overlayCol5List.setFontSize(listSize);
      this.overlayCol5List.setLineSpacing(listSpacing);
      this.overlayCol5List.setVisible(this.selectedTab === 4);
    }

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

    const lbBtnY = height / 2 + Math.min(600, height * 0.85) / 2 - 80;
    if (this.btnPrevPage) {
      this.btnPrevPage.setPosition(midX - 70, lbBtnY);
      this.btnPrevPage.setVisible(hasPrev);
    }
    if (this.btnNextPage) {
      this.btnNextPage.setPosition(midX + 70, lbBtnY);
      this.btnNextPage.setVisible(hasNext);
    }

    // Upgrade popup container layout update
    if (this.upgradeContainer) {
      if (this.upgradeBgGraphics) {
        this.upgradeBgGraphics.clear();
        this.upgradeBgGraphics.fillStyle(0x000000, 0.85);
        this.upgradeBgGraphics.fillRect(0, 0, width, height);

        const popupW = Math.min(420, width * 0.95);
        const popupH = Math.min(360, height * 0.7);
        const popupX = midX - popupW / 2;
        const popupY = height / 2 - popupH / 2;

        this.upgradeBgGraphics.fillStyle(0x1a0933, 0.96);
        this.upgradeBgGraphics.fillRoundedRect(popupX, popupY, popupW, popupH, 16);
        this.upgradeBgGraphics.lineStyle(3.5, 0xffd740, 1.0);
        this.upgradeBgGraphics.strokeRoundedRect(popupX, popupY, popupW, popupH, 16);
      }

      if (this.upgradeTitleText) {
        this.upgradeTitleText.setPosition(midX, height * 0.22);
        this.upgradeTitleText.setFontSize(isMobile ? '20px' : '26px');
      }

      const buttonYStart = height / 2 - (this.availableUpgrades.length - 1) * 26;
      this.upgradeButtons.forEach((btn, index) => {
        btn.setPosition(midX, buttonYStart + index * 52);
        btn.setFontSize(isMobile ? '13px' : '15px');
      });
    }
  }

  private submitXpAndCheckLevelUp(): void {
    fetch('/api/player/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xpToAdd: this.xpEarned }),
    })
      .then((res) => res.json() as Promise<XpResponse>)
      .then((data) => {
        this.totalXp = data.xp;
        this.currentLevel = data.level;
        this.leveledUp = data.leveledUp;
        this.availableUpgrades = data.availableUpgrades;

        this.updateXpProgressUI();

        if (this.leveledUp && this.availableUpgrades.length > 0) {
          this.showUpgradeChoicePopup();
        }
      })
      .catch((err) => {
        console.error('Failed to update player XP:', err);
      });
  }

  private updateXpProgressUI(): void {
    const { width, height } = this.scale;
    const midX = width / 2;
    const panelW = Math.min(Math.max(300, width * 0.95), 680);
    const hasBossProgress = this.bossPercentReached !== undefined && this.bossPercentReached !== null;
    const panelY = height * (hasBossProgress ? 0.23 : 0.20);

    const barW = panelW * 0.7;
    const barH = 14;
    const barX = midX - barW / 2;
    const barY = panelY + 110;

    const currentXpInLevel = this.totalXp % 50;
    const progressRatio = currentXpInLevel / 50;

    if (this.xpProgressBg) {
      this.xpProgressBg.clear();
      this.xpProgressBg.fillStyle(0x111111, 0.9);
      this.xpProgressBg.fillRoundedRect(barX, barY, barW, barH, 6);
      this.xpProgressBg.lineStyle(1.5, 0x4fc3f7, 0.5);
      this.xpProgressBg.strokeRoundedRect(barX, barY, barW, barH, 6);
    }

    if (this.xpProgressBar) {
      this.xpProgressBar.clear();
      if (progressRatio > 0) {
        this.xpProgressBar.fillStyle(0x00ff66, 1.0);
        this.xpProgressBar.fillRoundedRect(barX, barY, barW * progressRatio, barH, 6);
      }
    }

    if (this.levelProgressText) {
      this.levelProgressText.setText(`Level ${this.currentLevel}`).setPosition(midX, panelY + 82);
    }

    if (this.xpGainText) {
      this.xpGainText.setText(`XP: ${currentXpInLevel} / 50  (+${this.xpEarned} XP this run)`).setPosition(midX, panelY + 154);
    }
  }

  private showUpgradeChoicePopup(): void {
    const { width, height } = this.scale;
    const midX = width / 2;
    const isMobile = width < 600;

    // Disable main buttons
    if (this.playAgainButton) this.playAgainButton.setAlpha(0.2).disableInteractive();
    if (this.viewLeaderboardsButton) this.viewLeaderboardsButton.setAlpha(0.2).disableInteractive();

    this.upgradeContainer = this.add.container(0, 0).setDepth(110);

    this.upgradeBgGraphics = this.add.graphics();
    this.upgradeContainer.add(this.upgradeBgGraphics);

    this.upgradeTitleText = this.add.text(midX, height * 0.22, 'LEVEL UP!\nCHOOSE AN UPGRADE', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: isMobile ? '20px' : '26px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',

    }).setOrigin(0.5);
    this.upgradeContainer.add(this.upgradeTitleText);

    // Draw background modal panel
    const popupW = Math.min(420, width * 0.95);
    const popupH = Math.min(360, height * 0.7);
    const popupX = midX - popupW / 2;
    const popupY = height / 2 - popupH / 2;

    this.upgradeBgGraphics.fillStyle(0x000000, 0.85);
    this.upgradeBgGraphics.fillRect(0, 0, width, height);

    this.upgradeBgGraphics.fillStyle(0x1a0933, 0.96);
    this.upgradeBgGraphics.fillRoundedRect(popupX, popupY, popupW, popupH, 16);
    this.upgradeBgGraphics.lineStyle(3.5, 0xffd740, 1.0);
    this.upgradeBgGraphics.strokeRoundedRect(popupX, popupY, popupW, popupH, 16);

    const upgradeLabelMap: Record<string, string> = {
      speed: 'SWIFT FIN (+5% Speed)',
      damage: 'SHARP SPINES (+10% Spell Damage)',
      hp: 'THICK HIDE (+10 HP)',
      pickup: 'MAGNETIC AURA (+5% Pickup Range)',
    };

    this.upgradeButtons = [];
    const buttonYStart = height / 2 - (this.availableUpgrades.length - 1) * 26;
    
    this.availableUpgrades.forEach((type, index) => {
      const btnText = upgradeLabelMap[type] || type.toUpperCase();
      const btnY = buttonYStart + index * 52;
      
      const btn = this.add.text(midX, btnY, btnText, {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: isMobile ? '13px' : '15px',
        color: '#00ff66',
        stroke: '#000000',
        strokeThickness: 3.5,
        align: 'center',

      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout', () => btn.setColor('#00ff66'));
      btn.on('pointerdown', () => {
        // Apply upgrade choice via API
        fetch('/api/player/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upgradeType: type }),
        })
          .then((res) => res.json())
          .then(() => {
            // Restore main buttons
            if (this.playAgainButton) this.playAgainButton.setAlpha(1.0).setInteractive();
            if (this.viewLeaderboardsButton) this.viewLeaderboardsButton.setAlpha(1.0).setInteractive();

            // Destroy popup
            this.upgradeContainer?.destroy();
            this.upgradeContainer = null;
            this.upgradeButtons = [];

            // Show toast message
            const toast = this.add.text(midX, height * 0.74, 'UPGRADE APPLIED SUCCESSFULLY! ★', {
              fontFamily: 'Arial Black, sans-serif',
              fontSize: '16px',
              color: '#ffd740',
              stroke: '#000000',
              strokeThickness: 4,
      
            }).setOrigin(0.5);

            this.tweens.add({
              targets: toast,
              alpha: 0,
              delay: 1500,
              duration: 500,
              onComplete: () => toast.destroy(),
            });
          })
          .catch((err) => {
            console.error('Failed to apply upgrade:', err);
            if (this.playAgainButton) this.playAgainButton.setAlpha(1.0).setInteractive();
            if (this.viewLeaderboardsButton) this.viewLeaderboardsButton.setAlpha(1.0).setInteractive();
            this.upgradeContainer?.destroy();
            this.upgradeContainer = null;
            this.upgradeButtons = [];
          });
      });

      this.upgradeContainer?.add(btn);
      this.upgradeButtons.push(btn);
    });
  }
}
