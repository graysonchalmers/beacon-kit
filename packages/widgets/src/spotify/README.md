# Spotify (`spotify`)
Port of the old Beacon "spotify" card. Album art beside track/artist, seek bar with times, transport row
(↺ 15, ⏮, Play/Pause, ⏭, 15 ↻), "Play on" device select (speaker groups / single speakers) and volume (▼ slider ▲ value).
When `data.error` is set (not set up, rate limited) it shows the message and a **Try again** button.
Data mirrors old GET /spotify-now (camelCase: `canVolume`, `retryIn`). Buttons change local state only; a host wires real commands.
