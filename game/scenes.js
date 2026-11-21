// scenes.js — original SVG artwork for Harbor Lights.
// Each scene is a pure function: drawScene(altered, prefix) returns the inner
// SVG markup of one panel. `altered` is a Set of difference ids that the right
// panel applies; the left panel is always drawn with an empty set, so the two
// panels are identical except for the ten designed differences. `prefix`
// keeps gradient ids unique between the two panels on the page.
// All coordinates live in a 640 x 420 viewBox. No randomness: every element
// is placed from fixed numbers, so both panels render identically every run.

export const VIEWBOX = { width: 640, height: 420 };

// --- small shared drawing helpers ---------------------------------------

function cloud(x, y, s, opacity) {
  return `<g fill="#ffffff" opacity="${opacity}">
    <ellipse cx="${x}" cy="${y}" rx="${34 * s}" ry="${15 * s}"/>
    <ellipse cx="${x - 22 * s}" cy="${y + 6 * s}" rx="${22 * s}" ry="${11 * s}"/>
    <ellipse cx="${x + 24 * s}" cy="${y + 6 * s}" rx="${24 * s}" ry="${12 * s}"/>
  </g>`;
}

function gullShape(x, y, s, color) {
  return `<path d="M ${x} ${y} q ${7 * s} ${-7 * s} ${14 * s} 0 q ${7 * s} ${-7 * s} ${14 * s} 0"
    fill="none" stroke="${color}" stroke-width="${2.4 * s}" stroke-linecap="round"/>`;
}

function star4(x, y, r, color) {
  return `<path d="M ${x} ${y - r} L ${x + r * 0.28} ${y - r * 0.28} L ${x + r} ${y}
    L ${x + r * 0.28} ${y + r * 0.28} L ${x} ${y + r} L ${x - r * 0.28} ${y + r * 0.28}
    L ${x - r} ${y} L ${x - r * 0.28} ${y - r * 0.28} Z" fill="${color}"/>`;
}

function waveLine(y, color, opacity, wobble) {
  const w = wobble || 0;
  return `<path d="M 0 ${y} q 40 ${-9 + w} 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0"
    fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="${opacity}"/>`;
}

function plankRow(y, h, color) {
  let s = '';
  for (let x = 0; x < 640; x += 80) {
    s += `<rect x="${x + 2}" y="${y}" width="76" height="${h}" rx="3" fill="${color}"/>`;
  }
  return s;
}

// --- Scene 1: Sunset Harbor ---------------------------------------------
// A fishing harbour at sunset: pier, boat, cottages, gulls, cat, lighthouse.

