import type { ReactNode } from "react";
import type { WidgetState } from "../contract";

/** Shared card shell: one place for the 4 states so every widget looks and reads the same. */
export function Frame({ title, state, empty = "No data yet", children, className = "" }: {
  title: string; state: WidgetState; empty?: string; children?: ReactNode; className?: string;
}) {
  return (
    <section aria-label={title} aria-busy={state === "loading"}
      className={`flex h-full w-full min-w-48 overflow-hidden flex-col gap-2 rounded-[var(--bk-radius)] border border-white/5 bg-bk-card p-4 ${className}`}>
      <h3 className="text-xs uppercase tracking-wide text-bk-muted">{title}</h3>
      <div className="relative min-h-0 flex-1">
        {state === "loading" && <div className="h-full min-h-16 w-full animate-pulse rounded bg-white/10" />}
        {state === "error" && <p role="alert" className="text-sm text-red-400">Couldn't load data</p>}
        {state === "empty" && <p className="text-sm text-bk-muted">{empty}</p>}
        {state === "ready" && children}
      </div>
    </section>
  );
}
