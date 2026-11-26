import type { ReactNode } from "react";
import type { WidgetState } from "../contract";
import { Glyph, isGlyph } from "./Glyph";

/** Shared card shell: one place for the 4 states so every widget looks and reads the same.
 *  Title style comes from skin tokens (--bk-title-*): the beacon skin draws the old Beacon header (icon chip, bold title). */
export function Frame({ title, state, empty = "No data yet", children, className = "", icon, extra, actions }: {
  title: string; state: WidgetState; empty?: string; children?: ReactNode; className?: string;
  /** Chip before the title: a glyph name (old Beacon G() set, see Glyph.tsx) or any node. */
  icon?: ReactNode;
  /** Inline after the title (e.g. "1/3"). */
  extra?: ReactNode;
  /** Right side of the header (the old "+" size button lives here). */
  actions?: ReactNode;
}) {
  return (
    <section aria-label={title} aria-busy={state === "loading"}
      className={`bk-card flex h-full w-full min-w-48 overflow-hidden flex-col gap-2 rounded-[var(--bk-radius)] border border-bk-line bg-bk-card p-[var(--bk-card-pad,16px)] ${className}`}>
      <header className="bk-head flex min-h-7 items-center gap-2">
        {icon && <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md bg-bk-raise text-sm">{isGlyph(icon) ? <Glyph name={icon} size="18px" /> : icon}</span>}
        <h3 className="min-w-0 flex-1 truncate" style={{ fontSize: "var(--bk-title-size)", fontWeight: "var(--bk-title-weight)" as never,
          textTransform: "var(--bk-title-case)" as never, letterSpacing: "var(--bk-title-track)", color: "var(--bk-title-color)" }}>
          {title}{extra && <span className="ml-1.5 text-sm font-normal normal-case text-bk-muted">{extra}</span>}
        </h3>
        {actions}
      </header>
      <div className="relative min-h-0 flex-1 overflow-auto">
        {state === "loading" && <div className="h-full min-h-16 w-full animate-pulse rounded bg-bk-raise" />}
        {state === "error" && <p role="alert" className="text-sm text-bk-danger">Couldn't load data</p>}
        {state === "empty" && <p className="text-sm text-bk-muted">{empty}</p>}
        {state === "ready" && children}
      </div>
    </section>
  );
}
