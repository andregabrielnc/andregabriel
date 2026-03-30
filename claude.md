# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

No test suite is configured.

## Architecture

Single-page landing site built with React 19 + Vite 7. No routing — all sections render in sequence inside `App.jsx`.

**Component flow** (`src/App.jsx`):
Navbar → Hero → Interview → About → Concursos → HowItHelps → Discursivas → Experience → Testimonials → FAQ → Contact → Footer

Each section lives as its own file under `src/components/`. `WhatsAppButton` is a floating UI element not included in the main flow directly.

**Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin. Design tokens (colors, fonts) are defined in the `@theme` block at the top of `src/index.css` — this is the single source of truth for the palette and custom variables. No `tailwind.config.js` file exists.

**Animations**: Framer Motion is used for scroll/entrance animations across components.

**Icons**: `lucide-react`.

**Static assets**: Images live in `public/` and are referenced with absolute paths (e.g., `/ebserh.png`).

## Deploy

GitHub repo: `andregabrielnc/andregabriel`

**Vercel (recommended):** Connect repo, set Framework Preset to Vite, build command `npm run build`, output directory `dist`.

**GitHub Pages:** Add `base: '/andregabriel/'` to `vite.config.js` when deploying to a subpath. A workflow example is available in the git history.
