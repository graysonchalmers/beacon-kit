# 🔁 Beacon → Beacon Kit migration

Old Beacon = `view.html` + `widgets.js` + `voice.py` in Util-VoiceServer. `voice.py` stays as backend (HTTP) for `apps/beacon`.
The old page has **30 card types** (the `R` renderer map in `widgets.js`). Each maps to a kit widget, or a board JSON of kit widgets.
Every kit widget uses semantic tokens only, so all of them work in every skin (STANDARDS rule 11). See **Boards/Parity** in Storybook.

| Old card type | Kit widget | Status |
|---|---|---|
| `tile` | `stat-tile` + `sparkline` | ✅ |
| `gauge` | `gauge` | ✅ |
| `sysscope`, `quotas`, `mesh` | `meter-rows` | ✅ |
| `fleet` | `item-list` (+ `meter-rows` per host) | ✅ |
| `countdown` | `countdown` | ✅ |
| `checklist` | `checklist` | ✅ |
| `counter` | `counter` | ✅ |
| `markdown`, `docs` | `markdown` | ✅ |
| `html` | `embed-frame` | ✅ |
| `media` | `media-viewer` | ✅ |
| `scene` | `scene-3d` | ✅ |
| `ask`, `boss` | `chat-pane` | ✅ |
| `calendar`, `mail`, `notion`, `replies`, `decisions`, `favorites`, `projects`, `archived` | `item-list` (data adapter per source) | 🟨 widget ✅, adapters not wired |
| `devstream`, `ytplaylists` | `media-viewer` + `item-list` | 🟨 needs a `media-grid` widget |
| `spotify` | new `player` widget | ⬜ |
| `radar` | new `radar-map` widget (canvas) | ⬜ |
| `iso` (frogs) | new `iso-scene` widget | ⬜ |
| `kit` (kitscreen / glyphs / fx) | tokens + primitives, a skin | ⬜ |
| Board shell: card ⋯ menu, Arrange / Add / Archive, Focus | `board` shell | ⬜ |
| Chat pane cloud / local toggle | `chat-pane` option | ⬜ |

Status: ⬜ old · 🟨 moving · ✅ moved (widget exists with 4 state stories)
