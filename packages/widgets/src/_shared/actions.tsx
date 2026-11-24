import { createContext, useCallback, useContext, useState } from "react";
import { sfx } from "./fx";

/** How a widget asks the host to do something (answer a decision, mark done). The live adapter supplies the real one;
 *  the default pretends the server said yes after a short wait, so stories and the demo board behave like old Beacon. */
export type SendAction = (action: string, payload: Record<string, unknown>) => Promise<boolean>;
const demo: SendAction = () => new Promise((r) => setTimeout(() => r(true), 600));
export const ActionsContext = createContext<SendAction>(demo);
export const useAction = () => useContext(ActionsContext);

export type TapState = "idle" | "sending" | "sent" | "failed";
/** Old Beacon sendTap: Sending… -> ✓ Sent (confirm sound, hold 0.7 s, then onDone) | Didn't go through (cancel sound, shake, 3.5 s). */
export function useSendTap(onDone?: () => void) {
  const [st, setSt] = useState<TapState>("idle");
  const run = useCallback(async (req: () => Promise<boolean>) => {
    if (st === "sending" || st === "sent") return false;
    setSt("sending");
    let ok = false; try { ok = await req(); } catch { ok = false; }
    if (ok) { setSt("sent"); sfx("ui_confirm", .5); setTimeout(() => onDone?.(), 700); }
    else { setSt("failed"); sfx("ui_cancel", .5); setTimeout(() => setSt((s) => (s === "failed" ? "idle" : s)), 3500); }
    return ok;
  }, [st, onDone]);
  return [st, run] as const;
}
