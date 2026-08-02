---
title: "Docraft's rendering engine finally has a name: Loom"
description: "How several months of refactoring turned Docraft's parse-to-PDF pipeline into a named, staged architecture — and why that mattered more than any single feature."
date: 2026-08-02
tags: [cpp, docraft, architecture, open-source]
draft: false
---

Back in March I wrote about [why I started building Docraft](/blog/docraft-intro) and what the library could already do. What I didn't write about — because it didn't really exist yet in any describable form — was how it worked internally. At `v1.0.0-beta.3`, the version that post described, going from a `.craft` file to a rendered PDF was one pass through a few thousand lines of code that did the parsing, the layout math, and the drawing in whatever order made a given feature work. It was fine for a beta. It was not something I could explain to a contributor in under ten minutes, and it was not something I could confidently extend without breaking something two layers away.

Between beta.3 and today's [`v1.0.0-RC3`](https://github.com/Cadons/Docraft/releases/tag/v1.0.0-RC3), a good chunk of the work went into things that don't make for exciting changelog entries: enforcing an explicit accessor pattern across the core APIs instead of relying on macro-generated getters and setters, a general refactor pass, and — the one that actually mattered architecturally — a July pull request titled, accurately if unglamorously, "find the best pattern for the layout engine." That's where the pipeline the docs now call **Loom** took its current shape.

## What Loom is

Loom isn't a separate library or a rewrite from scratch. It's a name for a specific pipeline that the [Docraft documentation](https://cadons.github.io/Docraft/about.html) describes as "a pipeline of visitor passes over a node tree." In practice, turning a `.craft` file into a PDF now goes through eight distinct, ordered stages:

1. **Parsing** — the Craft Language XML is read by a [pugixml](https://pugixml.org/)-backed parser into a generic tree.
2. **Element tree** — a tag-agnostic `DocraftParsedElement` tree: at this point the code doesn't yet know what a `<Table>` or a `<Chart>` is, just that it's an element with attributes and children.
3. **Tree building + templating** — the template engine resolves `${variables}` and `<Foreach>` loops against the bound JSON data at the same point the tree gets built.
4. **Loom node tree** — generic elements are converted into specialized node types: `Text`, `Paragraph`, `VStack`, `Table`, and so on.
5. **Measure** — a pass that calculates how much space each node actually needs.
6. **Layout** — a cursor-based pass that turns those measurements into a real, flowing arrangement on the page.
7. **Pagination** — the laid-out content is split across page boundaries, including mid-table splits.
8. **Rendering** — the final pass walks the paginated tree and draws it, currently through a [libharu](https://github.com/libharu/libharu) backend.

None of this is visible from a `.craft` file, and it isn't meant to be — the whole point of the Craft Language is that you describe *what* a document looks like and never think about the pipeline underneath it. But knowing the pipeline exists explains a lot about what changed between March and now.

## Why splitting it up actually matters

The obvious complaint about "we refactored it into stages" is that it's an implementation detail nobody asked for. What made it worth four months of PRs is what each stage is now allowed to *not* know about.

Measure doesn't know what a page is. Layout doesn't know it's eventually going to be paginated. Pagination doesn't know libharu exists. Rendering is the only stage in the entire pipeline that talks to the PDF backend directly — everything upstream of it works against an abstract, already-positioned tree.

That's what makes the "pluggable backend" claim from the original March post actually true rather than aspirational. Back then, the idea that you could swap libharu for a different PDF library, or render to SVG instead, was a design goal. Now it's a consequence of the architecture: implementing a different backend means implementing the `RenderingProcessor` stage's interface, not hunting `HPDF_*` calls out of parsing code.

It's also the reason the newest features — [Canvas and Chart](/blog/docraft-charts-and-canvas), covered in the next post — could ship as ordinary node types that flow through the same eight stages, instead of needing special-casing scattered across the codebase. A chart is measured, laid out, paginated, and rendered exactly like a paragraph is; it just happens to draw differently in stage 8.

## Where it stands

Docraft is currently at `v1.0.0-RC3` — a release candidate, not yet the stable 1.0 the version number is aiming at. The Craft Language surface has been stable since the beta, but the internals underneath it look nothing like they did in March, and that's by design: getting the pipeline right before 1.0 means fewer breaking changes have to happen after it.

The repository is at [github.com/Cadons/Docraft](https://github.com/Cadons/Docraft). If you're curious how a specific stage works, or you hit a case where the pipeline does something surprising, I'd genuinely like to hear about it — issues and questions are welcome.
