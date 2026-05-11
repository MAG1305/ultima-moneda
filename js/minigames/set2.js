// Set 2 — Secuencia de 4 teclas aleatorias (1.5 segundos)
const KEYS     = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
const LENGTH   = 4;
const DURATION = 2000;

export function start({ onSaved, onCut }) {
  const sequence = Array.from({ length: LENGTH }, () =>
    KEYS[Math.floor(Math.random() * KEYS.length)],
  );

  const overlay     = document.getElementById('mg2-overlay');
  const seqDisplay  = document.getElementById('mg2-seq-display');
  const seqProgress = document.getElementById('mg2-seq-progress');
  const bar         = document.getElementById('mg2-bar');

  let progress = 0;
  let resolved = false;

  renderKeys();
  bar.style.transition = 'none';
  bar.style.width      = '100%';
  overlay.classList.remove('hidden');

  requestAnimationFrame(() => {
    bar.style.transition = `width ${DURATION}ms linear`;
    bar.style.width      = '0%';
  });

  const timer = setTimeout(() => resolve(false), DURATION);

  const onKeyDown = (e) => {
    if (resolved) return;
    const k = e.key.toUpperCase();
    if (!/^[A-Z]$/.test(k)) return;

    if (k === sequence[progress]) {
      progress++;
      renderKeys();
      if (progress === LENGTH) resolve(true);
    } else {
      resolve(false);
    }
  };

  document.addEventListener('keydown', onKeyDown);

  function renderKeys() {
    seqDisplay.innerHTML = sequence
      .map((k, i) => {
        let cls = 'seq-key';
        if (i < progress)  cls += ' done';
        if (i === progress) cls += ' active';
        return `<span class="${cls}">${k}</span>`;
      })
      .join('');
    seqProgress.textContent = `${progress} / ${LENGTH}`;
  }

  function resolve(saved) {
    if (resolved) return;
    resolved = true;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKeyDown);
    bar.style.transition = 'none';
    bar.style.width      = '100%';
    overlay.classList.add('hidden');
    saved ? onSaved() : onCut();
  }
}
