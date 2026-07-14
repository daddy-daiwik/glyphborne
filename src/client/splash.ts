import { navigateTo, requestExpandedMode } from '@devvit/web/client';

const docsLink = document.getElementById('docs-link') as HTMLDivElement;
const playtestLink = document.getElementById('playtest-link') as HTMLDivElement;
const discordLink = document.getElementById('discord-link') as HTMLDivElement;
const startButton = document.getElementById('start-button') as HTMLButtonElement;
const dailyGlyphEl = document.getElementById('daily-glyph') as HTMLSpanElement;

startButton.addEventListener('click', (e) => {
  requestExpandedMode(e, 'game');
});

docsLink.addEventListener('click', () => {
  navigateTo('https://developers.reddit.com/docs');
});

playtestLink.addEventListener('click', () => {
  navigateTo('https://www.reddit.com/r/Devvit');
});

discordLink.addEventListener('click', () => {
  navigateTo('https://discord.com/invite/R7yu2wh9Qz');
});

function init() {
  // Compute daily glyph dynamically matching Game.ts daily glyph math:
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const shapes = ['YELLOW ▲', 'GREEN ●', 'PURPLE ■'] as const;
  const targetShape = shapes[daysSinceEpoch % 3]!;
  dailyGlyphEl.textContent = `★ ${targetShape} (gives +20 Score instead of +10 when collected!)`;
}

init();