export function drawHarbor(altered, p) {
  const has = (id) => altered.has(id);
  const sunR = has('sun') ? 24 : 44;
  const sailColor = has('sail') ? '#3a7bd5' : '#e74c3c';
  const windowColor = has('window') ? '#2c3550' : '#ffd76a';
  const buoyColor = has('buoy') ? '#27ae60' : '#e74c3c';
  return `
  <defs>
    <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff9a56"/><stop offset="0.55" stop-color="#ff6b9d"/>
      <stop offset="1" stop-color="#7b5ea7"/>
    </linearGradient>
    <linearGradient id="${p}sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2e86ab"/><stop offset="1" stop-color="#14456b"/>
    </linearGradient>
    <radialGradient id="${p}glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffd76a" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ffd76a" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${p}pier"><polygon points="0,300 260,300 210,420 0,420"/></clipPath>
  </defs>
  <rect width="640" height="240" fill="url(#${p}sky)"/>
  <rect y="240" width="640" height="180" fill="url(#${p}sea)"/>
  <circle cx="520" cy="98" r="72" fill="url(#${p}glow)"/>
  <circle cx="520" cy="98" r="${sunR}" fill="#ffd76a"/>
  ${cloud(120, 62, 1, 0.85)}${cloud(300, 44, 0.8, 0.7)}${cloud(440, 84, 0.6, 0.6)}
  ${gullShape(180, 112, 1, '#5b3a5e')}
  ${has('gull') ? '' : gullShape(252, 90, 1, '#5b3a5e')}
  ${gullShape(330, 122, 0.9, '#5b3a5e')}
  <!-- distant lighthouse -->
  <g>
    <rect x="52" y="150" width="16" height="90" fill="#f4ead8"/>
    <rect x="52" y="168" width="16" height="12" fill="#c0392b"/>
    <rect x="52" y="198" width="16" height="12" fill="#c0392b"/>
    <rect x="48" y="138" width="24" height="14" fill="#2c3550"/>
    ${has('beacon') ? '' : `<polygon points="72,145 150,128 150,162" fill="#ffe98a" opacity="0.75"/>`}
  </g>
  <!-- sea -->
  ${waveLine(268, '#bfe3f0', 0.5, 0)}${waveLine(300, '#8fc7dd', 0.45, 4)}
  ${waveLine(352, '#bfe3f0', 0.4, -3)}${waveLine(396, '#8fc7dd', 0.35, 2)}
  <!-- fishing boat -->
  <g>
    <path d="M 340 300 L 440 300 L 424 326 L 356 326 Z" fill="#7a4a21"/>
    <rect x="386" y="228" width="6" height="74" fill="#5d3a1a"/>
    <path d="M 392 232 L 392 292 L ${has('sail') ? 448 : 446} 292 Z" fill="${sailColor}"/>
    <circle cx="389" cy="222" r="5" fill="#ffd76a"/>
  </g>
  <!-- buoy -->
  <g>
    <path d="M 288 322 L 312 322 L 306 344 L 294 344 Z" fill="${buoyColor}"/>
    <rect x="288" y="330" width="24" height="5" fill="#ffffff"/>
    <circle cx="300" cy="318" r="4" fill="#ffd76a"/>
  </g>
  <!-- cottages on the far shore -->
  <g>
    <polygon points="436,340 640,330 640,420 436,420" fill="#4a6b3f"/>
    <ellipse cx="470" cy="352" rx="18" ry="6" fill="#3d5c34"/>
    <ellipse cx="610" cy="348" rx="16" ry="5" fill="#3d5c34"/>
    <rect x="470" y="286" width="90" height="54" fill="#f2e3c6"/>
    <polygon points="462,288 515,258 568,288" fill="#b5542d"/>
    <rect x="484" y="306" width="18" height="18" fill="${windowColor}"/>
    <rect x="524" y="306" width="18" height="18" fill="#ffd76a"/>
    <rect x="506" y="316" width="14" height="24" fill="#6b4226"/>
    <rect x="580" y="300" width="46" height="40" fill="#e8d3a8"/>
    <polygon points="576,302 603,282 630,302" fill="#8a4a2d"/>
    <rect x="594" y="314" width="14" height="14" fill="#ffd76a"/>
  </g>
  <!-- wooden pier -->
  <g>
    <polygon points="0,300 260,300 210,420 0,420" fill="#8a5a2b"/>
    <polygon points="0,300 260,300 210,420 0,420" fill="#000000" opacity="0.08"/>
    <g clip-path="url(#${p}pier)">
      ${plankRow(306, 14, '#a06a35')}${plankRow(330, 14, '#96622f')}
      ${plankRow(354, 14, '#a06a35')}${plankRow(378, 14, '#96622f')}
    </g>
    <rect x="20" y="300" width="8" height="120" fill="#6b4226"/>
    <rect x="120" y="300" width="8" height="120" fill="#6b4226"/>
  </g>
  <!-- flag pole on the pier -->
  <g>
    <rect x="38" y="238" width="5" height="66" fill="#4a3220"/>
    ${has('flag') ? '' : `<polygon points="43,240 78,248 43,258" fill="#e74c3c"/>`}
  </g>
  <!-- fisherman -->
  <g>
    <circle cx="150" cy="282" r="11" fill="#f2c79b"/>
    ${has('hat') ? '' : `<path d="M 136 276 a 14 14 0 0 1 28 0 l 4 3 -36 0 Z" fill="#2e86ab"/>`}
    <path d="M 138 292 L 162 292 L 166 322 L 134 322 Z" fill="#3a7bd5"/>
    <rect x="140" y="322" width="7" height="16" fill="#2c3550"/>
    <rect x="153" y="322" width="7" height="16" fill="#2c3550"/>
    <line x1="162" y1="300" x2="196" y2="272" stroke="#4a3220" stroke-width="3" stroke-linecap="round"/>
    <line x1="196" y1="272" x2="200" y2="306" stroke="#dfe9f2" stroke-width="1.4"/>
  </g>
  <!-- crates -->
  <g>
    <rect x="52" y="352" width="26" height="26" fill="#c98f3d" stroke="#8a5a2b" stroke-width="2"/>
    <rect x="80" y="352" width="26" height="26" fill="#c98f3d" stroke="#8a5a2b" stroke-width="2"/>
    ${has('crates') ? '' : `<rect x="66" y="326" width="26" height="26" fill="#d9a44f" stroke="#8a5a2b" stroke-width="2"/>`}
    <line x1="52" y1="365" x2="78" y2="365" stroke="#8a5a2b" stroke-width="2"/>
    <line x1="80" y1="365" x2="106" y2="365" stroke="#8a5a2b" stroke-width="2"/>
  </g>
  <!-- cat on the dock -->
  ${has('cat') ? '' : `<g>
    <ellipse cx="232" cy="356" rx="16" ry="12" fill="#3d3d3d"/>
    <circle cx="238" cy="340" r="9" fill="#3d3d3d"/>
    <polygon points="232,332 234,322 238,331" fill="#3d3d3d"/>
    <polygon points="240,331 244,322 246,332" fill="#3d3d3d"/>
    <path d="M 216 352 q -12 -4 -10 -16" fill="none" stroke="#3d3d3d" stroke-width="4" stroke-linecap="round"/>
  </g>`}
  `;
}

