import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import type { LeaderboardsData, LeaderboardEntry, LeaderboardGetResponse } from '../../shared/api';

export class MainMenu extends Scene {
  backgroundGraphics: Phaser.GameObjects.Graphics | null = null;
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
  overlayCol1List: Phaser.GameObjects.Text | null = null;
  overlayCol2List: Phaser.GameObjects.Text | null = null;
  overlayCol3List: Phaser.GameObjects.Text | null = null;
  overlayCloseButton: Phaser.GameObjects.Text | null = null;

  tabDepthBtn: Phaser.GameObjects.Text | null = null;
  tabLightningBtn: Phaser.GameObjects.Text | null = null;
  tabNovaBtn: Phaser.GameObjects.Text | null = null;
  selectedTab: number = 0;

  leaderboardsData: LeaderboardsData | null = null;

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

    this.leaderboardContainer = null;
    this.overlayBgGraphics = null;
    this.overlayHeader = null;
    this.tabDepthBtn = null;
    this.tabLightningBtn = null;
    this.tabNovaBtn = null;
    this.selectedTab = 0;
    this.overlayCol1Title = null;
    this.overlayCol2Title = null;
    this.overlayCol3Title = null;
    this.overlayCol1List = null;
    this.overlayCol2List = null;
    this.overlayCol3List = null;
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
      resolution: 2,
    }).setOrigin(0.5).setDepth(1);

    // 3. Subtitle Text at depth 1
    this.subtitleText = this.add.text(0, 0, 'Abyssal Spellcasting Adventure', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#80d8ff',
      stroke: '#000000',
      strokeThickness: 3.5,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5).setDepth(1);

    // 4. Play Button at depth 1
    this.playButton = this.add.text(0, 0, 'PLAY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#00ff66',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1);

    // 5. Leaderboards Button at depth 1
    this.leaderboardButton = this.add.text(0, 0, 'LEADERBOARDS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1);

    // Setup interactive events
    this.playButton.on('pointerover', () => this.playButton?.setColor('#ffffff'));
    this.playButton.on('pointerout', () => this.playButton?.setColor('#00ff66'));
    this.playButton.on('pointerdown', () => {
      this.scene.start('Game');
    });

    this.leaderboardButton.on('pointerover', () => this.leaderboardButton?.setColor('#ffd740'));
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
      resolution: 2,
    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayHeader);

    // Tab buttons
    this.tabDepthBtn = this.add.text(0, 0, 'SCORE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabDepthBtn);

    this.tabLightningBtn = this.add.text(0, 0, 'LIGHTNING', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabLightningBtn);

    this.tabNovaBtn = this.add.text(0, 0, 'NOVA', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.tabNovaBtn);

    // Tab click handlers
    this.tabDepthBtn.on('pointerdown', () => {
      this.selectedTab = 0;
      this.refreshLayout();
    });
    this.tabLightningBtn.on('pointerdown', () => {
      this.selectedTab = 1;
      this.refreshLayout();
    });
    this.tabNovaBtn.on('pointerdown', () => {
      this.selectedTab = 2;
      this.refreshLayout();
    });

    // Columns title inside overlay
    this.overlayCol1Title = this.add.text(0, 0, 'TOP DEPTH', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#4fc3f7',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol1Title);

    this.overlayCol2Title = this.add.text(0, 0, 'TOP LIGHTNING', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffd740',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol2Title);

    this.overlayCol3Title = this.add.text(0, 0, 'TOP NOVA', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#e040fb',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5);
    this.leaderboardContainer.add(this.overlayCol3Title);

    // Lists
    this.overlayCol1List = this.add.text(0, 0, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2.2,
      align: 'left',
      lineSpacing: 6,
      resolution: 2,
    }).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol1List);

    this.overlayCol2List = this.add.text(0, 0, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2.2,
      align: 'left',
      lineSpacing: 6,
      resolution: 2,
    }).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol2List);

    this.overlayCol3List = this.add.text(0, 0, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2.2,
      align: 'left',
      lineSpacing: 6,
      resolution: 2,
    }).setOrigin(0.5, 0);
    this.leaderboardContainer.add(this.overlayCol3List);

    // Close button
    this.overlayCloseButton = this.add.text(0, 0, 'CLOSE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ff5252',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.leaderboardContainer.add(this.overlayCloseButton);

    this.overlayCloseButton.on('pointerover', () => this.overlayCloseButton?.setColor('#ffffff'));
    this.overlayCloseButton.on('pointerout', () => this.overlayCloseButton?.setColor('#ff5252'));
    this.overlayCloseButton.on('pointerdown', () => {
      this.leaderboardContainer?.setVisible(false);
    });

    this.refreshLayout();

    // Re-calculate positions whenever the game canvas is resized.
    this.scale.on('resize', () => this.refreshLayout());
  }

  private showLeaderboardsOverlay(): void {
    this.leaderboardContainer?.setVisible(true);

    if (this.overlayCol1List) this.overlayCol1List.setText('Loading...');
    if (this.overlayCol2List) this.overlayCol2List.setText('Loading...');
    if (this.overlayCol3List) this.overlayCol3List.setText('Loading...');

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

    let lightningLines = '';
    this.leaderboardsData.lightning.forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      lightningLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol2List) this.overlayCol2List.setText(lightningLines || 'No entries yet');

    let novaLines = '';
    this.leaderboardsData.nova.forEach((entry: LeaderboardEntry, i: number) => {
      const name = entry.username.substring(0, maxNameLen);
      novaLines += `#${i + 1} ${name} ${entry.score}\n`;
    });
    if (this.overlayCol3List) this.overlayCol3List.setText(novaLines || 'No entries yet');

    this.refreshLayout();
  }

  private displayOverlayError(): void {
    if (this.overlayCol1List) this.overlayCol1List.setText('Unavailable');
    if (this.overlayCol2List) this.overlayCol2List.setText('Unavailable');
    if (this.overlayCol3List) this.overlayCol3List.setText('Unavailable');
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

    const midX = width / 2;

    // Title text — no scaling, fixed font size
    if (this.titleText) {
      this.titleText.setPosition(midX, height * 0.26);
      this.titleText.setScale(1);
    }

    if (this.subtitleText) {
      this.subtitleText.setPosition(midX, height * 0.36);
      this.subtitleText.setScale(1);
    }

    // Buttons
    if (this.playButton) {
      this.playButton.setPosition(midX, height * 0.54);
      this.playButton.setScale(1);
    }

    if (this.leaderboardButton) {
      this.leaderboardButton.setPosition(midX, height * 0.68);
      this.leaderboardButton.setScale(1);
    }

    const isMobile = width < 600;

    // Redraw Overlay Background
    if (this.overlayBgGraphics) {
      this.overlayBgGraphics.clear();
      // Fullscreen semi-transparent black
      this.overlayBgGraphics.fillStyle(0x000000, 0.92);
      this.overlayBgGraphics.fillRect(0, 0, width, height);

      // Gold border panel for Leaderboards
      const lbPanelW = Math.min(Math.max(320, width * 0.9), 700);
      const lbPanelH = height * 0.74;
      const lbPanelX = midX - lbPanelW / 2;
      const lbPanelY = height * 0.13;
      this.overlayBgGraphics.fillStyle(0x001122, 0.96);
      this.overlayBgGraphics.fillRoundedRect(lbPanelX, lbPanelY, lbPanelW, lbPanelH, 14);
      this.overlayBgGraphics.lineStyle(2.5, 0xffd740, 0.95);
      this.overlayBgGraphics.strokeRoundedRect(lbPanelX, lbPanelY, lbPanelW, lbPanelH, 14);
    }

    // Overlay Header — no scaling
    if (this.overlayHeader) {
      this.overlayHeader.setPosition(midX, height * 0.17);
      this.overlayHeader.setFontSize(isMobile ? '20px' : '28px');
      this.overlayHeader.setScale(1);
    }

    // ── Tab buttons placement
    const tabY = height * 0.23;
    const tabGap = isMobile ? 75 : 125;
    
    if (this.tabDepthBtn) {
      this.tabDepthBtn.setPosition(midX - tabGap, tabY);
      this.tabDepthBtn.setFontSize(isMobile ? '12px' : '15px');
      this.tabDepthBtn.setColor(this.selectedTab === 0 ? '#ffd740' : '#ffffff');
      this.tabDepthBtn.setStroke('#000000', this.selectedTab === 0 ? 4 : 2);
    }
    if (this.tabLightningBtn) {
      this.tabLightningBtn.setPosition(midX, tabY);
      this.tabLightningBtn.setFontSize(isMobile ? '12px' : '15px');
      this.tabLightningBtn.setColor(this.selectedTab === 1 ? '#ffd740' : '#ffffff');
      this.tabLightningBtn.setStroke('#000000', this.selectedTab === 1 ? 4 : 2);
    }
    if (this.tabNovaBtn) {
      this.tabNovaBtn.setPosition(midX + tabGap, tabY);
      this.tabNovaBtn.setFontSize(isMobile ? '12px' : '15px');
      this.tabNovaBtn.setColor(this.selectedTab === 2 ? '#ffd740' : '#ffffff');
      this.tabNovaBtn.setStroke('#000000', this.selectedTab === 2 ? 4 : 2);
    }

    // Centered columns title & list
    const lbTitleY = height * 0.31;
    const lbListY = lbTitleY + 24;

    const titleSize = isMobile ? '13px' : '18px';
    const listSize = isMobile ? '12px' : '15px';
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

    // Col 2: Lightning (selectedTab === 1)
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

    // Col 3: Nova (selectedTab === 2)
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

    // Overlay Close Button
    if (this.overlayCloseButton) {
      this.overlayCloseButton.setPosition(midX, height * 0.83);
      this.overlayCloseButton.setFontSize(isMobile ? '16px' : '22px');
      this.overlayCloseButton.setScale(1);
    }
  }
}
