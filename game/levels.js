// levels.js — the three levels of Harbor Lights.
// Each level names its scene (drawn by scenes.js), its time limit, its
// difficulty note, and its ten differences. A difference has an id (matched
// by the scene renderer), a hit spot in the 640 x 420 viewBox (x, y, radius)
// and a short label shown when it is found. Hit spots sit on the element
// that changes, on both panels, so a click on either panel counts.

export const LEVELS = [
  {
    id: 'harbor',
    scene: 'harbor',
    title: 'Sunset Harbor',
    tagline: 'A quiet fishing harbour as the sun goes down.',
    difficulty: 'Easy',
    timeLimit: 180,
    diffs: [
      { id: 'sun', x: 520, y: 98, r: 34, label: 'The sun shrank' },
      { id: 'gull', x: 259, y: 90, r: 24, label: 'A gull flew away' },
      { id: 'sail', x: 412, y: 262, r: 32, label: 'The sail changed colour' },
      { id: 'window', x: 493, y: 315, r: 20, label: 'A window went dark' },
      { id: 'cat', x: 232, y: 348, r: 24, label: 'The dock cat vanished' },
      { id: 'buoy', x: 300, y: 331, r: 22, label: 'The buoy turned green' },
      { id: 'flag', x: 58, y: 248, r: 22, label: 'The pier flag is gone' },
      { id: 'hat', x: 150, y: 274, r: 20, label: 'The fisherman lost his hat' },
      { id: 'crates', x: 79, y: 339, r: 26, label: 'A crate went missing' },
      { id: 'beacon', x: 96, y: 145, r: 26, label: 'The lighthouse beam is out' },
    ],
  },
  {
    id: 'lighthouse',
    scene: 'lighthouse',
    title: 'The Lighthouse at Night',
    tagline: 'The keeper is asleep — but something is different.',
    difficulty: 'Medium',
    timeLimit: 150,
    diffs: [
      { id: 'moon', x: 520, y: 66, r: 32, label: 'The moon turned crescent' },
      { id: 'star', x: 400, y: 52, r: 20, label: 'A star went out' },
      { id: 'beam', x: 320, y: 109, r: 40, label: 'The beam swung around' },
      { id: 'cottage', x: 138, y: 312, r: 20, label: 'A cottage window went dark' },
      { id: 'owl', x: 122, y: 176, r: 24, label: 'The owl flew off' },
      { id: 'lantern', x: 473, y: 281, r: 20, label: 'The lantern went out' },
      { id: 'boat', x: 440, y: 362, r: 28, label: 'The rowboat drifted away' },
      { id: 'tree', x: 553, y: 272, r: 30, label: 'The pine tree vanished' },
      { id: 'scope', x: 240, y: 325, r: 32, label: 'The telescope tipped down' },
      { id: 'rocks', x: 322, y: 322, r: 20, label: 'A rock slipped under' },
    ],
  },
  {
    id: 'storm',
    scene: 'storm',
    title: 'Storm at the Pier',
    tagline: 'Rain, wind and waves — look closely, the storm hides things.',
    difficulty: 'Hard',
    timeLimit: 120,
    diffs: [
      { id: 'rain', x: 160, y: 60, r: 55, label: 'The rain thinned out' },
      { id: 'crest', x: 200, y: 250, r: 28, label: 'The wave crests lost their foam' },
      { id: 'plank', x: 308, y: 314, r: 24, label: 'The broken plank healed' },
      { id: 'flag', x: 102, y: 208, r: 22, label: 'The flag tore in half' },
      { id: 'barrel', x: 492, y: 332, r: 28, label: 'The barrel rolled away' },
      { id: 'gull', x: 223, y: 200, r: 20, label: 'A sheltering gull left' },
      { id: 'lantern', x: 569, y: 264, r: 20, label: 'The storm lantern died' },
      { id: 'ring', x: 352, y: 238, r: 26, label: 'The life ring lost its red' },
      { id: 'anchor', x: 128, y: 368, r: 26, label: 'The anchor is gone' },
      { id: 'ship', x: 515, y: 209, r: 30, label: 'The ship on the horizon vanished' },
    ],
  },
];
