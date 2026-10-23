// Big blocky pixel title: draws the h1 text from a 5x7 pixel font as SVG (no font download needed).
(function pixelTitle() {
  const h1 = document.querySelector('h1.pixel-title');
  if (!h1) return;
  const FONT = {
    M: ['X...X', 'XX.XX', 'X.X.X', 'X.X.X', 'X...X', 'X...X', 'X...X'],
    O: ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
    V: ['X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.X.X.', '..X..'],
    I: ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', 'XXXXX'],
    E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
    N: ['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X', 'X...X', 'X...X'],
    G: ['.XXX.', 'X...X', 'X....', 'X.XXX', 'X...X', 'X...X', '.XXX.'],
    H: ['X...X', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
    T: ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', '..X..'],
  };
  const words = h1.textContent.trim().toUpperCase().split(/\s+/);
  if (!words.every((w) => [...w].every((c) => FONT[c]))) return; // unknown letter: keep plain text
  const NS = 'http://www.w3.org/2000/svg';
  const width = Math.max(...words.map((w) => w.length * 6 - 1));
  const height = words.length * 8 - 1;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + (width + 1) + ' ' + (height + 1));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('shape-rendering', 'crispEdges');
  const shadow = document.createElementNS(NS, 'g');
  const front = document.createElementNS(NS, 'g');
  shadow.setAttribute('fill', '#1f3fff');
  shadow.setAttribute('transform', 'translate(0.45 0.45)');
  front.setAttribute('fill', '#ffffff');
  const rect = (parent, x, y) => {
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', 1.02); r.setAttribute('height', 1.02);
    parent.appendChild(r);
  };
  const filled = [];
  words.forEach((word, row) => {
    [...word].forEach((ch, i) => {
      FONT[ch].forEach((line, y) => {
        [...line].forEach((cell, x) => {
          if (cell !== 'X') return;
          rect(shadow, i * 6 + x, row * 8 + y);
          rect(front, i * 6 + x, row * 8 + y);
          filled.push([i * 6 + x, row * 8 + y]);
        });
      });
    });
  });
  svg.appendChild(shadow);
  svg.appendChild(front);
  // a few lime "glitch" pixels that blink on top of the letters themselves
  const glitch = document.createElementNS(NS, 'g');
  glitch.setAttribute('fill', '#c6ff00');
  for (let i = 0; i < 7; i++) {
    const r = document.createElementNS(NS, 'rect');
    const cell = filled[Math.floor(Math.random() * filled.length)];
    r.setAttribute('x', cell[0]);
    r.setAttribute('y', cell[1]);
    r.setAttribute('width', 1.02); r.setAttribute('height', 1.02);
    r.setAttribute('class', 'glitch-px');
    r.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
    r.style.animationDuration = (1.2 + Math.random() * 1.6).toFixed(2) + 's';
    glitch.appendChild(r);
  }
  svg.appendChild(glitch);
  h1.setAttribute('aria-label', h1.textContent.trim());
  h1.textContent = '';
  h1.appendChild(svg);
})();

// Dog Appreciation Corner ("TARA", a DOGEMA film): the photos images/dog1.jpg, dog2.jpg, ... (no upper limit, found
// automatically) as frames on movie film strips. Each row of the board is a strip of film; the photos can be dragged
// out of it and placed anywhere. The layout is redone at random every time the corner is opened.
(function dogGallery() {
  const gallery = document.getElementById('dog-gallery');
  const details = gallery.closest('details');
  const BATCH = 8, LIMIT = 500, COLS = 2;
  const WIDTH = 36;                   // photo width, % of the board width (a photo is 4:5)
  const EDGE = 20;                    // px of film edge (sprocket holes + edge print) above and below a photo
  const FRAMES = ['2A', '3', '3A', '4', '4A', '5', '5A'];
  const WORDS = ['STARRING TARA', 'GOOD DOG', 'BEST FRIEND', 'PURE JOY', '10/10', 'NOW SHOWING', 'SOLD OUT'];
  const NS = 'http://www.w3.org/2000/svg';
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  // A film reel drawn in SVG: rim, six windows and a hub.
  function reel(cls) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'reel ' + cls);
    svg.setAttribute('aria-hidden', 'true');
    const add = (tag, attrs) => {
      const e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
      svg.appendChild(e);
    };
    add('circle', { cx: 50, cy: 50, r: 48, fill: '#0b0b0b', stroke: '#c6ff00', 'stroke-width': 2.5 });
    for (let k = 0; k < 6; k++) {
      const ang = (k * 60) * Math.PI / 180;
      add('circle', { cx: (50 + 28 * Math.cos(ang)).toFixed(2), cy: (50 + 28 * Math.sin(ang)).toFixed(2), r: 11, fill: '#060606', stroke: '#c6ff00', 'stroke-width': 2 });
    }
    add('circle', { cx: 50, cy: 50, r: 9, fill: '#c6ff00' });
    add('circle', { cx: 50, cy: 50, r: 3.5, fill: '#0b0b0b' });
    return svg;
  }

  // Which photos exist? dog1.jpg, dog2.jpg, ... with no upper limit: check them 8 at a time and stop after
  // a batch where none exist (so a few missing numbers are fine). Online only the headers are fetched;
  // the photos themselves download when shown. Done the first time the corner is opened.
  const exists = (n) => {
    const src = 'images/dog' + n + '.jpg';
    if (location.protocol === 'file:') {
      return new Promise((resolve) => {
        const probe = new Image();
        probe.onload = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = src;
      });
    }
    return fetch(src, { method: 'HEAD' }).then((r) => r.ok, () => false);
  };
  let ready = null;
  const findPhotos = () => ready || (ready = (async () => {
    const found = [];
    for (let start = 1; start <= LIMIT; start += BATCH) {
      const nums = Array.from({ length: BATCH }, (_, i) => start + i);
      const ok = await Promise.all(nums.map(exists));
      const hits = nums.filter((n, i) => ok[i]);
      if (!hits.length) break;
      found.push(...hits);
    }
    return found;
  })());

  // Lay everything out again at random; runs when the corner is opened.
  function layout(available) {
    gallery.innerHTML = '';
    const COUNT = available.length;
    if (!COUNT) { gallery.appendChild(el('p', 'hud-empty', 'NO FRAMES LOADED YET')); return; }
    const ROWS = Math.ceil(COUNT / COLS);
    // the board grows with the number of rows; sizes below are percentages of its height
    const ASPECT = 0.675 * ROWS;                  // board height / board width
    const PHOTO_H = WIDTH * 1.25 / ASPECT;        // photo height, % of the board height
    const TOP = 29.7 / ASPECT, SLOT = 60 / ASPECT; // first strip row starts at TOP %, each row is SLOT % tall
    gallery.style.aspectRatio = '1 / ' + ASPECT.toFixed(3);
    gallery.style.setProperty('--scn', '"SCN_' + String(COUNT).padStart(2, '0') + '"');
    const ids = shuffle(available.slice());
    // with an odd number of photos one is centred in a middle row, so nothing looks missing
    const odd = COUNT % 2 === 1;
    const soloRow = !odd ? -1 : ROWS === 1 ? 0 : Math.min(ROWS - 2, 1 + Math.floor(Math.random() * Math.max(1, ROWS - 2)));
    const slots = [];
    for (let row = 0; row < ROWS; row++) {
      if (row === soloRow) slots.push({ row, x: (100 - WIDTH) / 2 });
      else for (let col = 0; col < COLS && slots.length < COUNT; col++) slots.push({ row, x: col * 50 + (50 - WIDTH) / 2 });
    }

    // reels peeking in from the corners, under the film
    gallery.append(reel('reel-a'), reel('reel-b'));

    // the film strips: one per row
    for (let row = 0; row < ROWS; row++) {
      const strip = el('div', 'strip');
      strip.style.top = 'calc(' + (TOP + row * SLOT).toFixed(2) + '% - ' + EDGE + 'px)';
      strip.style.height = 'calc(' + PHOTO_H.toFixed(2) + '% + ' + (EDGE * 2) + 'px)';
      strip.appendChild(el('span', 'strip-text', ('TARA 400 \u25B7 ' + (row * 2 + 1) + ' \u25B7 ' + (row * 2 + 1) + 'A \u25B7 ').repeat(6)));
      gallery.appendChild(strip);
    }

    // some frames look like old black-and-white film, one is warm sepia
    const base = ['color', 'color', 'color', 'color', 'bw', 'bw', 'sepia'];
    const looks = shuffle(Array.from({ length: COUNT }, (_, i) => base[i % base.length]));
    const stampOn = Math.floor(Math.random() * COUNT);
    let topZ = COUNT + 10;

    ids.forEach((n, i) => {
      const slot = slots[i];
      const shot = el('figure', 'shot look-' + looks[i]);
      shot.style.width = WIDTH + '%';
      shot.style.left = (slot.x + rand(-1, 1)).toFixed(1) + '%';
      shot.style.top = (TOP + slot.row * SLOT + rand(-0.3, 0.3)).toFixed(2) + '%';
      shot.style.zIndex = i + 10;
      shot.style.setProperty('--rot', rand(-1.8, 1.8).toFixed(1) + 'deg');

      const img = el('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = 'images/dog' + n + '.jpg';
      img.alt = 'Tara, photo ' + n;
      img.draggable = false;
      shot.appendChild(img);
      shot.appendChild(el('span', 'frame-no', '\u25B7 ' + n + ' / ' + pick(FRAMES)));
      if (i === stampOn) shot.appendChild(el('span', 'stamp', pick(WORDS)));

      let dx = 0, dy = 0;
      shot.addEventListener('pointerdown', (e) => {
        const r = shot.getBoundingClientRect();
        dx = e.clientX - r.left;
        dy = e.clientY - r.top;
        shot.setPointerCapture(e.pointerId);
        shot.classList.add('dragging', 'loose'); // pulled out of the reel: becomes a loose print
        shot.style.zIndex = ++topZ;
      });
      shot.addEventListener('pointermove', (e) => {
        if (!shot.classList.contains('dragging')) return;
        const g = gallery.getBoundingClientRect(), r = shot.getBoundingClientRect();
        // the on-screen box is slightly bigger than the layout box because of the tilt; use the layout size
        const w = shot.offsetWidth, h = shot.offsetHeight;
        const x = Math.min(Math.max(e.clientX - g.left - dx - (r.width - w) / 2, 0), g.width - w);
        const y = Math.min(Math.max(e.clientY - g.top - dy - (r.height - h) / 2, 0), g.height - h);
        shot.style.left = (x / g.width * 100).toFixed(2) + '%';
        shot.style.top = (y / g.height * 100).toFixed(2) + '%';
      });
      const drop = () => shot.classList.remove('dragging');
      shot.addEventListener('pointerup', drop);
      shot.addEventListener('pointercancel', drop);
      gallery.appendChild(shot);
    });

    // a ticket stub on the film beside the centred photo (only when there is one)
    if (soloRow >= 0) {
    const ticket = el('div', 'ticket');
    ticket.append(el('b', '', 'ADMIT ONE'), el('span', '', 'N\u00B0 000' + (1 + Math.floor(Math.random() * 9))));
    ticket.style.top = (TOP + soloRow * SLOT + 3).toFixed(1) + '%';
    ticket.style.left = (Math.random() < 0.5 ? 3 : 71) + '%';
    ticket.style.setProperty('--rot', rand(-9, 9).toFixed(1) + 'deg');
    ticket.style.zIndex = COUNT + 5;
    gallery.appendChild(ticket);
    }

    const foot = el('div', 'hud-foot');
    foot.append(el('span', '', 'A DOGEMA FILM'), el('span', '', COUNT + ' FRAMES LOADED'));
    gallery.appendChild(foot);
  }

  if (details) {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      findPhotos().then(layout);
      if (window.taraSay) window.taraSay("That's me! \uD83D\uDC3E");
    });
    if (details.open) findPhotos().then(layout);
  } else {
    findPhotos().then(layout);
  }
})();

