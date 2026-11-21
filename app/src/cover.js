// Vice City Cover Maker — the cover painter.
// Draws a multi-panel GTA-style poster on a canvas: each panel holds one photo
// (cover-fit, draggable, zoomable), a Vice City sunset grade washes over the
// whole poster, and the caption is set in Anton with a hot gradient fill.
//
// Layouts (fractions of the canvas, before the caption band):
//   poster — a big hero panel left, two stacked panels right
//   solo   — one photo, full bleed
//   strip  — three panels side by side
// The caption band overlaps the bottom of the panels, GTA-cover style.

export const LAYOUTS = ['poster', 'solo', 'strip'];

function panelRects(layout, w, h) {
  const gap = Math.round(w * 0.012);
  const band = Math.round(h * 0.20); // caption band height
  const top = h - band;
  if (layout === 'solo') {
    return [{ x: 0, y: 0, w, h: top }];
  }
  if (layout === 'strip') {
    const pw = (w - gap * 2) / 3;
    return [
      { x: 0, y: 0, w: pw, h: top },
      { x: pw + gap, y: 0, w: pw, h: top },
      { x: (pw + gap) * 2, y: 0, w: pw, h: top },
    ];
  }
  // poster
  const heroW = Math.round(w * 0.60);
  const sideX = heroW + gap;
  const sideW = w - sideX;
  const sideH = (top - gap) / 2;
  return [
    { x: 0, y: 0, w: heroW, h: top },
    { x: sideX, y: 0, w: sideW, h: sideH },
    { x: sideX, y: sideH + gap, w: sideW, h: sideH },
  ];
}

// Paint one photo into a panel rect, cover-fit, with pan (ox, oy in -0.5..0.5)
// and zoom (>= 1). The grade is a warm sunset wash applied on top.
function paintPanel(ctx, img, rect, pan, grade) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * pan.zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) / 2 + pan.ox * w * 0.35;
  const dy = y + (h - dh) / 2 + pan.oy * h * 0.35;
  ctx.drawImage(img, dx, dy, dw, dh);
  // Sunset grade: magenta sky at the top fading to orange at the bottom.
  if (grade > 0) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, `rgba(255, 46, 136, ${0.34 * grade})`);
    g.addColorStop(0.55, `rgba(255, 122, 24, ${0.22 * grade})`);
    g.addColorStop(1, `rgba(88, 28, 135, ${0.30 * grade})`);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }
  // Vignette: darkens the panel edges so the poster reads as one piece.
  const v = ctx.createRadialGradient(
    x + w / 2, y + h / 2, Math.min(w, h) * 0.42,
    x + w / 2, y + h / 2, Math.max(w, h) * 0.75,
  );
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(10,2,20,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  // Thin dark frame between panels.
  ctx.strokeStyle = 'rgba(8,2,16,0.9)';
  ctx.lineWidth = Math.max(2, Math.round(w * 0.004));
  ctx.strokeRect(x, y, w, h);
}

function paintCaption(ctx, cfg, w, h) {
  const band = Math.round(h * 0.20);
  const by = h - band;
  // Deep purple band, fading in from the art above.
  const bg = ctx.createLinearGradient(0, by - band * 0.35, 0, h);
  bg.addColorStop(0, 'rgba(16,5,32,0)');
  bg.addColorStop(0.45, 'rgba(16,5,32,0.92)');
  bg.addColorStop(1, 'rgba(16,5,32,1)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, by - band * 0.35, w, band * 1.35);

  const title = (cfg.title || 'VICE CITY').toUpperCase();
  const sub = cfg.subtitle || '';
  const scale = cfg.titleScale || 1;
  // Fit the title across the width, then draw it in the band. Keep the title
  // and the subtitle inside the band: the title sits in the upper half of
  // the band and the subtitle just below it, clear of the canvas edge.
  let size = Math.round(w * 0.105 * scale);
  ctx.font = `${size}px Anton, Impact, sans-serif`;
  const maxW = w * 0.92;
  while (ctx.measureText(title).width > maxW && size > 24) {
    size = Math.round(size * 0.94);
    ctx.font = `${size}px Anton, Impact, sans-serif`;
  }
  const cx = w / 2;
  const ty = by + band * 0.38;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  // Gradient fill: gold at the top, hot pink at the bottom.
  const fill = ctx.createLinearGradient(0, ty - size * 0.55, 0, ty + size * 0.55);
  fill.addColorStop(0, '#ffd166');
  fill.addColorStop(0.45, '#ff7a18');
  fill.addColorStop(1, '#ff2e88');
  ctx.lineWidth = Math.max(3, Math.round(size * 0.10));
  ctx.strokeStyle = 'rgba(12,2,24,0.95)';
  ctx.strokeText(title, cx, ty);
  ctx.fillStyle = fill;
  ctx.fillText(title, cx, ty);

  if (sub) {
    const subSize = Math.round(size * 0.26);
    ctx.font = `600 ${subSize}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(245,238,252,0.92)';
    ctx.fillText(sub.toUpperCase(), cx, ty + size * 0.58);
  }
  // Thin neon rule under the band.
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(w * 0.06, h - Math.max(3, h * 0.006), w * 0.88, Math.max(3, h * 0.006));
}

export function renderCover(canvas, cfg) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#12081c';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(cfg.layout, w, h);
  const panels = cfg.panels || [];
  rects.forEach((rect, i) => {
    const p = panels[i];
    if (p && p.img && p.img.complete && p.img.naturalWidth > 0) {
      paintPanel(ctx, p.img, rect, p.pan || { ox: 0, oy: 0, zoom: 1 }, cfg.grade ?? 0.55);
    } else {
      // Empty panel: deep gradient so the poster never shows a hole.
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      g.addColorStop(0, '#3b1155');
      g.addColorStop(1, '#12081c');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
  });
  paintCaption(ctx, cfg, w, h);
}

// Export the current cover as a PNG blob at the requested size.
export function exportCover(cfg, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  renderCover(canvas, cfg);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
