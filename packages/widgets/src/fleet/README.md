# Fleet (`fleet`)

Port of the old Beacon fleet strip (`fleet.js`). One tile per machine: status pip (ok/warn/bad, grey when stale or no reading, with an age chip), CPU / RAM / optional GPU / DSK mini bars coloured by thresholds, a two-step power row (Reboot / Shut down, plus "when idle" variants for machines listed in `power.idle`; arm then Confirm or Cancel), and a GPU lease line.

Data: `{ machines: [{ id, name?, state, level?, age_s?, cpu?, mem?, gpu?, disk? }], lease?: { known, free?, holder?, mins?, queue? }, power?: { ready, why?, idle } }`.
Power actions are local UI state only; the host must wire a real call. Stories: Ready, Loading, Empty, Error, Parity (930x380, old Sandbox sample).
