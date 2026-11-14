# Harsha Tummala — Senior ML & Systems Engineer Portfolio

[![Deploy Portfolio to GitHub Pages](https://github.com/harsha6107/harsha6107.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/harsha6107/harsha6107.github.io/actions/workflows/deploy.yml)

> **I build ML and search systems that ship: 26M-SKU catalog intelligence, tool-calling LLM agents, and high-throughput data platforms.**

Live production site: **[https://harsha6107.github.io](https://harsha6107.github.io)**

---

## Preview

| Dark Mode (`1440px` — Deep Carbon Slate) | Light Mode (`1440px` — Warm Archival Alabaster) |
| :--- | :--- |
| ![Harsha Tummala Portfolio — Dark Mode](public/images/portfolio-preview-dark.png) | ![Harsha Tummala Portfolio — Light Mode](public/images/portfolio-preview-light.png) |

---

## Architecture & Stack

| Layer | Technology | Version / Specification |
| :--- | :--- | :--- |
| **Framework** | [Astro](https://astro.build/) | `7.4.12` (`output: 'static'`, zero-JS default, selective lazy islands) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `7.0.2` (`astro/tsconfigs/strict`, `exactOptionalPropertyTypes: true`) |
| **Content Engine** | Astro Content Collections (`glob` loader) + [MDX](https://mdxjs.com/) | `@astrojs/mdx@8.1.6` with strict Zod schemas in `src/content.config.ts`. Components hold **zero hardcoded copy**; all content lives in `src/content/`. |
| **Styling & Tokens** | Modern Native CSS | Cascade layers (`@layer reset, tokens, base, layout, components, utilities, motion`), `oklch()` color tokens with sRGB fallbacks, `@container` queries, fluid `clamp()` type scale, strict 8pt (`0.5rem`) grid. |
| **Typography** | Self-hosted Variable Fonts (`WOFF2`) | `@fontsource-variable/inter` (body/display) + `@fontsource-variable/jetbrains-mono` (`tabular-nums` telemetry, equations, code). |
| **Syntax Highlighting** | Shiki Dual Themes | `github-light-high-contrast` (Light) & `github-dark-default` (Dark) — zero runtime JS. |
| **OpenGraph Images** | Build-Time SVG → PNG | `satori@0.26.0` + `@resvg/resvg-js@2.6.2` generating `1200×630` PNG cards for every route at `/og/[...slug].png`. |
| **Linting & Formatting** | [Biome](https://biomejs.dev/) | `@biomejs/biome@2.6.7` |
| **E2E & Accessibility** | [Playwright](https://playwright.dev/) + [Axe](https://github.com/dequelabs/axe-core) | `@playwright/test@1.65.1` + `@axe-core/playwright@4.14.0` enforcing zero WCAG 2.2 AA violations across all routes in Light & Dark themes and zero horizontal overflow (`320px` → `2560px`). |
| **Performance Gate** | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | `@lhci/cli@0.16.1` enforcing **100 / 100** across Performance, Accessibility, Best Practices, and SEO on mobile (`LCP < 1.5s`, `CLS < 0.02`, `TBT < 100ms`). |
| **CI / Deployment** | GitHub Actions | `.github/workflows/deploy.yml` → `actions/deploy-pages@v4` + Dependabot weekly updates. |

---

## Signature ML Moment & Interactions

1. **Interactive 2D UMAP Embedding Map (`< 5 KB` lazy-loaded island)**
   - Projects, technical essays, and core ML/data capabilities are projected onto a 2D latent manifold (`src/components/EmbeddingMap.astro` + `public/scripts/embedding-map.js`).
   - Hovering or keyboard-focusing any vector node computes **live cosine similarity** ($\cos\theta = \frac{\mathbf{u}\cdot\mathbf{v}}{\|\mathbf{u}\|\|\mathbf{v}\|}$) across all 4D capability embeddings (`[search, agents, data, ml]`) and renders SVG nearest-neighbor tethers (`k=3`).
   - Clicking any project or essay node navigates directly to its specification. Includes a collapsible static HTML `<table>` matrix fallback for screen readers and no-JS environments.
2. **Cross-Document View Transitions**
   - Native CSS `@view-transition { navigation: auto; }` morphs project card titles (`view-transition-name: title-<slug>`) and headline metric badges (`view-transition-name: metric-<slug>`) seamlessly into the Case Study header.
3. **Scroll-Driven Animations (`@supports`)**
   - Reading progress bar (`animation-timeline: scroll(root)`) and card reveals (`animation-timeline: view()`) are progressively enhanced inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`. All content remains `opacity: 1` without support.
4. **`⌘K` / `Ctrl+K` Command Palette**
   - Built on native `<dialog>` (`src/components/CommandPalette.astro`) with full keyboard navigation (`↑`/`↓`/`Enter`/`Esc`), instant fuzzy filtering across sections, case studies, and essays, one-keystroke theme toggling, and email copying.

---

## Repository Structure

```text
├── .github/
│   ├── dependabot.yml              # Weekly automated npm & GitHub Actions updates
│   └── workflows/deploy.yml        # Quality gates + GitHub Pages deployment
├── public/
│   ├── favicon.svg                 # Monogram vector icon
│   ├── images/                     # Portfolio preview screenshots
│   ├── resume/Harsha_Tummala.pdf   # Printable 1-page engineering résumé PDF
│   ├── robots.txt                  # Crawler directives + sitemap pointer
│   └── scripts/embedding-map.js    # Lazy-loaded 4.32 KB UMAP k-NN island
├── src/
│   ├── assets/profile.jpg          # Source portrait optimized to AVIF/WebP via astro:assets
│   ├── components/
│   │   ├── ArchitectureDiagram.astro # 5 bespoke accessible SVG system schematics
│   │   ├── CommandPalette.astro    # ⌘K native <dialog> command palette
│   │   ├── EmbeddingMap.astro      # 2D UMAP Latent Space Explorer + static table fallback
│   │   └── ProjectCard.astro       # Container-queried spotlight card with View Transition tags
│   ├── content/
│   │   ├── site/main.json          # All bio, hero telemetry, timeline, skills & UI copy
│   │   ├── projects/*.mdx          # 5 production engineering case studies
│   │   └── writing/*.mdx           # 4 technical architecture essays
│   ├── content.config.ts           # Strict Zod schemas for projects, writing & site collections
│   ├── layouts/BaseLayout.astro    # Semantic shell, SEO/JSON-LD, theme init, reading progress
│   ├── pages/
│   │   ├── index.astro             # Home: positioning, telemetry, projects, UMAP map, writing, contact
│   │   ├── about.astro             # Philosophy, portrait, experience timeline, capability matrix
│   │   ├── resume.astro            # Print-styled HTML specification + PDF download
│   │   ├── 404.astro               # Telemetry fault page with recovery routes
│   │   ├── rss.xml.ts              # RSS 2.0 feed for technical writing
│   │   ├── og/[...slug].png.ts     # Build-time Satori + Resvg OpenGraph PNG generator
│   │   ├── projects/               # Index + [slug].astro case study layout
│   │   └── writing/                # Index + [slug].astro essay layout
│   └── styles/global.css           # Cascade layers, OKLCH tokens, fluid type, print & motion rules
└── tests/
    ├── check-bundle-size.mjs       # Enforces <50 KB home JS & <30 KB signature island
    ├── portfolio.spec.ts           # 26 Playwright + Axe WCAG 2.2 AA & viewport tests
    └── serve-dist.mjs              # Zero-dependency static server for CI testing
```

---

## How to Add a Project Case Study

1. Create a new `.mdx` file in `src/content/projects/` (e.g., `src/content/projects/06-my-new-system.mdx`).
2. Populate the frontmatter matching the `projects` Zod schema in `src/content.config.ts`:

```mdx
---
title: "Distributed Vector Index & Real-Time Reranker"
shortTitle: "Vector Index & Reranker"
slug: "vector-index-reranker"
order: 6
featured: true
company: "eParts Services"
timeframe: "2026"
role: "Senior ML Engineer"
domain: "Search & Retrieval"
headlineMetric: "14 ms p99 · +19% NDCG@10"
summary: "One-paragraph executive summary of the production system and measurable outcome."
problem: "Why the legacy architecture failed under production load."
approachSummary: "How the new architecture solved the bottleneck."
constraints:
  - "Strict <20 ms p99 latency SLA across 26M vectors."
  - "Zero downtime during daily index compaction."
stack:
  - "Rust"
  - "Qdrant"
  - "ONNX Runtime"
  - "Python"
metrics:
  - value: "14 ms"
    label: "p99 Rerank Latency"
    detail: "INT8 quantized cross-encoder on CPU"
  - value: "+19%"
    label: "NDCG@10 Lift"
    detail: "Evaluated on 10K human-labeled queries"
diagramId: "search-26m"
retrospective:
  - title: "Quantize earlier in the pipeline"
    lesson: "Moving from FP16 to INT8 cut memory bandwidth 2x with <0.3% recall drop."
links:
  - label: "GitHub Repository"
    url: "https://github.com/harsha6107"
embedding:
  x: 24
  y: 26
  cluster: "search"
  vector: [0.95, 0.25, 0.30, 0.40]
---

## Context & Failure Modes

Write the deep-dive technical narrative, equations, benchmarks, and code blocks here...
```

3. Run `pnpm run build` — Astro automatically validates the schema, generates `/projects/vector-index-reranker/`, builds the OpenGraph card at `/og/projects/vector-index-reranker.png`, and plots the new node on the 2D UMAP Embedding Map and `⌘K` Command Palette.

---

## How to Add a Technical Essay

1. Create a new `.mdx` file in `src/content/writing/` (e.g., `src/content/writing/my-new-post.mdx`).
2. Add frontmatter matching the `writing` Zod schema in `src/content.config.ts`:

```mdx
---
title: "Designing Zero-Copy Feature Stores with Arrow Flight"
slug: "zero-copy-feature-stores-arrow-flight"
pubDate: 2026-04-01
readingTime: "7 min read"
category: "Data Systems"
summary: "How Arrow Flight eliminates serialization overhead for high-throughput online ML inference."
tags:
  - "Apache Arrow"
  - "Feature Store"
  - "Python"
relatedProject: "cdc-snowflake-pipeline"
embedding:
  x: 22
  y: 78
  cluster: "data"
  vector: [0.20, 0.15, 0.94, 0.30]
---

Write your MDX essay with Shiki-highlighted code blocks and LaTeX math...
```

---

## Local Development & Quality Gate Commands

```bash
# Install dependencies
pnpm install

# Start local development server (http://localhost:4321)
pnpm run dev

# 1. Lint & format check via Biome
pnpm run check

# 2. Typecheck + Static build + OpenGraph PNG generation
pnpm run build

# 3. Verify JS budget (< 50 KB home JS, < 30 KB lazy UMAP island)
node tests/check-bundle-size.mjs

# 4. Run Playwright E2E + Axe WCAG 2.2 AA accessibility & responsive tests (320px–2560px)
pnpm run test:e2e

# 5. Run Lighthouse CI mobile assertions (100/100 across all 4 categories)
pnpm run lhci
```

---

## Deployment (GitHub Pages)

This repository is configured as a root user site (`harsha6107.github.io`) with `site: 'https://harsha6107.github.io'` in [`astro.config.mjs`](astro.config.mjs).

Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
1. **Quality Gate Job (`quality-gates`)**: Runs Biome, Astro typecheck & build, JS bundle budget checks, Playwright + Axe WCAG 2.2 AA tests, and Lighthouse CI mobile 100/100 assertions, then uploads `./dist` as a Pages artifact.
2. **Deploy Job (`deploy`)**: Publishes the verified `./dist` artifact to GitHub Pages via `actions/deploy-pages@v4`.

To enable GitHub Actions deployment in repository settings:
- Navigate to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions** (or run `gh api -X PUT repos/harsha6107/harsha6107.github.io/pages -f build_type=workflow`).
