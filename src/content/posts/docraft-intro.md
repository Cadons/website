---
title: "Declarative PDF generation in C++23"
description: "How I built Docraft — a self-contained C++ library that lets you define documents in XML and renders them to PDF without any external tools."
date: 2026-03-10
tags: [cpp, docraft, pdf]
draft: false
---

Generating PDFs from C++ has always been painful. The ecosystem is fragmented: you either call low-level libraries that expose raw page-drawing primitives, or you shell out to external tools like LaTeX or headless browsers.

Neither option is great when you're building medical software where dependencies need to be minimal, auditable, and self-contained.

## The problem

In my day job at Medacta I ran into this repeatedly. We needed to generate structured documents — reports, records, formatted output — from within a C++ process, with no network calls, no spawned processes, no temp files.

## The solution: Docraft

Docraft lets you describe documents in a simple XML markup called the **Craft Language**...

```xml
<Document>
  <Header>
    <Text>Monthly Report</Text>
  </Header>
  <Body>
    <Table model="${data}">
      <Column title="Name" />
      <Column title="Value" />
    </Table>
  </Body>
</Document>
```

The library takes care of layout, page breaking, headers and footers — you describe *what*, it handles *how*.

## What I learned

Building a layout engine from scratch is humbling. Flow-based layout with automatic page breaking is deceptively complex...
