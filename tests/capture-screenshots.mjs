import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from '@playwright/test';

process.env.NO_PROXY = 'localhost,127.0.0.1';
process.env.no_proxy = 'localhost,127.0.0.1';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./screenshots', process.argv[2] || 'pass-1');
fs.mkdirSync(outDir, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0] || '/');
  let filePath = path.join(distDir, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
    filePath = `${filePath}.html`;
  } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || !filePath.startsWith(distDir)) {
    const notFound = path.join(distDir, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

const PAGES = [
  { name: 'home', route: '/' },
  { name: 'projects', route: '/projects' },
  { name: 'case-study-search', route: '/projects/catalog-search-26m' },
  { name: 'case-study-mcp', route: '/projects/agentic-ai-mcp-platform' },
  { name: 'writing', route: '/writing' },
  { name: 'essay-search', route: '/writing/part-number-search-at-26m-scale' },
  { name: 'about', route: '/about' },
  { name: 'resume', route: '/resume' },
  { name: '404', route: '/404.html' },
];

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

const THEMES = ['dark', 'light'];

server.listen(4329, '127.0.0.1', async () => {
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-proxy-server'],
  });

  try {
    for (const theme of THEMES) {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: vp,
          colorScheme: theme,
        });
        await context.addInitScript((t) => {
          localStorage.setItem('theme', t);
        }, theme);
        const page = await context.newPage();

        for (const pg of PAGES) {
          await page.goto(`http://127.0.0.1:4329${pg.route}`, {
            waitUntil: 'networkidle',
          });
          // Scroll down and back up to trigger lazy-loaded EmbeddingMap on home
          if (pg.name === 'home') {
            await page.evaluate(() => window.scrollTo(0, 1400));
            await page.waitForTimeout(250);
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(100);
          }
          const filename = `${pg.name}-${vp.width}w-${theme}.png`;
          await page.screenshot({
            path: path.join(outDir, filename),
            fullPage: true,
          });
        }
        await context.close();
      }
    }
    console.log(`Captured ${PAGES.length * VIEWPORTS.length * THEMES.length} screenshots in ${outDir}`);
  } finally {
    await browser.close();
    server.close();
  }
});
