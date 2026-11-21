// scenes.js — every picture in the game is drawn here, in code, as inline SVG.
// Two scenes (a cat café and a night garden). Each scene is drawn twice —
// variant "a" and variant "b" — from the same builder, so the panels are
// near-identical except for the 7 differences listed in DIFFERENCES.
// Nothing here loads an image: the art is all shapes, so the game works offline.

const SVGNS = 'http://www.w3.org/2000/svg';

export const VIEW_W = 560;
export const VIEW_H = 420;

function el(parent, tag, attrs = {}) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  parent.appendChild(node);
  return node;
}

function text(parent, x, y, content, attrs = {}) {
  const node = el(parent, 'text', { x, y, ...attrs });
  node.textContent = content;
  return node;
}

// ---------------------------------------------------------------------------
// Level 1 — "The Cat Café": a warm café corner with a cat on a cushion.
// Differences (variant a vs b):
//   clock-hands   wall clock reads 3:00 vs 4:30
//   cat-bow       the cat's bow is red vs teal
//   window-sky    sun in the window vs a cloud
//   teapot-steam  steam curls above the teapot vs none
//   plant-flower  three pink flowers vs two (middle one gone)
//   wall-picture  framed picture shows a fish vs a mouse
//   coffee-cup    the cup is full of coffee vs empty
// ---------------------------------------------------------------------------