// Give every heading its own random sticker look: fill/ink/outline colours, hard shadow and a slight tilt.
(function randomiseWordArt() {
  const variants = [
    { bg: '#ffffff', fg: '#1f3fff', bd: '#1f3fff', sh: '#c6ff00' }, // white pill, blue ink (BLISS)
    { bg: '#c6ff00', fg: '#000000', bd: '#000000', sh: '#1f3fff' }, // acid lime, black ink
    { bg: '#1f3fff', fg: '#ffffff', bd: '#ffffff', sh: '#c6ff00' }, // electric blue, white ink
    { bg: '#000000', fg: '#c6ff00', bd: '#c6ff00', sh: '#1f3fff' }, // black, lime ink
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  document.querySelectorAll('.panel h2, .wordart').forEach((el) => {
    const v = pick(variants);
    el.style.setProperty('--wa-bg', v.bg);
    el.style.setProperty('--wa-fg', v.fg);
    el.style.setProperty('--wa-bd', v.bd);
    el.style.setProperty('--wa-sh', v.sh);
    el.style.setProperty('--wa-rot', (Math.random() * 5 - 3).toFixed(1) + 'deg');
  });
})();

// Flickering glitter over headers marked with data-sparkle.
(function addGlitter() {
  const colours = ['#ffffff', '#c6ff00', '#c6ff00', '#6f86ff', '#8ff3ff'];
  document.querySelectorAll('[data-sparkle]').forEach((heading) => {
    const wrap = document.createElement('span');
    wrap.className = 'glitter-wrap';
    heading.parentNode.insertBefore(wrap, heading);
    wrap.appendChild(heading);
    for (let i = 0; i < 36; i++) {
      const g = document.createElement('span');
      g.className = 'glitter';
      g.setAttribute('aria-hidden', 'true');
      g.style.left = (Math.random() * 100).toFixed(1) + '%';
      g.style.top = (Math.random() * 100).toFixed(1) + '%';
      g.style.setProperty('--size', (2 + Math.random() * 3).toFixed(1) + 'px');
      g.style.setProperty('--col', colours[Math.floor(Math.random() * colours.length)]);
      g.style.setProperty('--dur', (0.5 + Math.random() * 1.1).toFixed(2) + 's');
      g.style.setProperty('--delay', (-Math.random() * 2).toFixed(2) + 's');
      wrap.appendChild(g);
    }
  });
})();

// Movie Night Planner: read the published Google Sheet tabs (CSV) and set up the "add" buttons.
(function movieNightPlanner() {
  const cfg = window.PLANNER || {};
  const say = (text) => { if (window.taraSay) window.taraSay(text); }; // Tara's speech bubble (see the end of this file)

  // Small CSV parser that handles quoted fields, commas and newlines inside quotes.
  function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.some((f) => f.trim() !== '')) rows.push(row);
        row = [];
      } else field += ch;
    }
    row.push(field);
    if (row.some((f) => f.trim() !== '')) rows.push(row);
    return rows;
  }

  function setMessage(list, text) {
    list.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = text;
    list.appendChild(li);
  }

  function setButton(id, url) {
    const a = document.getElementById(id);
    if (url) a.href = url;
    else { a.classList.add('disabled'); a.removeAttribute('href'); }
  }

  // "NEW" badges: remember which entries were on the list when the page was last left, per device.
  const SEEN_PREFIX = 'planner-seen-';
  const currentKeys = {}; // listId -> keys of the entries on screen now
  function readSeen(listId) {
    try {
      const raw = localStorage.getItem(SEEN_PREFIX + listId);
      return raw === null ? null : JSON.parse(raw); // null = first visit: nothing counts as new
    } catch (e) { return null; }
  }
  function saveSeen() {
    try {
      Object.keys(currentKeys).forEach((id) => localStorage.setItem(SEEN_PREFIX + id, JSON.stringify(currentKeys[id])));
    } catch (e) { /* storage blocked: badges simply never show */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveSeen(); });
  window.addEventListener('pagehide', saveSeen);

  // ---- dates: strict parsing only (never Date.parse, which turns "Fri 14 Nov" into the year 2001) ----
  function validDate(y, m, d) {
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? dt : null;
  }
  const SLASH = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4}|\d{2})\b/;
  // Slash dates are ambiguous (3/4 = 3 April or March 4). Look at all dates: a part above 12 settles it.
  function detectOrder(strings) {
    let dmy = false, mdy = false;
    strings.forEach((s) => {
      const m = SLASH.exec(s.trim());
      if (!m) return;
      if (+m[1] > 12) dmy = true;
      if (+m[2] > 12) mdy = true;
    });
    if (dmy && !mdy) return 'dmy';
    if (mdy && !dmy) return 'mdy';
    return cfg.dateOrder === 'mdy' ? 'mdy' : 'dmy';
  }
  const fullYear = (y) => (y < 100 ? 2000 + y : y);
  // English and Czech month names (Czech without accents, any case ending): "October", "Oct", "rijna", "listopadu"
  const MONTH_NAMES = [
    ['jan', 'leden', 'ledna'], ['feb', 'unor', 'unora'], ['mar', 'brezen', 'brezna'], ['apr', 'duben', 'dubna'],
    ['may', 'kveten', 'kvetna'], ['jun', 'cerven', 'cervna'], ['jul', 'cervenec', 'cervence'], ['aug', 'srpen', 'srpna'],
    ['sep', 'zari'], ['oct', 'rijen', 'rijna'], ['nov', 'listopad', 'listopadu'], ['dec', 'prosinec', 'prosince'],
  ];
  function monthFromName(word) {
    const w = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\.$/, '');
    if (w.length < 3 || !/^[a-z]+$/.test(w)) return 0;
    if (w.startsWith('cervenc')) return 7; // Czech July, checked before June ("cerven")
    for (let i = 0; i < 12; i++) {
      const [en, ...cz] = MONTH_NAMES[i];
      if (w.startsWith(en) || cz.includes(w)) return i + 1;
    }
    return 0;
  }
  function parseDate(str, order) {
    let s = str.trim();
    // a leading weekday ("pá 24. 10. 2026", "Friday, October 24, 2026") is dropped
    const first = s.split(/[\s,]+/)[0];
    if (first && /^[^\d]+$/.test(first) && weekdayOf(first.replace(/[.,]$/, '')) >= 0) s = s.slice(first.length).replace(/^[\s,.]+/, '');
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s) || /^(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(s);
    if (m) return validDate(+m[1], +m[2], +m[3]);
    m = /^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4}|\d{2})\b/.exec(s); // 14.11.2026 is always day first
    if (m) return validDate(fullYear(+m[3]), +m[2], +m[1]);
    m = SLASH.exec(s);
    if (m) return order === 'mdy' ? validDate(fullYear(+m[3]), +m[1], +m[2]) : validDate(fullYear(+m[3]), +m[2], +m[1]);
    m = /^(\d{1,2})\.?\s+([^\d\s.,]+)\.?,?\s+(\d{4})\b/.exec(s); // 24 October 2026, 24. října 2026
    if (m && monthFromName(m[2])) return validDate(+m[3], monthFromName(m[2]), +m[1]);
    m = /^([^\d\s.,]+)\.?\s+(\d{1,2}),?\s+(\d{4})\b/.exec(s); // October 24, 2026
    if (m && monthFromName(m[1])) return validDate(+m[3], monthFromName(m[1]), +m[2]);
    return null; // free text such as "Fri 14 Nov evening": kept in the list, never hidden
  }

  const isTrue = (v) => /^(true|yes|y|x|1|\u2713|\u2714|watched)$/i.test((v || '').trim());
  // "Locked" column on the dates tab: a movie title, or a tick / "yes" for a locked night with the movie still open.
  // null = not locked, '' = locked without a movie, text = the movie
  const LOCK_COL = /lock|zamk|booked|potvrz/i;
  const lockedValue = (v) => {
    const t = (v || '').trim();
    if (!t || /^(false|no|n|0|-)$/i.test(t)) return null;
    return isTrue(t) || /^(locked|ano)$/i.test(t) ? '' : t;
  };
  // "What time?" answers: "Afternoon, Evening" -> ['afternoon', 'evening']; empty or "All day" -> [] (any time)
  const TIME_COL = /\btime\b|part of (the )?day|\b[čc]as\b|kdy p|afternoon|evening|odpoled|ve[čc]er/i;
  const ANY_TIME = /^(all day|whole day|any ?time|any|whenever|cel[yý] den|kdykoliv?)$/i;
  const timeSlots = (cell) => {
    const parts = String(cell || '').split(/\s*(?:,|;|\/|&|\+|\band\b|\ba\b)\s*/i).map((x) => x.trim().toLowerCase()).filter(Boolean);
    return parts.some((x) => ANY_TIME.test(x)) ? [] : parts;
  };
  // free: Map name -> null (any time) or Set of slots. Both free = two people share a time (any time matches all).
  function overlap(free) {
    const names = Array.from(free.keys());
    if (names.length < 2) return { both: false, slots: [] };
    const all = new Set();
    free.forEach((v) => { if (v) v.forEach((x) => all.add(x)); });
    if (!all.size) return { both: true, slots: [] };
    const slots = Array.from(all).filter((x) => names.filter((n) => !free.get(n) || free.get(n).has(x)).length >= 2);
    const anyBoth = names.filter((n) => !free.get(n)).length >= 2;
    return { both: anyBoth || slots.length > 0, slots: anyBoth ? [] : slots };
  }
  function whoText(free, people, ov) {
    const names = Array.from(free.keys()).sort((a, b) => people.indexOf(a) - people.indexOf(b));
    if (ov.both) return names.join(' + ') + (ov.slots.length ? ' \u00B7 ' + ov.slots.join(' / ') : '');
    return names.map((n) => (free.get(n) && free.get(n).size ? n + ' (' + Array.from(free.get(n)).join(' / ') + ')' : n)).join(' \u00B7 ');
  }

  // ---- "Add to calendar": an .ics file (works in Google, Apple and Outlook calendars) with built-in alerts,
  //      plus a Google Calendar link. All-day event on the chosen date.
  const pad2 = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate());
  const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  // calendar files must wrap lines longer than 75 bytes (continuation lines start with a space). Bytes, not
  // characters: Czech letters take 2 and emoji 4. Whole characters only, so a letter or emoji is never split.
  const utf8 = new TextEncoder();
  function foldLine(line) {
    const out = [];
    let cur = '', bytes = 0;
    for (const ch of line) {
      const n = utf8.encode(ch).length;
      if (bytes + n > 75) { out.push(cur); cur = ' '; bytes = 1; }
      cur += ch;
      bytes += n;
    }
    out.push(cur);
    return out.join('\r\n');
  }
  const utcStamp = (d) => d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' +
    pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + 'Z';
  // hand a calendar file to the browser as a download
  function downloadIcs(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function eventInfo(date, note, customTitle) {
    const title = customTitle || cfg.eventTitle || 'Movie night \uD83C\uDFAC';
    const pageUrl = /^https?:/.test(location.href) ? location.origin + location.pathname : '';
    const lines = [customTitle ? 'It is locked in. Popcorn ready.' : 'Pick a movie from the list and press play.'];
    if (note) lines.push(note);
    if (pageUrl) lines.push(pageUrl);
    return { title, description: lines.join('\n'), pageUrl };
  }
  function buildIcs(date, info) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const alarm = (trigger, text) => ['BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(text), 'TRIGGER:' + trigger, 'END:VALARM'];
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Movie Night Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:movie-night-' + ymd(date) + '@birthday-surprise',
      'DTSTAMP:' + utcStamp(new Date()),
      'DTSTART;VALUE=DATE:' + ymd(date),
      'DTEND;VALUE=DATE:' + ymd(next),
      'SUMMARY:' + icsEscape(info.title),
      'DESCRIPTION:' + icsEscape(info.description),
      ...(info.pageUrl ? ['URL:' + info.pageUrl] : []),
      ...alarm('-PT6H', 'Movie night is tomorrow'),  // 18:00 the evening before
      ...alarm('PT9H', 'Movie night is today'),      // 09:00 on the day
      'END:VEVENT', 'END:VCALENDAR',
    ].map(foldLine).join('\r\n') + '\r\n';
  }
  function calendarButtons(date, note, customTitle) {
    const info = eventInfo(date, note, customTitle);
    const row = document.createElement('span');
    row.className = 'cal-row';
    const ics = document.createElement('button');
    ics.type = 'button';
    ics.className = 'chip';
    ics.textContent = 'Add to calendar';
    ics.addEventListener('click', () => {
      say("Saved! I'll wag my tail on the day \uD83D\uDC3E");
      downloadIcs('movie-night-' + ymd(date) + '.ics', buildIcs(date, info));
    });
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const g = document.createElement('a');
    g.className = 'chip';
    g.target = '_blank';
    g.rel = 'noopener';
    g.textContent = 'Google';
    g.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(info.title) +
      '&dates=' + ymd(date) + '/' + ymd(next) +
      '&details=' + encodeURIComponent(info.description);
    g.addEventListener('click', () => say("Saved! I'll wag my tail on the day \uD83D\uDC3E"));
    row.append(ics, g);
    return row;
  }

  // ---- Monthly reminder: a repeating calendar event (first Saturday of the month, 17:00) that links back to this page ----
  function floatingStamp(d) {
    return ymd(d) + 'T' + pad2(d.getHours()) + pad2(d.getMinutes()) + '00';
  }
  function firstSaturday(year, month) {
    const first = new Date(year, month, 1, 17, 0, 0);
    return new Date(year, month, 1 + (6 - first.getDay() + 7) % 7, 17, 0, 0);
  }
  // first reminder: the first Saturday of this month, or of next month if that is less than a day away or already past
  function firstReminder() {
    const now = new Date();
    let d = firstSaturday(now.getFullYear(), now.getMonth());
    if (d - now < 24 * 60 * 60 * 1000) d = firstSaturday(now.getFullYear(), now.getMonth() + 1);
    return d;
  }
  function reminderInfo() {
    const url = cfg.siteUrl || (/^https?:/.test(location.href) ? location.origin + location.pathname : '');
    const lines = ['Time to plan a movie night: look at the movies waiting and the free dates.'];
    if (url) lines.push(url);
    return { title: cfg.reminderTitle || 'Plan a movie night \uD83C\uDFAC', description: lines.join('\n'), url };
  }
  function buildReminderIcs(start, info) {
    const end = new Date(start.getTime() + 15 * 60 * 1000);
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Movie Night Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:monthly-movie-night-reminder@birthday-surprise',
      'DTSTAMP:' + utcStamp(new Date()),
      'DTSTART:' + floatingStamp(start),
      'DTEND:' + floatingStamp(end),
      'RRULE:FREQ=MONTHLY;BYDAY=1SA',
      'SUMMARY:' + icsEscape(info.title),
      'DESCRIPTION:' + icsEscape(info.description),
      ...(info.url ? ['URL:' + info.url] : []),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(info.title), 'TRIGGER:PT0S', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].map(foldLine).join('\r\n') + '\r\n';
  }
  function wireReminder() {
    const icsBtn = document.getElementById('remind-ics');
    const gLink = document.getElementById('remind-google');
    if (!icsBtn || !gLink) return;
    const start = firstReminder();
    const end = new Date(start.getTime() + 15 * 60 * 1000);
    const info = reminderInfo();
    icsBtn.addEventListener('click', () => {
      say("I'll remind you once a month. Woof! \uD83D\uDC3E");
      downloadIcs('movie-night-monthly-reminder.ics', buildReminderIcs(start, info));
    });
    gLink.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(info.title) +
      '&dates=' + floatingStamp(start) + '/' + floatingStamp(end) +
      '&recur=' + encodeURIComponent('RRULE:FREQ=MONTHLY;BYDAY=1SA') +
      '&details=' + encodeURIComponent(info.description);
    gLink.addEventListener('click', () => say("I'll remind you once a month. Woof! \uD83D\uDC3E"));
  }

  // "TONIGHT" / "TOMORROW" / "IN 5 DAYS" tag for a date
  function countdown(date, today) {
    const days = Math.round((date - today) / 86400000);
    const soon = document.createElement('span');
    soon.className = 'soon' + (days <= 1 ? ' hot' : '');
    soon.textContent = days === 0 ? 'TONIGHT' : days === 1 ? 'TOMORROW' : 'IN ' + days + ' DAYS';
    return soon;
  }
  const rowDetails = (r) => r.slice(2).map((x) => x.trim()).filter(Boolean).join(' \u00B7 ');

  // ---- "Pick for me": spins through the movie tickets and lands on a random one ----
  function wirePicker() {
    const btn = document.getElementById('pick-movie');
    const list = document.getElementById('movie-list');
    if (!btn || !list) return;
    btn.addEventListener('click', () => {
      const items = Array.from(list.querySelectorAll('li:not(.muted)'));
      if (items.length < 2) { say(items.length ? 'Add one more movie and I\'ll pick for you \uD83C\uDFB2' : 'Add some movies first and I\'ll pick one \uD83C\uDFB2'); return; }
      items.forEach((li) => { li.classList.remove('picked', 'flash'); const t = li.querySelector('.pick-tag'); if (t) t.remove(); });
      const winner = pickOlder(items.length);
      const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // at least ~16 flashes, ending exactly on the winner; the whole spin always takes about 2.5 s
      const n = items.length;
      const steps = still ? 0 : winner + n * Math.max(1, Math.ceil((16 - winner) / n));
      const weights = Array.from({ length: steps }, (_, k) => 1 + 6 * Math.pow(k / Math.max(1, steps), 3)); // slows down at the end
      const total = weights.reduce((a, b) => a + b, 0) || 1;
      let i = 0;
      btn.disabled = true;
      const land = () => {
        items.forEach((li) => li.classList.remove('flash'));
        const li = items[winner];
        if (li.hidden) expandList(list);
        li.classList.add('picked');
        const tag = document.createElement('span');
        tag.className = 'pick-tag';
        tag.textContent = "TONIGHT'S PICK";
        li.insertBefore(tag, li.querySelector('small'));
        li.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
        say('Ooh, ' + li.firstChild.textContent.trim() + (winner === items.length - 1 ? "! It's waited the longest \uD83C\uDF7F" : '! Good pick \uD83C\uDF7F'));
        btn.disabled = false;
      };
      const tick = () => {
        if (i >= steps) { land(); return; }
        items.forEach((li) => li.classList.remove('flash'));
        items[i % items.length].classList.add('flash');
        i++;
        setTimeout(tick, 2500 * weights[i - 1] / total); // slows down like a wheel
      };
      tick();
    });
  }

  // ---- column helpers, ratings, ČSFD ----
  const findCol = (header, re, fallback) => { const i = header.findIndex((h) => re.test(h)); return i >= 0 ? i : fallback; };
  // ratings are out of 10: "8", "8/10", "7,5" -> 8, 8, 7.5; "4/5" or "★★★★" are doubled to 8
  function parseRating(v) {
    const s = String(v || '').trim();
    if (!s) return null;
    const stars = (s.match(/★/g) || []).length;
    if (stars) return Math.min(10, stars * 2);
    const m = /(\d+(?:[.,]\d+)?)/.exec(s);
    if (!m) return null;
    let n = parseFloat(m[1].replace(',', '.'));
    if (/\/\s*5\b/.test(s)) n *= 2;
    return n > 0 ? Math.min(10, n) : null;
  }
  const ratingText = (n) => '\u2605 ' + (Math.round(n * 10) / 10) + '/10';
  const csfdUrl = (title) => 'https://www.csfd.cz/hledat/?q=' + encodeURIComponent(title);
  const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
  let movieTitles = []; // movies still to watch, used by "Lock it in"
  // movies waiting longer are more likely to be picked: lists are newest first, so the last one weighs the most
  // (with 5 movies the oldest is 5x as likely as the newest)
  function pickOlder(n) {
    let r = Math.random() * n * (n + 1) / 2;
    for (let i = 0; i < n; i++) { r -= i + 1; if (r < 0) return i; }
    return n - 1;
  }

  // ---- taste match: how close your two ratings are on movies you both rated ----
  function renderTaste(entries) {
    const box = document.getElementById('taste');
    if (!box) return;
    const rated = entries.filter((e) => e.watched).map((e) => ({ title: e.title, r: (e.ratings || []).filter((x) => x.name && x.value) }))
      .filter((m) => m.r.length >= 2);
    box.hidden = !rated.length;
    if (!rated.length) return;
    const diff = (m) => Math.abs(m.r[0].value - m.r[1].value);
    const avg = (m) => (m.r[0].value + m.r[1].value) / 2;
    const match = Math.max(0, Math.round(100 - rated.reduce((a, m) => a + diff(m), 0) / rated.length * 10));
    const mood = match >= 90 ? 'same brain' : match >= 75 ? 'great match' : match >= 50 ? 'agree to disagree' : 'opposites attract';
    const loved = rated.slice().sort((a, b) => avg(b) - avg(a))[0];
    const split = rated.slice().sort((a, b) => diff(b) - diff(a))[0];
    const num = (v) => Math.round(v * 10) / 10;
    box.innerHTML = '';
    const line = (label, value, extra) => {
      const row = document.createElement('span');
      row.className = 'taste-row';
      const l = document.createElement('i');
      l.textContent = label;
      const b = document.createElement('b');
      b.textContent = value;
      row.append(l, b);
      if (extra) row.appendChild(document.createTextNode(' ' + extra));
      box.appendChild(row);
    };
    line('Taste match', match + '%', '\u00B7 ' + mood);
    line('Most loved together', loved.title, '\u2605 ' + num(avg(loved)) + '/10');
    if (diff(split) >= 2) line('Biggest split', split.title, split.r.map((x) => x.name + ' ' + num(x.value)).join(' vs '));
  }

  // ---- "Free days" tab: Date | Jakub | Her (checkboxes). Optional "Jakub (evening)" columns, a "Note" column,
  //      and rows with a weekday instead of a date ("Friday") for days you're usually free ----
  const WEEKDAYS = [
    ['sunday', 'sun', 'nedele', 'ne'], ['monday', 'mon', 'pondeli', 'po'], ['tuesday', 'tue', 'tues', 'utery', 'ut'],
    ['wednesday', 'wed', 'streda', 'st'], ['thursday', 'thu', 'thur', 'thurs', 'ctvrtek', 'ct'],
    ['friday', 'fri', 'patek', 'pa'], ['saturday', 'sat', 'sobota', 'so'],
  ];
  function weekdayOf(text) {
    const t = text.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/^(every|each|usually|kazd[yae]|vzdy)\s+/, '').replace(/s$/, '');
    return WEEKDAYS.findIndex((names) => names.includes(t) || names.includes(t + 's'));
  }
  // "Jakub", "Jakub (evening)" or "Jakub - evening" -> { name, slot }
  function splitHeader(h) {
    const m = /^(.*?)\s*(?:\(([^)]*)\)|[-–:]\s*(.+))\s*$/.exec(h.trim());
    if (m && m[1]) return { name: m[1].trim(), slot: (m[2] || m[3] || '').trim().toLowerCase() };
    return { name: h.trim(), slot: '' };
  }
  // who ticked, and whether everybody shares a time slot (= both free)
  function summarize(ticks, people, slots, note) {
    const names = people.filter((p) => ticks.some((c) => c.name === p));
    const shared = people.length >= 2 ? slots.filter((s) => people.every((p) => ticks.some((c) => c.name === p && c.slot === s))) : [];
    const both = shared.length > 0;
    const slotText = shared.filter(Boolean).join(' / ');
    const who = both
      ? names.join(' + ') + (slotText ? ' · ' + slotText : '')
      : names.map((n) => {
        const s = ticks.filter((c) => c.name === n && c.slot).map((c) => c.slot);
        return s.length ? n + ' (' + s.join(' / ') + ')' : n;
      }).join(' · ');
    return { names, both, shared, details: [who, note].filter(Boolean).join(' · ') };
  }
  function parseGrid(parsed, today) {
    const header = parsed[0] || [];
    const di = findCol(header, /date|datum|^\s*(den|day)\s*$|when|kdy/i, 0);
    const ni = findCol(header, /note|pozn|comment|koment/i, -1);
    const li = header.findIndex((h, i) => i !== di && LOCK_COL.test(h));
    const cols = [];
    let lastNight = null;
    header.forEach((h, i) => {
      if (i === di || i === ni || i === li || !h.trim() || /timestamp|casov|časov/i.test(h)) return;
      cols.push(Object.assign({ i }, splitHeader(h)));
    });
    const people = [];
    cols.forEach((c) => {
      const p = people.find((x) => sameName(x, c.name));
      if (p) c.name = p; else people.push(c.name);
    });
    const slots = Array.from(new Set(cols.map((c) => c.slot)));
    const rows = parsed.slice(1);
    const order = detectOrder(rows.map((r) => r[di] || ''));
    const explicit = new Map();
    const patterns = new Map();
    rows.forEach((r) => {
      const cell = (r[di] || '').trim();
      if (!cell) return;
      const ticks = cols.filter((c) => isTrue(r[c.i]));
      const info = summarize(ticks, people, slots, ni >= 0 ? (r[ni] || '').trim() : '');
      const w = weekdayOf(cell);
      if (w >= 0) { patterns.set(w, info); return; }
      const d = parseDate(cell, order);
      const lock = li >= 0 ? lockedValue(r[li]) : null;
      if (d && d < today && lock !== null && (!lastNight || d > lastNight)) lastNight = d; // a past locked night
      if (!d || d < today) return;
      const key = 'grid|' + ymd(d) + '|' + ticks.map((c) => c.i).join(',') + '|' + (lock || '');
      explicit.set(ymd(d), Object.assign(info, { date: d, r, title: cell, key, keys: [key], lock }));
    });
    const dated = Array.from(explicit.values()).filter((e) => e.names.length || e.lock !== null);
    return { dated, people, hints: { explicit, patterns }, lastNight };
  }

  // ---- "Show all": long lists show the first few rows and a button instead of a scroll box ----
  function collapseList(ul, n) {
    const old = document.getElementById(ul.id + '-more');
    if (old) old.remove();
    const items = Array.from(ul.children).filter((li) => !li.classList.contains('muted'));
    items.forEach((li) => { li.hidden = false; });
    if (items.length <= n + 1) return; // hiding a single row is not worth a button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip more-toggle';
    btn.id = ul.id + '-more';
    const apply = () => {
      const open = btn.dataset.open === '1';
      items.forEach((li, i) => { li.hidden = !open && i >= n; });
      btn.textContent = open ? 'Show less' : 'Show all (' + items.length + ')';
    };
    btn.addEventListener('click', () => { btn.dataset.open = btn.dataset.open === '1' ? '' : '1'; apply(); });
    apply();
    ul.after(btn);
  }
  function expandList(ul) {
    const btn = document.getElementById(ul.id + '-more');
    if (btn && btn.dataset.open !== '1') btn.click();
  }

  // ---- a night that's locked in the sheet ("Locked" column): the same for both of you ----
  const lockTitle = (movie) => (movie ? 'Movie night: ' + movie + ' \uD83C\uDFAC' : '');
  function lockedView(e) {
    const wrap = document.createElement('span');
    wrap.className = 'locked';
    const line = document.createElement('span');
    line.className = 'locked-line';
    line.textContent = e.lock ? 'Locked in: ' : 'Locked in: movie night, movie to be decided';
    if (e.lock) {
      const b = document.createElement('b');
      b.textContent = e.lock;
      line.appendChild(b);
    }
    wrap.append(line, calendarButtons(e.date, e.details, lockTitle(e.lock)));
    return wrap;
  }
  // the site can't write to the sheet: this opens it, with the movie copied, so the lock can be typed in for both
  function saveLockChip(date, movie) {
    const day = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'numeric' });
    const a = sheetChip('save-lock', '\uD83D\uDD12 Save it for both of us',
      movie ? 'Paste "' + movie + '" into the Locked column next to ' + day + ' (copied!) \uD83D\uDD12'
        : 'Type "yes" into the Locked column next to ' + day + ' \uD83D\uDD12');
    if (a && movie) {
      a.addEventListener('click', () => {
        try { navigator.clipboard.writeText(movie).catch(() => {}); } catch (err) { /* no clipboard: the movie is in the bubble */ }
      }, true);
    }
    return a;
  }

  // ---- "Lock it in": on a both-free date, pick a movie and make the calendar event for it ----
  function lockInButton(date, details) {
    const wrap = document.createElement('span');
    wrap.className = 'lock-wrap';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip lock';
    btn.textContent = '🎬 Lock it in';
    // or lock just the date and decide on the movie later
    const plain = document.createElement('button');
    plain.type = 'button';
    plain.className = 'chip lock-plain';
    plain.textContent = '\uD83D\uDCC5 Just the date';
    const result = document.createElement('span');
    result.className = 'locked';
    result.hidden = true;
    const lock = (withMovie) => {
      const movie = withMovie && movieTitles.length ? movieTitles[pickOlder(movieTitles.length)] : '';
      result.innerHTML = '';
      const line = document.createElement('span');
      line.className = 'locked-line';
      line.textContent = movie ? 'Locked in: ' : withMovie && !movieTitles.length
        ? 'Locked in: movie night (add some movies to pick one)' : 'Locked in: movie night, movie to be decided';
      if (movie) {
        const b = document.createElement('b');
        b.textContent = movie;
        line.appendChild(b);
      }
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'chip mini';
      again.textContent = movie ? '\uD83C\uDFB2 Another' : '\uD83C\uDFB2 Pick a movie';
      again.hidden = movie ? movieTitles.length < 2 : !movieTitles.length;
      again.addEventListener('click', () => lock(true));
      result.append(line, calendarButtons(date, details, lockTitle(movie)), again);
      if (movie) {
        const skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'chip mini';
        skip.textContent = 'No movie yet';
        skip.addEventListener('click', () => lock(false));
        result.appendChild(skip);
      }
      const save = saveLockChip(date, movie);
      if (save) result.appendChild(save);
      result.hidden = false;
      btn.hidden = true;
      plain.hidden = true;
      say(movie ? movie + " it is! Don't forget snacks \uD83C\uDF7F" : 'Movie night locked in! Pick the movie whenever \uD83C\uDFAC');
    };
    btn.addEventListener('click', () => lock(true));
    plain.addEventListener('click', () => lock(false));
    wrap.append(btn, plain, result);
    return wrap;
  }

  // the buttons under a date: the locked night, the lock buttons (both free), or calendar + "I'm free too".
  // "Can't make it" always goes at the end of that same row.
  function showtimeActions(e) {
    let row;
    if (e.lock != null) row = lockedView(e);
    else if (e.both) row = lockInButton(e.date, e.details);
    else {
      row = calendarButtons(e.date, e.details);
      const free = freeTooChip();
      if (free) row.appendChild(free);
    }
    const out = notFreeChip();
    if (out) row.appendChild(out);
    return row;
  }

  // ---- "Who's free" board: the next five weeks, a dot per person, lime when you're both free ----
  const PERSON_COLORS = ['#c6ff00', '#5b7bff', '#ff4de1', '#ffffff'];
  function renderBoard(dated, people, today, hints) {
    const board = document.getElementById('free-board');
    if (!board) return;
    board.innerHTML = '';
    const byDay = new Map(dated.map((e) => [ymd(e.date), e]));
    const color = (name) => PERSON_COLORS[Math.max(0, people.findIndex((p) => sameName(p, name))) % PERSON_COLORS.length];
    const start = new Date(today);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday of this week
    const grid = document.createElement('div');
    grid.className = 'board-grid';
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const h = document.createElement('span');
      h.className = 'board-dow';
      h.textContent = d.toLocaleDateString(undefined, { weekday: 'narrow' });
      grid.appendChild(h);
    }
    let usedHints = false;
    for (let i = 0; i < 35; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const cell = document.createElement('span');
      let e = byDay.get(ymd(d));
      let usual = false;
      // a weekday you're usually free counts as "likely" unless that date has its own row
      if (!e && hints && d >= today && !hints.explicit.has(ymd(d)) && hints.patterns.has(d.getDay())) {
        const p = hints.patterns.get(d.getDay());
        if (p.names.length) { e = p; usual = true; usedHints = true; }
      }
      cell.className = 'board-day' + (d < today ? ' past' : '') + (+d === +today ? ' today' : '') +
        (e ? (usual ? ' usual' : ' free') : '') + (e && e.both ? (usual ? ' usual-both' : ' both') : '');
      const num = document.createElement('b');
      num.textContent = d.getDate();
      cell.appendChild(num);
      if (e) {
        const dots = document.createElement('i');
        (e.names.length ? e.names : ['?']).forEach((n) => {
          const dot = document.createElement('span');
          dot.style.background = e.names.length ? color(n) : '#fff';
          dots.appendChild(dot);
        });
        cell.appendChild(dots);
        cell.title = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) + ': ' +
          (usual ? 'usually ' : '') + (e.details || 'free');
      }
      grid.appendChild(cell);
    }
    const legend = document.createElement('div');
    legend.className = 'board-legend';
    people.forEach((p) => {
      const item = document.createElement('span');
      const dot = document.createElement('i');
      dot.style.background = color(p);
      item.append(dot, document.createTextNode(p));
      legend.appendChild(item);
    });
    const bothKey = document.createElement('span');
    bothKey.className = 'legend-both';
    bothKey.textContent = 'Both free';
    legend.appendChild(bothKey);
    if (usedHints) {
      const usualKey = document.createElement('span');
      usualKey.className = 'legend-usual';
      usualKey.textContent = 'Usually free';
      legend.appendChild(usualKey);
    }
    board.append(grid, legend);
    board.hidden = false;
  }

  // ---- header banner: next movie night (both free), a suggestion from usual days, or a nudge ----
  // "I'm free too" on a date only one of you has ticked: opens the sheet where the other name gets ticked
  function sheetChip(cls, text, line) {
    const gridMode = !!cfg.availabilityCsvUrl;
    const url = (gridMode ? cfg.availabilitySheetUrl : cfg.datesSheetUrl) || cfg.sheetUrl;
    if (!url) return null;
    const a = document.createElement('a');
    a.className = 'chip ' + cls;
    a.textContent = text;
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', () => say(line));
    return a;
  }
  const freeTooChip = () => sheetChip('free-too', "\u2713 I'm free too", 'Tick your name next to the date \u2705');
  // plans changed: opens the sheet to untick your name (or delete the row if nobody's free any more)
  const notFreeChip = () => sheetChip('not-free', "\u2715 Can't make it", 'Untick your name next to that date. Maybe next time \uD83D\uDC3E');

  function renderNextShow(dated, today, hints, lastNight) {
    const box = document.getElementById('next-show');
    if (!box) return;
    box.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'ns-label';
    box.appendChild(label);
    const locked = dated.filter((e) => e.lock !== null).sort((a, b) => a.date - b.date)[0];
    const both = dated.filter((e) => e.both).sort((a, b) => a.date - b.date)[0];
    const any = dated[0];
    const gridMode = !!cfg.availabilityCsvUrl;
    // ticking a date that's already there happens in the sheet; a brand-new date goes through the form
    const tickUrl = (gridMode ? cfg.availabilitySheetUrl : cfg.datesSheetUrl) || cfg.sheetUrl || '#dates';
    const formUrl = gridMode ? tickUrl : (cfg.datesFormUrl || '#dates');
    const addChip = (text, url) => {
      const add = document.createElement('a');
      add.className = 'chip';
      add.textContent = text;
      add.href = url;
      if (url !== '#dates') { add.target = '_blank'; add.rel = 'noopener'; }
      add.addEventListener('click', () => say(url === tickUrl ? 'Tick your name next to the date \u2705' : "Add your day, I'll sniff out when you're both free \uD83D\uDC3E"));
      return add;
    };
    const when = (date) => {
      const w = document.createElement('span');
      w.className = 'ns-when';
      w.textContent = date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
      return w;
    };
    // the next weekday you're both usually free, if that date has no row of its own yet
    let suggestion = null;
    if (!both && hints) {
      for (let i = 0; i < 35 && !suggestion; i++) {
        const d = new Date(today); d.setDate(today.getDate() + i);
        const p = hints.patterns.get(d.getDay());
        if (p && p.both && !hints.explicit.has(ymd(d))) suggestion = d;
      }
    }
    let spoke = false;
    if (locked) {
      label.textContent = 'Movie night locked';
      const tag = document.createElement('span');
      tag.className = 'both-tag locked-tag';
      tag.textContent = '\uD83D\uDD12 LOCKED';
      box.append(when(locked.date), countdown(locked.date, today), tag, showtimeActions(locked));
      const days = Math.round((locked.date - today) / 86400000);
      const what = locked.lock ? locked.lock + ' ' : 'Movie night ';
      if (days <= 1) { spoke = true; setTimeout(() => say(what + (days === 0 ? 'is TONIGHT! \uD83C\uDF7F' : 'is tomorrow! \uD83C\uDF7F')), 1500); }
    } else if (both) {
      label.textContent = 'Next movie night';
      const tag = document.createElement('span');
      tag.className = 'both-tag';
      tag.textContent = 'BOTH FREE';
      box.append(when(both.date), countdown(both.date, today), tag, showtimeActions(both));
      const days = Math.round((both.date - today) / 86400000);
      if (days <= 1) { spoke = true; setTimeout(() => say(days === 0 ? 'Movie night is TONIGHT! \uD83C\uDF7F' : 'Movie night is tomorrow! \uD83C\uDF7F'), 1500); }
    } else if (suggestion) {
      label.textContent = 'Suggested';
      const why = document.createElement('span');
      why.className = 'ns-only';
      why.textContent = "you're usually both free that day";
      box.append(when(suggestion), countdown(suggestion, today), why, addChip('Confirm in the sheet', tickUrl));
    } else {
      label.textContent = 'No movie night yet';
      const none = document.createElement('span');
      none.className = 'ns-only';
      none.textContent = any ? 'no day where you are both free yet: tick "I\'m free too" on a date below' : 'no free dates yet';
      box.append(none, addChip(gridMode ? 'Tick your free days' : '+ Add a free date', formUrl));
    }
    // nothing locked for a while: say how long it's been (from past rows in the Locked column)
    const since = lastNight ? Math.round((today - lastNight) / 86400000) : 0;
    if (!locked && since >= 14) {
      const gap = document.createElement('span');
      gap.className = 'ns-since';
      gap.textContent = since + ' days since your last movie night';
      box.appendChild(gap);
      if (since >= 21 && !spoke) setTimeout(() => say("It's been " + since + ' days since our last movie night! I miss it \uD83E\uDD7A'), 1800);
    }
    box.hidden = false;
  }

  function renderStats(results) {
    const el = document.getElementById('stats');
    if (!el) return;
    const movies = results.find((r) => r && r.kind === 'movies');
    const dates = results.find((r) => r && r.kind === 'dates');
    const parts = [];
    if (movies) {
      if (movies.watchedCol) parts.push(movies.watched + ' watched together');
      parts.push(movies.waiting + ' waiting');
    }
    if (dates) parts.push(dates.both + ' both-free date' + (dates.both === 1 ? '' : 's'));
    if (dates && dates.lastNight) {
      const ago = Math.round((dates.today - dates.lastNight) / 86400000);
      parts.push('last movie night ' + (ago === 1 ? 'yesterday' : ago + ' days ago'));
    }
    if (movies && movies.ratings.length) {
      const avg = movies.ratings.reduce((a, b) => a + b, 0) / movies.ratings.length;
      parts.push('avg \u2605 ' + avg.toFixed(1) + '/10');
    }
    if (!parts.length) return;
    el.textContent = parts.join('  ·  ');
    el.hidden = false;
  }

  async function fillList(listId, csvUrl, emptyText, kind) {
    const list = document.getElementById(listId);
    const watchedList = kind === 'movies' ? document.getElementById('watched-list') : null;
    const watchedBlock = kind === 'movies' ? document.getElementById('watched-block') : null;
    const gridMode = kind === 'dates' && !!cfg.availabilityCsvUrl;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (!csvUrl) { setMessage(list, 'Not connected yet.'); return null; }
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) { setMessage(list, 'Could not load the list (Google answered ' + res.status + '). Is the tab published as CSV?'); return null; }
      const text = await res.text();
      if (/^\s*</.test(text)) { setMessage(list, 'That link is a web page, not CSV. Re-publish the tab as "Comma-separated values (.csv)".'); return null; }
      const parsed = parseCsv(text);
      const header = parsed[0] || [];
      const rows = parsed.slice(1).reverse(); // newest first
      // movies: a "Watched" column (checkboxes) moves a movie to the watched list; a "Rating" column (1-10) shows its score
      const wi = kind === 'movies' ? findCol(header, /watched|vid[eě]n|vid[eě]li/i, -1) : -1;
      // rating columns: one shared "Rating", or one per person ("Jakub's rating", "Adela's rating")
      const ratingCols = kind === 'movies'
        ? header.map((h, i) => ({ i, h })).filter((c) => /rating|hodnocen|stars|hv[eě]zd/i.test(c.h))
          .map((c) => ({ i: c.i, name: c.h.replace(/\s*(['\u2019`\u00B4]s)?\s*(rating|hodnocen|stars|hv[eě]zd)\w*.*$/i, '').trim() }))
        : [];
      const ratingIdx = new Set(ratingCols.map((c) => c.i));
      // dates from the form: who is free comes from a "Who" question (a Checkboxes question gives "Jakub, Adela")
      // and/or from checkbox columns named after each person (TRUE/FALSE), which can also be ticked later in the sheet
      const formDates = kind === 'dates' && !gridMode;
      const boolCol = (i) => {
        let any = false;
        for (const r of rows) {
          const v = (r[i] || '').trim();
          if (!v) continue;
          if (!/^(true|false)$/i.test(v)) return false;
          any = true;
        }
        return any;
      };
      // optional "Locked" column (a movie title or "yes" = that night is set, for both of you) and "What time?" answers
      const lockI = formDates ? header.findIndex((h, i) => i >= 2 && LOCK_COL.test(h)) : -1;
      const timeI = formDates ? header.findIndex((h, i) => i >= 2 && i !== lockI && TIME_COL.test(h)) : -1;
      const personCols = formDates ? header.map((h, i) => i).filter((i) => i >= 2 && i !== lockI && i !== timeI && header[i].trim() && boolCol(i)) : [];
      let whoI = formDates ? findCol(header, /who|kto|kdo|name|meno|jm[eé]no/i, -1) : -1;
      if (personCols.includes(whoI) || whoI === lockI || whoI === timeI) whoI = -1;
      if (formDates && whoI < 0 && header.length > 2 && !personCols.includes(2) && lockI !== 2 && timeI !== 2 && !/note|pozn/i.test(header[2])) whoI = 2;
      const splitNames = (cell) => String(cell || '').split(/\s*(?:,|;|\/|&|\+|\band\b|\ba\b)\s*/i).map((s) => s.trim()).filter(Boolean);
      const namesIn = (r) => [
        ...(whoI >= 0 ? splitNames(r[whoI]) : []),
        ...personCols.filter((i) => isTrue(r[i])).map((i) => header[i].trim()),
      ];
      const skipCols = new Set([whoI, lockI, timeI, ...personCols]);
      let lastNight = null; // the most recent locked night that's already over
      if (watchedBlock) watchedBlock.hidden = wi < 0;

      const seen = readSeen(listId);
      let keptNew = [];
      try { keptNew = JSON.parse(sessionStorage.getItem(SEEN_PREFIX + 'new-' + listId) || '[]'); } catch (e) { /* ignore */ }
      const newKeys = [];
      currentKeys[listId] = [];

      let entries = [];
      let dated = [];
      let people = [];
      let hints = null;
      if (gridMode) {
        const g = parseGrid(parsed, today);
        dated = g.dated;
        people = g.people;
        hints = g.hints;
        lastNight = g.lastNight;
        dated.forEach((e) => currentKeys[listId].push(e.key));
        dated.sort((a, b) => ((b.lock !== null) - (a.lock !== null)) || (b.both - a.both) || (a.date - b.date));
        entries = dated.slice();
      } else {
        const order = kind === 'dates' ? detectOrder(rows.map((r) => r[1] || '')) : 'dmy';
        rows.forEach((r) => {
          const title = (r[1] || '').trim();
          if (!title) return;
          const key = r.join('|');
          currentKeys[listId].push(key);
          const entry = {
            r, key, keys: [key], title,
            date: kind === 'dates' ? parseDate(title, order) : null,
            watched: wi >= 0 && isTrue(r[wi]),
            ratings: ratingCols.map((c) => ({ name: c.name, value: parseRating(r[c.i]) })),
            details: r.slice(2).filter((x, i) => i + 2 !== wi && !ratingIdx.has(i + 2) && !skipCols.has(i + 2)).map((x) => x.trim()).filter(Boolean).join(' · '),
            lock: lockI >= 0 ? lockedValue(r[lockI]) : null,
            slots: timeI >= 0 ? timeSlots(r[timeI]) : [],
          };
          if (entry.date && entry.date < today) { // outdated dates disappear; a locked one counts as the last movie night
            if (entry.lock !== null && (!lastNight || entry.date > lastNight)) lastNight = entry.date;
            return;
          }
          entries.push(entry);
        });
        if (kind === 'dates') {
          // one showtime per day: entries for the same date are merged, and with two different names it's "both free"
          const groups = new Map();
          const textOnly = [];
          personCols.forEach((i) => { const p = header[i].trim(); if (!people.some((x) => sameName(x, p))) people.push(p); });
          rows.slice().reverse().forEach((r) => { // oldest first, so people get stable colours
            namesIn(r).forEach((who) => {
              if (!people.some((p) => sameName(p, who))) people.push(who.charAt(0).toUpperCase() + who.slice(1));
            });
          });
          const canon = (typed) => people.find((p) => sameName(p, typed));
          entries.forEach((e) => {
            const names = namesIn(e.r).map(canon).filter(Boolean);
            if (!e.date) {
              e.details = [Array.from(new Set(names)).join(' + '), e.details].filter(Boolean).join(' · ');
              textOnly.push(e);
              return;
            }
            const k = ymd(e.date);
            let g = groups.get(k);
            if (!g) { g = { r: e.r, title: e.title, date: e.date, keys: [], names: [], notes: [], free: new Map(), lock: null }; groups.set(k, g); }
            g.keys.push(e.key);
            names.forEach((n) => {
              if (!g.names.includes(n)) g.names.push(n);
              // a row without a time means any time; times from several rows add up
              if (!e.slots.length) g.free.set(n, null);
              else if (!g.free.has(n) || g.free.get(n)) g.free.set(n, new Set([...(g.free.get(n) || []), ...e.slots]));
            });
            if (e.lock !== null && !g.lock) g.lock = e.lock; // a movie title wins over a plain "yes"
            e.r.slice(2).forEach((x, i) => { const v = x.trim(); if (!skipCols.has(i + 2) && v && !g.notes.includes(v)) g.notes.push(v); });
          });
          groups.forEach((g) => g.names.sort((a, b) => people.indexOf(a) - people.indexOf(b)));
          dated = Array.from(groups.values()).map((g) => {
            const ov = overlap(g.free);
            return Object.assign(g, {
              key: g.keys[0],
              both: ov.both,
              details: [whoText(g.free, people, ov), ...g.notes].filter(Boolean).join(' · '),
            });
          });
          dated.sort((a, b) => ((b.lock !== null) - (a.lock !== null)) || (b.both - a.both) || (a.date - b.date));
          entries = [...dated, ...textOnly];
        }
      }

      list.innerHTML = '';
      if (watchedList) watchedList.innerHTML = '';
      const ratings = [];
      entries.forEach((e) => {
        const li = document.createElement('li');
        if (e.date) {
          // showtime: day number and month in the ticket stub, weekday + how soon it is in the row
          li.classList.add('showtime');
          if (e.both) li.classList.add('both');
          const stub = document.createElement('span');
          stub.className = 'stub';
          const dnum = document.createElement('b');
          dnum.textContent = e.date.getDate();
          const mon = document.createElement('i');
          mon.textContent = e.date.toLocaleDateString(undefined, { month: 'short' }).replace('.', '');
          stub.append(dnum, mon);
          li.appendChild(stub);
          li.appendChild(document.createTextNode(e.date.toLocaleDateString(undefined, { weekday: 'long' }) +
            (e.date.getFullYear() !== today.getFullYear() ? ' ' + e.date.getFullYear() : '')));
          li.appendChild(countdown(e.date, today));
          if (e.lock !== null && e.lock !== undefined) {
            const tag = document.createElement('span');
            tag.className = 'both-tag locked-tag';
            tag.textContent = '\uD83D\uDD12 LOCKED';
            li.appendChild(tag);
          } else if (e.both) {
            const tag = document.createElement('span');
            tag.className = 'both-tag';
            tag.textContent = 'BOTH FREE';
            li.appendChild(tag);
          }
        } else {
          li.textContent = e.title;
        }
        (e.ratings || []).filter((x) => x.value).forEach((x) => {
          ratings.push(x.value);
          const st = document.createElement('span');
          st.className = 'stars';
          st.textContent = (x.name ? x.name + ' ' : '') + ratingText(x.value);
          st.setAttribute('aria-label', (x.name ? x.name + ': ' : '') + x.value + ' out of 10');
          li.appendChild(st);
        });
        const isNew = !e.watched && e.keys.some((k) => (seen && !seen.includes(k)) || keptNew.includes(k));
        if (isNew) {
          newKeys.push(...e.keys);
          const badge = document.createElement('span');
          badge.className = 'new-badge';
          badge.textContent = 'NEW';
          li.appendChild(badge);
        }
        if (e.details) {
          const small = document.createElement('small');
          small.textContent = e.details;
          li.appendChild(small);
        }
        if (e.date) {
          li.classList.add('has-cal');
          if (e.lock != null) li.classList.add('both', 'is-locked');
          li.appendChild(showtimeActions(e));
        }
        if (kind === 'movies') {
          const row = document.createElement('span');
          row.className = 'tix-row';
          const c = document.createElement('a');
          c.className = 'chip mini';
          c.href = csfdUrl(e.title);
          c.target = '_blank';
          c.rel = 'noopener';
          c.textContent = 'ČSFD ↗';
          row.appendChild(c);
          const missing = (e.ratings || []).filter((x) => !x.value);
          const unrated = missing.map((x) => x.name).filter(Boolean);
          if (e.watched && (!ratingCols.length || missing.length) && cfg.sheetUrl) {
            // watched but someone's score is missing: open the sheet to fill it in
            const rate = document.createElement('a');
            rate.className = 'chip mini rate';
            rate.href = cfg.sheetUrl;
            rate.target = '_blank';
            rate.rel = 'noopener';
            rate.textContent = unrated.length && missing.length < ratingCols.length ? '\u2605 ' + unrated.join(' & ') + ': rate it' : '\u2605 Rate it';
            rate.addEventListener('click', () => say('How many out of 10? Write it in your rating column \u2B50'));
            row.appendChild(rate);
          }
          li.appendChild(row);
        }
        if (e.watched) { li.classList.add('done'); watchedList.appendChild(li); } else list.appendChild(li);
      });
      try { sessionStorage.setItem(SEEN_PREFIX + 'new-' + listId, JSON.stringify(newKeys)); } catch (e) { /* ignore */ }
      if (!list.children.length) {
        setMessage(list, kind === 'dates'
          ? (gridMode ? 'No free days ticked yet. Tick yours in the sheet!' : (rows.length ? 'No upcoming dates. Add one!' : emptyText))
          : emptyText);
      }
      if (watchedList && wi >= 0 && !watchedList.children.length) setMessage(watchedList, 'Nothing watched yet.');
      collapseList(list, kind === 'dates' ? 5 : 6);
      if (watchedList) collapseList(watchedList, 4);
      if (kind === 'dates') {
        renderNextShow(dated, today, hints, lastNight);
        renderBoard(dated, people, today, hints);
        return { kind, both: dated.filter((e) => e.both).length, lastNight, today };
      }
      movieTitles = entries.filter((e) => !e.watched).map((e) => e.title);
      renderTaste(entries);
      return {
        kind,
        watchedCol: wi >= 0,
        watched: entries.filter((e) => e.watched).length,
        waiting: movieTitles.length,
        ratings,
      };
    } catch (e) {
      console.error('Planner: failed to load', csvUrl, e);
      setMessage(list, 'Could not reach Google (network or blocked). Try reloading.');
      return null;
    }
  }

  // Link to the Google Sheet itself (the normal /edit link) so a movie can be ticked as watched; hidden until set in config.js
  const sheetLink = document.getElementById('open-sheet');
  if (cfg.sheetUrl) { sheetLink.href = cfg.sheetUrl; sheetLink.hidden = false; }
  wireReminder();
  wirePicker();
  setButton('add-movie', cfg.moviesFormUrl);
  document.getElementById('add-movie').addEventListener('click', () => say('Add a good one! \uD83C\uDFAC'));
  document.getElementById('add-date').addEventListener('click', () => say("Add your day, I'll sniff out when you're both free \uD83D\uDC3E"));
  sheetLink.addEventListener('click', () => say('Tick it and rate it out of 10 \u2B50'));
  if (cfg.availabilityCsvUrl) {
    // free days are ticked in the sheet's "Free days" tab, not added with the form
    const addDate = document.getElementById('add-date');
    addDate.textContent = '✓ Tick your free days';
    setButton('add-date', cfg.availabilitySheetUrl || cfg.sheetUrl);
  } else {
    setButton('add-date', cfg.datesFormUrl);
  }
  // "Add to home screen": the browser's own install prompt where there is one (Android Chrome), otherwise Tara explains.
  // Opened from the home screen the page runs full screen like an app, so the button hides there.
  const homeBtn = document.getElementById('add-home');
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });
  window.addEventListener('appinstalled', () => { if (homeBtn) homeBtn.hidden = true; });
  if (homeBtn) {
    if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone) homeBtn.hidden = true;
    homeBtn.addEventListener('click', () => {
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then((r) => say(r.outcome === 'accepted' ? "I'm on your home screen now! \uD83D\uDC3E" : 'Maybe later then \uD83D\uDC3E'));
        installPrompt = null;
        return;
      }
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      say(ios ? 'Tap Share \u2B06\uFE0F at the bottom, then "Add to Home Screen" \uD83D\uDCF2'
        : 'Open the browser menu \u22EE and tap "Add to Home screen" \uD83D\uDCF2');
    });
  }

  Promise.all([
    fillList('movie-list', cfg.moviesCsvUrl, 'No movies yet. Add the first one!', 'movies'),
    fillList('date-list', cfg.availabilityCsvUrl || cfg.datesCsvUrl, 'No dates yet. Add one!', 'dates'),
  ]).then(renderStats);
})();

