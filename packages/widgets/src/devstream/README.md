# DevStream (`devstream`)
Port of the old Beacon "devstream" card. Newest library pictures as 84px tiles (wrap), a caption naming the newest
(title · folder · time), "No pictures yet." or "DevStream's library can't be read right now." when `ok` is false.
A tile opens an in-card lightbox (‹ › / arrow keys walk, Esc or ✕ closes). Data mirrors old GET /devstream.
`options.href` adds an "Open" link to the app (old card's title was the link).
