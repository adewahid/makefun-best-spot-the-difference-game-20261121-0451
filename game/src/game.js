// game.js — the game itself: state, scoring, timer, hints, markers and
// the title / win overlays. It knows nothing about how the pictures are
// drawn (scenes.js) or how sounds are made (audio.js).

import { LEVELS, VIEW_W, VIEW_H, renderScene } from './scenes.js';
import { SoundEngine } from './audio.js';

const POINTS_PER_FIND = 100;
const POINTS_PER_MISS = -25;
const POINTS_PER_HINT = -50;
const HINTS_PER_LEVEL = 3;
const TIME_BONUS_START = 300; // bonus for a fast finish, shrinks 2/s
const TIME_BONUS_PER_SECOND = 2;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function starsFor(seconds, misses) {
  if (seconds <= 120 && misses === 0) return 3;
  if (seconds <= 240 && misses <= 3) return 2;
  return 1;
}

export class Game {
  constructor(root) {
    this.root = root;
    this.sound = new SoundEngine();
    this.levelIndex = 0;
    this.unlockedLevel = 0;
    this.found = new Set();
    this.score = 0;
    this.misses = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.seconds = 0;
    this.timerId = null;
    this.phase = 'title'; // title | playing | won
    this.toastTimer = null;
    this.hintMark = null;

    this.el = {
      found: root.querySelector('#found-count'),
      total: root.querySelector('#total-count'),
      remaining: root.querySelector('#remaining-count'),
      timer: root.querySelector('#timer'),
      score: root.querySelector('#score'),
      misses: root.querySelector('#misses'),
      hintsLeft: root.querySelector('#hints-left'),
      hintBtn: root.querySelector('#hint-btn'),
      soundBtn: root.querySelector('#sound-btn'),
      restartBtn: root.querySelector('#restart-btn'),
      panelA: root.querySelector('#panel-a'),
      panelB: root.querySelector('#panel-b'),
      sceneNameA: root.querySelector('#scene-name-a'),
      sceneNameB: root.querySelector('#scene-name-b'),
      cursor: root.querySelector('#cursor'),
      overlay: root.querySelector('#overlay'),
      overlayCard: root.querySelector('#overlay-card'),
      toast: root.querySelector('#toast'),
      levelTabs: [...root.querySelectorAll('.level-tab')],
    };

    this.el.hintBtn.addEventListener('click', () => this.useHint());
    this.el.soundBtn.addEventListener('click', () => this.toggleSound());
    this.el.restartBtn.addEventListener('click', () => this.startLevel(this.levelIndex));
    this.el.levelTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const index = Number(tab.dataset.level);
        if (index <= this.unlockedLevel) this.startLevel(index);
      });
    });
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  get remaining() {
    return this.level.differences.length - this.found.size;
  }

  // -- level lifecycle -------------------------------------------------------

  startLevel(levelIndex) {
    this.levelIndex = levelIndex;
    this.found = new Set();
    this.misses = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.seconds = 0;
    this.phase = 'playing';
    this.clearMarks();
    this.hideOverlay();
    this.renderPanels();
    this.el.sceneNameA.textContent = this.level.name;
    this.el.sceneNameB.textContent = this.level.name;
    this.el.levelTabs.forEach((tab) => {
      const index = Number(tab.dataset.level);
      tab.classList.toggle('active', index === levelIndex);
      tab.classList.toggle('locked', index > this.unlockedLevel);
    });
    this.updateHud();
    this.startTimer();
    this.sound.ensureContext();
    this.sound.startMusic();
  }

  renderPanels() {
    renderScene(this.el.panelA, this.levelIndex, 'a');
    renderScene(this.el.panelB, this.levelIndex, 'b');
  }

  startTimer() {
    this.stopTimer();
    this.timerId = window.setInterval(() => {
      if (this.phase !== 'playing') return;
      this.seconds += 1;
      this.el.timer.textContent = formatTime(this.seconds);
    }, 1000);
  }

  stopTimer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // -- clicking --------------------------------------------------------------

  // A click (or keyboard pick) at scene coordinates (x, y) on either panel.
  // Returns 'found' | 'already' | 'miss'.
  pick(x, y) {
    if (this.phase !== 'playing') return 'idle';
    this.sound.ensureContext();
    const hit = this.level.differences.find((d) => {
      const dx = x - d.x;
      const dy = y - d.y;
      return dx * dx + dy * dy <= d.r * d.r;
    });
    if (!hit) {
      this.registerMiss(x, y);
      return 'miss';
    }
    if (this.found.has(hit.id)) return 'already';
    this.registerFound(hit);
    return 'found';
  }

  registerFound(diff) {
    this.found.add(diff.id);
    this.score += POINTS_PER_FIND;
    this.sound.found();
    this.placeMark(diff.x, diff.y, 'found');
    this.showToast(`Found it! ${diff.name} — +${POINTS_PER_FIND}`);
    this.updateHud();
    if (this.remaining === 0) this.winLevel();
  }

  registerMiss(x, y) {
    this.misses += 1;
    this.score = Math.max(0, this.score + POINTS_PER_MISS);
    this.sound.miss();
    this.placeMark(x, y, 'miss');
    this.showToast('Not quite — that spot matches. −25 points');
    this.updateHud();
  }

  // -- markers ---------------------------------------------------------------

  // Convert scene coordinates (560 x 420) to a position inside a panel.
  sceneToPanel(panel, x, y) {
    const rect = panel.getBoundingClientRect();
    return {
      left: (x / VIEW_W) * rect.width,
      top: (y / VIEW_H) * rect.height,
    };
  }

  placeMark(x, y, kind) {
    for (const panel of [this.el.panelA, this.el.panelB]) {
      const pos = this.sceneToPanel(panel, x, y);
      const mark = document.createElement('div');
      mark.className = kind === 'found' ? 'mark' : 'mark miss';
      mark.style.left = `${pos.left}px`;
      mark.style.top = `${pos.top}px`;
      panel.appendChild(mark);
      if (kind === 'miss') {
        window.setTimeout(() => mark.remove(), 900);
      }
    }
  }

  clearMarks() {
    for (const panel of [this.el.panelA, this.el.panelB]) {
      panel.querySelectorAll('.mark').forEach((mark) => mark.remove());
    }
    this.hintMark = null;
  }

  // -- hints -----------------------------------------------------------------

  useHint() {
    if (this.phase !== 'playing') return;
    if (this.hintsLeft <= 0) {
      this.showToast('No hints left on this level.');
      return;
    }
    const hidden = this.level.differences.filter((d) => !this.found.has(d.id));
    if (hidden.length === 0) return;
    const pick = hidden[Math.floor(Math.random() * hidden.length)];
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score + POINTS_PER_HINT);
    this.sound.hint();
    this.pulseHint(pick);
    this.showToast(`Hint: look near “${pick.name}” — −50 points`);
    this.updateHud();
  }

  pulseHint(diff) {
    if (this.hintMark) this.hintMark.forEach((m) => m.remove());
    this.hintMark = [];
    for (const panel of [this.el.panelA, this.el.panelB]) {
      const pos = this.sceneToPanel(panel, diff.x, diff.y);
      const mark = document.createElement('div');
      mark.className = 'mark hint-pulse';
      mark.style.left = `${pos.left}px`;
      mark.style.top = `${pos.top}px`;
      panel.appendChild(mark);
      this.hintMark.push(mark);
      window.setTimeout(() => mark.remove(), 2800);
    }
  }

  // -- winning ---------------------------------------------------------------

  winLevel() {
    this.phase = 'won';
    this.stopTimer();
    const timeBonus = Math.max(0, TIME_BONUS_START - this.seconds * TIME_BONUS_PER_SECOND);
    this.score += timeBonus;
    const stars = starsFor(this.seconds, this.misses);
    this.sound.fanfare();
    this.sound.stopMusic();
    this.unlockedLevel = Math.max(this.unlockedLevel, Math.min(LEVELS.length - 1, this.levelIndex + 1));
    this.updateHud();
    this.showWinOverlay(stars, timeBonus);
  }

  // -- HUD / toast / overlays ------------------------------------------------

  updateHud() {
    this.el.found.textContent = String(this.found.size);
    this.el.total.textContent = String(this.level.differences.length);
    this.el.remaining.textContent = String(this.remaining);
    this.el.timer.textContent = formatTime(this.seconds);
    this.el.score.textContent = String(this.score);
    this.el.misses.textContent = String(this.misses);
    this.el.hintsLeft.textContent = `(${this.hintsLeft})`;
    this.el.hintBtn.disabled = this.hintsLeft <= 0 || this.phase !== 'playing';
  }

  showToast(message) {
    this.el.toast.textContent = message;
    this.el.toast.classList.add('show');
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.el.toast.classList.remove('show');
    }, 2600);
  }

  showOverlay(html) {
    this.el.overlayCard.innerHTML = html;
    this.el.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.el.overlay.classList.add('hidden');
  }

  showTitle() {
    this.phase = 'title';
    this.stopTimer();
    this.levelIndex = 0;
    this.found = new Set();
    this.misses = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.seconds = 0;
    this.score = 0;
    this.clearMarks();
    this.renderPanels();
    this.el.sceneNameA.textContent = this.level.name;
    this.el.sceneNameB.textContent = this.level.name;
    this.updateHud();
    this.showOverlay(`
      <div class="big-emoji" aria-hidden="true">🐾</div>
      <h2>Whiskers' Café</h2>
      <h3>SPOT THE DIFFERENCE</h3>
      <p>Two pictures hang side by side in the café — and <strong>7 things</strong>
      don't match. A clock that changed time, a bow that changed colour,
      a sun that turned into a cloud… Find them all, then hunt the
      <strong>Firefly Garden</strong> at night.</p>
      <p>Click a difference on either picture to circle it. Wrong clicks cost
      25 points; hints cost 50. Finish fast and clean for 3 stars.</p>
      <div class="btn-row">
        <button type="button" class="big-btn" id="start-btn">Start hunting</button>
      </div>
      <p class="fineprint">Original art drawn in code · sounds synthesized live · plays fully offline</p>
    `);
    this.el.overlayCard.querySelector('#start-btn').addEventListener('click', () => {
      this.sound.ensureContext();
      this.startLevel(0);
    });
  }

  showWinOverlay(stars, timeBonus) {
    const starRow = [1, 2, 3]
      .map((n) => `<span class="${n <= stars ? '' : 'dim'}">★</span>`)
      .join('');
    const isLastLevel = this.levelIndex >= LEVELS.length - 1;
    const nextLevel = LEVELS[this.levelIndex + 1];
    const foundList = this.level.differences
      .map((d) => `<li>${d.name}</li>`)
      .join('');
    this.showOverlay(`
      <div class="big-emoji" aria-hidden="true">🎉</div>
      <h2>${isLastLevel ? 'You found them all!' : 'Level complete!'}</h2>
      <h3>${this.level.name.toUpperCase()}</h3>
      <div class="stars" aria-label="${stars} out of 3 stars">${starRow}</div>
      <div class="stat-grid">
        <div class="stat"><span class="stat-label">Time</span><span class="stat-value">${formatTime(this.seconds)}</span></div>
        <div class="stat"><span class="stat-label">Misses</span><span class="stat-value">${this.misses}</span></div>
        <div class="stat"><span class="stat-label">Time bonus</span><span class="stat-value">+${timeBonus}</span></div>
        <div class="stat"><span class="stat-label">Score</span><span class="stat-value">${this.score}</span></div>
      </div>
      <ul class="diff-list">${foundList}</ul>
      <div class="btn-row">
        ${isLastLevel
          ? '<button type="button" class="big-btn" id="again-btn">Play again</button>'
          : `<button type="button" class="big-btn" id="next-btn">Next: ${nextLevel.name}</button>
             <button type="button" class="big-btn secondary" id="again-btn">Replay level</button>`}
      </div>
      <p class="fineprint">${isLastLevel
        ? 'Both scenes cleared — you are a true difference detective.'
        : 'One more scene is waiting after dark…'}</p>
    `);
    const again = this.el.overlayCard.querySelector('#again-btn');
    if (again) again.addEventListener('click', () => this.startLevel(isLastLevel ? 0 : this.levelIndex));
    const next = this.el.overlayCard.querySelector('#next-btn');
    if (next) next.addEventListener('click', () => this.startLevel(this.levelIndex + 1));
  }

  toggleSound() {
    this.sound.ensureContext();
    this.sound.setEnabled(!this.sound.enabled);
    this.el.soundBtn.textContent = this.sound.enabled ? '♪ Sound: On' : '♪ Sound: Off';
  }
}
