const fs = require('node:fs');

const systemChromium = ['/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) =>
  fs.existsSync(p),
);

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        'http://localhost/index.html',
        'http://localhost/projects/catalog-search-26m/index.html',
      ],
      numberOfRuns: 2,
      chromePath: process.env.CHROME_PATH || systemChromium,
      settings: {
        chromeFlags:
          '--no-sandbox --headless --disable-gpu --disable-dev-shm-usage --no-proxy-server',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 1.0 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 1.0 }],
        'categories:seo': ['error', { minScore: 1.0 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.02 }],
      },
    },
  },
};
