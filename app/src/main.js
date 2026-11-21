// Vice City Cover Maker — the editor.
// Loads the sample photos (or the user's own uploads), keeps one pan/zoom per
// panel, and re-renders the cover on every change. Export writes a PNG at the
// size the user picked. No network: everything runs on the machine.

import { renderCover, exportCover } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = {
  boulevard: 'samples/boulevard.jpg',
  pier: 'samples/pier.jpg',
};

const state = {
  layout: 'poster',
  size: { w: 1080, h: 1080 },
  title: 'VICE CITY',
  subtitle: 'Sunset Heist',
  titleScale: 1,
  grade: 0.55,
  heroZoom: 1.15,
  panels: [
    { key: 'boulevard', pan: { ox: 0, oy: 0, zoom: 1.15 } },
    { key: 'pier', pan: { ox: 0, oy: 0, zoom: 1.1 } },
    { key: 'boulevard', pan: { ox: 0, oy: 0, zoom: 1.1 } },
  ],
  uploads: {}, // key -> object URL
};

const canvas = document.getElementById('cover');
const images = {}; // key -> HTMLImageElement

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function ensureImages() {
  for (const key of ['boulevard', 'pier']) {
    if (!images[key]) images[key] = await loadImage(SAMPLES[key]);
  }
}

function currentConfig() {
  return {
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
    titleScale: state.titleScale,
    panels: state.panels.map((p) => ({
      img: images[p.key] || null,
      pan: p.pan,
    })),
  };
}

function render() {
  canvas.width = state.size.w;
  canvas.height = state.size.h;
  renderCover(canvas, currentConfig());
  const label = document.getElementById('stage-label');
  if (label) label.textContent = `${state.layout[0].toUpperCase() + state.layout.slice(1)} · ${state.size.w} × ${state.size.h}`;
}

function bindSelect(id, index) {
  const el = document.getElementById(id);
  el.addEventListener('change', () => {
    state.panels[index].key = el.value;
    render();
  });
}

// Drag a photo inside its panel to reposition it; wheel zooms the hero.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  drag = { x, y, panel: panelAt(x, y) };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag || drag.panel < 0) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  const pan = state.panels[drag.panel].pan;
  pan.ox = Math.max(-0.5, Math.min(0.5, pan.ox + (x - drag.x) / canvas.width));
  pan.oy = Math.max(-0.5, Math.min(0.5, pan.oy + (y - drag.y) / canvas.height));
  drag.x = x;
  drag.y = y;
  render();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const pan = state.panels[0].pan;
  pan.zoom = Math.max(1, Math.min(2.5, pan.zoom - Math.sign(e.deltaY) * 0.08));
  document.getElementById('zoom-hero').value = String(pan.zoom);
  render();
}, { passive: false });

function panelAt(x, y) {
  // Same fractions as cover.js panelRects, so the hit test matches the paint.
  const w = canvas.width;
  const h = canvas.height;
  const band = Math.round(h * 0.20);
  const top = h - band;
  if (y > top) return -1;
  if (state.layout === 'solo') return 0;
  if (state.layout === 'strip') return Math.min(2, Math.floor(x / (w / 3)));
  const heroW = Math.round(w * 0.60);
  if (x < heroW) return 0;
  const gap = Math.round(w * 0.012);
  const sideH = (top - gap) / 2;
  return y < sideH ? 1 : 2;
}

document.getElementById('file-hero').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  images.upload = img;
  state.uploads.upload = url;
  state.panels[0].key = 'upload';
  document.getElementById('sel-hero').value = 'upload';
  render();
});

document.getElementById('btn-sample').addEventListener('click', async () => {
  await ensureImages();
  state.panels[0].key = 'boulevard';
  state.panels[1].key = 'pier';
  state.panels[2].key = 'boulevard';
  document.getElementById('sel-hero').value = 'boulevard';
  document.getElementById('sel-side1').value = 'pier';
  document.getElementById('sel-side2').value = 'boulevard';
  render();
});

bindSelect('sel-hero', 0);
bindSelect('sel-side1', 1);
bindSelect('sel-side2', 2);

document.getElementById('zoom-hero').addEventListener('input', (e) => {
  state.panels[0].pan.zoom = Number(e.target.value);
  render();
});
document.getElementById('grade').addEventListener('input', (e) => {
  state.grade = Number(e.target.value);
  render();
});
document.getElementById('cap-title').addEventListener('input', (e) => {
  state.title = e.target.value || 'VICE CITY';
  render();
});
document.getElementById('cap-sub').addEventListener('input', (e) => {
  state.subtitle = e.target.value;
  render();
});
document.getElementById('cap-size').addEventListener('input', (e) => {
  state.titleScale = Number(e.target.value);
  render();
});

document.querySelectorAll('.layout-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.layout-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.layout = btn.dataset.layout;
    render();
  });
});
document.querySelectorAll('.size-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.size = { w: Number(btn.dataset.w), h: Number(btn.dataset.h) };
    render();
  });
});

document.getElementById('btn-export').addEventListener('click', async () => {
  const blob = await exportCover(currentConfig(), state.size.w, state.size.h);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `vice-city-cover-${state.size.w}x${state.size.h}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
});

// Fixed screenshot scenes (?shot=editor / ?shot=cover) for the entry's dossier.
// A shot may also carry &size=square|portrait|wide to render the cover at
// that export size, so the portrait screenshot is a real 1080x1350 cover.
const params = new URLSearchParams(location.search);
if (params.has('shot')) {
  const sizeName = params.get('size');
  if (sizeName === 'portrait') state.size = { w: 1080, h: 1350 };
  else if (sizeName === 'wide') state.size = { w: 1920, h: 1080 };
  else state.size = { w: 1080, h: 1080 };
  runShot(params.get('shot'), params, async (photo, caption) => {
    await ensureImages();
    state.panels[0].key = photo;
    state.panels[1].key = photo === 'pier' ? 'boulevard' : 'pier';
    state.panels[2].key = photo;
    state.title = caption;
    state.subtitle = 'Sunset Heist';
    render();
  });
} else {
  ensureImages().then(render);
}
