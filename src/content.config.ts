import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    slug: z.string(),
    index: z.string(),
    organization: z.string(),
    period: z.string(),
    role: z.string(),
    featured: z.boolean().default(true),
    order: z.number(),
    headlineMetric: z.string(),
    summary: z.string(),
    problem: z.string(),
    constraints: z.array(z.string()),
    approachSummary: z.string(),
    metrics: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        detail: z.string(),
      }),
    ),
    stack: z.array(z.string()),
    diagramId: z.enum(['catalog-search', 'agentic-mcp', 'cdc-snowflake', 'rag-etim', 'iot-asr']),
    diagramTitle: z.string(),
    diagramCaption: z.string(),
    retrospective: z.array(
      z.object({
        title: z.string(),
        detail: z.string(),
      }),
    ),
    links: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
      }),
    ),
    embedding: z.object({
      x: z.number(),
      y: z.number(),
      cluster: z.enum(['search', 'agents', 'data', 'ml']),
      vector: z.array(z.number()),
    }),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    pubDate: z.coerce.date(),
    readingTime: z.string(),
    category: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(true),
    order: z.number(),
    embedding: z.object({
      x: z.number(),
      y: z.number(),
      cluster: z.enum(['search', 'agents', 'data', 'ml']),
      vector: z.array(z.number()),
    }),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/site' }),
  schema: z.object({
    name: z.string(),
    monogram: z.string(),
    role: z.string(),
    tagline: z.string(),
    positioningHeadline: z.string(),
    positioningSubhead: z.string(),
    location: z.string(),
    availability: z.string(),
    email: z.string(),
    phone: z.string(),
    links: z.object({
      github: z.string(),
      linkedin: z.string(),
      website: z.string(),
      resumePdf: z.string(),
    }),
    nav: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
      }),
    ),
    heroStats: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        context: z.string(),
      }),
    ),
    aboutShort: z.array(z.string()),
    aboutExtended: z.array(z.string()),
    engineeringPrinciples: z.array(
      z.object({
        index: z.string(),
        title: z.string(),
        body: z.string(),
      }),
    ),
    skillGroups: z.array(
      z.object({
        category: z.string(),
        code: z.string(),
        items: z.array(z.string()),
      }),
    ),
    skillNodes: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        cluster: z.enum(['search', 'agents', 'data', 'ml']),
        x: z.number(),
        y: z.number(),
        vector: z.array(z.number()),
        detail: z.string(),
        relatedProjectSlug: z.string(),
      }),
    ),
    experience: z.array(
      z.object({
        company: z.string(),
        product: z.string().optional(),
        role: z.string(),
        period: z.string(),
        location: z.string(),
        summary: z.string(),
        highlights: z.array(
          z.object({
            domain: z.string(),
            metric: z.string(),
            text: z.string(),
          }),
        ),
        stack: z.array(z.string()),
      }),
    ),
    education: z.array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        period: z.string(),
        location: z.string(),
        gpa: z.string().optional(),
        notes: z.string(),
      }),
    ),
    leadership: z.array(
      z.object({
        role: z.string(),
        organization: z.string(),
        period: z.string(),
        details: z.string(),
      }),
    ),
    ui: z.object({
      skipToContent: z.string(),
      commandPaletteLabel: z.string(),
      commandPalettePlaceholder: z.string(),
      themeToggleLabel: z.string(),
      copyEmailLabel: z.string(),
      copiedEmailFeedback: z.string(),
      selectedWorkIndex: z.string(),
      selectedWorkTitle: z.string(),
      selectedWorkSub: z.string(),
      viewAllProjects: z.string(),
      readCaseStudy: z.string(),
      latentSpaceIndex: z.string(),
      latentSpaceTitle: z.string(),
      latentSpaceSub: z.string(),
      writingIndex: z.string(),
      writingTitle: z.string(),
      writingSub: z.string(),
      viewAllWriting: z.string(),
      aboutIndex: z.string(),
      aboutTitle: z.string(),
      contactIndex: z.string(),
      contactTitle: z.string(),
      contactSub: z.string(),
      footerColophon: z.string(),
      notFoundCode: z.string(),
      notFoundTitle: z.string(),
      notFoundBody: z.string(),
      notFoundCta: z.string(),
    }),
  }),
});

export const collections = { projects, writing, site };
