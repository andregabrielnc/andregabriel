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

### Public Site
Single-page landing built with React 19 + Vite 7. All sections render in sequence inside `App.jsx`.

**Component flow** (`src/App.jsx`):
Navbar → Hero → Blog → HowItHelps → Concursos → Discursivas → Experience → Testimonials → FAQ → Contact → Footer

Each section lives under `src/components/`. Styling: **Tailwind CSS v4**. Icons: **lucide-react**. Animations: **Framer Motion**.

### Admin Area (`src/admin/`)
Modular admin panel with Coolify-style flat design.

**Layout structure:**
```
src/admin/
  theme/          tokens.ts, adminTheme.ts
  layout/         AdminLayout, AdminNavbar, AdminSidebar, SidebarNavItem
  pages/          DashboardPage
  cadastros/      CadastrosLayout, CadastrosSubNav, UsuariosPage, UsuariosForm
  editais/        EditaisListPage, EditaisFormPage, EditaisFormNav
    sections/     EditalInfoSection, EditalCargosSection, EditalConteudoSection, EditalAnexosSection
  shared/         ConfirmDialog, Modal, PageHeader, PhoneInput
```

**Navigation:** Sidebar (global) → Sub-nav column (context) → Content. No horizontal tabs.

**Styling:** MUI `sx` props exclusively (no Tailwind in admin). All colors/spacing from `tokens.ts`.

### Auth system (`server/routes/auth.js`)
Session-based auth with Passport.js. Supports email+password and Google OAuth. Email verification required. PostgreSQL session store.

### Backend (`server/`)
Express.js on port 3001. Routes: `/auth`, `/api/users`, `/api/editais`, `/api` (flashcards).

## Coding Standards

### File size
- **Max 400 lines per file.** If a component exceeds this, split into sub-components.
- **One component per file.** Exception: small helper components used only by the parent.

### Naming conventions
- **Files:** PascalCase for components (`AdminNavbar.tsx`), camelCase for utilities (`editaisHelpers.ts`)
- **Components:** PascalCase (`EditaisListPage`)
- **Hooks:** `use` prefix (`useRecaptcha`)
- **Constants:** UPPER_SNAKE_CASE for static values (`PRIMARY`, `API_URL`), camelCase for tokens object properties
- **Types/Interfaces:** PascalCase (`EditalFormFields`)

### Design tokens (source of truth)
All admin UI values come from `src/admin/theme/tokens.ts`:
```
Colors:     primary (#1a73e8), textPrimary (#202124), textSecondary (#5f6368), border (#e8eaed)
Surfaces:   bgDefault (#f8f9fa), bgSurface (#ffffff)
Layout:     sidebarWidth (240px), sidebarCollapsed (64px), navbarHeight (56px), subNavWidth (200px)
```

### Admin UI rules (Coolify-style)
- **Navbar:** Solid white, no blur/glass, no shadow, thin bottom border only
- **Sidebar:** White bg, plain text items, active = primary color text + fontWeight 600, NO background highlight, NO left border accent
- **Sub-nav:** Plain text list, active = primary color, no decoration
- **Content:** No Paper/Card wrappers with shadows around form sections. Clean flat layout.
- **Dialogs:** Use shared `ConfirmDialog` component. Never duplicate dialog markup.

### React rules
- **Hooks at top level only.** Never inside conditionals, loops, or IIFEs.
- **Lazy-loaded components need hard refresh** (Ctrl+Shift+F5) — HMR is unreliable for these.
- **useState before conditional returns.** Always place hooks before any early return.
- **Props over context** for single-form data flow. Use context only when prop drilling exceeds 3 levels.

### Styling rules
- **Public site:** Tailwind CSS classes
- **Admin area:** MUI `sx` props only (never Tailwind in `src/admin/`)
- **Never mix** Tailwind and MUI in the same component
- **Import tokens** instead of hardcoding colors: `import { tokens } from '../theme/tokens'`

## Verification & Quality

### Before every edit
- **Read the file first.** Never edit unread files.
- **Understand the component tree.** Trace parent → child nesting for JSX changes.

### After every edit
- **Run `npm run build`** — check for errors.
- **Read back the edited section** (20+ lines) to verify JSX nesting and logic.
- **For UI changes:** trace the full component hierarchy to confirm visual structure.

### When something doesn't work
- **Investigate WHY before retrying.** Read error messages, check line numbers.
- **If requested twice:** treat as high priority — diagnose the root cause first.

### `.env` safety
- **Never commit `.env`.** Production secrets in Coolify env vars only.
- **Local dev:** `RECAPTCHA_SECRET=` (empty) to skip validation.

### Commits
- Only when explicitly asked. Run `npm run build` first.
- Conventional messages: `feat:`, `fix:`, `chore:`, `refactor:`

## Deploy

GitHub repo: `andregabrielnc/andregabriel`

**Coolify (production):** Auto-deploys via GitHub webhook on push to `main`. Dockerfile builds frontend (nginx) + backend (Node.js) in single container. Traefik handles SSL/routing.

**Local dev:** `npm run dev` (frontend :5173) + `node server/index.js` (backend :3001). Vite proxies `/api` and `/auth` to backend.
