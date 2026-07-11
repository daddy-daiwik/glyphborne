You are writing a Devvit web application that runs on Reddit.com. Node 22+ required.

## Tech Stack

- **Frontend**: Phaser 4 (vanilla TS, no React), Vite
- **Backend**: Node.js v22 serverless environment (Devvit), Hono
- **Communication**: REST via `fetch` to Hono routes — NOT tRPC

## Architecture

- `src/server/` — Hono backend, serverless. Routes in `routes/`. Access `redis`, `reddit`, `context` from `@devvit/web/server`.
  - `index.ts` is the server entrypoint (Hono app).
- `src/client/` — Phaser game (iFrame on reddit.com). No React. Vanilla TS + DOM for splash.
  - `splash.html` — inline feed view (keep fast, keep heavy deps out).
  - `game.html` — expanded view (Phaser game).
  - To add an entrypoint: create an HTML file, add it to `devvit.json` `post.entrypoints`.
- `src/shared/` — types shared between client and server.
- `devvit.json` — registers entrypoints, menu items, forms, triggers. Each endpoint here must have a matching route in `src/server/routes/`.

## Commands

- `npm run dev` — `devvit playtest` (development server)
- `npm run build` — `vite build`
- `npm run deploy` — runs `type-check` + `lint` before upload. Use this to ship.
- `npm run launch` — `deploy` then `devvit publish` (for review)
- `npm run type-check` — `tsc --build` (checks all 4 tsconfig project references)
- `npm run lint` — eslint on `src/**/*.{ts,tsx}`
- `npm run prettier` — format all files
- No test runner is configured; `npm run test` does not exist.

## Code Style

- Prefer type aliases over interfaces.
- Prefer named exports over default exports.
- Never cast TypeScript types.
- Prettier: single quotes, trailing commas ES5.

## Devvit Platform Constraints

- Navigation: use `navigateTo` instead of `window.location`/`window.assign`.
- Dialogs: use `showToast` or `showForm` instead of `window.alert`.
- No geolocation, camera, microphone, or notifications APIs.
- No inline `<script>` in HTML files — always use `<script type="module" src="...">`.
- Do NOT use `@devvit/public-api` — this project uses `@devvit/web` only.

## Phaser Conventions

- Phaser reuses Scene instances. Reset cached GameObjects in `init()` to avoid stale references.
- The game uses `Scale.RESIZE`; scenes must handle `scale.on('resize', ...)` for responsive layout.
- The `Game` scene is client-only: gameplay state lives in the scene, drawn with Phaser `Graphics`. The Hono `/api` routes exist but the game does not currently consume them.

Docs: https://developers.reddit.com/docs/llms.txt.
