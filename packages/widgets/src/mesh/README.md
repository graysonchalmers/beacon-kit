# Mesh (`mesh`)
Port of the old Beacon "mesh" card (Util-Mesh). Four glyph-headed sections: Machines (status dot + name, "· down" / "n of m down"),
Load (per host load/core with a bar, RAM/VRAM free, GPU lease), Overnight (digest run, start/end, failures) and Recent alerts.
Dots: ok / warn / bad (bad glows and the name turns danger). Under width 4 only rows that need eyes show their detail line.
Rows are buttons (keyboard reachable); a press toggles local selection (the old card posted the tap to the brain).
Data mirrors old GET /mesh (`machines, harbor?, load, overnight, alerts`). Replaces `meter-rows` for this card.
