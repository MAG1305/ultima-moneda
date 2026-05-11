// Set 1 — Tecla única aleatoria (2 segundos)
const KEYS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
const DURATION = 2000;

export function start({ onSaved, onCut }) {
  const key      = KEYS[Math.floor(Math.random() * KEYS.length)];
  const overlay  = document.getElementById('mg1-overlay');
  const keyEl    = document.getElementById('mg1-key');
  const bar      = document.getElementById('mg1-bar');

  let resolved = false;

  keyEl.textContent     = key;
  bar.style.transition  = 'none';
  bar.style.width       = '100%';
  overlay.classList.remove('hidden');

  requestAnimationFrame(() => {
    bar.style.transition = `width ${DURATION}ms linear`;
    bar.style.width      = '0%';
  });

  const timer = setTimeout(() => resolve(false), DURATION);

  const onKeyDown = (e) => {
    if (resolved) return;
    if (e.key.toUpperCase() === key) {
      e.preventDefault();
      resolve(true);
    }
  };
  const onTap = () => { if (!resolved) resolve(true); };

  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', onTap);

  function resolve(saved) {
    if (resolved) return;
    resolved = true;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKeyDown);
    overlay.removeEventListener('click', onTap);
    bar.style.transition = 'none';
    bar.style.width      = '100%';
    overlay.classList.add('hidden');
    saved ? onSaved() : onCut();
  }
}