// --- Scene 2: The Lighthouse at Night ------------------------------------
// A tall lighthouse on a rocky point, keeper's cottage, moon, owl, boat.

export function drawLighthouse(altered, p) {
  const has = (id) => altered.has(id);
  const stars = [
    [90, 48], [180, 80], [260, 40], [330, 70], [400, 52], [470, 36], [580, 110],
  ];
  const starMarks = stars
    .filter((_, i) => !(has('star') && i === 4))
    .map(([x, y]) => star4(x, y, 7, '#ffe9a8')).join('');
  return `
  <defs>
    <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1026"/><stop offset="1" stop-color="#22355e"/>
    </linearGradient>
    <linearGradient id="${p}sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16294d"/><stop offset="1" stop-color="#0a1428"/>
    </linearGradient>
  </defs>
  <rect width="640" height="300" fill="url(#${p}sky)"/>
  <rect y="300" width="640" height="120" fill="url(#${p}sea)"/>
  ${starMarks}
  <!-- moon -->
  <g>
    <circle cx="520" cy="66" r="30" fill="#f4ead8"/>
    <circle cx="514" cy="60" r="6" fill="#e0d3b8"/>
    <circle cx="530" cy="74" r="4" fill="#e0d3b8"/>
    ${has('moon') ? `<circle cx="534" cy="56" r="26" fill="#131c3a"/>` : ''}
  </g>
  <!-- lighthouse -->
  <g>
    <polygon points="292,300 348,300 340,120 300,120" fill="#f4ead8"/>
    <polygon points="296,180 344,180 342,156 298,156" fill="#c0392b"/>
    <polygon points="294,232 346,232 344,208 296,208" fill="#c0392b"/>
    <rect x="292" y="96" width="56" height="26" fill="#2c3550"/>
    <rect x="300" y="102" width="40" height="14" fill="#ffe98a"/>
    <polygon points="288,98 352,98 344,82 296,82" fill="#c0392b"/>
    ${has('beam')
      ? `<polygon points="340,109 580,50 580,168" fill="#ffe98a" opacity="0.16"/>
         <polygon points="340,109 520,88 520,130" fill="#ffe98a" opacity="0.3"/>`
      : `<polygon points="300,109 60,50 60,168" fill="#ffe98a" opacity="0.16"/>
         <polygon points="300,109 120,88 120,130" fill="#ffe98a" opacity="0.3"/>`}
  </g>
  <!-- rocks at the base -->
  <g fill="#3d4a5e">
    <ellipse cx="272" cy="316" rx="34" ry="16"/>
    <ellipse cx="368" cy="318" rx="30" ry="14"/>
    ${has('rocks') ? '' : `<ellipse cx="322" cy="322" rx="20" ry="10"/>`}
  </g>
  <!-- rocky shore on the left, keeper's cottage on it -->
  <polygon points="0,338 260,338 260,420 0,420" fill="#16283a"/>
  <g>
    <rect x="60" y="286" width="110" height="52" fill="#e8d3a8"/>
    <polygon points="52,288 115,254 178,288" fill="#5d3a1a"/>
    <rect x="76" y="302" width="20" height="20" fill="#ffd76a"/>
    <rect x="128" y="302" width="20" height="20" fill="${has('cottage') ? '#2c3550' : '#ffd76a'}"/>
    <rect x="104" y="314" width="18" height="24" fill="#6b4226"/>
    <rect x="150" y="258" width="10" height="22" fill="#8a5a2b"/>
  </g>
  <!-- pine tree -->
  ${has('tree') ? '' : `<g>
    <rect x="548" y="286" width="10" height="34" fill="#5d3a1a"/>
    <polygon points="553,238 528,290 578,290" fill="#1e5c3a"/>
    <polygon points="553,258 534,296 572,296" fill="#267347"/>
    <polygon points="553,278 540,302 566,302" fill="#1e5c3a"/>
  </g>`}
  <!-- owl on a branch -->
  ${has('owl') ? '' : `<g>
    <line x1="96" y1="196" x2="150" y2="188" stroke="#4a3220" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="122" cy="178" rx="13" ry="16" fill="#7a6a55"/>
    <circle cx="117" cy="174" r="4" fill="#ffe9a8"/>
    <circle cx="128" cy="174" r="4" fill="#ffe9a8"/>
    <circle cx="117" cy="174" r="2" fill="#1a1a1a"/>
    <circle cx="128" cy="174" r="2" fill="#1a1a1a"/>
    <polygon points="120,180 124,180 122,185" fill="#e8a33d"/>
    <polygon points="110,164 112,154 116,163" fill="#7a6a55"/>
    <polygon points="128,163 132,154 134,164" fill="#7a6a55"/>
  </g>`}
  <!-- lantern on a post -->
  <g>
    <rect x="470" y="288" width="6" height="34" fill="#4a3220"/>
    <rect x="462" y="272" width="22" height="18" fill="#2c3550"/>
    ${has('lantern')
      ? `<rect x="467" y="277" width="12" height="9" fill="#22304a"/>`
      : `<rect x="467" y="277" width="12" height="9" fill="#ffd76a"/>
         <circle cx="473" cy="281" r="14" fill="#ffd76a" opacity="0.25"/>`}
  </g>
  <!-- telescope on the shore -->
  <g transform="translate(230 348)">
    <line x1="0" y1="0" x2="-16" y2="26" stroke="#4a3220" stroke-width="4" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="16" y2="26" stroke="#4a3220" stroke-width="4" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="0" y2="26" stroke="#4a3220" stroke-width="4" stroke-linecap="round"/>
    <g transform="rotate(${has('scope') ? 38 : -32})">
      <rect x="-6" y="-34" width="34" height="10" rx="5" fill="#8a6d3b"/>
      <rect x="28" y="-31" width="10" height="4" fill="#2c3550"/>
    </g>
  </g>
  <!-- rowboat in open water -->
  ${has('boat') ? '' : `<g>
    <path d="M 410 356 L 470 356 L 460 372 L 420 372 Z" fill="#7a4a21"/>
    <rect x="436" y="344" width="5" height="14" fill="#5d3a1a"/>
    <rect x="426" y="342" width="26" height="4" fill="#d9a44f"/>
  </g>`}
  ${waveLine(330, '#7fa8c9', 0.5, 0)}${waveLine(366, '#5d86ad', 0.45, 3)}
  ${waveLine(398, '#7fa8c9', 0.35, -2)}
  <!-- path stones -->
  <ellipse cx="130" cy="350" rx="12" ry="5" fill="#8a93a6"/>
  <ellipse cx="165" cy="362" rx="12" ry="5" fill="#8a93a6"/>
  <ellipse cx="200" cy="372" rx="12" ry="5" fill="#8a93a6"/>
  `;
}

