# Vice City Cover Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/dankurniaone/gta6-cover-art-01-v4/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/dankurniaone/gta6-cover-art-01-v4/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A make.fun entry for the [gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01): an offline browser web app that turns your photos into GTA 6-style cover art — the multi-panel poster look with bold caption lettering and a Vice City neon-sunset grade — exported as a PNG to share.

## What it does

- **Multi-panel poster**: a big hero panel plus two side panels (Poster), a single full-bleed photo (Solo), or three panels side by side (Strip).
- **Any photo**: load your own photos from your machine, or use the two bundled samples. Drag a photo to reposition it, scroll to zoom, pick a different photo per panel.
- **Vice City grade**: a warm magenta-to-orange sunset wash and vignette over the whole poster, with a strength slider.
- **Bold caption**: set the title and subtitle in Anton (SIL OFL), gradient-filled gold-to-pink with a dark outline, sized to fit.
- **Fast and easy**: one click from sample photos to an exported PNG in the common post sizes — 1080×1080, 1080×1350, 1920×1080.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: `app/index.html` and its ES modules, font, and sample photos are all files under `app/`. Photos are read on your machine and never uploaded.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `/output/dossier.json` with the vendored make.fun library.

## Screenshots

`screenshots/` holds 4 shots taken by the app itself (see `shots.json` for the scene each one uses): the cover alone (square and portrait), and the editor with a photo loaded. Every screenshot's long side is at most 1280px.

## Credits

- Font: Anton by Vernon Adams, SIL Open Font License 1.1 (`app/fonts/Anton-Regular.ttf`).
- Sample photos (CC-licensed, free to use):
  - `app/samples/boulevard.jpg` — "Ocean Drive at night in Miami Beach, Florida", CC BY-SA 2.0, via Openverse/Flickr.
  - `app/samples/pier.jpg` — "Pismo Beach Pier Sunset", CC BY 2.0, via Openverse/Flickr.
- No Rockstar Games logo, wordmark, artwork, character, or font is used. The cover art is an original design in the genre's style.

## License

MIT — see `LICENSE`.
