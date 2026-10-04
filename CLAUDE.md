# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Freshly scaffolded with Create Next App; no meal-tracking features exist yet.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)
- No test runner is configured.

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4 (via `@tailwindcss/postcss`; styles in `src/app/globals.css`).
- Code lives under `src/`; routes are in `src/app/`. Import alias: `@/*` → `./src/*`.
- The README's reference to `app/page.tsx` is boilerplate; the actual path is `src/app/page.tsx`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
