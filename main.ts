// Vice City Cover Maker — the entry program (Node 22, standard library only).
// The app lives in app/ beside this file: plain static files a desktop browser
// loads offline (app/index.html and its ES modules, the Anton font, two sample
// photos, no network request). This program hands the app in: it copies app/
// and screenshots/ to the output directory and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate refuses more than 4 screenshots, or one over 256 KiB. Catch that
// here, before anything is uploaded, instead of learning it from a rejection.
function checkScreenshots() {
  const shots = join(root, 'screenshots');
  if (!existsSync(shots)) throw new Error('screenshots/ is missing');
  const files = readdirSync(shots).filter((f) => /\.(png|jpe?g)$/i.test(f));
  if (files.length < 3 || files.length > 4) {
    throw new Error(`expected 3 or 4 screenshots, found ${files.length}`);
  }
  for (const file of files) {
    const size = statSync(join(shots, file)).size;
    if (size > 262144) throw new Error(`${file} is ${size} bytes, over the 256 KiB cap`);
  }
  return files;
}

function countAppFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    n += entry.isDirectory() ? countAppFiles(path) : 1;
  }
  return n;
}

function handIn() {
  const shots = checkScreenshots();
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(root, 'app'), join(outputDir, 'app'), { recursive: true });
  cpSync(join(root, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`handed in ${countAppFiles(join(root, 'app'))} app files and ${shots.length} screenshots to ${outputDir}`);
}

handIn();
