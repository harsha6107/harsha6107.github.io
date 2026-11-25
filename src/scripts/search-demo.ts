import { type SearchResult, type SkuItem, searchSkus, TIERS, type Tier } from '../utils/sku-search';

interface DemoConfig {
  items: SkuItem[];
  tiers: Record<Tier, string>;
  idleText: string;
  emptyText: string;
  hitsLabel: string;
  scannedLabel: string;
  popLabel: string;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** Wire up the server-rendered Pac-Search Maze console. Mirrors SearchDemo.astro. */
export function initSearchDemo(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('[data-sd-input]');
  const list = root.querySelector<HTMLOListElement>('[data-sd-results]');
  const status = root.querySelector<HTMLElement>('[data-sd-status]');
  const latency = root.querySelector<HTMLElement>('[data-sd-latency]');
  const normalized = root.querySelector<HTMLElement>('[data-sd-normalized]');
  const total = root.querySelector<HTMLElement>('[data-sd-total]');
  const winnerBadge = root.querySelector<HTMLElement>('[data-sd-winner-badge]');
  const corridor = root.querySelector<HTMLElement>('[data-sd-corridor]');
  const ptsBadge = root.querySelector<HTMLElement>('[data-sd-pts]');
  if (!input || !list || !status || !latency || !normalized || !total) return;

  const TIER_PCT: Record<Tier, number> = {
    exact: 10,
    normalized: 30,
    prefix: 50,
    fuzzy: 70,
    text: 86,
  };
  const TIER_PTS: Record<Tier, string> = {
    exact: '+800',
    normalized: '+400',
    prefix: '+200',
    fuzzy: '+200',
    text: '+100',
  };

  let cached: DemoConfig | null = null;
  const getConfig = (): DemoConfig => {
    if (!cached) cached = JSON.parse(root.dataset.config ?? '{}') as DemoConfig;
    return cached;
  };

  const renderRows = (result: SearchResult, config: DemoConfig): void => {
    const frag = document.createDocumentFragment();
    result.hits.forEach((hit, idx) => {
      const li = document.createElement('li');
      li.className = 'sd-row';
      li.dataset.tier = hit.tier;
      li.dataset.sku = hit.item.sku;

      const rank = document.createElement('span');
      rank.className = 'sd-rank pixel';
      rank.textContent = pad(idx + 1);

      const tier = document.createElement('span');
      tier.className = 'sd-tier';
      tier.textContent = config.tiers[hit.tier];

      const sku = document.createElement('span');
      sku.className = 'sd-sku';
      for (const seg of hit.segments) {
        if (seg.hit) {
          const mark = document.createElement('mark');
          mark.textContent = seg.text;
          sku.append(mark);
        } else {
          sku.append(seg.text);
        }
      }

      const pop = document.createElement('span');
      pop.className = 'sd-pop';
      pop.textContent = `${config.popLabel} ${hit.item.pop}`;

      const name = document.createElement('span');
      name.className = 'sd-name';
      name.textContent = hit.item.name;

      li.append(rank, tier, sku, pop, name);
      frag.append(li);
    });
    list.replaceChildren(frag);
  };

  const renderFunnel = (result: SearchResult, topTier: Tier | null): void => {
    for (const tier of TIERS) {
      const cell = root.querySelector<HTMLElement>(`[data-sd-funnel="${tier}"]`);
      const count = cell?.querySelector<HTMLElement>('[data-sd-count]');
      if (!cell || !count) continue;
      const n = result.counts[tier];
      count.textContent = String(n);
      cell.toggleAttribute('data-active', n > 0);
      cell.toggleAttribute('data-winner', tier === topTier);
    }
  };

  const run = (): void => {
    const config = getConfig();
    const t0 = performance.now();
    const result = searchSkus(config.items, input.value);
    const ms = performance.now() - t0;

    const top = result.hits[0];
    renderRows(result, config);
    renderFunnel(result, top ? top.tier : null);
    latency.textContent = `${ms < 0.1 ? ms.toFixed(3) : ms.toFixed(2)} ms`;
    normalized.textContent = result.normalized ? `"${result.normalized}"` : '—';
    total.textContent = `${result.total} ${config.hitsLabel} · ${result.scanned} ${config.scannedLabel}`;

    if (winnerBadge) {
      winnerBadge.textContent = `TOP GATE: ${top ? config.tiers[top.tier].toUpperCase() : 'NO MATCH'}`;
    }
    if (corridor) {
      corridor.style.setProperty('--pac-pct', `${top ? TIER_PCT[top.tier] : 4}%`);
    }
    if (ptsBadge) {
      ptsBadge.textContent = top ? TIER_PTS[top.tier] : 'MISS';
    }
    root.querySelectorAll<HTMLButtonElement>('[data-sd-sample]').forEach((chip) => {
      chip.toggleAttribute('data-active', chip.dataset.sdSample === input.value.trim());
    });

    if (!result.normalized) status.textContent = config.idleText;
    else if (!top) status.textContent = config.emptyText;
    else
      status.textContent = `${result.total} ${config.hitsLabel}. #1 ${top.item.sku} (${config.tiers[top.tier]})`;
    root.toggleAttribute('data-empty', !!result.normalized && !top);
  };

  const onInteract = (): void => {
    root.setAttribute('data-interacted', '');
    run();
    window.dispatchEvent(new CustomEvent('relic:unlock', { detail: 'pacman' }));
  };

  input.addEventListener('input', onInteract);
  root.querySelectorAll<HTMLButtonElement>('[data-sd-sample]').forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.sdSample ?? '';
      onInteract();
      input.focus();
    });
  });

  const highlightFunnel = (tier: string | null): void => {
    for (const t of TIERS) {
      const cell = root.querySelector<HTMLElement>(`[data-sd-funnel="${t}"]`);
      cell?.toggleAttribute('data-highlight', t === tier);
    }
  };

  list.addEventListener('pointerover', (e) => {
    const row = (e.target as HTMLElement | null)?.closest<HTMLElement>('.sd-row');
    highlightFunnel(row?.dataset.tier ?? null);
  });
  list.addEventListener('pointerleave', () => highlightFunnel(null));
  list.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement | null)?.closest<HTMLElement>('.sd-row');
    if (row?.dataset.sku) {
      input.value = row.dataset.sku;
      onInteract();
    }
  });

  root.setAttribute('data-initialized', 'true');
}
