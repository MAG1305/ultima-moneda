// Set 4 — Cortar el cable del color correcto (efecto Stroop)
// Aparece el NOMBRE de un color. El jugador corta el cable de ESE color.
// La fuente puede ser de un color diferente para crear interferencia cognitiva.

const DURATION = 1000;

const COLOR_POOL = [
  { name: 'ROJO',     hex: '#cc2200' },
  { name: 'AZUL',     hex: '#2266cc' },
  { name: 'VERDE',    hex: '#22aa44' },
  { name: 'AMARILLO', hex: '#ccaa00' },
  { name: 'NARANJA',  hex: '#cc6600' },
  { name: 'MORADO',   hex: '#882299' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function start({ onSaved, onCut }) {
  const overlay         = document.getElementById('mg4-overlay');
  const wordEl          = document.getElementById('mg4-word');
  const cablesContainer = document.getElementById('mg4-cables');
  const timerBar        = document.getElementById('mg4-timer-bar');

  // 4 colores aleatorios para los cables
  const cableColors = shuffle(COLOR_POOL).slice(0, 4);

  // El color correcto es uno de los 4 cables
  const target = cableColors[Math.floor(Math.random() * cableColors.length)];

  // Color de la fuente: 50% coincide con target, 50% diferente (Stroop)
  const inkColor = Math.random() < 0.5
    ? target.hex
    : cableColors.find(c => c !== target)?.hex ?? target.hex;

  wordEl.textContent  = target.name;
  wordEl.style.color  = inkColor;

  // Construir cables (posición aleatoria gracias al shuffle anterior)
  cablesContainer.innerHTML = '';
  cableColors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'cable-wrapper';
    btn.innerHTML = `
      <div class="cable-wire" style="background:${color.hex}"></div>
      <span class="cable-scissors">✂</span>
    `;
    btn.addEventListener('click', () => {
      if (!resolved) resolve(color === target);
    });
    cablesContainer.appendChild(btn);
  });

  let resolved = false;

  timerBar.style.transition = 'none';
  timerBar.style.width      = '100%';
  overlay.classList.remove('hidden');

  requestAnimationFrame(() => {
    timerBar.style.transition = `width ${DURATION}ms linear`;
    timerBar.style.width      = '0%';
  });

  const timer = setTimeout(() => { if (!resolved) resolve(false); }, DURATION);

  function resolve(saved) {
    if (resolved) return;
    resolved = true;
    clearTimeout(timer);
    timerBar.style.transition = 'none';
    timerBar.style.width      = '100%';
    overlay.classList.add('hidden');
    saved ? onSaved() : onCut();
  }
}
