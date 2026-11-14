import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { getSiteData, getSortedProjects, getSortedWriting } from '../../utils/content';

const fontRegularPath = path.resolve(
  './node_modules/@fontsource/inter/files/inter-latin-400-normal.woff',
);
const fontBoldPath = path.resolve(
  './node_modules/@fontsource/inter/files/inter-latin-700-normal.woff',
);
const fontMonoPath = path.resolve(
  './node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff',
);

const interRegular = fs.readFileSync(fontRegularPath);
const interBold = fs.readFileSync(fontBoldPath);
const jetbrainsMono = fs.readFileSync(fontMonoPath);

export const getStaticPaths: GetStaticPaths = async () => {
  const site = await getSiteData();
  const projects = await getSortedProjects();
  const posts = await getSortedWriting();

  return [
    {
      params: { slug: 'default' },
      props: {
        eyebrow: `${site.name.toUpperCase()} // ${site.role.toUpperCase()}`,
        title: site.positioningHeadline,
        badge: '26M SKUs · 25/25 Eval · 436 CDC Tables · -95% Spend',
        footer: 'harsha6107.github.io',
      },
    },
    ...projects.map((p) => ({
      params: { slug: `projects/${p.data.slug}` },
      props: {
        eyebrow: `CASE STUDY // SYS.${p.data.index} · ${p.data.organization.toUpperCase()}`,
        title: p.data.title,
        badge: p.data.headlineMetric,
        footer: `${site.name} · ${p.data.role}`,
      },
    })),
    ...posts.map((post) => ({
      params: { slug: `writing/${post.data.slug}` },
      props: {
        eyebrow: `TECHNICAL ESSAY // ${post.data.category.toUpperCase()}`,
        title: post.data.title,
        badge: `${post.data.readingTime} · ${post.data.tags.slice(0, 3).join(' · ')}`,
        footer: `${site.name} · harsha6107.github.io`,
      },
    })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const { eyebrow, title, badge, footer } = props as {
    eyebrow: string;
    title: string;
    badge: string;
    footer: string;
  };

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          backgroundColor: '#0E1014',
          color: '#F3F2EE',
          fontFamily: 'Inter',
          border: '2px solid #252A34',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'JetBrains Mono',
                      fontSize: '20px',
                      color: '#F48C48',
                      letterSpacing: '0.06em',
                    },
                    children: eyebrow,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'JetBrains Mono',
                      fontSize: '18px',
                      padding: '8px 16px',
                      backgroundColor: '#2B1B12',
                      color: '#F8A773',
                      borderRadius: '999px',
                    },
                    children: badge,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: title.length > 75 ? '46px' : '54px',
                fontWeight: 700,
                lineHeight: 1.16,
                letterSpacing: '-0.03em',
                color: '#F3F2EE',
                maxWidth: '1040px',
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '28px',
                borderTop: '1px solid #252A34',
                fontFamily: 'JetBrains Mono',
                fontSize: '20px',
                color: '#9BA0AB',
              },
              children: [
                {
                  type: 'span',
                  props: { children: footer },
                },
                {
                  type: 'span',
                  props: {
                    style: { color: '#F48C48' },
                    children: 'SEARCH · RAG · MCP · CDC',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: interBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'JetBrains Mono',
          data: jetbrainsMono,
          weight: 600,
          style: 'normal',
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render().asPng();

  return new Response(new Uint8Array(pngData), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
