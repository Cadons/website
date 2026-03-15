# AGENTS.md

## Project Snapshot
- Personal static site built with Astro + Tailwind; deploy target is GitHub Pages (`README.md`, `.github/workflows/deploy.yml`).
- Main content surfaces: homepage (`src/pages/index.astro`), blog index (`src/pages/blog/index.astro`), blog detail (`src/pages/blog/[slug].astro`), RSS (`src/pages/rss.xml.js`).
- Global frame/theme logic lives in `src/layouts/Layout.astro`; most pages render inside `<Layout>`.

## Architecture & Data Flow
- Homepage pulls from JSON + content collections in one place: `projects.json`, `dev-stack.json`, `config.json`, and latest posts via `getCollection('posts')` in `src/pages/index.astro`.
- Blog is file-based content: markdown files under `src/content/posts/` validated by Zod schema in `src/content/config.ts`.
- Draft handling is explicit and repeated; preserve `({ data }) => !data.draft` filters in homepage/blog/RSS when changing queries.
- Dynamic blog routes are static-generated in `getStaticPaths()` from collection slugs (`src/pages/blog/[slug].astro`).
- RSS depends on Astro site metadata (`context.site`) and `astro.config.mjs` `site`; changing domain requires updating both `astro.config.mjs` and `public/CNAME`.

## Conventions You Should Follow Here
- Treat `src/data/config.json` as single source of truth for author/social/domain text reused in layout, homepage, and feed.
- Project cards expect a stable schema (`name`, `description`, `url`, `lang`, `license`, `version`, `stars`, `featured`, `topics`) from `src/data/projects.json`.
- `dev-stack.json` has a special `Summary` key consumed separately from other groups in `src/pages/index.astro`; do not rename without updating destructuring logic.
- Blog frontmatter must match schema exactly (`title`, `description`, `date`, `tags`, `draft`) or content build fails.
- Styling is utility-first Tailwind; typography plugin is used for post body prose classes (`tailwind.config.mjs`, `src/pages/blog/[slug].astro`).
- Dark mode is class-based (`darkMode: 'class'`) and toggled via inline script in `src/layouts/Layout.astro`; avoid SSR-only theme assumptions.

## Developer Workflows
- Install/use local scripts from `package.json`:
  - `npm install`
  - `npm run dev` (local dev server)
  - `npm run build` (generates `dist/`)
  - `npm run preview` (serve built output)
- CI deploy path is fixed: push to `main` triggers build + Pages deploy with Node 20 and `npm ci` (`.github/workflows/deploy.yml`).
- If modifying build/deploy behavior, validate both local build and the workflow assumptions (artifact path is `./dist`).

## Commit Rules
- Prefer Conventional Commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Keep each commit focused on one surface (example: homepage only, blog rendering only, or data-only changes).
- When adding/changing posts, commit `src/content/posts/<slug>.md` separately from unrelated UI/styling edits.
- If a change affects publishing/deploy behavior, mention impacted paths in the commit body (for example `astro.config.mjs`, `public/CNAME`, `.github/workflows/deploy.yml`).
- For schema/data contract changes, include dependent file updates in the same commit (for example `src/data/projects.json` + `src/components/ProjectCard.astro`).

## High-Value Edit Hotspots
- Adding post: create `src/content/posts/<slug>.md` with valid frontmatter; draft posts stay unpublished.
- Adding featured project: append object in `src/data/projects.json` with `"featured": true` to appear on homepage.
- Metadata/links/theme/nav/footer changes are centralized in `src/layouts/Layout.astro` and `src/data/config.json`.

