// main.js — boot the game: create it, wire mouse + keyboard input, and
// either show the title screen or, with ?shot=<name>, a staged state
// for screenshots (see shots.js). No network, no build step.

import { Game } from './game.js';
import { attachInput } from './input.js';
import { applyShot } from './shots.js';

const game = new Game(document.getElementById('app'));
attachInput(game);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot && applyShot(game, shot)) {
  document.title = `Whiskers' Café — shot: ${shot}`;
} else {
  game.showTitle();
}

// Expose the game for play-testing in the browser console.
window.__whiskersGame = game;
