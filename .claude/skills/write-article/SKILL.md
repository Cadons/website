---
name: write-article
description: Write or draft a new blog post for matteocadoni.com (src/content/posts/). Use this whenever the user asks to write an article, write a blog post, draft a post about something they built or learned, announce a release, or turn notes/a topic into a published-ready post for this site. Also use it when the user asks to edit or restructure an existing post to match the site's voice. Do not use it for other prose (README updates, PR descriptions, docs) — only for src/content/posts/ articles.
---

# Write Article

Drafts a new post for `src/content/posts/`, matching the site's existing architecture (frontmatter schema, file layout) and Matteo's personal writing voice, calibrated so it's technical enough to be credible but readable by a non-technical friend.

## 1. Gather the topic and sources before writing

Ask (or infer from conversation context) what the post is about, and collect concrete source material rather than writing from general knowledge:

- If it's about a project/library/decision in this repo or elsewhere, read the actual code, README, or commit history for facts — don't guess at API shapes, version numbers, or feature lists.
- If it references external tools, libraries, specs, articles, or claims ("X doesn't support Y", "Z is the standard for W"), verify with WebFetch/WebSearch and keep the URL. Every non-obvious factual claim about a third party needs a source you can link — see §4.
- If the user hands you rough notes or a voice-memo-style brain dump, treat that as the raw material, not the prose — restructure it into the pattern below rather than lightly editing it.

If you don't have enough to write accurately (missing numbers, unclear motivation, unverified claim), ask rather than inventing plausible-sounding detail.

## 2. File setup

- Path: `src/content/posts/<slug>.md`, slug is kebab-case, derived from the title (see `welcome.md`, `docraft-intro.md` for precedent).
- Frontmatter must satisfy the Zod schema in `src/content/config.ts` exactly — the build fails otherwise:
  ```yaml
  ---
  title: "..."
  description: "One sentence, used as the post preview/meta description."
  date: YYYY-MM-DD
  tags: [lowercase, kebab-case, words]
  draft: true
  ---
  ```
- Default `draft: true` unless the user explicitly says to publish. That's the review gate before it goes live — don't flip it to `false` yourself.
- Use today's date unless the user specifies otherwise.

## 3. Structure — follow the existing architecture, not a generic blog template

Both current posts share a shape. Reuse it:

1. **No H1** — the title comes from frontmatter and is rendered by the layout; the post body starts straight into prose.
2. **Open with a concrete hook**, not a thesis statement. Ground it in a real situation: something that happened, a problem hit at work or on a project, an observation. ("Every C++ developer who has needed to generate a PDF document knows the feeling.")
3. **State the motivation honestly** — why this was worth doing/writing, tied to a real context (a job, a project, a frustration), not an abstract "I decided to explore X."
4. **Body in `##` sections**, each with a short, plain-language heading describing what it covers (not clever/cute titles). Typical section arc for a project/technical post:
   - What exists already / the landscape, with fair, specific critique of alternatives (not strawmen)
   - What this thing does differently, with a minimal concrete example (code block, command, or before/after) if it clarifies rather than decorates
   - What it's for / not for — explicit boundaries so readers self-select
   - The handful of technical choices that mattered and why
   - Current state and what's next
   For a non-project post (opinion, retrospective, notes), keep the same instinct: concrete opening → honest context → a few clearly-labeled sections → where things stand now.
5. **Close with state + an invitation**, not a summary recap. End on where things actually are (beta, shipped, still exploring) and a low-key call to engage — link to the repo, GitHub, or LinkedIn, phrased as a genuine invitation, not a CTA button in prose form.

## 4. Reference every source

Non-technical readers should still be able to trust every specific claim. Link sources inline as markdown links at the point of the claim, not batched into a "References" footer — that matches how the existing posts already cite things (`[github.com/Cadons/Docraft](https://github.com/Cadons/Docraft)`, tool names linked where first introduced).

- Any named tool, library, spec, or protocol the reader could look up: link it on first mention.
- Any number, benchmark, or claim about what a third party does or doesn't support: link the source you verified it against.
- Any product/company mentioned in a factual (not narrative) way: link if there's a natural source (repo, docs, product page).
- Don't link things that are self-evidently the author's own claim, opinion, or experience — only externally-verifiable facts need a citation.
- If a claim can't be sourced, either cut it or flag it to the user rather than publishing an unverifiable assertion.

## 5. Voice and technical calibration

This is the part most likely to make a draft feel off if skipped — read the two existing posts before writing if it's been a while.

- **First person, direct, no hype.** No "game-changing," "revolutionary," "seamless." The existing posts actively reject marketing language ("Not a personal brand. I don't have a course to sell.").
- **Explain the *why*, not just the *what*.** A paragraph on a technical choice should say what problem it solves and what was rejected, not just describe the feature.
- **Short paragraphs**, including occasional one-sentence paragraphs used deliberately for a beat/emphasis ("So I started looking for a better way.").
- **Bold** is used sparingly, mainly to flag the subject of a paragraph that's part of an enumerated comparison (e.g. **PoDoFo and similar low-level libraries**, **LaTeX**, **HTML-to-PDF solutions**) — not for random emphasis.
- **Technical but not much**: assume the reader is smart and curious, not that they know the domain. When a technical term first appears, give it a short plain-language gloss in the same sentence or a parenthetical, the way "shelling out to an external tool" or "flow layout" get explained through context rather than a glossary aside. Skip deep implementation detail that doesn't serve the narrative — depth should serve the point being made, not demonstrate expertise.
- **Concrete over abstract.** Real company names, real numbers, real constraints (e.g. "hospital network with restricted internet access") beat generic descriptions every time.
- **No forced structure filler.** No "In this post, we will..." intros, no "In conclusion" outros, no numbered takeaways lists tacked on at the end.

## 6. Before handing back the draft

Check:
- [ ] Frontmatter matches the schema in `src/content/config.ts` (title, description, date, tags array, draft boolean)
- [ ] Filename is kebab-case and matches the slug the title implies
- [ ] `draft: true` unless told otherwise
- [ ] Every external tool/claim/number is linked to a real source at first mention
- [ ] No marketing language, no generic intro/outro filler
- [ ] Opens with a concrete situation, not a thesis statement
- [ ] A non-technical reader could follow the narrative even if they skimmed the code blocks

If asked to publish, flip `draft: false` and remind the user this triggers a live deploy on push to `main` (see `CLAUDE.md`).
