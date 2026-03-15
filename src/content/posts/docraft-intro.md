---
title: "Introducing Docraft: declarative PDF generation for C++ applications"
description: "Why I built a C++23 library to generate PDF documents from XML templates — and why none of the existing solutions were good enough."
date: 2026-03-15
tags: [cpp, docraft, pdf, open-source]
draft: false
---

Every C++ developer who has needed to generate a PDF document knows the feeling. You search the ecosystem, find a handful of libraries, and quickly realize that none of them actually solve the problem — they just expose it at a slightly higher level.

I ran into this at work. At Medacta International we build pre-operative planning software, and generating structured reports is a core part of that. The legacy approach was exactly what you'd expect from something built before anyone thought carefully about it: drawing text and shapes pixel by pixel, manually tracking coordinates, no layout engine, no templates. Every change to a report format meant hunting through drawing code and adjusting numbers by hand.

So I started looking for a better way.

## What's already out there

**PoDoFo and similar low-level libraries** are an improvement over writing PDF with libharu manually, but you're still operating at the coordinate level. There's no concept of flow layout, no automatic page breaking, no template system. You describe *where* things go, not *what* you want.

**LaTeX** is the gold standard for document quality, but it requires a full TeX distribution to be installed on the machine — you can't bundle it as a library dependency. In a medical software context where the deployment environment is controlled and dependencies are audited, shelling out to an external tool is a non-starter.

**HTML-to-PDF solutions** — Qt WebEngine, wkhtmltopdf, headless Chromium — are the most developer-friendly option because HTML and CSS are familiar. But they pull in an entire browser rendering engine as a dependency. That's hundreds of megabytes and a significant attack surface for a library whose job is to produce a document.

**Web services** that run LaTeX or Pandoc remotely are fine for some use cases, but not when your software needs to work offline, in a hospital network with restricted internet access, or in a regulated environment where data can't leave the machine.

The frustrating part is that the right solution clearly exists conceptually — a declarative markup language that describes documents, a layout engine that handles the flow, a lightweight PDF renderer — it just didn't exist as a properly packaged, documented, vcpkg-installable C++ library.

## What Docraft does differently

Docraft is a C++ library that lets you define documents in an XML-based markup language called the **Craft Language**. You describe what your document looks like — structure, content, styling — and the library handles layout, page breaking, headers, footers, and rendering.

A simple invoice template looks like this:

```xml
<Document>
  <Settings page_size="A4" page_orientation="portrait"/>

  <Header margin_left="30" margin_right="30">
    <Layout orientation="horizontal">
      <Text weight="0.67" font_size="20" style="bold">${company_name}</Text>
      <Text weight="0.33" font_size="10" alignment="right">${company_address}</Text>
    </Layout>
  </Header>

  <Body margin_left="30" margin_right="30">
    <Text font_size="16" style="bold">INVOICE ${invoice_number}</Text>
    <Table model="${items}">
      <THead>
        <HTitle>Description</HTitle>
        <HTitle>Qty</HTitle>
        <HTitle>Amount</HTitle>
      </THead>
    </Table>
  </Body>

  <Footer>
    <PageNumber font_size="8" alignment="right"/>
  </Footer>
</Document>
```

You feed it a JSON data file and get a PDF out:

```bash
docraft_tool invoice.craft output.pdf -d invoice.json
```

Or you drive it from C++ directly:

```cpp
docraft::Document doc;
doc.load_template("invoice.craft");
doc.bind_data(json_data);
doc.render("output.pdf");
```

The library handles the rest: flow layout, automatic page breaks, header and footer repetition on every page, page numbering, table rendering with data binding.

## What it's designed for

Docraft is not a typesetting engine. If you're writing a book or need fine-grained control over kerning and ligatures, this is not the right tool.

It's designed for **structured document generation** — the kind of output that applications produce at runtime:

- Medical reports
- Invoices and receipts
- Industrial quality reports
- Shipping labels
- Any document where the structure is fixed but the data changes

The sweet spot is applications that need to generate many documents of the same type, driven by data, without human intervention.

## The technical choices

A few decisions that shaped how Docraft works:

**No external runtime tools.** The entire rendering pipeline is self-contained within the library. You don't need to install LaTeX, a headless browser, or any other external tool. Just link against the library and you're good to go.

**Pluggable backend.** libharu is the default, but the rendering pipeline is abstracted behind interfaces. If you need a different PDF library, or want to render to SVG or another format, you implement the backend interface and plug it in. The document model doesn't change.

**Template engine built in.** Variables (`${name}`), loops (`<Foreach>`), and conditional rendering are part of the Craft Language itself. You don't need a separate preprocessing step.

**Automatic layout.** The layout engine is flow-based with automatic page breaking. You define `<Layout>` containers with weighted children and let the engine figure out coordinates. Absolute positioning is available when you genuinely need it, but it shouldn't be the default.

## Current state and what's next

Docraft is currently in beta (`v1.0.0-beta.3`). The core features are stable and the library is usable in production, but the API surface may still change before the 1.0 release.

It will be published on **vcpkg** — so adding it to a CMake project will be as simple as adding a dependency to `vcpkg.json`. Conan support is on the roadmap if there's demand for it.

The thing I care about most for the next phase is building a community around it. The library is only as useful as the templates people build with it, and the Craft Language is only as good as the feedback it receives from real use cases. If you work in a domain that generates structured documents from C++ — medical, industrial, logistics, finance — I'd genuinely like to hear how you'd use it and what's missing.

The repository is at [github.com/Cadons/Docraft](https://github.com/Cadons/Docraft). Contributions, issues, and feedback are all welcome.