// --- Scene 3: Storm at the Pier ------------------------------------------
// A stormy pier: rain, grey sea, whipping flag, barrels, anchor, life ring.

const HEAVY_RAIN = [
  [40, 20, 26], [90, 60, 30], [140, 10, 24], [190, 70, 28], [240, 30, 26],
  [290, 80, 30], [340, 16, 24], [390, 60, 28], [440, 26, 26], [490, 74, 30],
  [540, 18, 24], [590, 66, 28], [60, 120, 26], [160, 140, 28], [260, 120, 26],
  [360, 146, 30], [460, 122, 26], [560, 142, 28], [110, 190, 26], [310, 196, 28],
  [510, 192, 26], [30, 220, 24], [210, 226, 26], [430, 224, 28],
];
const LIGHT_RAIN = [
  [90, 60, 30], [240, 30, 26], [390, 60, 28], [540, 18, 24],
  [160, 140, 28], [460, 122, 26], [110, 190, 26], [510, 192, 26],
  [30, 220, 24], [430, 224, 28],
];

export function drawStorm(altered, p) {
  const has = (id) => altered.has(id);
  const rain = has('rain') ? LIGHT_RAIN : HEAVY_RAIN;
  const crest = has('crest') ? '#7a8a99' : '#eef6fa';
  const rainMarks = rain
    .map(([x, y, len]) => `<line x1="${x}" y1="${y}" x2="${x - 8}" y2="${y + len}" stroke="#cfe3f2" stroke-width="2.4" stroke-linecap="round" opacity="0.75"/>`)
    .join('');
  return `
  <defs>
    <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2e3844"/><stop offset="1" stop-color="#5a6b7a"/>
    </linearGradient>
    <linearGradient id="${p}sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#274b5e"/><stop offset="1" stop-color="#122c3a"/>
    </linearGradient>
  </defs>
  <rect width="640" height="230" fill="url(#${p}sky)"/>
  <rect y="230" width="640" height="190" fill="url(#${p}sea)"/>
  ${cloud(120, 50, 1.1, 0.5)}${cloud(330, 36, 1.2, 0.45)}${cloud(520, 60, 0.9, 0.4)}
  <!-- distant ship -->
  ${has('ship') ? '' : `<g>
    <path d="M 470 216 L 560 216 L 548 230 L 482 230 Z" fill="#1c2836"/>
    <rect x="508" y="188" width="6" height="30" fill="#1c2836"/>
    <rect x="500" y="196" width="22" height="12" fill="#1c2836"/>
  </g>`}
  <!-- sea waves with crests -->
  <path d="M 0 250 q 40 -14 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0"
    fill="none" stroke="${crest}" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
  <path d="M 0 296 q 40 -12 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0"
    fill="none" stroke="${crest}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
  <path d="M 0 340 q 40 -10 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0"
    fill="none" stroke="#7fa8c9" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <!-- the pier -->
  <g>
    <rect x="0" y="300" width="640" height="120" fill="#6b4a26"/>
    ${plankRow(306, 16, '#7d5a30')}${plankRow(330, 16, '#6b4a26')}
    ${plankRow(354, 16, '#7d5a30')}${plankRow(378, 16, '#6b4a26')}
    <rect x="0" y="300" width="640" height="6" fill="#8a6a3d"/>
    ${has('plank') ? '' : `<g>
      <polygon points="286,306 330,306 322,322 292,322" fill="#122c3a"/>
      <polygon points="286,306 296,312 292,322" fill="#7d5a30"/>
      <polygon points="330,306 320,312 322,322" fill="#7d5a30"/>
    </g>`}
  </g>
  <!-- whipping flag -->
  <g>
    <rect x="76" y="196" width="6" height="110" fill="#3d2c1c"/>
    ${has('flag')
      ? `<polygon points="82,200 106,208 82,216" fill="#c0392b"/>`
      : `<polygon points="82,200 122,206 116,214 82,218" fill="#c0392b"/>`}
  </g>
  <!-- gulls sheltering on a post -->
  <g>
    <rect x="196" y="216" width="8" height="90" fill="#3d2c1c"/>
    ${gullShape(180, 212, 0.9, '#e8e8e8')}
    ${has('gull') ? '' : gullShape(216, 200, 0.9, '#e8e8e8')}
  </g>
  <!-- life ring on a post -->
  <g>
    <rect x="348" y="238" width="8" height="68" fill="#3d2c1c"/>
    <circle cx="352" cy="238" r="20" fill="${has('ring') ? '#f2f2f2' : '#e74c3c'}"/>
    <circle cx="352" cy="238" r="11" fill="none" stroke="${has('ring') ? '#f2f2f2' : '#e74c3c'}" stroke-width="0"/>
    <circle cx="352" cy="238" r="11" fill="#274b5e"/>
    ${has('ring') ? '' : `<g fill="#f2f2f2">
      <rect x="348" y="214" width="8" height="10"/><rect x="348" y="252" width="8" height="10"/>
      <rect x="328" y="234" width="10" height="8"/><rect x="366" y="234" width="10" height="8"/>
    </g>`}
  </g>
  <!-- barrel -->
  ${has('barrel') ? '' : `<g>
    <ellipse cx="492" cy="330" rx="22" ry="26" fill="#8a5a2b"/>
    <ellipse cx="492" cy="308" rx="22" ry="7" fill="#a06a35"/>
    <rect x="470" y="320" width="44" height="5" fill="#5d3a1a"/>
    <rect x="470" y="340" width="44" height="5" fill="#5d3a1a"/>
  </g>`}
  <!-- anchor -->
  ${has('anchor') ? '' : `<g stroke="#2c3550" stroke-width="6" fill="none" stroke-linecap="round">
    <circle cx="128" cy="344" r="9"/>
    <line x1="128" y1="352" x2="128" y2="392"/>
    <line x1="104" y1="368" x2="152" y2="368"/>
    <path d="M 104 368 q 0 22 24 22 q 24 0 24 -22"/>
  </g>`}
  <!-- lantern on a post -->
  <g>
    <rect x="566" y="272" width="7" height="34" fill="#3d2c1c"/>
    <rect x="558" y="254" width="23" height="20" fill="#2c3550"/>
    ${has('lantern')
      ? `<rect x="563" y="259" width="13" height="10" fill="#22304a"/>`
      : `<rect x="563" y="259" width="13" height="10" fill="#ffd76a"/>
         <circle cx="569" cy="264" r="16" fill="#ffd76a" opacity="0.3"/>`}
  </g>
  <!-- rope coil -->
  <g fill="none" stroke="#c9a86a" stroke-width="5">
    <circle cx="420" cy="392" r="16"/><circle cx="420" cy="392" r="9"/>
  </g>
  <!-- rain -->
  ${rainMarks}
  `;
}

export const SCENES = {
  harbor: drawHarbor,
  lighthouse: drawLighthouse,
  storm: drawStorm,
};
