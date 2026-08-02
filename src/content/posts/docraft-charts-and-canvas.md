---
title: "Docraft can finally draw a chart"
description: "RC3 adds Canvas, a free-form drawing surface, and Chart, five chart styles built on top of it — the two pieces every one of Docraft's example documents was quietly missing."
date: 2026-08-02
tags: [cpp, docraft, dataviz, open-source]
draft: false
---

Every one of the document types Docraft was designed for — invoices, medical reports, industrial QC reports — involves at least one number a reader is supposed to compare against another number. Until this week, the only way to make that comparison visible in a `.craft` document was a table. If you wanted a bar or a line instead, you were on your own: hand-position a stack of `<Rectangle>` elements and hope nobody asked you to change the data.

[`v1.0.0-RC3`](https://github.com/Cadons/Docraft/releases/tag/v1.0.0-RC3), released today, closes that gap with two new elements: `<Canvas>`, a free-form drawing surface, and `<Chart>`, five chart styles built directly on top of it.

## Canvas: stepping outside the flow

Every other container in the [Craft Language](https://cadons.github.io/Docraft/craft_language/index.html) block-stacks its children — each one goes below the last, the way a paragraph follows a paragraph. [`<Canvas>`](https://cadons.github.io/Docraft/craft_language/shapes.html#canvas) is the exception: its children position themselves by their own `x`/`y` coordinates relative to the canvas's own top-left corner, and anything drawn outside the canvas's bounds gets clipped. It's the one place in a Docraft document where you're back to specifying exact coordinates on purpose.

```xml
<Canvas width="200" height="150" background_color="#F5F5F5">
  <Circle x="20" y="20" width="30" height="30" background_color="blue" />
  <Line x1="0" y1="100" x2="200" y2="100" border_color="black" />
</Canvas>
```

On its own, `<Canvas>` is just a positioning primitive. What makes it worth having is that `<Chart>` is built on top of it — "each chart style is a small 'plugin' that fills a canvas with ordinary primitive nodes (lines, circles, rectangles, text), so nothing renderer-side needs to know about charts at all," per the [charts documentation](https://cadons.github.io/Docraft/craft_language/charts.html). That's the same design instinct behind the [Loom architecture](/blog/docraft-loom-architecture): a chart isn't a special case, it's a node that happens to draw other nodes.

## Chart: one element, five styles

A `<Chart>` needs an explicit `width`, `height`, and `style`, and one or more `<Series>` children carrying its data as a JSON array — either coordinate pairs for continuous data, or `{"label": value}` entries for categorical data.

```xml
<Chart style="scatter" width="480" height="300" title="Height vs. Weight by Age Group"
       x_label="Height (cm)" y_label="Weight (kg)">
  <Series name="Teens" color="#2CA02C" model='[[150,42],[155,48],[158,50],[162,55]]' />
  <Series name="Adults" color="#1F77B4" model='[[160,55],[165,60],[170,68],[175,72]]' />
</Chart>
```

![Scatter chart with three series comparing height and weight across age groups](/blog/docraft-charts-and-canvas/scatter.png)

**Scatter** plots one dot per point, unconnected — for showing whether two continuous variables are actually related.

![Spline chart showing two smoothly interpolated crossing trend lines](/blog/docraft-charts-and-canvas/spline.png)

**Spline** draws a smooth, interpolated curve through each series — useful when a trend should read as continuous rather than jagged. The image above is two series with crossing trend lines; the interpolation stays smooth right through the crossover.

![Line chart connecting quarterly revenue points with straight segments across three series](/blog/docraft-charts-and-canvas/line.png)

**Line** uses the same data shape as spline but connects points with straight segments instead of a curve — the honest version of a trend when you don't want to imply smoothness that isn't in the data.

![Histogram chart comparing quarterly sales across five regions as grouped bars](/blog/docraft-charts-and-canvas/histogram.png)

**Histogram** draws grouped bars, one per data point, side by side within each shared category. A detail worth calling out: the Y axis auto-zooms to the actual data range instead of always starting at zero — visible above, where the axis starts around 20, not 0 — so small differences between bars stay readable instead of getting flattened by a tall, mostly-empty baseline.

![Pie chart with six slices showing revenue split by product line](/blog/docraft-charts-and-canvas/pie.png)

**Pie** has no axes at all — each `<Series>` point becomes a slice sized by its share of the total.

## Composition instead of a dashboard node

There's no dedicated "dashboard" element and no "annotated chart" element. The docs are explicit about this: because `<Chart>` is just another node, it can be nested inside `<Canvas>` alongside ordinary shapes and text, each positioned by its own `x`/`y` — so a dashboard is just several charts on one canvas, and an annotation is just a `<Rectangle>` and a `<Text>` sitting near a chart's edge.

![Dashboard combining a pie chart, a histogram, and a line chart on one canvas with a heading and divider lines](/blog/docraft-charts-and-canvas/dashboard.png)

```xml
<Canvas width="600" height="600" background_color="#FAFAFA" border_color="#DDDDDD" border_width="1">
  <Text x="20" y="16" font_size="13" bold="true">Q1-Q3 Business Overview</Text>
  <Chart x="10" y="50" style="pie" width="290" height="230" title="Revenue Split">
    <Series model='[{"Hardware":32},{"Software":27},{"Services":18},{"Support":13},{"Other":10}]' />
  </Chart>
  <Chart x="300" y="50" style="histogram" width="290" height="230" title="Regional Sales">
    <Series name="Q1" model='[{"North":30},{"South":45},{"East":25},{"West":38}]' />
  </Chart>
  <Chart x="10" y="305" style="line" width="580" height="270" title="Monthly Growth Trend">
    <Series name="2025" model='[[1,40],[2,45],[3,50],[4,55],[5,60]]' />
  </Chart>
</Canvas>
```

![Spline chart annotated with two custom callout boxes showing peak users and year-over-year growth](/blog/docraft-charts-and-canvas/annotated.png)

The same idea covers annotations: wrap a `<Chart>` in a `<Canvas>` and drop `<Rectangle>`/`<Text>` callouts near it, positioned relative to the chart's outer bounding box. One caveat worth knowing if you try this yourself — a chart's internal plot coordinates (where a specific data point actually lands in pixels) aren't exposed back to the `.craft` file, so a callout can sit next to a chart, but it can't be pixel-aligned to one exact data point without already knowing that chart's own axis scaling.

## Seeing it in a real document

The clearest demonstration of all of this together is the new [Sales Performance Report example](https://cadons.github.io/Docraft/examples/sales_report.html) — KPI cards, a pie-and-histogram dashboard on one canvas, and a year-over-year trend chart, in one actual report rather than isolated snippets. I'll walk through that one alongside Docraft's other example templates in the [next post](/blog/docraft-example-templates).

Full attribute reference for both elements is in the [Craft Language docs](https://cadons.github.io/Docraft/craft_language/charts.html). This is RC territory, not stable 1.0, so I'd treat the chart syntax as solid but not frozen — if you build something with it, I'd like to know what broke or what was missing. The repository is [github.com/Cadons/Docraft](https://github.com/Cadons/Docraft).
