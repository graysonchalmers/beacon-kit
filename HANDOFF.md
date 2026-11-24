# 🧭 Beacon Kit handoff (2026-11-24)

Goal (Grayson): Beacon Kit **indistinguishable** from old Beacon (Util-VoiceServer `view.html` + `widgets.js`), with skins as a swappable surface over the same information.

## ✅ Merged (main)
- #5 skins system (rule 11) · #6 7 parity widgets · #7 player/radar-map/iso-scene/media-grid, swamp skin, `BoardShell` (Arrange/Add/Archive/Focus/skin picker)
- #8 `beacon` default skin (old view.html dark tokens, bold titles, icon chip, 12px pad) + 19 card widgets ported from old renderers (decision-queue, agenda, inbox, reply-queue, sysscope, quotas, mesh, fleet, radar, spotify, youtube, devstream, docs, favorites, projects, ask, boss, dice, backpack) + parity harness.
- Score: **25/25 cards ≤10% pixel diff, mean 4.1%** (`docs/parity-scores.json`). Pixel % is lenient on dark backgrounds; side-by-sides were also checked by eye.

## 🟨 In flight
Nothing. No open branches/PRs from this thread.

## ⬜ Remaining parity gaps
1. Drawn glyph icons (old `G("…")` icon set) instead of emoji in card headers/chips.
2. Swamp skin 9-slice pixel frames + Fira fonts (old `skins/swamp/skin.css`, `assets/kit`); tokens already match.
3. Frog sprites for `iso-scene` (old `assets/iso/*.json|png` atlas, gamekit.js); currently flat SVG. Score iso + Weather cards (not in harness yet).
4. Behaviours: sounds, confetti, "✓ Sent / Didn't go through" states, full-screen review sheet on decisions, tab memory, card "+" size menu + "More".
5. Live data: adapter from `voice.py` `/state` (+ `/agenda`, `/decisions`, `/notion`, `/replies`, `/docs`) into board data. Testing against real data needs a **Remote Control session on the Envy**.
6. Old radar processing (MRMS QC, hillshade) stays server-side; kit `radar` just layers images.

## 📏 Run the scoring harness
See `scripts/parity/README.md`. Short version (cloud container works):
```bash
# old side: Util-VoiceServer checkout with .venv (requirements.txt minus nvidia-* libs; Python 3.13 OK)
PW=$(npm root -g)/playwright VS_PYTHON=<uvs>/.venv/bin/python node scripts/parity/old_cards.mjs <uvs> /tmp/old
# kit side
npm run build-storybook
npm i --no-save pixelmatch@5.3.0 pngjs@7.0.0
PW=$(npm root -g)/playwright node scripts/parity/score.mjs storybook-static /tmp/old /tmp/score scripts/parity/map.json
```
Bar: each card's `Parity` story vs old Sandbox shot, same data + size, ≤10% differing pixels + same behaviours. Output: `<card>--side.png` (old | kit | diff).

## Rules
STANDARDS.md (11 rules). Tailwind pinned 4.1.4. Branch fresh from main. beacon-kit merges: ask Grayson per PR (decision card).
