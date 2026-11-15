import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('./dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const lazyIslandPath = path.join(distDir, 'scripts', 'embedding-map.js');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('Missing dist/index.html — run pnpm build first.');
  process.exit(1);
}

const html = fs.readFileSync(indexHtmlPath, 'utf8');

// Extract inline executable scripts (excluding application/ld+json)
const scriptRegex = /<script(?![^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi;
let inlineBytes = 0;
for (const match of html.matchAll(scriptRegex)) {
  inlineBytes += Buffer.byteLength(match[1] ?? '', 'utf8');
}

const astroDir = path.join(distDir, '_astro');
const astroJsBytes = fs.existsSync(astroDir)
  ? fs
      .readdirSync(astroDir)
      .filter((f) => f.endsWith('.js'))
      .reduce((sum, f) => sum + fs.statSync(path.join(astroDir, f)).size, 0)
  : 0;
const totalHomeBytes = inlineBytes + astroJsBytes;

const lazyIslandBytes = fs.existsSync(lazyIslandPath) ? fs.statSync(lazyIslandPath).size : 0;

const MAX_HOME_JS_BYTES = 50 * 1024; // 50 KB
const MAX_ISLAND_BYTES = 30 * 1024; // 30 KB

console.log(
  `Home page JS: ${(totalHomeBytes / 1024).toFixed(2)} KB (${(inlineBytes / 1024).toFixed(2)} KB inline + ${(astroJsBytes / 1024).toFixed(2)} KB chunks; limit: 50.00 KB)`,
);
console.log(
  `Lazy-loaded Embedding Map island: ${(lazyIslandBytes / 1024).toFixed(2)} KB (limit: 30.00 KB)`,
);

if (totalHomeBytes > MAX_HOME_JS_BYTES) {
  console.error(`FAIL: Home page JS (${totalHomeBytes} B) exceeds 50 KB limit.`);
  process.exit(1);
}

if (lazyIslandBytes > MAX_ISLAND_BYTES) {
  console.error(`FAIL: Signature island (${lazyIslandBytes} B) exceeds 30 KB limit.`);
  process.exit(1);
}

console.log('PASS: All JS bundle budgets satisfied.');
