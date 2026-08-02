# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Snapshot

Personal static site (matteocadoni.com) built with Astro + Tailwind CSS, deployed to GitHub Pages.

- Homepage: `src/pages/index.astro`
- Blog index: `src/pages/blog/index.astro`
- Blog detail: `src/pages/blog/[slug].astro`
- RSS feed: `src/pages/rss.xml.js`
- Global frame/theme logic: `src/layouts/Layout.astro` (most pages render inside `<Layout>`)

## Developer Workflows

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # generates dist/
npm run preview  # serve built output
```

There is no test suite or linter configured. CI deploy is fixed: push to `main` triggers build + Pages deploy with Node 20 and `npm ci` (`.github/workflows/deploy.yml`), artifact path `./dist`. If modifying build/deploy behavior, validate both the local build and the workflow assumptions.

## Architecture & Data Flow

- Homepage pulls from JSON + content collections in one place: `src/data/projects.json`, `src/data/dev-stack.json`, `src/data/config.json`, and latest posts via `getCollection('posts')`, all wired in `src/pages/index.astro`.
- Blog is file-based content: markdown files under `src/content/posts/`, validated by the Zod schema in `src/content/config.ts` (`title`, `description`, `date`, `tags`, `draft`). A build fails if frontmatter doesn't match.
- Dynamic blog routes are static-generated via `getStaticPaths()` from collection slugs in `src/pages/blog/[slug].astro`.
- Draft handling is explicit and repeated in three places — preserve the `({ data }) => !data.draft` filter in homepage, blog index, and RSS when changing queries.
- RSS depends on Astro site metadata (`context.site`) and the `site` value in `astro.config.mjs`; changing domain requires updating both `astro.config.mjs` and `public/CNAME`.

## Data Contracts

- `src/data/config.json` is the single source of truth for author/social/domain text, reused in the layout, homepage, and feed.
- `src/data/projects.json` entries must keep a stable schema consumed by `src/components/ProjectCard.astro`: `name`, `description`, `url`, `lang`, `license`, `version`, `stars`, `featured`, `topics`. Set `"featured": true` for a project to appear on the homepage.
- `src/data/dev-stack.json` has a special `Summary` key consumed separately from other groups in `src/pages/index.astro` — don't rename it without updating the destructuring logic there.

## Styling

- Utility-first Tailwind; the typography plugin renders blog post body prose (`tailwind.config.mjs`, used in `src/pages/blog/[slug].astro`).
- Dark mode is class-based (`darkMode: 'class'`), toggled via an inline script in `src/layouts/Layout.astro` — avoid SSR-only theme assumptions.

## Commit Conventions

- Conventional Commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Keep each commit focused on one surface (e.g. homepage only, blog rendering only, data-only changes).
- Commit new/changed posts (`src/content/posts/<slug>.md`) separately from unrelated UI/styling edits.
- If a change affects publishing/deploy behavior, mention impacted paths in the commit body (e.g. `astro.config.mjs`, `public/CNAME`, `.github/workflows/deploy.yml`).
- For schema/data contract changes, include dependent file updates in the same commit (e.g. `src/data/projects.json` + `src/components/ProjectCard.astro`).
