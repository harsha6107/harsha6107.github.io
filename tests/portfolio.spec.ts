import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/',
  '/projects',
  '/projects/catalog-search-26m',
  '/projects/agentic-ai-mcp-platform',
  '/writing',
  '/writing/part-number-search-at-26m-scale',
  '/about',
  '/resume',
  '/404.html',
];

test.describe('WCAG 2.2 AA Accessibility & Theme Contrast Suite', () => {
  for (const route of ROUTES) {
    for (const theme of ['dark', 'light'] as const) {
      test(`${route} has zero Axe WCAG 2.2 AA violations in ${theme} mode`, async ({ page }) => {
        await page.addInitScript((t) => {
          localStorage.setItem('theme', t);
        }, theme);
        await page.goto(route, { waitUntil: 'networkidle' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();

        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe('Responsive Viewport Integrity (320px to 2560px)', () => {
  const WIDTHS = [320, 375, 768, 1440, 2560];
  for (const width of WIDTHS) {
    test(`Home and Case Study have zero horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/projects/catalog-search-26m', '/about', '/resume']) {
        await page.goto(route, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(overflow, `Overflow detected on ${route} at ${width}px`).toBe(false);
      }
    });
  }
});

test.describe('Interactive Features: Theme Toggle, Command Palette & Embedding Map', () => {
  test('Theme toggle switches between dark and light mode cleanly', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const initial = await html.getAttribute('data-theme');
    await page.locator('#theme-toggle').click();
    const next = initial === 'dark' ? 'light' : 'dark';
    await expect(html).toHaveAttribute('data-theme', next);
  });

  test('Command Palette opens via button and filters items with keyboard navigation', async ({
    page,
  }) => {
    await page.goto('/');
    const dialog = page.locator('#cmd-palette');
    await expect(dialog).not.toBeVisible();

    await page.locator('#cmd-trigger').click();
    await expect(dialog).toBeVisible();

    const input = page.locator('#cmd-input');
    await input.fill('Snowflake');
    const visibleOptions = page.locator('[data-cmd-item]:not([hidden])');
    await expect(visibleOptions.first()).toContainText('CDC');

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('2D Embedding Map lazy-loads and computes cosine nearest neighbors on focus', async ({
    page,
  }) => {
    await page.goto('/');
    const explorer = page.locator('[data-embedding-explorer]');
    await explorer.scrollIntoViewIfNeeded();
    await expect(explorer).toHaveAttribute('data-initialized', 'true');

    const mcpNode = page.locator('[data-node-trigger="proj-agentic-ai-mcp-platform"]');
    await mcpNode.focus();

    await expect(page.locator('#emb-title')).toContainText('Agentic AI');
    await expect(page.locator('#emb-neighbors')).toContainText('cos θ =');
    await expect(page.locator('#ow-player-walker')).toHaveAttribute(
      'style',
      /translate\(620px,\s*130px\)/,
    );
  });

  test('Search demo matches typos via the Fuzzy tier and updates live status', async ({ page }) => {
    await page.goto('/');
    const demo = page.locator('[data-search-demo]');
    await demo.scrollIntoViewIfNeeded();
    await expect(demo).toHaveAttribute('data-initialized', 'true');

    const input = page.locator('[data-sd-input]');
    await input.fill('6240-2rs');
    const firstRow = page.locator('[data-sd-results] .sd-row').first();
    await expect(firstRow).toHaveAttribute('data-tier', 'fuzzy');
    await expect(firstRow).toContainText('6204-2RS/C3');
    await expect(page.locator('[data-sd-corridor]')).toHaveAttribute('style', /--pac-pct:\s*70%/);
  });

  test('Recruiter / Engineer toggle folds and unfolds the case-study deep dive', async ({
    page,
  }) => {
    await page.goto('/projects/catalog-search-26m');
    const deepDive = page.locator('#deep-dive');
    await expect(deepDive).toBeVisible();

    await page.locator('[data-audience-set="recruiter"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-audience', 'recruiter');
    await expect(deepDive).toBeHidden();

    await page.locator('[data-deep-dive-open]').click();
    await expect(page.locator('html')).toHaveAttribute('data-audience', 'engineer');
    await expect(deepDive).toBeVisible();
  });

  test('Pressing ? opens the keyboard shortcuts sheet', async ({ page }) => {
    await page.goto('/');
    const dialog = page.locator('#shortcuts-dialog');
    await expect(dialog).toBeHidden();
    await page.keyboard.press('?');
    await expect(dialog).toBeVisible();
  });

  test('Super Mario [?] Mystery Block dispenses secrets, coins, and unlocks Explorer Relic', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('[data-coin-counter]')).toHaveText('00');
    await page.locator('[data-mystery-block]').click();
    await expect(page.locator('[data-coin-counter]')).toHaveText('01');
    await expect(page.locator('[data-mystery-fact]')).toContainText('SECRET #1');
    await expect(page.locator('[data-relic-count]')).toHaveText('1/5');

    await page.locator('#quest-trigger').click();
    await expect(page.locator('#quest-dialog')).toBeVisible();
    await expect(page.locator('[data-quest-relic="coin"]')).toHaveAttribute('data-unlocked', '');
  });

  test('Tetris Capability Matrix inspects polyomino domains and hard-drops the I-piece', async ({
    page,
  }) => {
    await page.goto('/');
    const widget = page.locator('[data-tetris-widget]');
    await widget.scrollIntoViewIfNeeded();

    await widget.locator('[data-piece-btn="J"]').click();
    await expect(widget.locator('[data-t-title]')).toContainText('Snowflake CDC');

    await widget.locator('[data-tetris-drop]').click();
    await expect(widget).toHaveAttribute('data-dropped', 'true');
    await expect(page.locator('[data-tetris-lines]')).toHaveText('0440');
  });

  test('Konami Code (↑↑↓↓←→←→BA) unlocks secret Triforce achievement', async ({ page }) => {
    await page.goto('/');
    const keys = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    for (const k of keys) {
      await page.keyboard.press(k);
    }
    await expect(page.locator('#copy-toast')).toContainText('KONAMI CODE');
    await expect(page.locator('[data-relic-count]')).toHaveText('1/5');
  });
});
