---
title: "Why I run my own vcpkg registry"
description: "A personal vcpkg registry where I publish preview builds of my own C++ libraries on my own schedule, instead of waiting on the official registry's review process."
date: 2026-08-02
tags: [cpp, vcpkg, open-source]
draft: true
---

Here's a small, verifiable fact: as of today, [Docraft's port in the official vcpkg registry](https://github.com/microsoft/vcpkg/blob/master/ports/docraft/vcpkg.json) is pinned to `v1.0.0-beta.3` — the version from March. The actual project has since gone through two release candidates and, as of a few hours ago, [`v1.0.0-RC3`](https://github.com/Cadons/Docraft/releases/tag/v1.0.0-RC3), which adds an entire charting system. Anyone installing `docraft` through the official registry right now gets none of that.

That's not a complaint about [vcpkg](https://github.com/microsoft/vcpkg) — it's Microsoft's C++ package manager, it serves thousands of libraries, and a slow, careful review process for changes to the shared registry is exactly the right tradeoff at that scale. It's just the wrong tradeoff for a library of mine that's still moving through release candidates and where I'm the only maintainer deciding when a version is good enough to depend on.

So alongside the official submission, I run a second, much smaller registry: [github.com/Cadons/vcpkg-registry](https://github.com/Cadons/vcpkg-registry), browsable at [cadons.github.io/vcpkg-registry](https://cadons.github.io/vcpkg-registry/).

## What it actually is

vcpkg supports pulling ports from any git repository that follows the standard registry layout — you're not limited to the built-in one. My registry follows that layout exactly:

```
ports/
  <port>/
    vcpkg.json
    portfile.cmake
versions/
  baseline.json
  <first-letter>-/
    <port>.json
```

Right now it hosts two ports: `docraft`, and `cadons-ctus` — my [C++ client for the tus resumable upload protocol](/blog/welcome). Both are pinned to their actual latest tags rather than whatever's currently merged upstream in the official registry.

## Using it in a project

A consuming project adds it as an extra registry in `vcpkg-configuration.json`, alongside (not instead of) the default one:

```json
{
  "default-registry": {
    "kind": "builtin",
    "baseline": "<commit-sha-of-your-default-vcpkg-baseline>"
  },
  "registries": [
    {
      "kind": "git",
      "repository": "https://github.com/Cadons/vcpkg-registry",
      "baseline": "<commit-sha-of-this-repo>",
      "packages": ["docraft"]
    }
  ]
}
```

The `baseline` has to be a commit SHA from *this* registry, not a tag — `vcpkg x-update-baseline --add-initial-baseline` can generate or refresh it for you. From there, `docraft` is declared as a normal dependency in `vcpkg.json`, and can optionally be pinned to a specific version with an `overrides` entry, same as any other vcpkg dependency.

## How a port actually gets updated

This is the part that makes the whole thing worth having: publishing a new version to my registry is a script, not a manual PR review cycle.

```sh
python3 scripts/update_port.py docraft v1.0.0-RC3
```

`update_port.py` verifies the tag exists on the upstream GitHub repo, downloads the release archive, computes its SHA512, updates `version-string` in the port's `vcpkg.json` and the hash in `portfile.cmake`, and adds a new entry to the version database via `vcpkg x-add-version`. Without `--commit` it leaves everything staged for review before I push — a safety check, not a formality, since a bad SHA512 breaks the port for anyone pinned to that version. A second script, `update_versions_db.py`, handles the narrower case of regenerating the version database after editing a port without bumping its version — fixing a portfile bug, say.

Neither script requires vcpkg to be pre-installed. If `$VCPKG_ROOT` isn't set, they bootstrap a private copy of the vcpkg tool into a gitignored folder on first run. Same behavior on Windows, macOS, and Linux.

## The package browser

The site at [cadons.github.io/vcpkg-registry](https://cadons.github.io/vcpkg-registry/) — the "documentation with examples and screenshots" for the registry itself — isn't hand-maintained either. `generate_pages_data.py` scans `ports/` and `versions/baseline.json` and rebuilds the page's data file, and a GitHub Actions workflow reruns that script and redeploys automatically on every push to `main` that touches `ports/`, `versions/baseline.json`, or the docs folder. So getting Docraft's RC3 into the browsable registry today was, in full: run `update_port.py`, commit, push. The page updated itself.

## What this isn't

This registry doesn't replace the official vcpkg submission — [it's still the plan](/blog/docraft-intro) to get Docraft into the main registry once it's past release-candidate territory, and getting a library listed there matters for discoverability in a way a personal git repo never will. What this registry buys me is the gap in between: a way to depend on my own libraries' newest work, in my own projects, on the same day I tag a release, instead of waiting for a review queue that has no reason to prioritize a beta library nobody's asked about yet.

If you maintain your own C++ libraries and find yourself in the same gap, the layout is entirely reusable — the [README](https://github.com/Cadons/vcpkg-registry#readme) has the full setup, and the scripts are generic enough to work for any port that fetches from GitHub releases, not just mine.
