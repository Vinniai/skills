# abcdefg — interactive phase explorer

A Vite + React + TypeScript single-page app that presents the `abcdefg`
feature-development workflow as an interactive explorer. Click a phase on the A–G
rail (or use the **←/→** arrow keys) to switch its detail panel; the active phase is
reflected in the URL hash so views are shareable and reload-stable.

The UI follows the project's [impeccable](../.impeccable.md) Swiss-editorial design
context — shared OKLCH paper palette, Bricolage Grotesque + Spectral, a single
restrained vermilion accent, and hairline rules. It mirrors the static
[`docs/abcdefg.html`](../docs/abcdefg.html) page as a real SPA.

## Develop

```bash
npm install
npm run dev       # dev server with HMR
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build
npm run lint
```

## Structure

```
src/
  data/phases.ts             # the seven phases (letter, name, steps, exit)
  components/PhaseRail.tsx    # the A–G navigation strip
  components/PhaseDetail.tsx  # editorial detail panel for the active phase
  App.tsx                     # layout, active-phase state, keyboard + hash sync
  styles.css                 # impeccable design tokens + component styles
```
