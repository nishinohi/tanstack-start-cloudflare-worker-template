# TanStack Start + Cloudflare Worker Template

## Project Overview
フルスタック React フレームワーク (TanStack Start) を Cloudflare Workers 上で動作させるテンプレートプロジェクト。

## Tech Stack
- **Framework**: TanStack Start (React 19, SSR)
- **Routing**: TanStack Router (file-based, `src/routes/`)
- **Server State**: TanStack Query v5 + SSR integration
- **Styling**: Tailwind CSS v4 + Shadcn/ui (New York style, zinc)
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Auth**: Better Auth (session in Cloudflare KV)
- **Validation**: Zod + React Hook Form
- **Build**: Vite + @cloudflare/vite-plugin
- **Testing**: Vitest + @testing-library/react
- **Linting**: ESLint, Prettier, Stylelint, Lefthook (pre-commit)

## Key Files
- `src/router.tsx` - Router setup with TanStack Query context
- `src/routes/__root.tsx` - Root layout
- `src/routes/` - File-based routes
- `src/db/schema/` - Drizzle schema definitions
- `src/lib/utils.ts` - `cn()` utility
- `wrangler.jsonc` - Cloudflare deployment config
- `CLAUDE.md` - Full architecture details

## Detailed Memory Files
- `suggested_commands.md` - Development commands
- `code_style.md` - Code style conventions
- `task_completion.md` - Task completion checklist
- `architecture.md` - Architecture patterns
