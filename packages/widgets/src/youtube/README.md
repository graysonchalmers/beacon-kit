# YouTube (`youtube`)
Port of the old Beacon "ytplaylists" card. Search box ("Search playlists" / "Search this playlist"), a grid of playlist tiles
(16:9 thumbnail, title, "n videos"), "x of y playlists" while searching, and a footer note (mock: "Sample playlists. Run youtube_auth.py to show yours.").
A tile opens the playlist: "← Playlists" bar, video rows (thumb, title, channel, 🔒 private); a row plays it in an embedded player.
Data mirrors old GET /yt-playlists, with each playlist's `videos` inlined (old fetched them per playlist). Local state only.
