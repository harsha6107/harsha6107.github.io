/**
 * Lazy-loaded 2D UMAP Embedding Space Explorer (< 4 KB minified)
 * Computes real cosine similarity across 4D semantic vectors, renders k-NN (k=3)
 * tether lines in SVG, updates the telemetry inspector, and filters clusters.
 */
export function initEmbeddingMap(root) {
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';

  const rawPoints = root.getAttribute('data-points');
  if (!rawPoints) return;

  const points = JSON.parse(rawPoints);
  const byId = new Map(points.map((p) => [p.id, p]));

  const svgEl = root.querySelector('.embedding-svg');
  const edgesLayer = root.querySelector('#knn-edges-layer');
  const titleEl = root.querySelector('#emb-title');
  const kindEl = root.querySelector('#emb-kind-badge');
  const metricEl = root.querySelector('#emb-metric');
  const summaryEl = root.querySelector('#emb-summary');
  const vectorEl = root.querySelector('#emb-vector');
  const neighborsEl = root.querySelector('#emb-neighbors');
  const ctaEl = root.querySelector('#emb-cta');
  const nodeGroups = Array.from(root.querySelectorAll('.umap-node-group'));
  const groupById = new Map(
    nodeGroups.map((g) => [g.getAttribute('data-node-id'), g]),
  );
  const filterBtns = Array.from(
    document.querySelectorAll('[data-cluster-filter]'),
  );

  function cosineSimilarity(a, b) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }

  function selectNode(nodeId) {
    const active = byId.get(nodeId);
    if (!active) return;

    const scored = points
      .filter((p) => p.id !== active.id)
      .map((p) => ({
        point: p,
        sim: cosineSimilarity(active.vector, p.vector),
      }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3);

    const neighborIds = new Set(scored.map((s) => s.point.id));
    for (const group of nodeGroups) {
      const gid = group.getAttribute('data-node-id');
      group.setAttribute(
        'data-selected',
        gid === active.id ? 'true' : 'false',
      );
      group.setAttribute(
        'data-unrelated',
        gid !== active.id && !neighborIds.has(gid) ? 'true' : 'false',
      );
    }

    if (titleEl) titleEl.textContent = active.label;
    if (kindEl) kindEl.textContent = active.kind.toUpperCase();
    if (metricEl) metricEl.textContent = active.metricBadge;
    if (summaryEl) summaryEl.textContent = active.summary;
    if (vectorEl) {
      vectorEl.textContent = `[${active.vector.map((v) => v.toFixed(2)).join(', ')}]`;
    }
    if (ctaEl) {
      ctaEl.setAttribute('href', active.href);
      const span = ctaEl.querySelector('span');
      if (span) {
        span.textContent =
          active.kind === 'essay'
            ? 'Read Technical Essay'
            : 'Open Case Study Specification';
      }
    }

    if (neighborsEl) {
      neighborsEl.innerHTML = scored
        .map(
          ({ point, sim }) =>
            `<li data-neighbor-id="${point.id}"><a href="${point.href}" style="text-decoration:none;font-weight:600;">${point.label}</a><span style="color:var(--accent);">cos θ = ${sim.toFixed(3)}</span></li>`,
        )
        .join('');
    }

    if (edgesLayer) {
      const x1 = Math.round(active.x * 10);
      const y1 = Math.round(active.y * 5.4);
      edgesLayer.innerHTML = scored
        .map(({ point, sim }) => {
          const x2 = Math.round(point.x * 10);
          const y2 = Math.round(point.y * 5.4);
          const mx = Math.round((x1 + x2) / 2);
          const my = Math.round((y1 + y2) / 2) - 6;
          return `<g>
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--accent)" stroke-width="1.75" stroke-dasharray="4 3" />
            <text x="${mx}" y="${my}" fill="var(--accent)" font-size="9.5" class="mono" text-anchor="middle">${sim.toFixed(2)}</text>
          </g>`;
        })
        .join('');
    }
  }

  if (svgEl) {
    svgEl.addEventListener(
      'pointerenter',
      () => svgEl.setAttribute('data-hovering', 'true'),
      { passive: true },
    );
    svgEl.addEventListener(
      'pointerleave',
      () => svgEl.removeAttribute('data-hovering'),
      { passive: true },
    );
  }

  if (neighborsEl) {
    neighborsEl.addEventListener(
      'pointerover',
      (e) => {
        const li = e.target.closest('li[data-neighbor-id]');
        for (const g of nodeGroups) g.removeAttribute('data-highlighted');
        if (li) {
          const g = groupById.get(li.getAttribute('data-neighbor-id'));
          if (g) g.setAttribute('data-highlighted', 'true');
        }
      },
      { passive: true },
    );
    neighborsEl.addEventListener(
      'pointerleave',
      () => {
        for (const g of nodeGroups) g.removeAttribute('data-highlighted');
      },
      { passive: true },
    );
  }

  for (const group of nodeGroups) {
    const id = group.getAttribute('data-node-id');
    const link = group.querySelector('[data-node-trigger]');
    if (!id || !link) continue;

    link.addEventListener('pointerenter', () => selectNode(id), {
      passive: true,
    });
    link.addEventListener('focus', () => selectNode(id), { passive: true });
  }

  for (const btn of filterBtns) {
    btn.addEventListener('click', () => {
      const cluster = btn.getAttribute('data-cluster-filter') || 'all';
      for (const b of filterBtns) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      }
      for (const group of nodeGroups) {
        const nodeCluster = group.getAttribute('data-cluster');
        const dimmed = cluster !== 'all' && nodeCluster !== cluster;
        group.setAttribute('data-dimmed', dimmed ? 'true' : 'false');
      }
    });
  }

  const focusedLink = root.querySelector('[data-node-trigger]:focus');
  const initialId = focusedLink
    ? focusedLink.getAttribute('data-node-trigger')
    : points[0]?.id;
  if (initialId) {
    selectNode(initialId);
  }
}
