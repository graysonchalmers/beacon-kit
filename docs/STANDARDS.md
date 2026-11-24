# ✅ Standards of practice

Full spec: https://claude.ai/artifact/3rcZreriGBwHEUhS8kYdAm

**Levels:** tokens → primitives (shadcn/Radix) → widgets → boards. A level only uses the levels below it.
**Families:** data · list · 2d · 3d · media · input · chat.

## "Build me a thing that does XYZ"
1. **Pick before you build:** check `packages/widgets/src/registry.ts` first.
2. **Board first:** answer with a board JSON (`packages/board/src/schema.ts`). New code only for missing widgets.
3. **One job per widget:** if the description needs "and", split it.
4. **Tokens only:** no hard-coded colors or pixel sizes.
5. **Four states:** loading, empty, error, ready, each with a Storybook story.
6. **Responsive by size:** adapt to the card's grid size, not the screen.
7. **Accessible:** Radix primitives, keyboard reachable, reduced motion respected.
8. **Data outside the view:** `fetch` gets data, `render` stays pure.
9. **Prove it:** story + visual snapshot + Playwright at phone and desktop before merge.
10. **One folder per widget:** `widget.tsx`, `*.stories.tsx`, `README.md`.

## Planned stack
TypeScript, React, Vite, shadcn/ui + Tailwind, Tremor/Recharts, react-three-fiber, react-konva, TanStack Table/Query, react-grid-layout, Zustand, Zod, Storybook, Vitest, Playwright. pnpm workspaces.
