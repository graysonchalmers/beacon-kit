# Parity harness (old Beacon vs Beacon Kit)
1. `old_cards.mjs <Util-VoiceServer checkout> <outDir>`: runs the old view on its VS_TEST page server with tests/fixtures.mjs fake data and shoots every Sandbox card (needs that repo's .venv; `VS_PYTHON`, `PW=$(npm root -g)/playwright`).
2. `npm run build-storybook`, then `score.mjs storybook-static <oldDir> <outDir> map.json` (needs `pixelmatch@5`, `pngjs`): each card's `Parity` story vs the old shot at the old size, beacon skin. Writes `<card>--side.png` (old | kit | diff) and scores.json.
Bar: ≤10% differing pixels per card + matching behaviours. Latest: docs/parity-scores.json.
