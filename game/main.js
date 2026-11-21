// main.js — boots Harbor Lights once the page is ready.
import { SpotGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new SpotGame();
  window.__game = game; // debug hook: lets a play-test drive the game
  game.start();
});
