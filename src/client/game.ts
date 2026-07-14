import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { SplashScene } from './scenes/Splash';
import * as Phaser from 'phaser';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scale: {
    // RESIZE mode fills the Devvit iframe without fixed dimensions
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
  },
  // Snap texture-based draw calls to whole-integer pixel coordinates.
  // This eliminates sub-pixel blur caused by OS-level display scaling.
  roundPixels: true,
  // Keep smooth antialiasing for the vector/graphic style of this game
  antialias: true,
  input: {
    activePointers: 3,
  },
  scene: [Boot, Preloader, SplashScene, MainMenu, MainGame, GameOver],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

document.addEventListener('DOMContentLoaded', () => {
  StartGame('game-container');
});