function drawCafe(svg, variant) {
  const b = variant === 'b';

  // wall + floor
  el(svg, 'rect', { x: 0, y: 0, width: 560, height: 320, fill: '#f7e8c9' });
  el(svg, 'rect', { x: 0, y: 320, width: 560, height: 100, fill: '#b07a45' });
  for (let i = 0; i < 5; i++) {
    el(svg, 'line', { x1: 0, y1: 340 + i * 15, x2: 560, y2: 340 + i * 15, stroke: '#9c6a38', 'stroke-width': 2, opacity: 0.5 });
  }
  // wainscot line
  el(svg, 'rect', { x: 0, y: 312, width: 560, height: 8, fill: '#e3cfa5' });

  // bunting flags across the top
  const flagColors = ['#e76f51', '#e9c46a', '#2a9d8f', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#f4a261'];
  el(svg, 'path', { d: 'M0 26 Q280 52 560 26', fill: 'none', stroke: '#7a4a2b', 'stroke-width': 2 });
  flagColors.forEach((color, i) => {
    const x = 30 + i * 66;
    const y = 30 + Math.sin(i * 0.9) * 4;
    el(svg, 'path', { d: `M${x} ${y} L${x + 22} ${y + 2} L${x + 11} ${y + 22} Z`, fill: color });
  });

  // window (left)
  el(svg, 'rect', { x: 28, y: 48, width: 186, height: 158, rx: 8, fill: '#fff', stroke: '#7a4a2b', 'stroke-width': 5 });
  el(svg, 'rect', { x: 38, y: 58, width: 166, height: 138, fill: '#bfe3f2' });
  el(svg, 'line', { x1: 121, y1: 58, x2: 121, y2: 196, stroke: '#fff', 'stroke-width': 5 });
  el(svg, 'line', { x1: 38, y1: 127, x2: 204, y2: 127, stroke: '#fff', 'stroke-width': 5 });
  if (!b) {
    // sunny day
    el(svg, 'circle', { cx: 82, cy: 92, r: 24, fill: '#ffd93b' });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      el(svg, 'line', {
        x1: 82 + Math.cos(a) * 30, y1: 92 + Math.sin(a) * 30,
        x2: 82 + Math.cos(a) * 38, y2: 92 + Math.sin(a) * 38,
        stroke: '#ffd93b', 'stroke-width': 4, 'stroke-linecap': 'round',
      });
    }
    el(svg, 'ellipse', { cx: 168, cy: 168, rx: 22, ry: 9, fill: '#ffffff', opacity: 0.9 });
    el(svg, 'ellipse', { cx: 182, cy: 161, rx: 16, ry: 8, fill: '#ffffff', opacity: 0.9 });
  } else {
    // cloudy day
    el(svg, 'ellipse', { cx: 88, cy: 96, rx: 30, ry: 15, fill: '#ffffff' });
    el(svg, 'ellipse', { cx: 108, cy: 86, rx: 24, ry: 14, fill: '#ffffff' });
    el(svg, 'ellipse', { cx: 66, cy: 86, rx: 18, ry: 11, fill: '#ffffff' });
    el(svg, 'ellipse', { cx: 168, cy: 168, rx: 22, ry: 9, fill: '#ffffff', opacity: 0.9 });
    el(svg, 'ellipse', { cx: 182, cy: 161, rx: 16, ry: 8, fill: '#ffffff', opacity: 0.9 });
  }
  el(svg, 'rect', { x: 20, y: 206, width: 202, height: 10, rx: 3, fill: '#7a4a2b' });
  // little bird on the sill (same in both)
  el(svg, 'ellipse', { cx: 190, cy: 198, rx: 10, ry: 7, fill: '#5b8c5a' });
  el(svg, 'circle', { cx: 198, cy: 192, r: 6, fill: '#5b8c5a' });
  el(svg, 'path', { d: 'M204 192 L210 194 L204 196 Z', fill: '#e9c46a' });

  // wall clock
  el(svg, 'circle', { cx: 330, cy: 92, r: 40, fill: '#fffdf6', stroke: '#7a4a2b', 'stroke-width': 6 });
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    el(svg, 'line', {
      x1: 330 + Math.cos(a) * 32, y1: 92 + Math.sin(a) * 32,
      x2: 330 + Math.cos(a) * 36, y2: 92 + Math.sin(a) * 36,
      stroke: '#7a4a2b', 'stroke-width': 2,
    });
  }
  if (!b) {
    // 3:00 — hour hand right, minute hand up
    el(svg, 'line', { x1: 330, y1: 92, x2: 352, y2: 92, stroke: '#3d2b1f', 'stroke-width': 5, 'stroke-linecap': 'round' });
    el(svg, 'line', { x1: 330, y1: 92, x2: 330, y2: 62, stroke: '#3d2b1f', 'stroke-width': 4, 'stroke-linecap': 'round' });
  } else {
    // 4:30 — hour hand between 4 and 5, minute hand down
    el(svg, 'line', { x1: 330, y1: 92, x2: 344, y2: 110, stroke: '#3d2b1f', 'stroke-width': 5, 'stroke-linecap': 'round' });
    el(svg, 'line', { x1: 330, y1: 92, x2: 330, y2: 122, stroke: '#3d2b1f', 'stroke-width': 4, 'stroke-linecap': 'round' });
  }
  el(svg, 'circle', { cx: 330, cy: 92, r: 4, fill: '#e76f51' });

  // framed picture (right of clock)
  el(svg, 'rect', { x: 402, y: 48, width: 104, height: 88, rx: 6, fill: '#e9c46a', stroke: '#7a4a2b', 'stroke-width': 4 });
  el(svg, 'rect', { x: 410, y: 56, width: 88, height: 72, fill: '#fdf3dd' });
  if (!b) {
    // a fish portrait
    el(svg, 'ellipse', { cx: 454, cy: 92, rx: 24, ry: 14, fill: '#f4a261' });
    el(svg, 'path', { d: 'M476 92 L492 80 L492 104 Z', fill: '#f4a261' });
    el(svg, 'circle', { cx: 438, cy: 89, r: 3, fill: '#3d2b1f' });
    el(svg, 'path', { d: 'M430 84 Q436 80 442 84 M430 100 Q436 96 442 100', fill: 'none', stroke: '#e76f51', 'stroke-width': 2 });
  } else {
    // a mouse portrait
    el(svg, 'circle', { cx: 442, cy: 80, r: 9, fill: '#b8b0a8' });
    el(svg, 'circle', { cx: 468, cy: 80, r: 9, fill: '#b8b0a8' });
    el(svg, 'circle', { cx: 442, cy: 80, r: 5, fill: '#e8b4b8' });
    el(svg, 'circle', { cx: 468, cy: 80, r: 5, fill: '#e8b4b8' });
    el(svg, 'ellipse', { cx: 455, cy: 100, rx: 20, ry: 15, fill: '#b8b0a8' });
    el(svg, 'circle', { cx: 447, cy: 96, r: 2.5, fill: '#3d2b1f' });
    el(svg, 'circle', { cx: 463, cy: 96, r: 2.5, fill: '#3d2b1f' });
    el(svg, 'path', { d: 'M455 104 Q470 112 482 104', fill: 'none', stroke: '#8a6f5c', 'stroke-width': 2 });
  }

  // shelf with cups (under the picture)
  el(svg, 'rect', { x: 392, y: 158, width: 128, height: 10, fill: '#7a4a2b' });
  const cupColors = ['#2a9d8f', '#e76f51', '#e9c46a'];
  cupColors.forEach((color, i) => {
    const x = 408 + i * 38;
    el(svg, 'path', { d: `M${x} 138 L${x + 24} 138 L${x + 21} 158 L${x + 3} 158 Z`, fill: color });
    el(svg, 'path', { d: `M${x + 24} 142 Q${x + 32} 148 ${x + 24} 154`, fill: 'none', stroke: color, 'stroke-width': 3 });
  });

  // rug
  el(svg, 'ellipse', { cx: 280, cy: 386, rx: 168, ry: 24, fill: '#e9c46a' });
  el(svg, 'ellipse', { cx: 280, cy: 386, rx: 138, ry: 18, fill: '#e76f51' });
  el(svg, 'ellipse', { cx: 280, cy: 386, rx: 104, ry: 12, fill: '#f7e8c9' });

  // table
  el(svg, 'rect', { x: 150, y: 296, width: 260, height: 16, rx: 6, fill: '#8a5a33' });
  el(svg, 'rect', { x: 168, y: 312, width: 12, height: 74, fill: '#7a4a2b' });
  el(svg, 'rect', { x: 380, y: 312, width: 12, height: 74, fill: '#7a4a2b' });

  // teapot on the table
  el(svg, 'path', { d: 'M208 296 Q196 268 214 254 L246 254 Q264 268 252 296 Z', fill: '#2a9d8f' });
  el(svg, 'path', { d: 'M214 254 Q230 240 246 254', fill: '#2a9d8f' });
  el(svg, 'circle', { cx: 230, cy: 242, r: 5, fill: '#e9c46a' });
  el(svg, 'path', { d: 'M208 268 Q188 272 192 288 Q200 292 210 286', fill: 'none', stroke: '#2a9d8f', 'stroke-width': 7, 'stroke-linecap': 'round' });
  el(svg, 'path', { d: 'M252 266 Q268 272 260 288', fill: 'none', stroke: '#2a9d8f', 'stroke-width': 7, 'stroke-linecap': 'round' });
  if (!b) {
    // steam curls
    el(svg, 'path', { d: 'M222 232 Q216 220 222 210 Q228 200 222 190', fill: 'none', stroke: '#b8b0a8', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.85 });
    el(svg, 'path', { d: 'M240 232 Q246 220 240 210 Q234 200 240 190', fill: 'none', stroke: '#b8b0a8', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.85 });
  }

  // coffee cup on the table
  el(svg, 'ellipse', { cx: 330, cy: 296, rx: 26, ry: 5, fill: '#d8c49a' });
  el(svg, 'path', { d: 'M306 274 L354 274 L350 296 L310 296 Z', fill: '#fffdf6', stroke: '#d8c49a', 'stroke-width': 2 });
  el(svg, 'path', { d: 'M354 279 Q366 284 354 291', fill: 'none', stroke: '#d8c49a', 'stroke-width': 3 });
  el(svg, 'ellipse', { cx: 330, cy: 274, rx: 24, ry: 5, fill: b ? '#fffdf6' : '#6b4226' });

  // potted plant (bottom left)
  el(svg, 'path', { d: 'M48 330 L92 330 L86 372 L54 372 Z', fill: '#c96f4a' });
  el(svg, 'rect', { x: 44, y: 322, width: 52, height: 10, rx: 3, fill: '#b25a38' });
  el(svg, 'path', { d: 'M70 322 Q58 296 52 282 M70 322 Q70 292 70 272 M70 322 Q84 298 92 284', fill: 'none', stroke: '#43aa5b', 'stroke-width': 4, 'stroke-linecap': 'round' });
  el(svg, 'ellipse', { cx: 56, cy: 300, rx: 10, ry: 6, fill: '#43aa5b', transform: 'rotate(-30 56 300)' });
  el(svg, 'ellipse', { cx: 86, cy: 302, rx: 10, ry: 6, fill: '#43aa5b', transform: 'rotate(30 86 302)' });
  // flowers: three in a, two in b (middle one missing)
  const flowers = b ? [[52, 276], [92, 278]] : [[52, 276], [70, 264], [92, 278]];
  for (const [fx, fy] of flowers) {
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5;
      el(svg, 'circle', { cx: fx + Math.cos(a) * 7, cy: fy + Math.sin(a) * 7, r: 5, fill: '#f27fa0' });
    }
    el(svg, 'circle', { cx: fx, cy: fy, r: 4.5, fill: '#ffd93b' });
  }

  // the cat, sitting on a cushion (right)
  el(svg, 'ellipse', { cx: 462, cy: 372, rx: 62, ry: 16, fill: '#e76f51' });
  el(svg, 'ellipse', { cx: 462, cy: 368, rx: 48, ry: 12, fill: '#f4a261' });
  // tail
  el(svg, 'path', { d: 'M500 350 Q532 340 528 306 Q526 292 514 296 Q522 312 506 322', fill: '#f2a65a' });
  // body
  el(svg, 'ellipse', { cx: 462, cy: 336, rx: 42, ry: 34, fill: '#f2a65a' });
  el(svg, 'ellipse', { cx: 462, cy: 344, rx: 24, ry: 20, fill: '#fbe3c2' });
  // head
  el(svg, 'path', { d: 'M428 306 L434 276 L452 294 Z', fill: '#f2a65a' });
  el(svg, 'path', { d: 'M472 294 L490 276 L496 306 Z', fill: '#f2a65a' });
  el(svg, 'path', { d: 'M433 300 L437 283 L447 293 Z', fill: '#f4a7a7' });
  el(svg, 'path', { d: 'M477 293 L487 283 L491 300 Z', fill: '#f4a7a7' });
  el(svg, 'circle', { cx: 462, cy: 306, r: 30, fill: '#f2a65a' });
  // stripes
  el(svg, 'path', { d: 'M448 280 Q462 274 476 280', fill: 'none', stroke: '#d98a3d', 'stroke-width': 4, 'stroke-linecap': 'round' });
  el(svg, 'path', { d: 'M446 290 Q462 284 478 290', fill: 'none', stroke: '#d98a3d', 'stroke-width': 4, 'stroke-linecap': 'round' });
  // face
  el(svg, 'ellipse', { cx: 450, cy: 306, rx: 4, ry: 6, fill: '#3d2b1f' });
  el(svg, 'ellipse', { cx: 474, cy: 306, rx: 4, ry: 6, fill: '#3d2b1f' });
  el(svg, 'path', { d: 'M458 316 L466 316 L462 321 Z', fill: '#e76f51' });
  el(svg, 'path', { d: 'M462 321 Q458 328 450 325 M462 321 Q466 328 474 325', fill: 'none', stroke: '#3d2b1f', 'stroke-width': 2, 'stroke-linecap': 'round' });
  el(svg, 'path', { d: 'M424 302 L444 306 M424 314 L444 311 M480 306 L500 302 M480 311 L500 314', stroke: '#fffdf6', 'stroke-width': 2, 'stroke-linecap': 'round' });
  // bow under the chin: red in a, teal in b
  const bowColor = b ? '#2a9d8f' : '#e63946';
  el(svg, 'path', { d: 'M462 336 L446 328 L446 344 Z', fill: bowColor });
  el(svg, 'path', { d: 'M462 336 L478 328 L478 344 Z', fill: bowColor });
  el(svg, 'circle', { cx: 462, cy: 336, r: 5, fill: bowColor, stroke: '#fff', 'stroke-width': 1.5 });
  // paws
  el(svg, 'ellipse', { cx: 440, cy: 366, rx: 12, ry: 6, fill: '#f2a65a' });
  el(svg, 'ellipse', { cx: 484, cy: 366, rx: 12, ry: 6, fill: '#f2a65a' });
}

