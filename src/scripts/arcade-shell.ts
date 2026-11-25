/**
 * Lightweight Arcade HUD, WebAudio 8-Bit Synth, Relics, Tetris & Shortcuts Controller
 * Bundled & minified as a deferred ES module for 0ms main-thread blocking (TBT = 0).
 */

interface PieceSpec {
  code: string;
  name: string;
  metric: string;
  summary: string;
  tags: string[];
  href: string;
}

const init = (): void => {
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const sfxBtn = document.getElementById('sfx-toggle');
  const sfxLabel = document.querySelector<HTMLElement>('[data-sfx-label]');
  const questBtn = document.getElementById('quest-trigger');
  const questDialog = document.getElementById('quest-dialog') as HTMLDialogElement | null;
  const relicCountEl = document.querySelector<HTMLElement>('[data-relic-count]');
  const toast = document.getElementById('copy-toast');
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  // --- 8-Bit WebAudio Micro-Synthesizer (Muted by default) ---
  let sfxOn = false;
  let audioCtx: AudioContext | null = null;
  try {
    sfxOn = localStorage.getItem('retro_sfx') === '1';
  } catch {}

  const syncSfxUi = (): void => {
    if (sfxBtn) sfxBtn.setAttribute('aria-pressed', String(sfxOn));
    if (sfxLabel) sfxLabel.textContent = sfxOn ? '♪ ON' : '♪ OFF';
  };
  syncSfxUi();

  const playSfx = (kind: 'coin' | 'tetris' | 'secret' | 'select'): void => {
    if (!sfxOn) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') void audioCtx.resume();
      const now = audioCtx.currentTime;
      const notes: [number, number, number][] =
        kind === 'coin'
          ? [
              [987.77, 0, 0.07],
              [1318.51, 0.07, 0.22],
            ]
          : kind === 'tetris'
            ? [
                [523.25, 0, 0.06],
                [659.25, 0.06, 0.06],
                [783.99, 0.12, 0.06],
                [1046.5, 0.18, 0.18],
              ]
            : kind === 'secret'
              ? [
                  [783.99, 0, 0.08],
                  [739.99, 0.08, 0.08],
                  [622.25, 0.16, 0.08],
                  [440.0, 0.24, 0.08],
                  [415.3, 0.32, 0.08],
                  [659.25, 0.4, 0.08],
                  [830.61, 0.48, 0.08],
                  [1046.5, 0.56, 0.2],
                ]
              : [[660, 0, 0.05]];

      for (const [freq, offset, dur] of notes) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.035, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + offset + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + dur + 0.01);
      }
    } catch {}
  };

  const showToast = (msg: string): void => {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2800);
  };

  const toggleSfx = (): void => {
    sfxOn = !sfxOn;
    try {
      localStorage.setItem('retro_sfx', sfxOn ? '1' : '0');
    } catch {}
    syncSfxUi();
    if (sfxOn) playSfx('coin');
    showToast(sfxOn ? '8-BIT SFX ENABLED' : '8-BIT SFX MUTED');
  };

  if (sfxBtn) sfxBtn.addEventListener('click', toggleSfx);

  // --- Collectible 5-Relic Explorer Tracker ---
  const RELIC_NAMES: Record<string, string> = {
    coin: 'MYSTERY ? COIN',
    pacman: 'PAC-SEARCH PELLET',
    overworld: 'OVERWORLD COMPASS',
    tetris: 'TETRIS LINE CLEAR',
    triforce: 'TRIFORCE OF WISDOM',
  };
  const relics = new Set<string>();
  try {
    const savedRelics: unknown = JSON.parse(localStorage.getItem('retro_relics') || '[]');
    if (Array.isArray(savedRelics)) {
      for (const r of savedRelics) {
        if (typeof r === 'string' && RELIC_NAMES[r]) relics.add(r);
      }
    }
  } catch {}

  const syncRelicsUi = (): void => {
    if (relicCountEl) relicCountEl.textContent = `${relics.size}/5`;
    document.querySelectorAll<HTMLElement>('[data-quest-relic]').forEach((row) => {
      const id = row.getAttribute('data-quest-relic');
      const unlocked = Boolean(id && relics.has(id));
      row.toggleAttribute('data-unlocked', unlocked);
      const stateEl = row.querySelector<HTMLElement>('[data-quest-state]');
      if (stateEl) stateEl.textContent = unlocked ? '★ FOUND' : 'LOCKED';
    });
  };

  const unlockRelic = (id: string, silent = false): void => {
    if (!RELIC_NAMES[id] || relics.has(id)) return;
    relics.add(id);
    try {
      localStorage.setItem('retro_relics', JSON.stringify(Array.from(relics)));
    } catch {}
    syncRelicsUi();
    if (!silent) {
      if (relics.size === 5) {
        playSfx('secret');
        showToast('★ ALL 5/5 RELICS FOUND — MASTER EXPLORER!');
      } else {
        playSfx('coin');
        showToast(`★ RELIC [${relics.size}/5]: ${RELIC_NAMES[id]}`);
      }
    }
  };

  window.addEventListener('relic:unlock', (e: Event) => {
    const ce = e as CustomEvent<string>;
    if (ce.detail) unlockRelic(ce.detail);
  });

  if (window.location.pathname.startsWith('/projects/') && window.location.pathname.length > 10) {
    unlockRelic('triforce', true);
  }
  syncRelicsUi();

  // --- Warp Whistle Command Palette (⌘K / Ctrl+K) ---
  const dialog = document.getElementById('cmd-palette') as HTMLDialogElement | null;
  const cmdTrigger = document.getElementById('cmd-trigger');
  const cmdClose = document.getElementById('cmd-close');
  const cmdInput = document.getElementById('cmd-input') as HTMLInputElement | null;
  const cmdItems = Array.from(document.querySelectorAll<HTMLElement>('[data-cmd-item]'));
  let activeIdx = 0;

  const visibleItems = (): HTMLElement[] => cmdItems.filter((el) => !el.hidden);

  const updateSelection = (newIdx: number): void => {
    const vis = visibleItems();
    if (vis.length === 0) return;
    activeIdx = ((newIdx % vis.length) + vis.length) % vis.length;
    for (const el of cmdItems) el.setAttribute('aria-selected', 'false');
    const current = vis[activeIdx];
    if (current) {
      current.setAttribute('aria-selected', 'true');
      current.scrollIntoView({ block: 'nearest' });
    }
  };

  const closePalette = (): void => {
    if (dialog?.open) dialog.close();
  };

  const filterPalette = (query: string): void => {
    const q = query.trim().toLowerCase();
    for (const item of cmdItems) {
      const hay = item.getAttribute('data-label') || '';
      item.hidden = q.length > 0 && !hay.includes(q);
    }
    updateSelection(0);
  };

  const openPalette = (): void => {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    if (!dialog.open) dialog.showModal();
    if (cmdInput) {
      cmdInput.value = '';
      filterPalette('');
      cmdInput.focus();
    }
  };

  const openQuest = (): void => {
    closePalette();
    if (questDialog && typeof questDialog.showModal === 'function' && !questDialog.open) {
      questDialog.showModal();
    }
  };

  if (questBtn) questBtn.addEventListener('click', openQuest);
  document.querySelectorAll('[data-close-quest]').forEach((b) => {
    b.addEventListener('click', () => questDialog?.close());
  });
  document.querySelectorAll('[data-quest-warp]').forEach((a) => {
    a.addEventListener('click', () => questDialog?.close());
  });
  if (questDialog) {
    questDialog.addEventListener('click', (e) => {
      if (e.target === questDialog) questDialog.close();
    });
  }

  // --- Theme Switcher ---
  const toggleTheme = (): void => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
    playSfx('select');
    showToast(next === 'dark' ? 'WORLD: MIDNIGHT ARCADE' : 'WORLD: FAMICOM MANUAL');
  };

  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const copyText = async (text: string, feedback?: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    playSfx('coin');
    showToast(feedback || `Copied ${text}`);
  };

  document.querySelectorAll<HTMLElement>('[data-copy-email]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-copy-email') || '';
      const fb = btn.getAttribute('data-copy-feedback') || `Copied ${email}`;
      void copyText(email, fb);
    });
  });

  // --- Super Mario [?] Mystery Block Dispenser ---
  const mysteryBtn = document.querySelector<HTMLElement>('[data-mystery-block]');
  const mysteryOut = document.querySelector<HTMLElement>('[data-mystery-fact]');
  const coinCountEl = document.querySelector<HTMLElement>('[data-coin-counter]');
  if (mysteryBtn && mysteryOut) {
    const facts = JSON.parse(mysteryBtn.getAttribute('data-facts') || '[]') as string[];
    let factIdx = 0;
    let coins = 0;
    mysteryBtn.addEventListener('click', () => {
      coins += 1;
      if (coinCountEl) coinCountEl.textContent = String(coins).padStart(2, '0');
      if (facts.length > 0) {
        mysteryOut.textContent = facts[factIdx % facts.length] ?? '';
        factIdx += 1;
      }
      mysteryBtn.setAttribute('data-bouncing', 'true');
      setTimeout(() => mysteryBtn.removeAttribute('data-bouncing'), 240);
      playSfx('coin');
      unlockRelic('coin');
    });
  }

  // --- Tetris Interlocking Capability Well Controller ---
  const tetrisRoot = document.querySelector<HTMLElement>('[data-tetris-widget]');
  if (tetrisRoot) {
    const pieces = JSON.parse(tetrisRoot.getAttribute('data-pieces') || '[]') as PieceSpec[];
    const byCode = new Map(pieces.map((p) => [p.code, p]));
    const badgeEl = tetrisRoot.querySelector<HTMLElement>('[data-t-badge]');
    const metricEl = tetrisRoot.querySelector<HTMLElement>('[data-t-metric]');
    const titleEl = tetrisRoot.querySelector<HTMLElement>('[data-t-title]');
    const summaryEl = tetrisRoot.querySelector<HTMLElement>('[data-t-summary]');
    const tagsEl = tetrisRoot.querySelector<HTMLElement>('[data-t-tags]');
    const linkEl = tetrisRoot.querySelector<HTMLElement>('[data-t-link]');
    const dropBtn = tetrisRoot.querySelector<HTMLElement>('[data-tetris-drop]');
    const dropLabel = tetrisRoot.querySelector<HTMLElement>('[data-tetris-drop-label]');
    const bannerEl = tetrisRoot.querySelector<HTMLElement>('[data-tetris-banner]');
    const linesEl = document.querySelector<HTMLElement>('[data-tetris-lines]');

    const selectPiece = (code: string | null): void => {
      if (!code) return;
      const spec = byCode.get(code);
      if (!spec) return;
      tetrisRoot.querySelectorAll<HTMLElement>('[data-t-cell]').forEach((c) => {
        c.toggleAttribute('data-selected', c.getAttribute('data-t-cell') === code);
      });
      tetrisRoot.querySelectorAll<HTMLElement>('[data-piece-btn]').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-piece-btn') === code));
      });
      if (badgeEl) badgeEl.textContent = `TETROMINO // ${code}-BLOCK`;
      if (metricEl) metricEl.textContent = spec.metric;
      if (titleEl) titleEl.textContent = spec.name;
      if (summaryEl) summaryEl.textContent = spec.summary;
      if (tagsEl) {
        tagsEl.innerHTML = spec.tags.map((t) => `<li class="tag">${t}</li>`).join('');
      }
      if (linkEl) linkEl.setAttribute('href', spec.href);
      playSfx('select');
    };

    tetrisRoot.querySelectorAll<HTMLElement>('[data-t-cell]').forEach((c) => {
      c.addEventListener('click', () => selectPiece(c.getAttribute('data-t-cell')));
    });
    tetrisRoot.querySelectorAll<HTMLElement>('[data-piece-btn]').forEach((b) => {
      b.addEventListener('click', () => selectPiece(b.getAttribute('data-piece-btn')));
    });

    if (dropBtn) {
      dropBtn.addEventListener('click', () => {
        const dropped = tetrisRoot.getAttribute('data-dropped') === 'true';
        if (!dropped) {
          tetrisRoot.setAttribute('data-dropped', 'true');
          tetrisRoot.setAttribute('data-flash', 'true');
          setTimeout(() => tetrisRoot.removeAttribute('data-flash'), 360);
          tetrisRoot.querySelectorAll<HTMLElement>('[data-gap]').forEach((g) => {
            g.innerHTML = '<span class="pixel">I</span>';
          });
          if (bannerEl) bannerEl.textContent = '★ TETRIS! ZERO-GAP PIPELINE LOCKED';
          if (dropLabel) dropLabel.textContent = '↺ RESET MATRIX WELL';
          if (linesEl) linesEl.textContent = '0440';
          playSfx('tetris');
          unlockRelic('tetris');
        } else {
          tetrisRoot.removeAttribute('data-dropped');
          tetrisRoot.querySelectorAll<HTMLElement>('[data-gap]').forEach((g) => {
            g.innerHTML = '<span class="pixel">·</span>';
          });
          if (bannerEl) bannerEl.textContent = 'READY: 4-CELL GAP DETECTED';
          if (dropLabel) dropLabel.textContent = '▼ HARD DROP I-PIECE';
          if (linesEl) linesEl.textContent = '0436';
        }
      });
    }
  }

  // --- Telemetry Counter Scrub on Hover & First Scroll ---
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrubCounter = (el: HTMLElement): void => {
    if (reducedMotion || el.dataset.animating === '1') return;
    const raw = el.getAttribute('data-count-value') || el.textContent || '';
    const m = raw.match(/^([^0-9]*)(\d+)(.*)$/);
    if (!m) return;
    const prefix = m[1] || '';
    const target = Number.parseInt(m[2] || '0', 10);
    const suffix = m[3] || '';
    if (!Number.isFinite(target) || target <= 0) return;
    el.dataset.animating = '1';
    const t0 = performance.now();
    const dur = 320;
    const step = (now: number): void => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - p) ** 3;
      const val = Math.round(target * eased);
      el.textContent = `${prefix}${val}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
      else {
        el.textContent = raw;
        el.dataset.animating = '0';
      }
    };
    requestAnimationFrame(step);
  };

  document.querySelectorAll<HTMLElement>('.telemetry-cell').forEach((cell) => {
    const valEl = cell.querySelector<HTMLElement>('[data-count-value]');
    if (valEl) {
      cell.addEventListener('pointerenter', () => scrubCounter(valEl), { passive: true });
    }
  });
  window.addEventListener(
    'scroll',
    () => {
      document.querySelectorAll<HTMLElement>('[data-count-value]').forEach((el) => {
        scrubCounter(el);
      });
    },
    { once: true, passive: true },
  );

  const shortcuts = document.getElementById('shortcuts-dialog') as HTMLDialogElement | null;
  const body = document.body;
  const email = body.getAttribute('data-email') || '';
  const emailFeedback = body.getAttribute('data-email-feedback') || `Copied ${email}`;

  const openShortcuts = (): void => {
    closePalette();
    if (shortcuts && typeof shortcuts.showModal === 'function' && !shortcuts.open) {
      shortcuts.showModal();
    }
  };

  document.querySelectorAll('[data-open-shortcuts]').forEach((btn) => {
    btn.addEventListener('click', openShortcuts);
  });
  document.querySelectorAll('[data-close-shortcuts]').forEach((btn) => {
    btn.addEventListener('click', () => shortcuts?.close());
  });
  if (shortcuts) {
    shortcuts.addEventListener('click', (e) => {
      if (e.target === shortcuts) shortcuts.close();
    });
  }

  const executeItem = (item?: HTMLElement): void => {
    if (!item) return;
    const action = item.getAttribute('data-action');
    const href = item.getAttribute('data-href');
    const payload = item.getAttribute('data-payload');
    closePalette();
    if (action === 'toggle-theme') {
      toggleTheme();
    } else if (action === 'toggle-sfx') {
      toggleSfx();
    } else if (action === 'open-quest') {
      openQuest();
    } else if (action === 'copy-email' && payload) {
      void copyText(payload, `Copied ${payload}`);
    } else if (action === 'toast' && payload) {
      playSfx('coin');
      showToast(payload);
    } else if (action === 'shortcuts') {
      openShortcuts();
    } else if (href) {
      window.location.href = href;
    }
  };

  if (cmdTrigger) cmdTrigger.addEventListener('click', openPalette);
  if (cmdClose) cmdClose.addEventListener('click', closePalette);
  if (dialog) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closePalette();
    });
  }
  if (cmdInput) {
    cmdInput.addEventListener('input', () => filterPalette(cmdInput.value));
  }
  for (const item of cmdItems) {
    item.addEventListener('click', () => executeItem(item));
  }

  // --- Quest Mode Lens: Recruiter (60s Summary) vs Engineer (Full Dungeon) ---
  const syncAudience = (): void => {
    const current = root.getAttribute('data-audience') === 'recruiter' ? 'recruiter' : 'engineer';
    document.querySelectorAll<HTMLElement>('[data-audience-set]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-audience-set') === current));
    });
  };

  const setAudience = (next: string): void => {
    root.setAttribute('data-audience', next);
    try {
      localStorage.setItem('audience', next);
    } catch {}
    syncAudience();
    playSfx('select');
  };

  document.querySelectorAll<HTMLElement>('[data-audience-set]').forEach((b) => {
    b.addEventListener('click', () =>
      setAudience(b.getAttribute('data-audience-set') || 'engineer'),
    );
  });
  document.querySelectorAll<HTMLElement>('[data-deep-dive-open]').forEach((b) => {
    b.addEventListener('click', () => {
      setAudience('engineer');
      unlockRelic('triforce');
      const target = document.getElementById('deep-dive');
      if (target) {
        target.scrollIntoView({ block: 'start' });
        target.focus({ preventScroll: true });
      }
    });
  });
  if (root.getAttribute('data-audience') === 'recruiter') {
    syncAudience();
  }

  // --- Keyboard Shortcuts + Konami Code (↑↑↓↓←→←→BA) ---
  const GO: Record<string, string> = {
    h: '/',
    w: '/projects',
    n: '/writing',
    a: '/about',
    r: '/resume',
  };
  const KONAMI = [
    'arrowup',
    'arrowup',
    'arrowdown',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'arrowleft',
    'arrowright',
    'b',
    'a',
  ];
  let konamiIdx = 0;
  let goPending = false;
  let goTimer: ReturnType<typeof setTimeout> | null = null;

  const isTyping = (el: EventTarget | null): boolean => {
    if (!el || !(el instanceof HTMLElement)) return false;
    return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
  };

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog?.open) closePalette();
      else openPalette();
      return;
    }
    if (dialog?.open) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateSelection(activeIdx + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateSelection(activeIdx - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const vis = visibleItems();
        if (vis[activeIdx]) executeItem(vis[activeIdx]);
      }
      return;
    }
    if (shortcuts?.open || questDialog?.open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTyping(e.target)) return;

    const key = e.key.toLowerCase();

    if (key === KONAMI[konamiIdx]) {
      konamiIdx += 1;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        unlockRelic('triforce', true);
        playSfx('secret');
        showToast('★ KONAMI CODE: 99 LIVES & TRIFORCE UNLOCKED!');
        return;
      }
    } else {
      konamiIdx = key === KONAMI[0] ? 1 : 0;
    }

    if (goPending) {
      goPending = false;
      if (goTimer) clearTimeout(goTimer);
      if (GO[key]) {
        e.preventDefault();
        window.location.href = GO[key];
      }
      return;
    }
    if (e.key === '?') {
      e.preventDefault();
      openShortcuts();
    } else if (e.key === '/') {
      e.preventDefault();
      const demoInput = document.getElementById('sd-input') as HTMLInputElement | null;
      if (demoInput) {
        demoInput.scrollIntoView({ block: 'center' });
        demoInput.focus({ preventScroll: true });
        demoInput.select();
      } else {
        openPalette();
      }
    } else if (key === 'g') {
      goPending = true;
      goTimer = setTimeout(() => {
        goPending = false;
      }, 1200);
    } else if (key === 't') {
      toggleTheme();
    } else if (key === 'm') {
      toggleSfx();
    } else if (key === 'c' && email) {
      void copyText(email, emailFeedback);
    }
  });

  const greeting = body.getAttribute('data-greeting');
  if (greeting) console.log(`%c${greeting}`, 'font-family: monospace; color: #ffd23f;');

  const explorer = document.querySelector('[data-embedding-explorer]');
  if (explorer) {
    const loadMap = (): void => {
      const moduleUrl = '/scripts/embedding-map.js';
      import(/* @vite-ignore */ moduleUrl)
        .then((m: { initEmbeddingMap: (el: Element) => void }) => m.initEmbeddingMap(explorer))
        .catch(() => {});
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            io.disconnect();
            loadMap();
          }
        },
        { rootMargin: '80px' },
      );
      io.observe(explorer);
    } else {
      loadMap();
    }
  }
};

let initialized = false;
const runInit = (): void => {
  if (initialized) return;
  initialized = true;
  init();
};
window.addEventListener('keydown', runInit, { once: true, capture: true });
window.addEventListener('pointerdown', runInit, { once: true, capture: true, passive: true });
window.addEventListener('pointermove', runInit, { once: true, capture: true, passive: true });
window.addEventListener('focusin', runInit, { once: true, capture: true, passive: true });
window.addEventListener('scroll', runInit, { once: true, capture: true, passive: true });