// Pixel Tara: a tiny pixel-art dachshund who trots along the bottom of the screen now and then.
// Tapping her opens the dog corner. With reduced motion she just sits in the corner.
(function pixelTara() {
  const B = '#c8692b', D = '#7a3a12', K = '#111', L = '#c6ff00';
  // 24 x 10 pixels, facing right: long body, tail up, floppy dark ear. Two leg frames for the trot.
  const BODY = [
    '..................BBB...',
    '.................BBBBB..',
    '.................BKBBBBB',
    '..D.............DDBBBBBK',
    '...D............DDBBB...',
    '....BBBBBBBBBBBBBBBB....',
    '....BBBBBBBBBBBBBBB.....',
    '.....BBBBBBBBBBBBB......',
  ];
  const LEGS = [
    ['.....BB.......BB........', '.....D........D.........'],
    ['......BB.......BB.......', '.......D........D.......'],
  ];
  const colors = { B, D, K, L, S: '#e3925a', P: '#ff6f9d', W: '#ffffff' };
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 10');
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');
  const paint = (rows, y0, parent) => rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (!colors[c]) return;
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x); r.setAttribute('y', y0 + y); r.setAttribute('width', 1.02); r.setAttribute('height', 1.02);
    r.setAttribute('fill', colors[c]);
    parent.appendChild(r);
  }));
  // split the sprite into parts that can move on their own
  const TAIL_UP = [[2, 3], [3, 4]];
  const TAIL_DOWN = [[1, 5], [2, 5], [3, 5]];
  const isTail = (x, y) => TAIL_UP.some(([tx, ty]) => tx === x && ty === y);
  const part = (cls) => { const g = document.createElementNS(NS, 'g'); g.setAttribute('class', cls); svg.appendChild(g); return g; };
  const bodyG = part('body'), headG = part('head'), tailUpG = part('tail-up'), tailDownG = part('tail-down');
  BODY.forEach((row, y) => [...row].forEach((c, x) => {
    if (!colors[c]) return;
    const target = isTail(x, y) ? tailUpG : (x >= 16 && y <= 4 ? headG : bodyG);
    paint([' '.repeat(x) + c], y, target);
  }));
  TAIL_DOWN.forEach(([x, y]) => paint([' '.repeat(x) + 'D'], y, tailDownG));
  LEGS.forEach((frame, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'legs legs-' + i);
    paint(frame, 8, g);
    svg.appendChild(g);
  });
  const tara = document.createElement('button');
  tara.type = 'button';
  tara.className = 'tara';
  tara.setAttribute('aria-label', 'Tara. Open the dog corner');
  const bubble = document.createElement('span');
  bubble.className = 'tara-bubble';
  bubble.textContent = 'woof!';
  tara.append(svg, bubble);
  document.body.appendChild(tara);

  tara.addEventListener('click', () => {
    bubble.textContent = 'woof!';
    tara.classList.add('barking');
    setTimeout(() => tara.classList.remove('barking'), 1200);
    if (window.taraInterrupt) window.taraInterrupt();
    if (window.taraSay) window.taraSay("That's me! \uD83D\uDC3E");
    const dogs = document.getElementById('dogs');
    const det = dogs && dogs.querySelector('details');
    if (det && !det.open) det.open = true;
    if (dogs) dogs.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---- Tara the avatar: her face pops up in the corner with a speech bubble when you do something ----
  // 16 x 13 pixels, front view: floppy dark ears, light muzzle, black nose, pink tongue.
  const FACE = [
    '....BBBBBBBB....',
    '...BBBBBBBBBB...',
    '..DBBBBBBBBBBD..',
    '.DDBBKWBBKWBBDD.',
    '.DDBBKKBBKKBBDD.',
    '.DDBBBBBBBBBBDD.',
    '.DDBBBSSSSBBBDD.',
    '.DDBBSSKKSSBBDD.',
    '.DD.BSSKKSSB.DD.',
    '.DD.BSSSSSSB.DD.',
    '..D..SSPPSS..D..',
    '.....BSPPSB.....',
    '....BBBBBBBB....',
  ];
  const face = document.createElementNS(NS, 'svg');
  face.setAttribute('viewBox', '0 0 16 13');
  face.setAttribute('shape-rendering', 'crispEdges');
  face.setAttribute('aria-hidden', 'true');
  paint(FACE, 0, face);
  const pop = document.createElement('div');
  pop.className = 'tara-pop';
  pop.setAttribute('role', 'status');
  pop.setAttribute('aria-live', 'polite');
  const msg = document.createElement('p');
  msg.className = 'tara-msg';
  const avatar = document.createElement('button');
  avatar.type = 'button';
  avatar.className = 'tara-face';
  avatar.setAttribute('aria-label', 'Tara');
  avatar.appendChild(face);
  pop.append(msg, avatar);
  document.body.appendChild(pop);
  let hideTimer = null;
  window.taraSay = (text) => {
    msg.textContent = text;
    pop.classList.remove('show');
    void pop.offsetWidth; // replay the pop-in for a new message
    pop.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => pop.classList.remove('show'), 4000);
  };
  avatar.addEventListener('click', () => window.taraSay('Woof! \uD83D\uDC3E'));

  // A link that opens a new tab right after Tara spoke waits a moment, so the message can be read first.
  // Not in the home-screen app (links leave it anyway). This page is never replaced: if the browser blocks the
  // late tab, Tara asks for another tap, and that tap opens the link straight away.
  let saidAt = 0, pending = null, retry = null;
  const sayRaw = window.taraSay;
  window.taraSay = (text) => { saidAt = Date.now(); sayRaw(text); };
  const asApp = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest && ev.target.closest('a[target="_blank"]');
    if (!a || ev.defaultPrevented || ev.button || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
    if (a === retry) { retry = null; return; } // the tap after a blocked tab: let the browser open it now
    if (!/^https?:/.test(a.href) || Date.now() - saidAt > 150 || asApp()) return; // only links that just made Tara talk
    ev.preventDefault();
    if (pending) {
      if (pending.a === a) return; // a double tap opens one tab
      clearTimeout(pending.timer);  // a different link: that one wins
    }
    pending = {
      a,
      timer: setTimeout(() => {
        pending = null;
        const w = window.open(a.href, '_blank');
        if (w) w.opener = null;
        else { retry = a; sayRaw('Tap it once more to open it \uD83D\uDC3E'); }
      }, 1000),
    };
  });

  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { tara.classList.add('sitting'); return; }

  // ---- walking: each stroll is a little plan of moves and stops, played frame by frame ----
  const rand = (a, b) => a + Math.random() * (b - a);
  const OFF = 100;              // px outside the screen where she starts and ends
  const SPEED = 70, ZOOM = 230; // px per second: trot and zoomies
  let x = -OFF, dir = 1, plan = [], cur = null, last = 0, phase = 0, raf = 0, nextTimer = 0, active = false;

  const setPose = (classes) => {
    tara.classList.remove('trot', 'running', 'sniffing', 'wagging');
    classes.split(' ').filter(Boolean).forEach((c) => tara.classList.add(c));
  };
  const turnTo = (d) => { dir = d; tara.classList.toggle('left', d < 0); };
  const heart = () => {
    bubble.textContent = '\u2665';
    tara.classList.add('barking');
    setTimeout(() => { tara.classList.remove('barking'); bubble.textContent = 'woof!'; }, 1100);
  };

  function makePlan() {
    const w = window.innerWidth;
    const d = Math.random() < 0.5 ? 1 : -1;
    const startX = d > 0 ? -OFF : w + 20;
    const exitX = d > 0 ? w + 20 : -OFF;
    const steps = [];
    if (Math.random() < 0.18) {
      // zoomies: one fast, hoppy dash across
      steps.push({ type: 'move', to: exitX, speed: ZOOM, hop: true });
      return { d, startX, steps };
    }
    // 0-3 stops at random spots along the way
    const stops = Math.floor(rand(0, 4));
    const spots = Array.from({ length: stops }, () => rand(0.12, 0.88)).sort((p, q) => p - q);
    let turned = false;
    spots.forEach((f, i) => {
      const at = d > 0 ? f * w : (1 - f) * w;
      steps.push({ type: 'move', to: at - 42, speed: rand(55, 90) });
      const act = ['sniff', 'wag', 'look', 'sniff'][Math.floor(rand(0, 4))];
      steps.push({ type: 'act', act, dur: act === 'look' ? 1.4 : rand(1.2, 2.4) });
      if (!turned && i === stops - 1 && Math.random() < 0.25) {
        // changes her mind and trots back the way she came
        turned = true;
        steps.push({ type: 'move', to: startX, speed: rand(60, 95) });
      }
    });
    if (!turned) steps.push({ type: 'move', to: exitX, speed: rand(60, 90) });
    return { d, startX, steps };
  }

  function begin(seg) {
    seg.left = seg.dur || 0;
    if (seg.type === 'move') {
      turnTo(seg.to >= x ? 1 : -1);
      setPose(seg.hop ? 'trot running' : 'trot');
    } else if (seg.act === 'sniff') {
      setPose('sniffing');
    } else if (seg.act === 'wag') {
      setPose('wagging');
      heart();
    } else {
      setPose(''); // look: stand still, glance back, then look ahead again
    }
  }

  function frame(t) {
    const dt = Math.min(0.05, last ? (t - last) / 1000 : 0);
    last = t;
    if (!cur) {
      cur = plan.shift();
      if (!cur) { finish(); return; }
      begin(cur);
    }
    let y = 0;
    if (cur.type === 'move') {
      const dist = cur.to - x;
      const stepPx = cur.speed * dt * Math.sign(dist);
      if (Math.abs(stepPx) >= Math.abs(dist)) { x = cur.to; cur = null; } else x += stepPx;
      phase += dt;
      y = cur && cur.hop ? -Math.abs(Math.sin(phase * 13)) * 7 : -Math.abs(Math.sin(phase * 11)) * 1.5; // bounce in her step
    } else {
      cur.left -= dt;
      if (cur.act === 'look') {
        const half = cur.dur / 2;
        if (!cur.turned && cur.left < half + 0.3) { cur.turned = true; turnTo(-dir); }
        if (!cur.back && cur.left < 0.3) { cur.back = true; turnTo(-dir); }
      }
      if (cur.left <= 0) cur = null;
    }
    tara.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    active = false;
    setPose('');
    cancelAnimationFrame(raf);
    clearTimeout(nextTimer);
    nextTimer = setTimeout(walk, rand(10000, 25000)); // next stroll in 10-25 s
  }

  function walk(custom) {
    if (active && !custom) return;
    cancelAnimationFrame(raf);
    clearTimeout(nextTimer);
    const p = custom || makePlan();
    plan = p.steps.map((s) => Object.assign({}, s));
    x = p.startX;
    turnTo(p.d);
    cur = null;
    last = 0;
    phase = 0;
    active = true;
    raf = requestAnimationFrame(frame);
  }

  // tapped while walking: stop, wag, then carry on with the walk
  window.taraInterrupt = () => {
    if (!active) return;
    if (cur) plan.unshift(cur);
    plan.unshift({ type: 'act', act: 'wag', dur: 1.6 });
    cur = null;
  };
  window.taraWalk = walk; // handy for testing: taraWalk() starts a stroll right away

  nextTimer = setTimeout(walk, 3000);
})();