// ---------------------------------------------------------------------------
// Level 2 — "Firefly Garden": a night garden with a pond, a lantern and stars.
// Differences (variant a vs b):
//   moon-phase    full moon vs crescent moon
//   pond-frog     a frog sits on a lily pad vs no frog
//   lantern-lit   the lantern glows warm vs it is dark
//   tulip-colour  the big tulip is red vs yellow
//   firefly-count five fireflies vs four (one gone)
//   garden-snail  a snail on the path vs no snail
//   shooting-star a shooting star streaks the sky vs none
// ---------------------------------------------------------------------------

function drawGarden(svg, variant) {
  const b = variant === 'b';

  // night sky + ground
  const sky = el(svg, 'defs', {});
  const grad = el(sky, 'linearGradient', { id: 'skygrad', x1: 0, y1: 0, x2: 0, y2: 1 });
  el(grad, 'stop', { offset: '0%', 'stop-color': '#16233f' });
  el(grad, 'stop', { offset: '100%', 'stop-color': '#2c4a6e' });
  el(svg, 'rect', { x: 0, y: 0, width: 560, height: 300, fill: 'url(#skygrad)' });
  el(svg, 'rect', { x: 0, y: 300, width: 560, height: 120, fill: '#2f5d3a' });
  el(svg, 'rect', { x: 0, y: 300, width: 560, height: 8, fill: '#274d31' });

  // stars (fixed positions, same in both)
  const starSpots = [[40, 40], [90, 90], [140, 36], [200, 70], [260, 30], [320, 80], [370, 40], [520, 130], [500, 200], [60, 170], [250, 130], [330, 160], [90, 240], [480, 260]];
  for (const [sx, sy] of starSpots) {
    el(svg, 'path', { d: `M${sx} ${sy - 5} L${sx + 1.5} ${sy - 1.5} L${sx + 5} ${sy} L${sx + 1.5} ${sy + 1.5} L${sx} ${sy + 5} L${sx - 1.5} ${sy + 1.5} L${sx - 5} ${sy} L${sx - 1.5} ${sy - 1.5} Z`, fill: '#fffbe8' });
  }
  // shooting star (a only)
  if (!b) {
    el(svg, 'line', { x1: 120, y1: 52, x2: 178, y2: 78, stroke: '#fffbe8', 'stroke-width': 3, 'stroke-linecap': 'round' });
    el(svg, 'line', { x1: 128, y1: 56, x2: 158, y2: 70, stroke: '#ffd93b', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.8 });
    el(svg, 'circle', { cx: 178, cy: 78, r: 4, fill: '#fffbe8' });
  }

  // moon
  el(svg, 'circle', { cx: 452, cy: 72, r: 32, fill: '#f7ead0' });
  if (!b) {
    el(svg, 'circle', { cx: 442, cy: 64, r: 6, fill: '#e8d5ae' });
    el(svg, 'circle', { cx: 462, cy: 80, r: 4, fill: '#e8d5ae' });
    el(svg, 'circle', { cx: 458, cy: 58, r: 3, fill: '#e8d5ae' });
  } else {
    // crescent: bite taken out by a sky-coloured disc
    el(svg, 'circle', { cx: 468, cy: 62, r: 28, fill: '#1e2c49' });
    el(svg, 'circle', { cx: 444, cy: 66, r: 5, fill: '#e8d5ae' });
  }
  el(svg, 'circle', { cx: 452, cy: 72, r: 32, fill: 'none', stroke: '#f7ead0', 'stroke-width': 2, opacity: 0.35 });

  // distant hills
  el(svg, 'path', { d: 'M0 300 Q120 250 260 292 T560 286 L560 300 Z', fill: '#24402c' });
  el(svg, 'path', { d: 'M0 300 Q180 268 360 296 T560 292 L560 300 Z', fill: '#1d3323' });

  // fence
  el(svg, 'rect', { x: 0, y: 272, width: 560, height: 8, fill: '#6b4a2f' });
  el(svg, 'rect', { x: 0, y: 290, width: 560, height: 8, fill: '#6b4a2f' });
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 64;
    el(svg, 'rect', { x, y: 258, width: 14, height: 44, fill: '#7a5636' });
    el(svg, 'path', { d: `M${x} 258 L${x + 7} 248 L${x + 14} 258 Z`, fill: '#7a5636' });
  }

  // bushes
  el(svg, 'ellipse', { cx: 40, cy: 300, rx: 52, ry: 26, fill: '#24402c' });
  el(svg, 'ellipse', { cx: 530, cy: 304, rx: 46, ry: 24, fill: '#24402c' });

  // pond
  el(svg, 'ellipse', { cx: 180, cy: 352, rx: 112, ry: 32, fill: '#3d7ea6' });
  el(svg, 'ellipse', { cx: 180, cy: 348, rx: 96, ry: 26, fill: '#4a90b8' });
  el(svg, 'path', { d: 'M120 348 Q150 342 180 348 T240 348', fill: 'none', stroke: '#7fb8d4', 'stroke-width': 2, opacity: 0.7 });
  el(svg, 'path', { d: 'M130 360 Q160 354 190 360 T230 360', fill: 'none', stroke: '#7fb8d4', 'stroke-width': 2, opacity: 0.5 });
  // lily pads
  el(svg, 'ellipse', { cx: 128, cy: 344, rx: 26, ry: 9, fill: '#43aa5b' });
  el(svg, 'ellipse', { cx: 232, cy: 358, rx: 22, ry: 8, fill: '#43aa5b' });
  el(svg, 'ellipse', { cx: 178, cy: 338, rx: 20, ry: 7, fill: '#37964d' });
  el(svg, 'circle', { cx: 126, cy: 340, r: 3, fill: '#f27fa0' });
  // frog (a only) on the middle pad
  if (!b) {
    el(svg, 'ellipse', { cx: 178, cy: 332, rx: 13, ry: 9, fill: '#5cb85c' });
    el(svg, 'circle', { cx: 172, cy: 321, r: 5, fill: '#5cb85c' });
    el(svg, 'circle', { cx: 184, cy: 321, r: 5, fill: '#5cb85c' });
    el(svg, 'circle', { cx: 172, cy: 320, r: 2.5, fill: '#fff' });
    el(svg, 'circle', { cx: 184, cy: 320, r: 2.5, fill: '#fff' });
    el(svg, 'circle', { cx: 172, cy: 320, r: 1.2, fill: '#1d3323' });
    el(svg, 'circle', { cx: 184, cy: 320, r: 1.2, fill: '#1d3323' });
    el(svg, 'path', { d: 'M172 332 Q178 336 184 332', fill: 'none', stroke: '#1d3323', 'stroke-width': 1.5 });
  }

  // lantern post (right)
  el(svg, 'rect', { x: 416, y: 236, width: 8, height: 110, fill: '#4a3524' });
  el(svg, 'path', { d: 'M416 236 Q420 222 436 224', fill: 'none', stroke: '#4a3524', 'stroke-width': 6 });
  if (!b) {
    // lit: warm glow
    el(svg, 'circle', { cx: 436, cy: 248, r: 34, fill: '#ffd93b', opacity: 0.25 });
    el(svg, 'circle', { cx: 436, cy: 248, r: 20, fill: '#ffd93b', opacity: 0.35 });
  }
  el(svg, 'rect', { x: 426, y: 232, width: 20, height: 32, rx: 4, fill: '#3d2b1f' });
  el(svg, 'rect', { x: 430, y: 238, width: 12, height: 20, rx: 2, fill: b ? '#5a5348' : '#ffe08a' });
  el(svg, 'rect', { x: 424, y: 228, width: 24, height: 5, rx: 2, fill: '#3d2b1f' });
  if (!b) {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      el(svg, 'line', {
        x1: 436 + Math.cos(a) * 26, y1: 248 + Math.sin(a) * 26,
        x2: 436 + Math.cos(a) * 32, y2: 248 + Math.sin(a) * 32,
        stroke: '#ffd93b', 'stroke-width': 2, 'stroke-linecap': 'round',
      });
    }
  }

  // flower bed along the bottom
  const bedFlowers = [
    { x: 300, y: 366, color: b ? '#ffd93b' : '#e63946', big: true }, // the big tulip: red vs yellow
    { x: 268, y: 378, color: '#7fb3e8', big: false },
    { x: 334, y: 380, color: '#f27fa0', big: false },
    { x: 96, y: 396, color: '#f27fa0', big: false },
    { x: 486, y: 388, color: '#7fb3e8', big: false },
    { x: 516, y: 372, color: '#f27fa0', big: false },
  ];
  for (const f of bedFlowers) {
    el(svg, 'line', { x1: f.x, y1: f.y, x2: f.x, y2: f.y + (f.big ? 26 : 16), stroke: '#37964d', 'stroke-width': 3 });
    el(svg, 'ellipse', { cx: f.x - 6, cy: f.y + 12, rx: 7, ry: 3.5, fill: '#37964d', transform: `rotate(-30 ${f.x - 6} ${f.y + 12})` });
    const r = f.big ? 11 : 7;
    el(svg, 'path', { d: `M${f.x - r} ${f.y} Q${f.x - r} ${f.y - r - 4} ${f.x} ${f.y - r} Q${f.x + r} ${f.y - r - 4} ${f.x + r} ${f.y} Q${f.x} ${f.y + 5} ${f.x - r} ${f.y} Z`, fill: f.color });
  }

  // fireflies: five in a, four in b (the one at 250,150 is gone)
  const flies = b
    ? [[90, 150], [170, 110], [320, 120], [400, 170]]
    : [[90, 150], [170, 110], [250, 150], [320, 120], [400, 170]];
  for (const [fx, fy] of flies) {
    el(svg, 'circle', { cx: fx, cy: fy, r: 9, fill: '#d8f79a', opacity: 0.3 });
    el(svg, 'circle', { cx: fx, cy: fy, r: 3.5, fill: '#eaffb0' });
  }

  // snail on the path (a only)
  if (!b) {
    el(svg, 'ellipse', { cx: 366, cy: 392, rx: 16, ry: 7, fill: '#c9a227' });
    el(svg, 'circle', { cx: 358, cy: 384, r: 10, fill: '#d8b13c' });
    el(svg, 'path', { d: 'M358 384 m-5 0 a5 5 0 1 1 10 0 a3.5 3.5 0 1 1 -7 0 a2 2 0 1 1 4 0', fill: 'none', stroke: '#8a6d1f', 'stroke-width': 1.6 });
    el(svg, 'ellipse', { cx: 380, cy: 394, rx: 8, ry: 4, fill: '#e8dcc0' });
    el(svg, 'line', { x1: 384, y1: 390, x2: 386, y2: 382, stroke: '#e8dcc0', 'stroke-width': 2 });
    el(svg, 'circle', { cx: 386, cy: 381, r: 1.8, fill: '#3d2b1f' });
  }

  // grass tufts
  for (const [gx, gy] of [[60, 404], [150, 412], [250, 406], [330, 414], [440, 408], [510, 410], [200, 402]]) {
    el(svg, 'path', { d: `M${gx} ${gy} L${gx - 4} ${gy - 10} M${gx} ${gy} L${gx} ${gy - 12} M${gx} ${gy} L${gx + 4} ${gy - 10}`, stroke: '#4a8a57', 'stroke-width': 2, 'stroke-linecap': 'round' });
  }
  // stepping stones
  el(svg, 'ellipse', { cx: 300, cy: 404, rx: 26, ry: 7, fill: '#8a8a7a' });
  el(svg, 'ellipse', { cx: 340, cy: 396, rx: 22, ry: 6, fill: '#9a9a8a' });
}

