# Radar (`radar`)

Port of the old Beacon **radar** card: stacked map / clouds / rain / place-name layers with Rain, Clouds, Map, Names toggle chips,
+ / − / ⌂ zoom tools, a caption ("No rain on the radar" when there are no rain frames), and a play button with a time scrubber ending at "now".

Data is image URLs (`base`, `labels`, `clouds`, `frames[{ t, rain?, clouds? }]`); the host fetches and recolours tiles. Zoom is a visual scale
around the home point (5–9), the loop pauses 3 steps on the last frame like the old card. Distinct from `radar-map` (static image + legend).
