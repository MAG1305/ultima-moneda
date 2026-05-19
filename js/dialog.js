// Sistema de cajas de diálogo del jefe.
// Cada llamada muestra un retrato + texto + botones, y resuelve con el id del botón pulsado.

const overlay   = document.getElementById('dialog-overlay');
const portrait  = document.getElementById('dialog-portrait');
const speaker   = document.getElementById('dialog-speaker');
const textEl    = document.getElementById('dialog-text');
const buttonsEl = document.getElementById('dialog-buttons');

// Sprites disponibles para el jefe
export const BOSS_SPRITES = {
  initial:    'img/jefe-inicial-removebg-preview.png',
  smile:      'img/jefe-sonrisa-wason-removebg-preview.png',
  toothless:  'img/jefe-sonrisa-sin-diente-removebg-preview.png',
  angry:      'img/jefe-enojado-removebg-preview.png',
};

/**
 * Muestra una caja de diálogo.
 * @param {Object}   opts
 * @param {string}   opts.text        Texto del diálogo.
 * @param {string}  [opts.sprite]     Sprite del jefe (clave en BOSS_SPRITES) o URL.
 * @param {string}  [opts.speaker]    Nombre del que habla (default: EL JEFE).
 * @param {Array<{id:string,label:string,style?:string}>} [opts.buttons]  Botones disponibles.
 *        Si se omite, se muestra un único botón "CONTINUAR".
 * @returns {Promise<string>} id del botón pulsado.
 */
export function showDialog({ text, sprite = 'initial', speaker: speakerName = 'EL JEFE', buttons } = {}) {
  return new Promise(resolve => {
    portrait.src       = BOSS_SPRITES[sprite] ?? sprite;
    speaker.textContent = speakerName;
    textEl.textContent  = text ?? '';

    const opts = buttons && buttons.length
      ? buttons
      : [{ id: 'continue', label: 'CONTINUAR' }];

    buttonsEl.innerHTML = '';
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className   = 'dialog-btn' + (opt.style ? ' dialog-btn-' + opt.style : '');
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        buttonsEl.innerHTML = '';
        resolve(opt.id);
      }, { once: true });
      buttonsEl.appendChild(btn);
    });

    overlay.classList.remove('hidden');
  });
}

export function hideDialog() {
  overlay.classList.add('hidden');
  buttonsEl.innerHTML = '';
}
