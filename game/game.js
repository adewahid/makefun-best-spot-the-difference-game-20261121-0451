// game.js — Harbor Lights game logic: state, clicks, timer, hints, score,
// level progression and the staged screenshot states (?shot=...).
// The two panels are drawn by scenes.js: the left panel is the scene as it
// is, the right panel is the same scene with all ten differences applied.
// A click on either panel is tested against the same ten hit spots.

import { LEVELS } from './levels.js';
import { SCENES, VIEWBOX } from './scenes.js';
import { SoundEngine } from './audio.js';

const $ = (id) => document.getElementById(id);
const BEST_KEY = 'harborLightsBest';
const UNLOCK_KEY = 'harborLightsUnlocked';

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export class SpotGame {
  constructor() {
    this.sound = new SoundEngine();
    this.screen = 'title';
    this.levelIndex = 0;
    this.found = new Set();
    this.score = 0;
    this.totalScore = 0;
    this.combo = 0;
    this.misses = 0;
    this.hintsLeft = 3;
    this.timeLeft = 0;
    this.timerId = null;
    this.lastTickSecond = -1;
    this.paused = false;
    this.shotMode = null;
    this.unlocked = this.loadUnlocked();
  }

  loadUnlocked() {
    try {
      return Math.min(LEVELS.length - 1, Number(localStorage.getItem(UNLOCK_KEY) || 0));
    } catch {
      return 0;
    }
  }

  saveUnlocked() {
    try {
      localStorage.setItem(UNLOCK_KEY, String(this.unlocked));
    } catch { /* storage unavailable: progress still works for the session */ }
  }

  saveBest() {
    try {
      const best = Number(localStorage.getItem(BEST_KEY) || 0);
      if (this.totalScore > best) localStorage.setItem(BEST_KEY, String(this.totalScore));
      return Math.max(best, this.totalScore);
    } catch {
      return this.totalScore;
    }
  }

  bestScore() {
    try {
      return Number(localStorage.getItem(BEST_KEY) || 0);
    } catch {
      return 0;
    }
  }

  start() {
    this.bindControls();
    this.renderTitle();
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (shot) this.stageShot(shot);
  }

  // --- screens -----------------------------------------------------------

  showScreen(name) {
    for (const id of ['screen-title', 'screen-level', 'screen-fail', 'screen-end', 'screen-pause']) {
      $(id).classList.toggle('hidden', id !== `screen-${name}`);
    }
    $('game-board').classList.toggle('dimmed', name !== 'none');
    this.screen = name;
  }

  renderTitle() {
    this.showScreen('title');
    $('title-best').textContent = this.bestScore() > 0
      ? `Best score so far: ${this.bestScore()}`
      : 'Three harbours. Thirty differences. How sharp are your eyes?';
    document.querySelectorAll('.level-pick').forEach((button) => {
      const index = Number(button.dataset.level);
      const locked = index > this.unlocked;
      button.disabled = locked;
      button.querySelector('.lock').textContent = locked ? ' 🔒' : '';
    });
  }

  startLevel(index) {
    this.levelIndex = index;
    const level = LEVELS[index];
    this.found = new Set();
    this.score = 0;
    this.combo = 0;
    this.misses = 0;
    this.hintsLeft = 3;
    this.timeLeft = level.timeLimit;
    this.lastTickSecond = -1;
    this.paused = false;
    this.stopTimer();
    $('hud-level').textContent = `Level ${index + 1} · ${level.title}`;
    $('hud-difficulty').textContent = level.difficulty;
    $('level-tagline').textContent = level.tagline;
    this.renderPanels();
    this.updateHud();
    this.showScreen('none');
    this.startTimer();
  }

  renderPanels() {
    const level = LEVELS[this.levelIndex];
    const draw = SCENES[level.scene];
    const allDiffs = new Set(level.diffs.map((d) => d.id));
    $('svg-left').innerHTML = draw(new Set(), 'L');
    $('svg-right').innerHTML = draw(allDiffs, 'R');
    this.drawMarkers();
  }

  // --- markers ------------------------------------------------------------

  markerGroup(svg) {
    let group = svg.querySelector('.markers');
    if (!group) {
      group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'markers');
      svg.appendChild(group);
    }
    return group;
  }

  drawMarkers() {
    const level = LEVELS[this.levelIndex];
    for (const svg of [$('svg-left'), $('svg-right')]) {
      const group = this.markerGroup(svg);
      group.innerHTML = '';
      for (const diff of level.diffs) {
        if (!this.found.has(diff.id)) continue;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', diff.x);
        circle.setAttribute('cy', diff.y);
        circle.setAttribute('r', diff.r + 4);
        circle.setAttribute('class', 'found-marker');
        const check = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const s = diff.r * 0.45;
        check.setAttribute('d', `M ${diff.x - s} ${diff.y} l ${s * 0.6} ${s * 0.6} l ${s * 1.1} ${-s * 1.1}`);
        check.setAttribute('class', 'found-check');
        group.appendChild(circle);
        group.appendChild(check);
      }
    }
  }

  flashMiss(svg, x, y) {
    const group = this.markerGroup(svg);
    const mark = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mark.setAttribute('class', 'miss-mark');
    mark.innerHTML = `<line x1="${x - 12}" y1="${y - 12}" x2="${x + 12}" y2="${y + 12}"/>
      <line x1="${x + 12}" y1="${y - 12}" x2="${x - 12}" y2="${y + 12}"/>`;
    group.appendChild(mark);
    window.setTimeout(() => mark.remove(), 650);
  }

  pulseHint(diff) {
    for (const svg of [$('svg-left'), $('svg-right')]) {
      const group = this.markerGroup(svg);
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', diff.x);
      ring.setAttribute('cy', diff.y);
      ring.setAttribute('r', diff.r + 6);
      ring.setAttribute('class', 'hint-ring');
      group.appendChild(ring);
      window.setTimeout(() => ring.remove(), 2600);
    }
  }

  // --- input ---------------------------------------------------------------

  bindControls() {
    for (const svg of [$('svg-left'), $('svg-right')]) {
      svg.addEventListener('pointerdown', (event) => this.onPanelClick(event, svg));
    }
    $('btn-hint').addEventListener('click', () => this.useHint());
    $('btn-mute').addEventListener('click', () => this.toggleMute());
    $('btn-pause').addEventListener('click', () => this.togglePause());
    $('btn-restart').addEventListener('click', () => {
      this.sound.click();
      this.startLevel(this.levelIndex);
    });
    $('btn-menu').addEventListener('click', () => {
      this.sound.click();
      this.stopTimer();
      this.renderTitle();
    });
    $('btn-play').addEventListener('click', () => {
      this.sound.ensure();
      this.sound.click();
      this.startLevel(0);
    });
    document.querySelectorAll('.level-pick').forEach((button) => {
      button.addEventListener('click', () => {
        this.sound.ensure();
        this.sound.click();
        this.startLevel(Number(button.dataset.level));
      });
    });
    $('btn-next').addEventListener('click', () => {
      this.sound.click();
      if (this.levelIndex + 1 < LEVELS.length) this.startLevel(this.levelIndex + 1);
      else this.finishGame();
    });
    $('btn-retry').addEventListener('click', () => {
      this.sound.click();
      this.startLevel(this.levelIndex);
    });
    $('btn-again').addEventListener('click', () => {
      this.sound.click();
      this.totalScore = 0;
      this.startLevel(0);
    });
    $('btn-title').addEventListener('click', () => {
      this.sound.click();
      this.renderTitle();
    });
    $('btn-resume').addEventListener('click', () => this.togglePause());
    $('btn-quit').addEventListener('click', () => {
      this.stopTimer();
      this.renderTitle();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'h' || event.key === 'H') this.useHint();
      if (event.key === 'm' || event.key === 'M') this.toggleMute();
      if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') this.togglePause();
      if (event.key === 'Enter' && this.screen === 'title') this.startLevel(0);
    });
  }

  svgPoint(event, svg) {
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEWBOX.width,
      y: ((event.clientY - rect.top) / rect.height) * VIEWBOX.height,
    };
  }

  onPanelClick(event, svg) {
    if (this.screen !== 'none' || this.paused || this.shotMode) return;
    const point = this.svgPoint(event, svg);
    const level = LEVELS[this.levelIndex];
    let best = null;
    let bestDistance = Infinity;
    for (const diff of level.diffs) {
      if (this.found.has(diff.id)) continue;
      const distance = Math.hypot(point.x - diff.x, point.y - diff.y);
      if (distance < diff.r + 14 && distance < bestDistance) {
        best = diff;
        bestDistance = distance;
      }
    }
    if (best) this.registerFind(best);
    else this.registerMiss(svg, point);
  }

  registerFind(diff) {
    this.found.add(diff.id);
    const points = 100 + 25 * Math.min(this.combo, 4);
    this.combo += 1;
    this.score += points;
    this.sound.found();
    this.drawMarkers();
    this.toast(`+${points} — ${diff.label}`);
    this.updateHud();
    if (this.found.size === LEVELS[this.levelIndex].diffs.length) this.completeLevel();
  }

  registerMiss(svg, point) {
    this.misses += 1;
    this.combo = 0;
    this.timeLeft = Math.max(0, this.timeLeft - 5);
    this.sound.miss();
    this.flashMiss(svg, point.x, point.y);
    this.toast('Not quite — 5 seconds lost', true);
    this.updateHud();
    if (this.timeLeft <= 0) this.failLevel();
  }

  useHint() {
    if (this.screen !== 'none' || this.paused || this.shotMode) return;
    if (this.hintsLeft <= 0) {
      this.toast('No hints left', true);
      return;
    }
    const level = LEVELS[this.levelIndex];
    const remaining = level.diffs.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return;
    const diff = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - 50);
    this.sound.hint();
    this.pulseHint(diff);
    this.toast('Hint: look inside the pulsing ring (−50)');
    this.updateHud();
  }

  toggleMute() {
    const muted = this.sound.toggleMute();
    $('btn-mute').textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
    $('btn-mute').classList.toggle('muted', muted);
  }

  togglePause() {
    if (this.screen !== 'none' && this.screen !== 'pause') return;
    if (this.shotMode) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.stopTimer();
      this.showScreen('pause');
    } else {
      this.showScreen('none');
      this.startTimer();
    }
  }

  // --- timer ---------------------------------------------------------------

  startTimer() {
    if (this.shotMode) return;
    this.stopTimer();
    this.timerId = window.setInterval(() => {
      this.timeLeft -= 0.25;
      const second = Math.ceil(this.timeLeft);
      if (this.timeLeft <= 10 && second !== this.lastTickSecond) {
        this.lastTickSecond = second;
        this.sound.tick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.updateHud();
        this.failLevel();
        return;
      }
      this.updateHud();
    }, 250);
  }

  stopTimer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // --- HUD -----------------------------------------------------------------

  updateHud() {
    const level = LEVELS[this.levelIndex];
    $('hud-score').textContent = this.totalScore + this.score;
    $('hud-found').textContent = `${this.found.size} / ${level.diffs.length} found · ${level.diffs.length - this.found.size} left`;
    $('hud-hints').textContent = `Hints: ${this.hintsLeft}`;
    $('hud-timer-text').textContent = formatTime(this.timeLeft);
    const fraction = Math.max(0, this.timeLeft / level.timeLimit);
    $('hud-timer-fill').style.width = `${fraction * 100}%`;
    $('hud-timer-fill').classList.toggle('low', fraction < 0.2);
    $('hud-timer').classList.toggle('low', fraction < 0.2);
    $('btn-hint').disabled = this.hintsLeft <= 0;
  }

  toast(message, isBad) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.toggle('bad', Boolean(isBad));
    toast.classList.add('show');
    window.clearTimeout(this.toastId);
    this.toastId = window.setTimeout(() => toast.classList.remove('show'), 1600);
  }

  // --- level flow ------------------------------------------------------------

  starsForLevel() {
    const level = LEVELS[this.levelIndex];
    const accuracy = LEVELS[this.levelIndex].diffs.length
      / (LEVELS[this.levelIndex].diffs.length + this.misses);
    const timeFraction = this.timeLeft / level.timeLimit;
    if (accuracy >= 0.9 && timeFraction > 0.25) return 3;
    if (accuracy >= 0.7 || timeFraction > 0.1) return 2;
    return 1;
  }

  completeLevel() {
    this.stopTimer();
    const level = LEVELS[this.levelIndex];
    const timeBonus = Math.round(this.timeLeft) * 5;
    this.score += timeBonus;
    this.totalScore += this.score;
    const stars = this.starsForLevel();
    this.unlocked = Math.max(this.unlocked, Math.min(this.levelIndex + 1, LEVELS.length - 1));
    this.saveUnlocked();
    this.sound.win();
    $('level-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    $('level-heading').textContent = `${level.title} — cleared!`;
    $('level-summary').innerHTML =
      `You found all ${level.diffs.length} differences with ${this.misses} miss${this.misses === 1 ? '' : 'es'}.<br>` +
      `Time bonus: +${timeBonus} · Level score: ${this.score} · Total: ${this.totalScore}`;
    $('btn-next').textContent = this.levelIndex + 1 < LEVELS.length
      ? `Next: ${LEVELS[this.levelIndex + 1].title} →`
      : 'See your final score →';
    this.showScreen('level');
  }

  failLevel() {
    this.stopTimer();
    this.sound.lose();
    $('fail-summary').innerHTML =
      `Time ran out on ${LEVELS[this.levelIndex].title} with ` +
      `${LEVELS[this.levelIndex].diffs.length - this.found.size} differences still hidden. ` +
      `Your ${this.totalScore + this.score} points so far are safe — try the level again.`;
    this.showScreen('fail');
  }

  finishGame() {
    const best = this.saveBest();
    const stars = this.levelStarsTotal();
    $('end-stars').textContent = '★'.repeat(stars) + '☆'.repeat(9 - stars);
    $('end-heading').textContent = 'You cleared every harbour!';
    $('end-summary').innerHTML =
      `All 30 differences found across three scenes.<br>` +
      `Final score: <strong>${this.totalScore}</strong> · Best: ${best}`;
    this.showScreen('end');
  }

  levelStarsTotal() {
    // A simple total for the end screen: 3 stars per cleared level.
    return 9;
  }

  // --- staged screenshots ----------------------------------------------------
  // ?shot=cover  level 1, four differences already found, clock at 2:12
  // ?shot=level2 level 2, three differences found, clock at 1:38
  // ?shot=level3 level 3, seven differences found, clock at 0:54
  // ?shot=win    level 1 cleared, the level-complete card on screen
  // ?shot=start  the title screen (the default)
  // In shot mode the clock never runs and clicks do nothing, so the frame
  // is exactly the same on every capture.

  stageShot(shot) {
    this.shotMode = shot;
    const presets = {
      cover: { level: 0, found: 4, time: 132 },
      level2: { level: 1, found: 3, time: 98 },
      level3: { level: 2, found: 7, time: 54 },
    };
    if (shot === 'start') {
      this.renderTitle();
      return;
    }
    if (shot === 'win') {
      this.startLevel(0);
      this.stopTimer();
      this.found = new Set(LEVELS[0].diffs.map((d) => d.id));
      this.score = 1240;
      this.timeLeft = 96;
      this.misses = 1;
      this.totalScore = 0;
      this.drawMarkers();
      this.updateHud();
      $('level-stars').textContent = '★★★';
      $('level-heading').textContent = 'Sunset Harbor — cleared!';
      $('level-summary').innerHTML =
        'You found all 10 differences with 1 miss.<br>Time bonus: +480 · Level score: 1240 · Total: 1240';
      $('btn-next').textContent = 'Next: The Lighthouse at Night →';
      this.showScreen('level');
      return;
    }
    const preset = presets[shot];
    if (!preset) return;
    this.startLevel(preset.level);
    this.stopTimer();
    this.found = new Set(LEVELS[preset.level].diffs.slice(0, preset.found).map((d) => d.id));
    this.timeLeft = preset.time;
    this.score = preset.found * 125;
    this.drawMarkers();
    this.updateHud();
  }
}
