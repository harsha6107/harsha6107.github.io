/**
 * Tiered part-number matcher used by the home-page search demo.
 *
 * Mirrors the ranking idea from the catalog-search case study at toy scale:
 * exact → normalized (punctuation folded) → prefix → fuzzy (prefix edit
 * distance), then a keyword fallback on the product name. Ties inside a tier
 * break on popularity. Runs both at build time (SSR first paint) and in the
 * browser (lazy-loaded), so it must stay dependency-free.
 */

export type Tier = 'exact' | 'normalized' | 'prefix' | 'fuzzy' | 'text';

export interface SkuItem {
  sku: string;
  name: string;
  pop: number;
}

export interface Segment {
  text: string;
  hit: boolean;
}

export interface Hit {
  item: SkuItem;
  tier: Tier;
  segments: Segment[];
}

export interface SearchResult {
  query: string;
  normalized: string;
  hits: Hit[];
  total: number;
  counts: Record<Tier, number>;
  scanned: number;
}

export const TIERS: readonly Tier[] = ['exact', 'normalized', 'prefix', 'fuzzy', 'text'];

export const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Optimal string alignment distance (Levenshtein + adjacent transpositions). */
function osa(a: string, b: string): number {
  const cols = b.length + 1;
  const d = new Uint8Array((a.length + 1) * cols);
  const at = (i: number, j: number): number => d[i * cols + j] ?? 0;
  for (let i = 0; i <= a.length; i++) d[i * cols] = i;
  for (let j = 0; j <= b.length; j++) d[j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, at(i - 2, j - 2) + 1);
      }
      d[i * cols + j] = best;
    }
  }
  return at(a.length, b.length);
}

/** Edit budget grows with query length, like Elasticsearch AUTO fuzziness. */
const maxEdits = (length: number): number => (length < 4 ? 0 : length < 8 ? 1 : 2);

/** Distance between the query and the best-aligned prefix of the SKU. */
function prefixDistance(nq: string, ns: string): number {
  let best = Number.POSITIVE_INFINITY;
  for (let len = nq.length - 1; len <= nq.length + 1; len++) {
    if (len < 1 || len > ns.length) continue;
    best = Math.min(best, osa(nq, ns.slice(0, len)));
  }
  return best;
}

/** Mark the first `count` alphanumeric characters of the SKU as matched. */
function highlight(sku: string, count: number): Segment[] {
  const segments: Segment[] = [];
  let consumed = 0;
  for (const char of sku) {
    const isAlnum = /[a-z0-9]/i.test(char);
    const hit = isAlnum && consumed < count;
    if (isAlnum) consumed++;
    const last = segments[segments.length - 1];
    if (last && last.hit === hit) last.text += char;
    else segments.push({ text: char, hit });
  }
  return segments;
}

export function searchSkus(items: readonly SkuItem[], raw: string, limit = 6): SearchResult {
  const query = raw.trim();
  const nq = normalize(query);
  const counts: Record<Tier, number> = { exact: 0, normalized: 0, prefix: 0, fuzzy: 0, text: 0 };
  if (!nq) {
    return { query, normalized: '', hits: [], total: 0, counts, scanned: items.length };
  }

  const lowered = query.toLowerCase();
  const tokens = lowered.split(/\s+/).filter((token) => token.length >= 3);
  const budget = maxEdits(nq.length);
  const matches: Hit[] = [];

  for (const item of items) {
    const sku = item.sku.toLowerCase();
    const ns = normalize(item.sku);
    let tier: Tier | null = null;
    let matched = 0;

    if (sku === lowered) {
      tier = 'exact';
      matched = ns.length;
    } else if (ns === nq) {
      tier = 'normalized';
      matched = ns.length;
    } else if (nq.length >= 2 && ns.startsWith(nq)) {
      tier = 'prefix';
      matched = nq.length;
    } else if (budget > 0 && prefixDistance(nq, ns) <= budget) {
      tier = 'fuzzy';
      matched = Math.min(nq.length, ns.length);
    } else if (tokens.length > 0) {
      const name = item.name.toLowerCase();
      if (tokens.every((token) => name.includes(token))) tier = 'text';
    }

    if (tier) {
      counts[tier]++;
      matches.push({
        item,
        tier,
        segments: tier === 'text' ? [{ text: item.sku, hit: false }] : highlight(item.sku, matched),
      });
    }
  }

  matches.sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || b.item.pop - a.item.pop);

  return {
    query,
    normalized: nq,
    hits: matches.slice(0, limit),
    total: matches.length,
    counts,
    scanned: items.length,
  };
}
