import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getSiteData, getSortedWriting } from '../utils/content';

export async function GET(context: APIContext) {
  const site = await getSiteData();
  const posts = await getSortedWriting();

  return rss({
    title: `${site.name} — Technical Writing & Architecture Essays`,
    description: site.positioningHeadline,
    site: context.site ?? site.links.website,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.summary,
      categories: post.data.tags,
      link: `/writing/${post.data.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
