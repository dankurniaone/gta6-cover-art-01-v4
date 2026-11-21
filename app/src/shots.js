// Fixed scenes for the entry's screenshots.
// ?shot=editor shows the full maker with a sample photo loaded and a caption.
// ?shot=cover shows the finished cover alone (the app's own drawing of it).
// window.__shotReady is set once the scene has painted, so the screenshot
// runner knows when to capture.

export async function runShot(shot, query, load) {
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Sunset Heist';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await load(photo, caption);
  // Two animation frames: one to paint, one to let the canvas settle.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
