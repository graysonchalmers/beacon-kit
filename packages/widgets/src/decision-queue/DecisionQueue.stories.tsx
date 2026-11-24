import type { Meta, StoryObj } from "@storybook/react";
import { DecisionQueue } from "./widget";

// Parity data = old tests/fixtures.mjs /decisions (non-notion asks) + /notion rows, as the Sandbox card drew them.
const o = (label: string) => ({ label, hint: "", done: false });
const pic = (cap: string) => ({ src: "fake-" + cap.length, cap });
const parity = {
  asks: [{ id: "l1", status: "pending" as const, by: "Claude", title: "Keep the old Decisions card layout as a fallback?", why: "Two cards showed the same Notion rows.", options: [o("Yes, keep it"), o("No, drop it")], links: [] }],
  rows: [
    { id: "d1", group: "you" as const, kind: "Approve", status: "New", title: "Merge the dashboard cards PR and restart the server?", url: "https://example.com", options: [o("Trust your pick"), o("Not an issue"), o("More context")],
      images: [pic("Before: cards clipped at 3 rows"), pic("After: Inbox cards show their pictures")], why: "Gates are green and the proof shots match; merging only changes widgets.js and notionq.py.",
      groomer: "Groomer note 2026-10-28: keep. Evidence: PR checks passed 2 h ago, no open review comments. Suggestion: approve and restart the server." },
    { id: "d2", group: "you" as const, kind: "Decide", status: "New", title: "Retire the 14 merged worktrees?", url: "", options: [o("Trust your pick"), o("Not an issue")], images: [], why: "", groomer: "" },
    { id: "r1", group: "you" as const, kind: "Do", status: "New", title: "Reconnect the YouTube credential in n8n (playlist sync failing since Monday)", url: "", options: [], images: [], why: "", groomer: "" },
    { id: "r2", group: "you" as const, kind: "Review", status: "New", title: "Look at the new card lightbox on the live window", url: "", options: [], images: [pic("Lightbox with swipe hint")], why: "", groomer: "Groomer note 2026-10-28: stale. Evidence: lightbox shipped 3 days ago and nothing has touched it since. Suggestion: close it." },
    { id: "r4", group: "you" as const, kind: "Do", status: "New", title: "Paste the new Spotify client secret", url: "", options: [], images: [], why: "Spotify returns 401 until the secret is replaced.", groomer: "" },
    { id: "c1", group: "claude" as const, kind: "Do", status: "In progress", title: "Try GIFs, a video clip and a PDF on Hey Server", url: "", options: [], images: [pic("GIF card"), pic("PDF card")], why: "", groomer: "" },
    { id: "c2", group: "claude" as const, kind: "Do", status: "In progress", title: "Set up the Mark up on Legion share shortcut", url: "", options: [], images: [pic("Shortcut menu")], why: "", groomer: "Groomer note 2026-10-28: still relevant. Evidence: no later log. Suggestion: leave it running." },
    { id: "x1", group: "done" as const, kind: "Do", status: "Done", title: "Replace notion-layout on claude.ai (2ad703d)", url: "", options: [], images: [pic("Layout live")], why: "", groomer: "" },
    { id: "x2", group: "done" as const, kind: "Review", status: "Done", title: "Check the YouTube card on the phone", url: "", options: [], images: [], why: "", groomer: "" }],
};

const View = DecisionQueue.render;
const meta: Meta<typeof View> = { title: "Widgets/Input/DecisionQueue", component: View,
  args: { options: { title: "Decisions", icon: "❓", now: "2026-11-24T12:00:00Z" }, size: [3, 6] },
  decorators: [(S) => <div style={{ width: "299px", height: "602px" }}><S /></div>] };
export default meta;
type S = StoryObj<typeof View>;
export const Ready: S = { args: { state: "ready", data: parity } };
export const Loading: S = { args: { state: "loading" } };
export const Empty: S = { args: { state: "empty" } };
export const Error: S = { args: { state: "error" } };
/** Old "decisions" Sandbox card, 299 x 602. */
export const Parity: S = { args: { state: "ready", data: parity } };
/** Old "notion" Sandbox card: same layout, Notion Inbox title and db glyph. */
export const ParityNotion: S = { args: { state: "ready", data: parity, options: { title: "Notion Inbox", icon: "🗄", now: "2026-11-24T12:00:00Z" } } };
