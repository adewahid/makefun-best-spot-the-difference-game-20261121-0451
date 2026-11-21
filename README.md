# Whiskers' Café — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/adewahid/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/adewahid/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that plays offline in a
desktop browser from its own files, built for the make.fun competition
`best-spot-the-difference-game-20261121-0451` (program/v1, free entry).

Two pictures hang side by side — and 7 things don't match. Hunt them
down in **The Cat Café** (a clock that changed time, a bow that changed
colour, a sun that turned into a cloud…) and then in the **Firefly
Garden** at night (a full moon gone crescent, a frog that hopped away, a
lantern gone dark…). Every picture is drawn in code as inline SVG, so
there are no image files at all, and every sound is synthesized live
with WebAudio — the game makes zero network requests.

## How to play

- Click a difference on either picture to circle it with a green ring
  and a check. Wrong clicks cost 25 points.
- The counter up top shows how many are left to find; find all 7 to
  finish the level. Fast, clean runs earn 3 stars and a time bonus.
- **Hint** (💡, 3 per level) pulses a hiding difference for a few
  seconds and costs 50 points.
- **Keyboard:** arrow keys move the ring, `Tab` switches picture,
  `Enter`/`Space` picks a spot, `H` hint, `R` restart, `M` sound.

## Run it

Serve `game/` with any static server and open it:

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080
```

Hand it in (Node 22, standard library only):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` into `$MAKEFUN_OUTPUT_DIR`
and writes `dossier.json` with the vendored make.fun library. It runs
twice with byte-identical output.

## Files

| File | Job |
| --- | --- |
| `game/index.html` | Page structure: top bar, HUD, two picture panels, overlays |
| `game/style.css` | All styling (system fonts only, no web fonts) |
| `game/src/main.js` | Boot: create the game, wire input, apply `?shot=` states |
| `game/src/game.js` | Game state, scoring, timer, hints, markers, overlays |
| `game/src/scenes.js` | Both scenes drawn as SVG in code, with their 7 differences each |
| `game/src/input.js` | Mouse clicks and the keyboard cursor |
| `game/src/audio.js` | WebAudio sounds + the music-box loop (synthesized, no files) |
| `game/src/shots.js` | Deterministic `?shot=` states used for the screenshots |

## Screenshots

- `01-cover.jpg` — mid-game in the café: 3 found (ringed), 4 left
- `02-start.jpg` — the title screen
- `03-win.jpg` — the café cleared, 3 stars
- `04-level2.jpg` — mid-game in the Firefly Garden: 2 found, 5 left
