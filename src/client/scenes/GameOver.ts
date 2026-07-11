import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import type { LeaderboardsData, LeaderboardPostResponse } from '../../shared/api';

type GameOverData = {
  score: number;
  bestTridentChain?: number;
  bestLightningChain?: number;
  bestNovaChain?: number;
  bestPoisonChain?: number;
};

// Helper: fixed text style factory
const txt = (fontSize: string, color: string, strokeThickness = 6) => ({
  fontFamily: 'Arial, sans-serif',
  fontSize,
  color,
  stroke: '#000000',
  strokeThickness,
  align: 'center' as const,
  resolution: 2,
});

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  backgroundGraphics: Phaser.GameObjects.Graphics | null = null;
  panelGraphics: Phaser.GameObjects.Graphics | null = null;

  gameover_text: Phaser.GameObjects.Text | null = null;

  // Stats display
  panelTitleText: Phaser.GameObjects.Text | null = null;
  col1TitleText: Phaser.GameObjects.Text | null = null;
  col2TitleText: Phaser.GameObjects.Text | null = null;
  col3TitleText: Phaser.GameObjects.Text | null = null;

  col1CurrentText: Phaser.GameObjects.Text | null = null;
  col2CurrentText: Phaser.GameObjects.Text | null = null;
  col3CurrentText: Phaser.GameObjects.Text | null = null;

  col1TopText: Phaser.GameObjects.Text | null = null;
  col2TopText: Phaser.GameObjects.Text | null = null;
  col3TopText: Phaser.GameObjects.Text | null = null;

  col1RecordText: Phaser.GameObjects.Text | null = null;
  col2RecordText: Phaser.GameObjects.Text | null = null;
  col3RecordText: Phaser.GameObjects.Text | null = null;

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
    this.leaderboardsData = null;

    this.gameover_text = null;
    this.panelTitleText = null;
    this.col1TitleText = null;
    this.col2TitleText = null;
    this.col3TitleText = null;
    this.col1CurrentText = null;
    this.col2CurrentText = null;
    this.col3CurrentText = null;
    this.col1TopText = null;
    this.col2TopText = null;
    this.col3TopText = null;
    this.col1RecordText = null;
    this.col2RecordText = null;
    this.col3RecordText = null;
    this.viewLeaderboardsButton = null;
    this.playAgainButton = null;
    this.leaderboardContainer = null;
    this.overlayBgGraphics = null;
    
    this.tabDepthBtn = null;
    this.tabTridentBtn = null;
    this.tabLightningBtn = null;
    this.tabNovaBtn = null;
    this.tabPoisonBtn = null;
    this.selectedTab = 0;
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

    // ── Stats panel header
    this.panelTitleText = this.add
      .text(0, 0, 'RUN STATISTICS', txt('18px', '#ffffff', 6))
      .setOrigin(0.5);

    // ── Column titles
    this.col1TitleText = this.add
      .text(0, 0, 'DEPTH', txt('16px', '#4fc3f7', 5))
      .setOrigin(0.5);
    this.col2TitleText = this.add
      .text(0, 0, 'LIGHTNING', txt('16px', '#ffd740', 5))
      .setOrigin(0.5);
    this.col3TitleText = this.add
      .text(0, 0, 'NOVA BURST', txt('16px', '#e040fb', 5))
      .setOrigin(0.5);

    // ── Current run metrics
    this.col1CurrentText = this.add
      .text(0, 0, `Score: ${this.finalScore}`, txt('15px', '#ffffff', 5))
      .setOrigin(0.5);
    this.col2CurrentText = this.add
      .text(0, 0, `Chain: ${this.bestLightningChain}`, txt('15px', '#ffffff', 5))
      .setOrigin(0.5);
    this.col3CurrentText = this.add
      .text(0, 0, `Nova Hits: ${this.bestNovaChain}`, txt('15px', '#ffffff', 5))
      .setOrigin(0.5);

    // ── Top records fetched
    this.col1TopText = this.add
      .text(0, 0, 'Top: Fetching...', txt('13px', '#88aaff', 4))
      .setOrigin(0.5);
    this.col2TopText = this.add
      .text(0, 0, 'Top: Fetching...', txt('13px', '#88aaff', 4))
      .setOrigin(0.5);
    this.col3TopText = this.add
      .text(0, 0, 'Top: Fetching...', txt('13px', '#88aaff', 4))
      .setOrigin(0.5);

    // ── New record labels (hidden by default)
    this.col1RecordText = this.add
      .text(0, 0, 'NEW RECORD!', txt('13px', '#00ff66', 5))
      .setOrigin(0.5).setVisible(false);
    this.col2RecordText = this.add
      .text(0, 0, 'NEW RECORD!', txt('13px', '#00ff66', 5))
      .setOrigin(0.5).setVisible(false);
    this.col3RecordText = this.add
      .text(0, 0, 'NEW RECORD!', txt('13px', '#00ff66', 5))
      .setOrigin(0.5).setVisible(false);

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

    this.tabLightningBtn = this.add.text(0, 0, 'LIGHTNING', txt('15px', '#ffffff', 3))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabLightningBtn);

    this.tabNovaBtn = this.add.text(0, 0, 'NOVA', txt('15px', '#ffffff', 3))
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabNovaBtn);

    // Tab click handlers
    this.tabDepthBtn.on('pointerdown', () => {
      this.selectedTab = 0;
      this.updateLayout(this.scale.width, this.scale.height);
    });
    this.tabLightningBtn.on('pointerdown', () => {
      this.selectedTab = 1;
      this.updateLayout(this.scale.width, this.scale.height);
    });
    this.tabNovaBtn.on('pointerdown', () => {
      this.selectedTab = 2;
      this.updateLayout(this.scale.width, this.scale.height);
    });

    this.overlayCol1Title = this.add
      .text(0, 0, 'TOP DEPTH', txt('15px', '#4fc3f7', 5))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol1Title);

    this.overlayCol2Title = this.add
      .text(0, 0, 'TOP LIGHTNING', txt('15px', '#ffd740', 5))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol2Title);

    this.overlayCol3Title = this.add
      .text(0, 0, 'TOP NOVA', txt('15px', '#e040fb', 5))
      .setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol3Title);

    const listStyle = {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2.2,
      align: 'left' as const,
      lineSpacing: 5,
      resolution: 2,
    };

    this.overlayCol1List = this.add.text(0, 0, 'Loading...', listStyle).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol1List);

    this.overlayCol2List = this.add.text(0, 0, 'Loading...', listStyle).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol2List);

    this.overlayCol3List = this.add.text(0, 0, 'Loading...', listStyle).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol3List);

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
    const topLightning = this.leaderboardsData.lightning[0]?.score ?? 0;
    const topNova = this.leaderboardsData.nova[0]?.score ?? 0;

    if (this.col1TopText) this.col1TopText.setText(`Top: ${topScore}`);
    if (this.col2TopText) this.col2TopText.setText(`Top: ${topLightning}`);
    if (this.col3TopText) this.col3TopText.setText(`Top: ${topNova}`);

    const recordsArr: Phaser.GameObjects.Text[] = [];
    if (this.finalScore >= topScore && this.finalScore > 0) {
      if (this.col1RecordText) { this.col1RecordText.setVisible(true); recordsArr.push(this.col1RecordText); }
    }
    if (this.bestLightningChain >= topLightning && this.bestLightningChain > 0) {
      if (this.col2RecordText) { this.col2RecordText.setVisible(true); recordsArr.push(this.col2RecordText); }
    }
    if (this.bestNovaChain >= topNova && this.bestNovaChain > 0) {
      if (this.col3RecordText) { this.col3RecordText.setVisible(true); recordsArr.push(this.col3RecordText); }
    }

    if (recordsArr.length > 0) {
      this.tweens.add({ targets: recordsArr, alpha: 0.3, duration: 350, yoyo: true, repeat: -1 });
    }

    const width = this.scale.width;
    const isMobile = width < 600;
    const maxNameLen = isMobile ? 5 : 12;

    let scoreLines = '';
    this.leaderboardsData.score.forEach((entry, i) => {
      const name = entry.username.substring(0, maxNameLen);
      scoreLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol1List) this.overlayCol1List.setText(scoreLines || 'No entries yet');

    let tridentLines = '';
    const tridentData = this.leaderboardsData.trident || [];
    tridentData.forEach((entry, i) => {
      const name = entry.username.substring(0, maxNameLen);
      tridentLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol2List) this.overlayCol2List.setText(tridentLines || 'No entries yet');

    let lightningLines = '';
    this.leaderboardsData.lightning.forEach((entry, i) => {
      const name = entry.username.substring(0, maxNameLen);
      lightningLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol3List) this.overlayCol3List.setText(lightningLines || 'No entries yet');

    let novaLines = '';
    this.leaderboardsData.nova.forEach((entry, i) => {
      const name = entry.username.substring(0, maxNameLen);
      novaLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol4List) this.overlayCol4List.setText(novaLines || 'No entries yet');

    let poisonLines = '';
    const poisonData = this.leaderboardsData.poison || [];
    poisonData.forEach((entry, i) => {
      const name = entry.username.substring(0, maxNameLen);
      poisonLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol5List) this.overlayCol5List.setText(poisonLines || 'No entries yet');

    this.updateLayout(this.scale.width, this.scale.height);
  }

  private displayErrorState(): void {
    if (this.col1TopText) this.col1TopText.setText('Top: N/A');
    if (this.col2TopText) this.col2TopText.setText('Top: N/A');
    if (this.col3TopText) this.col3TopText.setText('Top: N/A');
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
      this.gameover_text.setPosition(midX, height * 0.1);
      this.gameover_text.setScale(1);
    }

    // Main Stats Panel
    const panelW = Math.min(Math.max(300, width * 0.88), 640);
    const panelH = Math.min(height * 0.46, 260);
    const panelX = midX - panelW / 2;
    const panelY = height * 0.18;

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

    // 3 columns inside panel
    const col1X = midX - panelW * 0.3;
    const col2X = midX;
    const col3X = midX + panelW * 0.3;
    const colY = panelY + 55;
    const row1Y = colY + 26;
    const row2Y = row1Y + 24;
    const row3Y = row2Y + 22;

    const setPos = (t: Phaser.GameObjects.Text | null, x: number, y: number) => {
      if (t) { t.setPosition(x, y); t.setScale(1); }
    };

    setPos(this.col1TitleText, col1X, colY);
    setPos(this.col1CurrentText, col1X, row1Y);
    setPos(this.col1TopText, col1X, row2Y);
    setPos(this.col1RecordText, col1X, row3Y);

    setPos(this.col2TitleText, col2X, colY);
    setPos(this.col2CurrentText, col2X, row1Y);
    setPos(this.col2TopText, col2X, row2Y);
    setPos(this.col2RecordText, col2X, row3Y);

    setPos(this.col3TitleText, col3X, colY);
    setPos(this.col3CurrentText, col3X, row1Y);
    setPos(this.col3TopText, col3X, row2Y);
    setPos(this.col3RecordText, col3X, row3Y);

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

    const isMobile = width < 600;

    // ── Leaderboard Overlay
    if (this.overlayBgGraphics) {
      this.overlayBgGraphics.clear();
      this.overlayBgGraphics.fillStyle(0x000000, 0.92);
      this.overlayBgGraphics.fillRect(0, 0, width, height);

      const lbW = Math.min(Math.max(320, width * 0.9), 700);
      const lbH = height * 0.74;
      const lbX = midX - lbW / 2;
      const lbY = height * 0.13;
      this.overlayBgGraphics.fillStyle(0x001122, 0.96);
      this.overlayBgGraphics.fillRoundedRect(lbX, lbY, lbW, lbH, 14);
      this.overlayBgGraphics.lineStyle(2.5, 0xffd740, 0.95);
      this.overlayBgGraphics.strokeRoundedRect(lbX, lbY, lbW, lbH, 14);
    }

    setPos(this.overlayHeader, midX, height * 0.17);
    if (this.overlayHeader) this.overlayHeader.setFontSize(isMobile ? '20px' : '24px');

    // ── Tab buttons placement
    const tabY = height * 0.23;
    const tabGap = isMobile ? 55 : 85;

    if (this.tabDepthBtn) {
      this.tabDepthBtn.setPosition(midX - tabGap * 2, tabY);
      this.tabDepthBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabDepthBtn.setColor(this.selectedTab === 0 ? '#ffd740' : '#ffffff');
      this.tabDepthBtn.setStroke('#000000', this.selectedTab === 0 ? 3.5 : 2);
    }
    if (this.tabTridentBtn) {
      this.tabTridentBtn.setPosition(midX - tabGap, tabY);
      this.tabTridentBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabTridentBtn.setColor(this.selectedTab === 1 ? '#ffd740' : '#ffffff');
      this.tabTridentBtn.setStroke('#000000', this.selectedTab === 1 ? 3.5 : 2);
    }
    if (this.tabLightningBtn) {
      this.tabLightningBtn.setPosition(midX, tabY);
      this.tabLightningBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabLightningBtn.setColor(this.selectedTab === 2 ? '#ffd740' : '#ffffff');
      this.tabLightningBtn.setStroke('#000000', this.selectedTab === 2 ? 3.5 : 2);
    }
    if (this.tabNovaBtn) {
      this.tabNovaBtn.setPosition(midX + tabGap, tabY);
      this.tabNovaBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabNovaBtn.setColor(this.selectedTab === 3 ? '#ffd740' : '#ffffff');
      this.tabNovaBtn.setStroke('#000000', this.selectedTab === 3 ? 3.5 : 2);
    }
    if (this.tabPoisonBtn) {
      this.tabPoisonBtn.setPosition(midX + tabGap * 2, tabY);
      this.tabPoisonBtn.setFontSize(isMobile ? '10px' : '13px');
      this.tabPoisonBtn.setColor(this.selectedTab === 4 ? '#ffd740' : '#ffffff');
      this.tabPoisonBtn.setStroke('#000000', this.selectedTab === 4 ? 3.5 : 2);
    }

    // Centered columns title & list
    const lbTitleY = height * 0.31;
    const lbListY = lbTitleY + 24;

    const titleSize = isMobile ? '12px' : '15px';
    const listSize = isMobile ? '12px' : '13px';
    const listSpacing = isMobile ? 5 : 6;

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

    setPos(this.overlayCloseButton, midX, height * 0.83);
    if (this.overlayCloseButton) this.overlayCloseButton.setFontSize(isMobile ? '16px' : '20px');
  }
}
