# matteocadoni.com
![logo_dark.svg](public/logo_dark.svg)

Personal site built with [Astro](https://astro.build) + Tailwind CSS. Hosted on GitHub Pages.

## Stack

- **Astro** — static site generator
- **Tailwind CSS** — styling
- **Markdown** — blog posts
- **GitHub Actions** — automatic deploy on push to `main`

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Adding a project

Edit `src/data/projects.json` — add an object to the array:

```json
{
  "name": "my-project",
  "description": "Short description.",
  "url": "https://github.com/Cadons/my-project",
  "lang": "C++",
  "license": "MIT",
  "version": "v1.0.0",
  "stars": 0,
  "featured": true,
  "topics": ["cpp", "topic"]
}
```

## Writing a blog post

Create a new file in `src/content/posts/`:

```
src/content/posts/my-post-title.md
```

With this frontmatter:

```markdown
---
title: "My post title"
description: "One sentence description."
date: 2026-03-15
tags: [cpp, tag]
draft: false
---

Content here...
```

Set `draft: true` to keep it in the repo without publishing.

## Deploy

Push to `main` — GitHub Actions builds and deploys automatically.

### First-time GitHub Pages setup

1. Go to repo **Settings → Pages**
2. Set source to **GitHub Actions**
3. In your DNS, add a CNAME record: `www` → `cadons.github.io`
4. Add an A record pointing `@` to GitHub Pages IPs (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))
