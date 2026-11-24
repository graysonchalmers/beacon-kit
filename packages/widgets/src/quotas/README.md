# Tokens and quotas (`quotas`)
Port of the old Beacon "quotas" card (offload system). Sections: Auto-offload level pips (OFF/STEADY/BOOST/MAX, active one lit),
Plan quotas bars, Gemini API (free key calls, paid spend), Tokens last 24 h (per-backend hourly sparkline + t/s + 24 h total),
Local models (GPU lease, loaded Ollama models). Read-only like the old card; every part has a tooltip. Bars go warn at 60 %, bad at 85 %.
Data mirrors old GET /quotas (`deck, levels, auto, plans, opencode?, gemini, backends, gpu, ollama`). Replaces `meter-rows` for this card.
