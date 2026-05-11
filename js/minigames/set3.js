// Set 3 — Esquivar la cuchilla (estilo pesca de Stardew, al revés)
// Mantén pulsado → dedo sube. Suelta → dedo cae por gravedad.
// La cuchilla se mueve aleatoriamente. Sobrevivir 5 s = salvado.

const ARENA_H      = 320;
const BLADE_H      = 40;
const FINGER_H     = 36;
const SURVIVE_MS   = 5000;
const COLLISION_PX = 16;  // distancia entre centros para colisión

// Física del dedo (como la barra verde de Stardew)
const FLOAT_VEL = -5;    // velocidad fija hacia arriba al mantener pulsado
const GRAVITY   = 0.28;  // aceleración de caída por frame
const MAX_FALL  = 9;     // velocidad máxima de caída

export function start({ onSaved, onCut }) {
  const overlay  = document.getElementById('mg3-overlay');
  const arena    = document.getElementById('mg3-arena');
  const bladeEl  = document.getElementById('mg3-blade');
  const fingerEl = document.getElementById('mg3-finger');
  const timerBar = document.getElementById('mg3-timer-bar');

  // Estado del dedo
  let fingerY   = ARENA_H / 2 - FINGER_H / 2;
  let fingerVel = 0;
  let isHolding = false;

  // Estado de la cuchilla
  let bladeY      = 0;
  let bladeVel    = 0;
  let bladeTarget = ARENA_H * 0.7;

  let resolved    = false;
  let startTime   = null;
  let rafId       = null;
  let targetTimer = null;

  // Posiciones iniciales
  bladeEl.style.top  = bladeY + 'px';
  fingerEl.style.top = fingerY + 'px';

  // Timer visual (verde — cuenta 5 segundos)
  timerBar.style.transition = 'none';
  timerBar.style.width      = '100%';
  overlay.classList.remove('hidden');

  requestAnimationFrame(() => {
    timerBar.style.transition = `width ${SURVIVE_MS}ms linear`;
    timerBar.style.width      = '0%';
  });

  // ── Controles ──────────────────────────────────────────────────────────────
  // Capturar pointerdown en todo el overlay para que sea fácil mantener pulsado
  const onDown = (e) => {
    e.preventDefault();
    isHolding = true;
    fingerEl.classList.add('holding');
  };
  const onUp = () => {
    isHolding = false;
    fingerEl.classList.remove('holding');
  };

  overlay.addEventListener('pointerdown', onDown);
  document.addEventListener('pointerup', onUp);
  // Por si el puntero sale del documento mientras se mantiene pulsado
  document.addEventListener('pointercancel', onUp);

  // ── Movimiento de la cuchilla ───────────────────────────────────────────────
  function scheduleTarget() {
    const delay = 500 + Math.random() * 900;
    targetTimer = setTimeout(() => {
      if (!resolved) {
        bladeTarget = Math.random() * (ARENA_H - BLADE_H);
        scheduleTarget();
      }
    }, delay);
  }
  scheduleTarget();

  // ── Game loop ───────────────────────────────────────────────────────────────
  function loop(timestamp) {
    if (resolved) return;
    if (!startTime) startTime = timestamp;

    const elapsed  = timestamp - startTime;
    const speedMul = 1 + (elapsed / SURVIVE_MS) * 2.2; // acelera hasta ×3.2

    // Física del dedo
    if (isHolding) {
      fingerVel = FLOAT_VEL;
    } else {
      fingerVel = clamp(fingerVel + GRAVITY, -MAX_FALL, MAX_FALL);
    }
    fingerY = clamp(fingerY + fingerVel, 0, ARENA_H - FINGER_H);

    // Física de la cuchilla (resorte)
    bladeVel  = (bladeVel + (bladeTarget - bladeY) * 0.055 * speedMul) * 0.88;
    bladeY    = clamp(bladeY + bladeVel, 0, ARENA_H - BLADE_H);

    bladeEl.style.top  = bladeY  + 'px';
    fingerEl.style.top = fingerY + 'px';

    // La colisión solo se comprueba al acabar los 5 segundos
    if (elapsed >= SURVIVE_MS) {
      const bladeCY  = bladeY  + BLADE_H  / 2;
      const fingerCY = fingerY + FINGER_H / 2;
      const survived = Math.abs(bladeCY - fingerCY) >= COLLISION_PX;
      resolve(survived);
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  function resolve(saved) {
    if (resolved) return;
    resolved = true;
    cancelAnimationFrame(rafId);
    clearTimeout(targetTimer);
    overlay.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
    fingerEl.classList.remove('holding');
    timerBar.style.transition = 'none';
    timerBar.style.width      = '100%';
    overlay.classList.add('hidden');
    saved ? onSaved() : onCut();
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
