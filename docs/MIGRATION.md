# 🔁 Beacon → Beacon Kit migration

Old Beacon = `view.html` + `voice.py` in Util-VoiceServer. `voice.py` stays as backend (HTTP) for `apps/beacon`.

| Old card / module | Kit widget | Status |
|---|---|---|
| Chat pane (cloud / local) | `chat-pane` | ⬜ old |
| sysscope | `stat-tile`, `sparkline` | ⬜ old |
| fleet | `list`, `stat-tile` | ⬜ old |
| scene3d | `scene-3d` | ⬜ old |
| kitscreen / glyphs / fx | tokens + primitives | ⬜ old |
| Card ⋯ menu, Arrange / Add / Archive | `board` shell | ⬜ old |

Status: ⬜ old · 🟨 moving · ✅ moved