// ---------------------------------------------------------------------------
// Scene catalogue: name, builder, and the 7 differences with their
// positions in scene coordinates (560 x 420) and hit radius.
// ---------------------------------------------------------------------------

export const LEVELS = [
  {
    id: 'cafe',
    name: 'The Cat Café',
    subtitle: 'A sleepy afternoon at Whiskers’ Café',
    draw: drawCafe,
    differences: [
      { id: 'clock-hands', name: 'The clock changed time', x: 330, y: 92, r: 42 },
      { id: 'cat-bow', name: 'The cat’s bow changed colour', x: 462, y: 336, r: 26 },
      { id: 'window-sky', name: 'The sun turned into a cloud', x: 88, y: 92, r: 36 },
      { id: 'teapot-steam', name: 'The teapot stopped steaming', x: 231, y: 212, r: 30 },
      { id: 'plant-flower', name: 'A flower went missing', x: 70, y: 264, r: 24 },
      { id: 'wall-picture', name: 'The picture swapped fish for mouse', x: 454, y: 92, r: 40 },
      { id: 'coffee-cup', name: 'The coffee vanished from the cup', x: 330, y: 278, r: 26 },
    ],
  },
  {
    id: 'garden',
    name: 'Firefly Garden',
    subtitle: 'A summer night full of blinking lights',
    draw: drawGarden,
    differences: [
      { id: 'moon-phase', name: 'The full moon became a crescent', x: 452, y: 72, r: 34 },
      { id: 'pond-frog', name: 'The frog hopped away', x: 178, y: 330, r: 26 },
      { id: 'lantern-lit', name: 'The lantern went dark', x: 436, y: 248, r: 30 },
      { id: 'tulip-colour', name: 'The red tulip turned yellow', x: 300, y: 360, r: 22 },
      { id: 'firefly-count', name: 'A firefly blinked out', x: 250, y: 150, r: 22 },
      { id: 'garden-snail', name: 'The snail crawled off', x: 366, y: 388, r: 26 },
      { id: 'shooting-star', name: 'The shooting star is gone', x: 150, y: 66, r: 30 },
    ],
  },
];

// Render one variant ("a" or "b") of a level into a container element.
// Returns the created <svg> element.
export function renderScene(container, levelIndex, variant) {
  container.innerHTML = '';
  const level = LEVELS[levelIndex];
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VIEW_W} ${VIEW_H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${level.name}, picture ${variant.toUpperCase()}`);
  level.draw(svg, variant);
  container.appendChild(svg);
  return svg;
}
