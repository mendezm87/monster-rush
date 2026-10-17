# Monster Rush

### [▶ Play Monster Rush in your browser](https://mendezm87.github.io/monster-rush/)

Works on PC (mouse and keyboard or a gamepad) and on phones (turn the phone sideways). No install needed. [See all the monsters](https://mendezm87.github.io/monster-rush/gallery.html).

A real-time pixel-art monster roguelike: pick a starter, rush down through floors of rooms full of wild monsters, recruit new ones, collect coins and items, and see how deep you get. Built on the combat of [Monster Battle Stadium](https://github.com/mendezm87/monster-battle-stadium). Plain HTML5 Canvas + JavaScript, no build step, no dependencies.

**Status:** first playable. Pick a starter (Smugshi, Cinderox or Tidalisk), clear 3 floors of rooms with 1-3 wild monsters each, recruit monsters in recruit rooms, collect coins and berries, beat each floor's boss. Levels, starter evolutions, a shop and a treasure room on every floor, run-long relics, and starters unlocked by beating bosses (saved in the browser).

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
python serve.py
# then visit http://localhost:8137
```

Tests: with the server running, open http://localhost:8137/test.html. Bots play full runs and it shows PASS or FAIL.
