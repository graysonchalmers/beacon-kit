# 🧰 Beacon Kit

A kitbash React UI kit: tokens → primitives → widgets → boards.
Ask for "a thing that does XYZ" and the answer is a **board** (JSON) of existing widgets — new code only for missing widgets.

## 🧭 North star of Beacon Dashboard
Beacon Kit is the successor and intended north star of **Beacon Dashboard** (the `view.html` board in Util-VoiceServer).
Beacon's cards migrate here card by card into `apps/beacon`; `voice.py` stays the backend. New Beacon UI work goes here, not in `view.html`.

Rules: [docs/STANDARDS.md](docs/STANDARDS.md) · Migration: [docs/MIGRATION.md](docs/MIGRATION.md)

## Widgets (one per family)
| Family | Widget | Type key |
|---|---|---|
| data | Stat tile, Sparkline | `stat-tile`, `sparkline` |
| list | Item list | `item-list` |
| 2d | Cutout (react-konva, draggable) | `cutout-2d` |
| 3d | Scene (react-three-fiber, lazy-loaded) | `scene-3d` |
| media | Media viewer (image/video) | `media-viewer` |
| input | Form built from Zod at runtime | `zod-form` |
| chat | Chat pane | `chat-pane` |

Demo board: `packages/board/src/demo.board.json`, story **Boards/Demo** (12 cols on desktop, 1 col on phone).
Snapshots: `npm run build-storybook && node scripts/snap.mjs` (every story, desktop + phone, fails on page errors).
