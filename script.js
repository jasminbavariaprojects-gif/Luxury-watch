const TOTAL_FRAMES = 240;
const canvas = document.querySelector('#watch-canvas');
const context = canvas.getContext('2d', { alpha: false });
const sequence = document.querySelector('.sequence');
const loading = document.querySelector('#loading');
const frameNumber = document.querySelector('#frame-number');
const intro = document.querySelector('.copy-intro');
const craft = document.querySelector('.copy-craft');
const finale = document.querySelector('.copy-finale');
const scrollLine = document.querySelector('.scroll-line');
const images = Array(TOTAL_FRAMES);
let loaded = 0, currentFrame = 0, lastRender = -1, dpr = 1;

function source(frame) { return `frames/frame_${String(frame).padStart(5, '0')}.png`; }
function resizeCanvas() { dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; draw(currentFrame); }
function draw(frame) {
  const image = images[frame];
  if (!image || !image.complete) return;
  const cw = canvas.width, ch = canvas.height, iw = image.naturalWidth, ih = image.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const w = iw * scale, h = ih * scale;
  context.fillStyle = '#090d14'; context.fillRect(0, 0, cw, ch);
  context.drawImage(image, (cw - w) / 2, (ch - h) / 2, w, h);
  lastRender = frame;
}
function load(frame, priority = false) {
  if (images[frame]) return;
  const img = new Image(); images[frame] = img;
  img.onload = () => { loaded++; if (frame === currentFrame || lastRender < 0) draw(currentFrame); if (loaded <= 36) { loading.querySelector('span').textContent = `${Math.round((loaded / 36) * 100)}%`; } if (loaded >= 16) loading.classList.add('loaded'); };
  img.src = source(frame);
}
for (let i = 0; i < 36; i++) load(i, true);
function preloadAround(frame) { for (let i = Math.max(0, frame - 8); i <= Math.min(TOTAL_FRAMES - 1, frame + 16); i++) load(i); }
function update() {
  const bounds = sequence.getBoundingClientRect();
  const distance = sequence.offsetHeight - innerHeight;
  const progress = Math.min(1, Math.max(0, -bounds.top / distance));
  const target = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * (TOTAL_FRAMES - 1)));
  currentFrame = target; preloadAround(target); draw(target);
  frameNumber.textContent = String(target + 1).padStart(2, '0');
  intro.style.opacity = Math.max(0, 1 - progress * 5);
  craft.style.opacity = Math.max(0, Math.min(1, (progress - .26) * 7, (.66 - progress) * 7));
  finale.style.opacity = Math.max(0, Math.min(1, (progress - .7) * 5));
  scrollLine.style.transform = `scaleX(${Math.max(.08, 1 - progress)})`;
  requestAnimationFrame(() => {});
}
window.addEventListener('resize', resizeCanvas, { passive: true });
window.addEventListener('scroll', update, { passive: true });
window.addEventListener('load', () => { resizeCanvas(); update(); setTimeout(() => loading.classList.add('loaded'), 4000); });
window.addEventListener('pointerdown', () => { for (let i = 36; i < TOTAL_FRAMES; i++) setTimeout(() => load(i), (i - 36) * 18); }, { once: true });
