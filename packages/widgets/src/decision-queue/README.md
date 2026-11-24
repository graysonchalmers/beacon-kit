# DecisionQueue

Family: **input** · type key: `decision-queue` · export `DecisionQueue`

Ports the old Beacon `decisions` and `notion` cards (one Inbox layout). Options `title` and `icon` pick which one: `Decisions` / ❓ or `Notion Inbox` / 🗄. `now` (ISO) pins the groomer-note age for stories.

Data: `asks` (agent questions: title, `? Why` disclosure, answer buttons, links, Not now) and `rows` (inbox rows grouped `you` / `claude` / `done`: kind chip, title, Done, image pair with captions, Why approve box, groomer note disclosure, option buttons). Tabs Needs you / Claude working / Done recently show counts and switch with click or arrow keys. Taps are local state; the host posts them through its own fetch layer. Stories: Ready, Loading, Empty, Error, Parity, ParityNotion. Semantic tokens only.
