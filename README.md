# Globetrotter

Learn the world's 197 countries on an accurate map, five at a time. Meet each country, match its name, then find it on the map. Earn stars and XP and keep a daily streak.

Play: https://kevinanderson20.github.io/globetrotter/

Progress saves in your browser on your device. Use "Back up progress" to move it to another device.

Map data: Natural Earth 1:10m, via world-atlas.

Daily 10: the same 10 countries for everyone each day. Drop a pin; points depend on how close you get.

Neighbors drill: tap every country that borders the highlighted one.

Mastery map: see how well you know each country at a glance.

Challenges: quiz a whole continent or the world, timed, with your best scores saved.

Works offline: open it once with internet (ideally from your home-screen icon) and the app saves a copy on your device.

## Editions

- `index.html`: World (197 countries). This is the source of the app code.
- `usa/`: the 50 states (US Census 1:10m boundaries via us-atlas; `tools/build-us-data.js`).
- `earth/`: oceans & seas, rivers, mountain ranges and peaks, deserts and regions (Natural Earth 1:50m physical layers; `tools/build-earth-data.mjs`).

`usa/` and `earth/` are generated from the World edition. After editing `index.html`, run `python3 tools/build_editions.py`.
