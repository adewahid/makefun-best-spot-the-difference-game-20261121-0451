// shots.js — deterministic states for the maker's screenshots, driven by
// the ?shot= query parameter. The game itself never depends on these;
// they only set up a fixed scene so a screenshot always shows the same
// moment. Supported values:
//   start   title screen over the fresh café scene
//   cover   mid-game: 3 differences found, 4 still hiding, timer 01:23
//   win     level 1 finished: all 7 found, win overlay with 3 stars
//   level2  mid-game on the garden: 2 found, 5 still hiding

// Differences to pre-find for each staged state (by id, in find order).
const COVER_FOUND = ['clock-hands', 'cat-bow', 'window-sky'];
const LEVEL2_FOUND = ['moon-phase', 'pond-frog'];
const COVER_SECONDS = 83; // 01:23 on the clock
const COVER_SCORE = 320; // 3 finds (300) + 20 left over from an early hint
const LEVEL2_SECONDS = 47;
const LEVEL2_SCORE = 200;

function preFind(game, ids) {
  for (const id of ids) {
    const diff = game.level.differences.find((d) => d.id === id);
    if (!diff) continue;
    game.found.add(diff.id);
    game.placeMark(diff.x, diff.y, 'found');
  }
  game.updateHud();
}

function setClock(game, seconds, score) {
  game.seconds = seconds;
  game.score = score;
  game.updateHud();
}

// Apply one staged state. Returns the shot name, or null when none applies.
export function applyShot(game, name) {
  switch (name) {
    case 'start':
      game.showTitle();
      return 'start';
    case 'cover': {
      game.startLevel(0);
      preFind(game, COVER_FOUND);
      setClock(game, COVER_SECONDS, COVER_SCORE);
      return 'cover';
    }
    case 'win': {
      game.startLevel(0);
      // Find all seven silently, then finish with a fast, clean run.
      for (const diff of game.level.differences) {
        game.found.add(diff.id);
        game.placeMark(diff.x, diff.y, 'found');
      }
      game.seconds = 96;
      game.score = 700;
      game.misses = 0;
      game.winLevel();
      return 'win';
    }
    case 'level2': {
      game.startLevel(1);
      preFind(game, LEVEL2_FOUND);
      setClock(game, LEVEL2_SECONDS, LEVEL2_SCORE);
      return 'level2';
    }
    default:
      return null;
  }
}
