import { getCollection, getEntry } from 'astro:content';

export async function getSiteData() {
  const entry = await getEntry('site', 'main');
  if (!entry) {
    throw new Error('Missing src/content/site/main.json');
  }
  return entry.data;
}

export async function getSortedProjects() {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getSortedWriting() {
  const all = await getCollection('writing');
  return all.sort((a, b) => a.data.order - b.data.order);
}
