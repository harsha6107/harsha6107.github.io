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
const fontPixelPath = path.resolve(
  './node_modules/@fontsource/silkscreen/files/silkscreen-latin-700-normal.woff',
);
const fontMonoPath = path.resolve(
  './node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff',
);

const interRegular = fs.readFileSync(fontRegularPath);
const interBold = fs.readFileSync(fontBoldPath);
const silkscreenBold = fs.readFileSync(fontPixelPath);
const jetbrainsMono = fs.readFileSync(fontMonoPath);

export const getStaticPaths: GetStaticPaths = async () => {
  const site = await getSiteData();
  const projects = await getSortedProjects();
  const posts = await getSortedWriting();

  return [
    {
      params: { slug: 'default' },
      props: {
        eyebrow: `P1 // ${site.name.toUpperCase()}`,
        title: site.positioningHeadline,
        badge: '26M SKUs | 25/25 Eval | -95% Spend',
        footer: 'harsha6107.github.io',
      },
    },
    ...projects.map((p) => ({
      params: { slug: `projects/${p.data.slug}` },
      props: {
        eyebrow: `WORLD STAGE ${p.data.index} // ${p.data.organization.toUpperCase()}`,
        title: p.data.title,
        badge: p.data.headlineMetric,
        footer: `${site.name} | ${p.data.role}`,
      },
    })),
    ...posts.map((post) => ({
      params: { slug: `writing/${post.data.slug}` },
      props: {
        eyebrow: `STRATEGY SCROLL // ${post.data.category.toUpperCase()}`,
        title: post.data.title,
        badge: `${post.data.readingTime} | ${post.data.tags.slice(0, 2).join(' + ')}`,
        footer: `${site.name} | harsha6107.github.io`,
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
          boxSizing: 'border-box',
          display: 'flex',
          padding: '14px 8px 8px 8px',
          backgroundColor: '#FFD23F',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                width: '1184px',
                height: '608px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '40px 48px',
                backgroundColor: '#0B0E1A',
                color: '#F6F4EB',
                fontFamily: 'Inter',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '24px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'Silkscreen',
                            fontSize: '18px',
                            color: '#FFD23F',
                            letterSpacing: '0.03em',
                          },
                          children: `> ${eyebrow}`,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'JetBrains Mono',
                            fontSize: '16px',
                            padding: '8px 14px',
                            backgroundColor: '#19213B',
                            color: '#52EB94',
                            border: '2px solid #46578C',
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
                      fontSize: title.length > 80 ? '42px' : '50px',
                      fontWeight: 700,
                      lineHeight: 1.16,
                      letterSpacing: '-0.025em',
                      color: '#F6F4EB',
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
                      paddingTop: '22px',
                      borderTop: '3px solid #283358',
                      fontFamily: 'Silkscreen',
                      fontSize: '16px',
                      color: '#9AA7C7',
                    },
                    children: [
                      {
                        type: 'span',
                        props: { children: footer },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { color: '#FFD23F' },
                          children: '1UP // SEARCH + AI + MCP + CDC',
                        },
                      },
                    ],
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
          name: 'Silkscreen',
          data: silkscreenBold,
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
