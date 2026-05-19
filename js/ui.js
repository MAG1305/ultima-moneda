import { MAX_MONEY } from './state.js';
import { BOSS_SPRITES } from './dialog.js';

// ===== DOM refs =====
const screenStart = document.getElementById('screen-start');
const screenGame  = document.getElementById('screen-game');
const screenEnd   = document.getElementById('screen-end');

const setTransitionOverlay = document.getElementById('set-transition-overlay');
const sttSetnum  = document.getElementById('stt-setnum');
const sttDesc    = document.getElementById('stt-desc');
const sttMoney   = document.getElementById('stt-money');
const btnSetCont = document.getElementById('btn-set-continue');

const continueOfferOverlay = document.getElementById('continue-offer-overlay');
const coMoney    = document.getElementById('co-money');
const coNextSet  = document.getElementById('co-next-set');
const coNextDesc = document.getElementById('co-next-desc');
const btnCoYes   = document.getElementById('btn-co-yes');
const btnCoNo    = document.getElementById('btn-co-no');

const hudSet     = document.getElementById('hud-set');
const hudRound   = document.getElementById('hud-round');
const moneyAmount    = document.getElementById('money-amount');
const moneyBar       = document.getElementById('money-bar');
const moneyBarLabel  = document.getElementById('money-bar-label');

const coin           = document.getElementById('coin');
const coinResult     = document.getElementById('coin-result');
const choiceButtons  = document.querySelectorAll('.btn-choice');

const bossSprite  = document.getElementById('boss-sprite');
const handImage   = document.getElementById('hand-image');
const screenFx    = document.getElementById('screen-fx');

const fingerMarkers = [0, 1, 2, 3, 4].map(i => document.getElementById(`finger-${i}`));

const endTitle   = document.getElementById('end-title');
const endSummary = document.getElementById('end-summary');
const endFingers = document.getElementById('end-fingers');
const endMoney   = document.getElementById('end-money');

// ===== Screens =====
export function showScreen(name) {
  [screenStart, screenGame, screenEnd].forEach(s => s.classList.remove('active'));
  ({ start: screenStart, game: screenGame, end: screenEnd })[name]?.classList.add('active');
}

// ===== Boss sprite (en la escena, no en el diálogo) =====
export function setBossSprite(key) {
  const url = BOSS_SPRITES[key] ?? key;
  if (url) bossSprite.src = url;
}

// ===== Hand image (sprite sin fondo sobre la mesa) =====
export function setHandImage(_state) {
  handImage.src = 'img/mesa-dedos.png';
}

// ===== Screen FX (al cortar dedo) =====
export function triggerLossFx() {
  screenFx.classList.remove('hidden');
  screenFx.classList.remove('active');
  void screenFx.offsetWidth;
  screenFx.classList.add('active');
  screenGame.classList.add('shake');

  setTimeout(() => {
    screenGame.classList.remove('shake');
  }, 700);

  setTimeout(() => {
    screenFx.classList.remove('active');
    screenFx.classList.add('hidden');
  }, 1100);
}

// ===== Continue Offer (between sets) =====
export function showContinueOffer(currentMoney, nextConfig, onYes, onNo) {
  coMoney.textContent   = `Llevas $${currentMoney.toLocaleString('es')}`;
  coNextSet.textContent = nextConfig.title;
  coNextDesc.textContent = `${nextConfig.desc} — $${nextConfig.moneyPerWin.toLocaleString('es')} por acierto`;
  continueOfferOverlay.classList.remove('hidden');

  const yes = () => { cleanup(); onYes(); };
  const no  = () => { cleanup(); onNo();  };

  function cleanup() {
    btnCoYes.removeEventListener('click', yes);
    btnCoNo.removeEventListener('click', no);
    continueOfferOverlay.classList.add('hidden');
  }

  btnCoYes.addEventListener('click', yes);
  btnCoNo.addEventListener('click', no);
}

// ===== Set Transition =====
export function showSetTransition(config, onContinue) {
  sttSetnum.textContent = config.title;
  sttDesc.textContent   = config.desc;
  sttMoney.textContent  = `$${config.moneyPerWin.toLocaleString('es')} por acierto`;
  setTransitionOverlay.classList.remove('hidden');

  const handler = () => {
    btnSetCont.removeEventListener('click', handler);
    setTransitionOverlay.classList.add('hidden');
    onContinue();
  };
  btnSetCont.addEventListener('click', handler);
}

// ===== HUD =====
export function updateHUD(setNum, roundNum, totalRounds) {
  hudSet.textContent   = `Set ${setNum}/4`;
  hudRound.textContent = `Ronda ${roundNum}/${totalRounds}`;
}

export function updateMoney(money) {
  moneyAmount.textContent = money.toLocaleString('es');
  const pct = Math.min(100, (money / MAX_MONEY) * 100);
  moneyBar.style.width      = pct + '%';
  moneyBarLabel.textContent = '$' + money.toLocaleString('es');
}

// ===== Coin =====
export function enableCoinChoice(enabled) {
  choiceButtons.forEach(b => { b.disabled = !enabled; });
}

export function animateCoin(result, onDone) {
  coin.classList.remove('spinning');
  void coin.offsetWidth;
  coin.classList.add('spinning');
  setTimeout(() => {
    coin.classList.remove('spinning');
    const front = coin.querySelector('.coin-face.front');
    const back  = coin.querySelector('.coin-face.back');
    if (result === 'cara') { front.textContent = 'C'; back.textContent = 'X'; }
    else                   { front.textContent = 'X'; back.textContent = 'C'; }
    onDone();
  }, 900);
}

export function showCoinResult(text, color) {
  coinResult.textContent  = text;
  coinResult.style.color  = color ?? '#ccc';
}

export function clearCoinResult() {
  coinResult.textContent = '';
}

// ===== Fingers (marcadores sobre la imagen) =====
export function resetFingers() {
  fingerMarkers.forEach(m => m.classList.remove('cut', 'saved', 'active-round'));
  setHandImage('intact');
}

export function setActiveRoundFinger(index) {
  fingerMarkers.forEach(m => m.classList.remove('active-round'));
  if (index >= 0) fingerMarkers[index]?.classList.add('active-round');
}

export function markFingerCut(index) {
  fingerMarkers[index]?.classList.remove('active-round', 'saved');
  fingerMarkers[index]?.classList.add('cut');
  setHandImage('cut');
}

export function markFingerSaved(index) {
  fingerMarkers[index]?.classList.remove('active-round');
  fingerMarkers[index]?.classList.add('saved');
}

// ===== End screen =====
export function showEndScreen(state) {
  const cutCount = state.fingers.filter(Boolean).length;
  const allIntact = cutCount === 0;

  endTitle.textContent = allIntact ? '¡SALISTE ILESO!' : 'JUEGO TERMINADO';
  endTitle.style.color = allIntact ? '#66bb6a' : '#d4a017';
  endSummary.textContent = `Dedos perdidos: ${cutCount} / 5`;

  endFingers.innerHTML = '';
  state.fingers.forEach(cut => {
    const span = document.createElement('span');
    span.textContent = cut ? '✂' : '🖐';
    endFingers.appendChild(span);
  });

  endMoney.textContent = `Ganaste: $${state.money.toLocaleString('es')}`;
  showScreen('end');
}
