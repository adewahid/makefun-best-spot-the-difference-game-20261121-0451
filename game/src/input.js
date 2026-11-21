// input.js — mouse and keyboard play for the two picture panels.
// Mouse: click a spot on either panel. Keyboard: arrow keys move a ring
// across the focused panel, Tab switches panels, Enter/Space picks the
// spot under the ring, H hints, R restarts, M toggles sound.

import { VIEW_W, VIEW_H } from './scenes.js';

const STEP = 14; // scene units per arrow-key press
const FAST_STEP = 48; // with Shift held

// Convert a pointer event on a panel into scene coordinates (560 x 420).
export function eventToSceneCoords(panel, event) {
  const rect = panel.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * VIEW_W;
  const y = ((event.clientY - rect.top) / rect.height) * VIEW_H;
  return { x, y };
}

export function attachInput(game) {
  const cursor = game.el.cursor;
  const stage = game.root.querySelector('#stage');
  let panelIndex = 0; // 0 = panel A, 1 = panel B
  let cursorPos = { x: VIEW_W / 2, y: VIEW_H / 2 };
  let cursorVisible = false;

  const panels = [game.el.panelA, game.el.panelB];

  function showCursor() {
    if (!cursorVisible) {
      cursorVisible = true;
      cursor.classList.add('visible');
    }
    positionCursor();
  }

  function positionCursor() {
    const panel = panels[panelIndex];
    const rect = panel.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    cursor.style.left = `${rect.left - stageRect.left + (cursorPos.x / VIEW_W) * rect.width}px`;
    cursor.style.top = `${rect.top - stageRect.top + (cursorPos.y / VIEW_H) * rect.height}px`;
  }

  function moveCursor(dx, dy) {
    showCursor();
    cursorPos.x = Math.max(0, Math.min(VIEW_W, cursorPos.x + dx));
    cursorPos.y = Math.max(0, Math.min(VIEW_H, cursorPos.y + dy));
    positionCursor();
  }

  function switchPanel() {
    panelIndex = 1 - panelIndex;
    panels[panelIndex].focus({ preventScroll: true });
    showCursor();
  }

  function pickAtCursor() {
    showCursor();
    game.pick(cursorPos.x, cursorPos.y);
  }

  // Mouse: click either panel to pick that spot.
  for (const panel of panels) {
    panel.addEventListener('click', (event) => {
      const { x, y } = eventToSceneCoords(panel, event);
      cursorPos = { x, y };
      panelIndex = panels.indexOf(panel);
      game.pick(x, y);
    });
    panel.addEventListener('pointermove', (event) => {
      if (cursorVisible) {
        const { x, y } = eventToSceneCoords(panel, event);
        cursorPos = { x, y };
        panelIndex = panels.indexOf(panel);
        positionCursor();
      }
    });
    panel.addEventListener('focus', () => {
      panelIndex = panels.indexOf(panel);
      showCursor();
    });
  }

  // Keep the ring glued to its panel when the window resizes.
  window.addEventListener('resize', () => {
    if (cursorVisible) positionCursor();
  });

  // Keyboard play.
  document.addEventListener('keydown', (event) => {
    if (game.phase !== 'playing') return;
    const step = event.shiftKey ? FAST_STEP : STEP;
    switch (event.key) {
      case 'ArrowLeft':
        moveCursor(-step, 0);
        event.preventDefault();
        break;
      case 'ArrowRight':
        moveCursor(step, 0);
        event.preventDefault();
        break;
      case 'ArrowUp':
        moveCursor(0, -step);
        event.preventDefault();
        break;
      case 'ArrowDown':
        moveCursor(0, step);
        event.preventDefault();
        break;
      case 'Tab':
        switchPanel();
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        pickAtCursor();
        event.preventDefault();
        break;
      case 'h':
      case 'H':
        game.useHint();
        break;
      case 'r':
      case 'R':
        game.startLevel(game.levelIndex);
        break;
      case 'm':
      case 'M':
        game.toggleSound();
        break;
      default:
        break;
    }
  });

  return { showCursor, positionCursor };
}
