# Glyphborne 🦑

Glyphborne is a hack-and-slash spellcrafting game where you play as an anglerfish in the Abyssal Depths, featuring massive asynchronous multiplayer. Built for the Reddit Hackathon using Devvit, Phaser 4, and Hono.

## Features

- **Massive Shared-State Boss Fight:** The Abyssal Leviathan is a global community raid boss with 1,000,000 HP. Every player on the subreddit contributes damage to the exact same health pool synced live via the Devvit Realtime API.
- **Interactive Comment Drops:** Viewers can influence active games by commenting on the Reddit post! Commenting `!DropMana 10` causes a rain of spell orbs for all players. Commenting `!HealPlayer 3 @username` instantly and directly heals that specific player mid-fight.
- **Procedural Visual Style:** The entire game is built with Phaser Graphics. No images, no sprites. Every enemy, spell, and particle is code-drawn geometry.
- **Retention Mechanics:** 
  - **Daily Glyph:** One orb type is "blessed" each day (2x score).
  - **Daily Streak:** Consecutive days played = score multiplier (1x → 2x over 7 days).
  - **Combo Streak:** Kill 5 enemies in 3s → "HEAT" mode; kill 10 → "BLAZE" mode.
- **Persistent Progression:** Earn XP from kills, level up, and choose permanent upgrades securely stored in Redis.

## Tech Stack

- **Platform:** [Devvit](https://developers.reddit.com/) Web (Reddit Developer Platform)
- **Frontend:** [Phaser 4](https://phaser.io/) (Vanilla TS)
- **Backend:** [Hono](https://hono.dev/) + Redis + Devvit Realtime API
- **Bundler:** [Vite](https://vite.dev/)

## Getting Started

> Make sure you have Node 22 installed on your machine before running!

1. Clone the repository and install dependencies with `npm install`.
2. Run `npm run login` to log your CLI into Reddit.
3. Run `npm run dev` to start a development server and test live on your test subreddit.

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects.
- `npm run type-check`: Type checks, lints, and prettifies your app.
- `npm run deploy`: Uploads a new version of your app.
- `npm run launch`: Publishes your app for review.

## Credits

Built using the Devvit Phaser Starter template. Thanks to the Phaser team for providing a great template!
