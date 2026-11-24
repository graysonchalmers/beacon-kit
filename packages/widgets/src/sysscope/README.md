# SysScope (`sysscope`)
Port of the old Beacon "sysscope" card: one row per screensaver probe (weather, alerts, temp, claude, queue, build, stealth, legion).
Each row has a level stripe (ok / warn / bad), the probe glyph (name shown at width >= 4, tooltip otherwise), a big reading with an
optional ▲/▼ trend, a small line and detail lines (`mail:`, `cal:`, `⚠ ` leads become glyphs).
Data: `{ rows: [{ key, name?, big, trend?, small?, lines[], level }] }`. Options: `label` (default "Envy"), `icon`.
`fetch` is left to the board (old endpoint: GET /sysscope, poll 60 s). Replaces `meter-rows` for this card.
